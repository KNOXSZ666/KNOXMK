/* ============================================================
   KNOX SHOP - ADMIN.JS
   All 15 admin features
   ============================================================ */

// ===== CONFIG =====
const SUPABASE_URL = 'https://lsievokkismxxaiezdlm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzaWV2b2traXNteHhhaWV6ZGxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MjY0NzgsImV4cCI6MjA5NzAwMjQ3OH0.TZ6_NlpDIrl6xDucsc8S4hqA23RQVWsVLrQRjtr6YmQ';
const ADMIN_USER = 'admin';
const ADMIN_PASS_HASH = 'ce4015d3018e3a034167f36ad1028b3bf92561d58cf5233251684ba879cbb8e0'; // password plaintext đã được bỏ khỏi source

let sb = null;
try { sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY); } catch (e) { console.error(e); }

let revenueChartInstance = null;
let adminRefreshInterval = null;
let cachedOrders = [];
let cachedUsers = [];

// ===== UTILS =====
function fmtPrice(n) { return Number(n || 0).toLocaleString('vi-VN') + 'đ'; }
function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function genCode(prefix) { return prefix + '-' + Math.random().toString(36).substring(2, 8).toUpperCase(); }
function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function copyText(text) {
  if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => showToast('Đã sao chép!'));
  else { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); showToast('Đã sao chép!'); }
}
function showToast(msg, type) {
  const c = document.getElementById('toastContainer');
  if (!c) return;
  const el = document.createElement('div');
  el.className = 'toast' + (type ? ' ' + type : '');
  el.textContent = msg;
  c.appendChild(el);
  setTimeout(() => { el.classList.add('removing'); setTimeout(() => el.remove(), 300); }, 3000);
}

// ===== AUTH CHECK =====
function checkAdminAuth() {
  const saved = localStorage.getItem('knox_user');
  if (!saved) { window.location.href = 'index.html'; return false; }
  try {
    const parsed = JSON.parse(saved);
    if (parsed.username !== ADMIN_USER) { window.location.href = 'index.html'; return false; }
    if (Date.now() - parsed.ts > 7 * 24 * 3600 * 1000) { localStorage.removeItem('knox_user'); window.location.href = 'index.html'; return false; }
    return true;
  } catch { window.location.href = 'index.html'; return false; }
}

function adminLogout() {
  localStorage.removeItem('knox_user');
  window.location.href = 'index.html';
}

// ===== ADMIN LOG =====
async function logAdmin(action, target, details) {
  const { error } = await sb.from('admin_logs').insert({ action, target: target || '', details: details || '' });
  if (error) console.warn('logAdmin insert error:', error.message);
}

// ===== NOTIFICATION HELPER =====
async function notifyUser(username, title, message, type) {
  const { error } = await sb.from('notifications').insert({ username, title, message, type: type || 'info', read: false });
  if (error) console.warn('notifyUser insert error:', error.message);
}

// ===== BACKGROUND STARS =====
function initStars() {
  const sc = document.getElementById('starsContainer');
  if (sc) for (let i = 0; i < 30; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    s.style.left = Math.random() * 100 + '%';
    s.style.top = Math.random() * 100 + '%';
    s.style.animationDelay = Math.random() * 3 + 's';
    s.style.animationDuration = (2 + Math.random() * 3) + 's';
    sc.appendChild(s);
  }
}

// ===== TABS =====
function switchAdminTab(tab, btn) {
  document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.admin-tab-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('panel-' + tab).classList.add('active');

  if (tab === 'orders') loadOrders();
  if (tab === 'deposits') {
    const sel = document.getElementById('depositFilter');
    if (sel) depositFilter = sel.value; else depositFilter = 'all';
    loadDeposits();
  }
  if (tab === 'cards') {
    const sel = document.getElementById('cardFilter');
    if (sel) cardFilter = sel.value; else cardFilter = 'all';
    loadCards();
  }
  if (tab === 'tickets') loadTickets();
  if (tab === 'users') loadUsers();
  if (tab === 'scripts') loadScripts();
  if (tab === 'deals') loadDeals();
  if (tab === 'vouchers') loadVouchers();
  if (tab === 'reviews') loadReviews();
  if (tab === 'broadcast') loadBroadcastHistory();
  if (tab === 'logins') loadLogins();
  if (tab === 'logs') loadLogs();
}

// ===== STATS =====
async function loadAdminStats() {
  try {
    const [orders, deposits, cards, tickets, users, depCompleted] = await Promise.all([
      sb.from('orders').select('status'),
      sb.from('deposits').select('status, amount'),
      sb.from('card_deposits').select('status'),
      sb.from('tickets').select('status'),
      sb.from('users').select('id, is_locked'),
      sb.from('deposits').select('amount').eq('status', 'completed')
    ]);

    const oData = orders.data || [];
    const dData = deposits.data || [];
    const cData = cards.data || [];
    const tData = tickets.data || [];
    const uData = users.data || [];
    const revenue = (depCompleted.data || []).reduce((s, d) => s + (d.amount || 0), 0);

    const pendingOrders = oData.filter(o => o.status === 'pending').length;
    const pendingDeposits = dData.filter(d => d.status === 'pending').length;
    const pendingCards = cData.filter(c => c.status === 'pending').length;
    const openTickets = tData.filter(t => t.status === 'open').length;

    document.getElementById('statTotalOrders').textContent = oData.length;
    document.getElementById('statPendingOrders').textContent = pendingOrders;
    document.getElementById('statCompletedOrders').textContent = oData.filter(o => o.status === 'completed').length;
    document.getElementById('statPendingDeposits').textContent = pendingDeposits;
    document.getElementById('statPendingCards').textContent = pendingCards;
    document.getElementById('statOpenTickets').textContent = openTickets;
    document.getElementById('statTotalUsers').textContent = uData.length;
    document.getElementById('statRevenue').textContent = fmtPrice(revenue);

    // Badge updates
    const setBadge = (id, count) => {
      const el = document.getElementById(id);
      if (count > 0) { el.textContent = count; el.classList.remove('hidden'); }
      else el.classList.add('hidden');
    };
    setBadge('badgeOrders', pendingOrders);
    setBadge('badgeDeposits', pendingDeposits);
    setBadge('badgeCards', pendingCards);
    setBadge('badgeTickets', openTickets);
  } catch (e) { console.error(e); }
}

// ===== REVENUE CHART =====
async function loadRevenueChart(period, btn) {
  document.querySelectorAll('#panel-revenue .btn').forEach(b => {
    b.classList.remove('btn-primary'); b.classList.add('btn-secondary');
  });
  if (btn) { btn.classList.add('btn-primary'); btn.classList.remove('btn-secondary'); }
  else {
    const btns = document.querySelectorAll('#panel-revenue .btn');
    if (btns[0]) { btns[0].classList.add('btn-primary'); btns[0].classList.remove('btn-secondary'); }
  }

  try {
    const { data } = await sb.from('deposits').select('amount, created_at').eq('status', 'completed');
    const now = new Date();
    let labels = [], values = [];

    if (period === 7 || period === 30) {
      const days = period;
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now); d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        labels.push(d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }));
        values.push(0);
        (data || []).forEach(dep => {
          if (dep.created_at && dep.created_at.slice(0, 10) === key) values[values.length - 1] += dep.amount || 0;
        });
      }
    } else {
      // 12 months
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const ym = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        labels.push(d.toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' }));
        values.push(0);
        (data || []).forEach(dep => {
          if (dep.created_at && dep.created_at.slice(0, 7) === ym) values[values.length - 1] += dep.amount || 0;
        });
      }
    }

    const ctx = document.getElementById('revenueChart').getContext('2d');
    if (revenueChartInstance) revenueChartInstance.destroy();
    revenueChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Doanh thu (VNĐ)',
          data: values,
          borderColor: '#00E5A0',
          backgroundColor: 'rgba(0, 229, 160, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#00E5A0',
          pointBorderColor: '#0B0B12',
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#E8E8F0', font: { family: 'Rajdhani' } } },
          tooltip: { callbacks: { label: (c) => fmtPrice(c.parsed.y) } }
        },
        scales: {
          x: { ticks: { color: '#8888A0', font: { family: 'Rajdhani' } }, grid: { color: 'rgba(255,255,255,0.05)' } },
          y: { ticks: { color: '#8888A0', font: { family: 'Rajdhani' }, callback: (v) => (v / 1000) + 'K' }, grid: { color: 'rgba(255,255,255,0.05)' } }
        }
      }
    });
  } catch (e) { console.error(e); }
}

// ===== ORDERS =====
async function loadOrders() {
  try {
    const { data } = await sb.from('orders').select('*').order('created_at', { ascending: false });
    cachedOrders = data || [];
    renderOrdersTable();
  } catch (e) { console.error(e); }
}

function renderOrdersTable() {
  const search = (document.getElementById('orderSearch')?.value || '').toLowerCase();
  const filter = document.getElementById('orderFilter')?.value || '';
  let rows = cachedOrders;
  if (search) rows = rows.filter(o =>
    (o.order_code || '').toLowerCase().includes(search) ||
    (o.username || '').toLowerCase().includes(search) ||
    (o.service || '').toLowerCase().includes(search)
  );
  if (filter) rows = rows.filter(o => o.status === filter);

  const t = document.getElementById('ordersTable');
  if (rows.length === 0) { t.innerHTML = '<p style="text-align:center;padding:30px;color:var(--text-dim);">Không có đơn hàng</p>'; return; }

  t.innerHTML = `<table class="data-table"><thead><tr>
    <th>Mã</th><th>KH</th><th>Dịch vụ</th><th>Giá</th><th>TK Game</th><th>Tiến độ</th><th>Link tải</th><th>Trạng thái</th><th>TG</th><th>Hành động</th>
  </tr></thead><tbody>` + rows.map(o => {
    const sc = 'status-' + (o.status || 'pending');
    return `<tr>
      <td class="code-cell">${o.order_code}</td>
      <td>${escapeHtml(o.username)}</td>
      <td>${escapeHtml(o.service)}</td>
      <td>${fmtPrice(o.price)}</td>
      <td>
        <div style="font-size:0.75rem;">
          <div>ID: ${escapeHtml(o.game_username)} <button class="copy-btn" onclick="copyText('${escapeHtml(o.game_username)}')">📋</button></div>
          <div>MK: ${escapeHtml(o.game_password)} <button class="copy-btn" onclick="copyText('${escapeHtml(o.game_password)}')">📋</button></div>
        </div>
      </td>
      <td>
        <input type="number" min="0" max="100" value="${o.progress || 0}" style="width:50px;background:var(--bg-input);border:1px solid var(--border);color:var(--text);border-radius:4px;padding:2px 4px;" onchange="updateOrderProgress('${o.order_code}', this.value)">
      </td>
      <td><input type="text" value="${escapeHtml(o.download_link || '')}" placeholder="Paste link..." style="width:100px;background:var(--bg-input);border:1px solid var(--border);color:var(--text);border-radius:4px;padding:2px 4px;font-size:0.75rem;" onchange="updateOrderLink('${o.order_code}', this.value)"></td>
      <td>
        <select onchange="updateOrderStatus('${o.order_code}', this.value)" style="background:var(--bg-input);border:1px solid var(--border);color:var(--text);border-radius:4px;padding:2px;font-size:0.78rem;">
          <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Chờ xử lý</option>
          <option value="processing" ${o.status === 'processing' ? 'selected' : ''}>Đang xử lý</option>
          <option value="completed" ${o.status === 'completed' ? 'selected' : ''}>Hoàn thành</option>
          <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Hủy</option>
        </select>
      </td>
      <td style="font-size:0.72rem;white-space:nowrap;">${fmtDate(o.created_at)}</td>
      <td>
        <button class="admin-action-btn approve" onclick="saveOrder('${o.order_code}')">💾</button>
        ${o.reject_reason ? `<div style="font-size:0.7rem;color:var(--danger);margin-top:4px;">${escapeHtml(o.reject_reason)}</div>` : ''}
      </td>
    </tr>`;
  }).join('') + `</tbody></table>`;
}

async function updateOrderProgress(code, val) {
  const { error } = await sb.from('orders').update({ progress: parseInt(val) || 0 }).eq('order_code', code);
  if (error) console.error('updateProgress error:', error);
}

async function updateOrderLink(code, val) {
  const { error } = await sb.from('orders').update({ download_link: val }).eq('order_code', code);
  if (error) console.error('updateLink error:', error);
}

async function updateOrderStatus(code, status) {
  const order = cachedOrders.find(o => o.order_code === code);
  if (!order) { showToast('Không tìm thấy đơn!', 'error'); loadOrders(); return; }

  if (status === 'cancelled') {
    const reason = prompt('Nhập lý do từ chối đơn hàng:');
    if (!reason) { loadOrders(); return; }

    // Refund first
    if (order.price > 0) {
      const { data: user, error: userErr } = await sb.from('users').select('balance').eq('username', order.username).maybeSingle();
      if (userErr) { showToast('Lỗi tải user: ' + userErr.message, 'error'); loadOrders(); return; }
      if (!user) { showToast('Không tìm thấy user!', 'error'); loadOrders(); return; }

      const { error: refundErr } = await sb.from('users').update({ balance: (user.balance || 0) + order.price }).eq('username', order.username);
      if (refundErr) { console.error('Refund error:', refundErr); showToast('Lỗi hoàn tiền: ' + refundErr.message, 'error'); loadOrders(); return; }
    }

    // Update order status
    const { error: ordErr } = await sb.from('orders').update({ status: 'cancelled', reject_reason: reason }).eq('order_code', code);
    if (ordErr) { console.error('Update order error:', ordErr); showToast('Lỗi cập nhật đơn: ' + ordErr.message, 'error'); loadOrders(); return; }

    await notifyUser(order.username, '❌ Đơn bị từ chối', `Đơn ${code} bị hủy. Lý do: ${reason}. Đã hoàn ${fmtPrice(order.price)} vào ví.`, 'order');
    await logAdmin('Hủy đơn', code, 'Lý do: ' + reason);
    showToast(`✅ Đã hủy đơn + hoàn ${fmtPrice(order.price)}`, 'success');
  } else {
    const update = { status };
    if (status === 'completed') update.progress = 100;
    if (status === 'processing' && (!order.progress || order.progress === 0)) update.progress = 10;

    const { error: ordErr } = await sb.from('orders').update(update).eq('order_code', code);
    if (ordErr) { console.error('Update order error:', ordErr); showToast('Lỗi cập nhật đơn: ' + ordErr.message, 'error'); loadOrders(); return; }

    const msgMap = { pending: 'đang chờ xử lý', processing: 'đang được xử lý', completed: 'đã hoàn thành!' };
    await notifyUser(order.username, '📦 Cập nhật đơn ' + code, `Đơn hàng của bạn ${msgMap[status] || 'đã cập nhật'}.`, 'order');
    await logAdmin('Cập nhật đơn', code, '→ ' + status);
    showToast('✅ Đã cập nhật trạng thái', 'success');
  }
  loadOrders();
  loadAdminStats();
}

async function saveOrder(code) {
  showToast('Đã lưu', 'success');
  loadOrders();
}

// ===== DEPOSITS =====
let depositFilter = 'all';

async function loadDeposits() {
  try {
    let query = sb.from('deposits').select('*').order('created_at', { ascending: false });
    const { data, error } = await query;
    if (error) { console.error('loadDeposits error:', error); showToast('Lỗi tải: ' + error.message, 'error'); return; }

    // Apply client-side filter
    let rows = data || [];
    if (depositFilter !== 'all') rows = rows.filter(d => d.status === depositFilter);

    const t = document.getElementById('depositsTable');
    if (rows.length === 0) {
      t.innerHTML = '<p style="text-align:center;padding:30px;color:var(--text-dim);">Không có lệnh nạp</p>';
      return;
    }
    t.innerHTML = `<table class="data-table"><thead><tr>
      <th>Mã</th><th>KH</th><th>Số tiền</th><th>PT</th><th>Nội dung CK</th><th>Ghi chú</th><th>Trạng thái</th><th>TG</th><th>Hành động</th>
    </tr></thead><tbody>` + rows.map(d => {
      const sc = 'status-' + (d.status === 'completed' ? 'completed' : d.status === 'rejected' ? 'cancelled' : 'pending');
      const st = { pending: 'Chờ duyệt', completed: 'Đã duyệt', rejected: 'Từ chối' }[d.status] || d.status;
      let actions = '';
      if (d.status === 'pending') {
        actions = `<button class="admin-action-btn approve" onclick="approveDeposit('${d.deposit_code}')">Duyệt</button>
                   <button class="admin-action-btn reject" onclick="rejectDeposit('${d.deposit_code}')">Từ chối</button>`;
      }
      // Extract transfer content from note
      let napCode = '', userNote = d.note || '';
      const m = (d.note || '').match(/\[NDCK:\s*(NAP\d+)\]/);
      if (m) { napCode = m[1]; userNote = (d.note || '').replace(/\[NDCK:\s*NAP\d+\]\s*/, ''); }
      return `<tr>
        <td class="code-cell">${d.deposit_code}</td>
        <td>${escapeHtml(d.username)}</td>
        <td class="text-accent">${fmtPrice(d.amount)}</td>
        <td>${escapeHtml(d.method)}</td>
        <td>${napCode ? `<strong class="text-accent mono">${napCode}</strong> <button class="copy-btn" onclick="copyText('${napCode}')">📋</button>` : '-'}</td>
        <td style="max-width:150px;font-size:0.8rem;word-break:break-word;">${escapeHtml(userNote)}</td>
        <td><span class="status-badge ${sc}">${st}</span></td>
        <td style="font-size:0.72rem;white-space:nowrap;">${fmtDate(d.created_at)}</td>
        <td>${actions || '-'}</td>
      </tr>`;
    }).join('') + `</tbody></table>`;
  } catch (e) { console.error(e); showToast('Lỗi: ' + e.message, 'error'); }
}

async function approveDeposit(code) {
  // 1. Fetch the deposit record
  const { data: dep, error: depErr } = await sb.from('deposits').select('*').eq('deposit_code', code).maybeSingle();
  if (depErr) { console.error('Fetch deposit error:', depErr); return showToast('Lỗi tải đơn nạp: ' + depErr.message, 'error'); }
  if (!dep) return showToast('Không tìm thấy lệnh nạp!', 'error');
  if (dep.status === 'completed') return showToast('Lệnh này đã duyệt rồi!', 'warning');

  // 2. Fetch the user
  const { data: user, error: userErr } = await sb.from('users').select('balance, total_deposited, referred_by').eq('username', dep.username).maybeSingle();
  if (userErr) { console.error('Fetch user error:', userErr); return showToast('Lỗi tải user: ' + userErr.message, 'error'); }
  if (!user) return showToast('Không tìm thấy user: ' + dep.username, 'error');

  const newBal = (user.balance || 0) + dep.amount;
  const newDep = (user.total_deposited || 0) + dep.amount;

  // 3. Add money to user
  const { error: updErr } = await sb.from('users').update({ balance: newBal, total_deposited: newDep }).eq('username', dep.username);
  if (updErr) { console.error('Update user error:', updErr); return showToast('Lỗi cộng tiền (có thể do RLS): ' + updErr.message, 'error'); }

  // 4. Mark deposit as completed
  const { error: depUpdErr } = await sb.from('deposits').update({ status: 'completed' }).eq('deposit_code', code);
  if (depUpdErr) { console.error('Update deposit error:', depUpdErr); return showToast('Lỗi cập nhật trạng thái: ' + depUpdErr.message, 'error'); }

  // 5. Referral reward on FIRST deposit
  if ((user.total_deposited || 0) === 0 && user.referred_by) {
    try {
      const { data: referrer, error: refErr } = await sb.from('users').select('balance').eq('username', user.referred_by).maybeSingle();
      if (!refErr && referrer) {
        await sb.from('users').update({ balance: (referrer.balance || 0) + 10000 }).eq('username', user.referred_by);
        notifyUser(user.referred_by, '👥 Thưởng giới thiệu!', `Bạn nhận được 10.000đ từ người bạn giới thiệu ${dep.username}.`, 'referral');
      }
    } catch (e) { console.error('Referral reward error:', e); }
  }

  // 6. Notify user + log
  await notifyUser(dep.username, '💰 Nạp tiền thành công!', `Đã cộng ${fmtPrice(dep.amount)} vào ví. Số dư mới: ${fmtPrice(newBal)}.`, 'deposit');
  await logAdmin('Duyệt nạp', code, fmtPrice(dep.amount) + ' cho ' + dep.username);

  showToast(`✅ Đã duyệt! Cộng ${fmtPrice(dep.amount)} cho ${dep.username}. Số dư: ${fmtPrice(newBal)}`, 'success');
  loadDeposits();
  loadAdminStats();
}

async function rejectDeposit(code) {
  const reason = prompt('Nhập lý do từ chối:');
  if (!reason) return;

  const { data: dep, error: depErr } = await sb.from('deposits').select('*').eq('deposit_code', code).maybeSingle();
  if (depErr) return showToast('Lỗi tải: ' + depErr.message, 'error');
  if (!dep) return showToast('Không tìm thấy lệnh nạp!', 'error');
  if (dep.status !== 'pending') return showToast('Lệnh không ở trạng thái chờ!', 'warning');

  const { error: updErr } = await sb.from('deposits').update({ status: 'rejected', note: reason }).eq('deposit_code', code);
  if (updErr) { console.error('Reject deposit error:', updErr); return showToast('Lỗi từ chối: ' + updErr.message, 'error'); }

  await notifyUser(dep.username, '❌ Nạp bị từ chối', `Lệnh nạp ${code} bị từ chối. Lý do: ${reason}`, 'deposit');
  await logAdmin('Từ chối nạp', code, reason);

  showToast('✅ Đã từ chối lệnh nạp', 'success');
  loadDeposits();
  loadAdminStats();
}

// ===== CARDS =====
let cardFilter = 'all';

async function loadCards() {
  try {
    const { data, error } = await sb.from('card_deposits').select('*').order('created_at', { ascending: false });
    if (error) { console.error('loadCards error:', error); showToast('Lỗi tải: ' + error.message, 'error'); return; }

    let rows = data || [];
    if (cardFilter !== 'all') rows = rows.filter(c => c.status === cardFilter);

    const t = document.getElementById('cardsTable');
    if (rows.length === 0) { t.innerHTML = '<p style="text-align:center;padding:30px;color:var(--text-dim);">Không có thẻ cào</p>'; return; }
    t.innerHTML = `<table class="data-table"><thead><tr>
      <th>Mã</th><th>KH</th><th>Nhà mạng</th><th>Mệnh giá</th><th>Seri</th><th>Mã thẻ</th><th>Nhận</th><th>Trạng thái</th><th>TG</th><th>Hành động</th>
    </tr></thead><tbody>` + rows.map(c => {
      const sc = 'status-' + (c.status === 'completed' ? 'completed' : c.status === 'rejected' ? 'cancelled' : 'pending');
      const st = { pending: 'Chờ check', completed: 'Đã duyệt', rejected: 'Từ chối' }[c.status] || c.status;
      let actions = '';
      if (c.status === 'pending') {
        actions = `<button class="admin-action-btn approve" onclick="approveCard('${c.card_code}')">Duyệt</button>
                   <button class="admin-action-btn reject" onclick="rejectCard('${c.card_code}')">Từ chối</button>`;
      }
      return `<tr>
        <td class="code-cell">${c.card_code}</td>
        <td>${escapeHtml(c.username)}</td>
        <td>${escapeHtml(c.telco)}</td>
        <td>${fmtPrice(c.amount)}</td>
        <td><span class="mono">${escapeHtml(c.serial)}</span> <button class="copy-btn" onclick="copyText('${escapeHtml(c.serial)}')">📋</button></td>
        <td><span class="mono">${escapeHtml(c.code)}</span> <button class="copy-btn" onclick="copyText('${escapeHtml(c.code)}')">📋</button></td>
        <td class="text-accent">${fmtPrice(c.actual_amount)}</td>
        <td><span class="status-badge ${sc}">${st}</span></td>
        <td style="font-size:0.72rem;white-space:nowrap;">${fmtDate(c.created_at)}</td>
        <td>${actions || '-'}</td>
      </tr>`;
    }).join('') + `</tbody></table>`;
  } catch (e) { console.error(e); showToast('Lỗi: ' + e.message, 'error'); }
}

async function approveCard(code) {
  const { data: card, error: cardErr } = await sb.from('card_deposits').select('*').eq('card_code', code).maybeSingle();
  if (cardErr) return showToast('Lỗi tải: ' + cardErr.message, 'error');
  if (!card) return showToast('Không tìm thấy thẻ!', 'error');
  if (card.status === 'completed') return showToast('Thẻ này đã duyệt rồi!', 'warning');

  const { data: user, error: userErr } = await sb.from('users').select('balance, total_deposited').eq('username', card.username).maybeSingle();
  if (userErr) return showToast('Lỗi tải user: ' + userErr.message, 'error');
  if (!user) return showToast('Không tìm thấy user: ' + card.username, 'error');

  const newBal = (user.balance || 0) + card.actual_amount;
  const newDep = (user.total_deposited || 0) + card.actual_amount;

  const { error: updErr } = await sb.from('users').update({ balance: newBal, total_deposited: newDep }).eq('username', card.username);
  if (updErr) { console.error('Update user error:', updErr); return showToast('Lỗi cộng tiền: ' + updErr.message, 'error'); }

  const { error: cardUpdErr } = await sb.from('card_deposits').update({ status: 'completed' }).eq('card_code', code);
  if (cardUpdErr) { console.error('Update card error:', cardUpdErr); return showToast('Lỗi cập nhật: ' + cardUpdErr.message, 'error'); }

  await notifyUser(card.username, '📱 Thẻ cào đã duyệt!', `Thẻ ${card.telco} ${fmtPrice(card.amount)} → nhận ${fmtPrice(card.actual_amount)}. Số dư: ${fmtPrice(newBal)}.`, 'card');
  await logAdmin('Duyệt thẻ', code, fmtPrice(card.actual_amount) + ' cho ' + card.username);

  showToast(`✅ Đã duyệt thẻ! Cộng ${fmtPrice(card.actual_amount)} cho ${card.username}`, 'success');
  loadCards();
  loadAdminStats();
}

async function rejectCard(code) {
  const reason = prompt('Nhập lý do từ chối:');
  if (!reason) return;

  const { data: card, error: cardErr } = await sb.from('card_deposits').select('*').eq('card_code', code).maybeSingle();
  if (cardErr) return showToast('Lỗi tải: ' + cardErr.message, 'error');
  if (!card) return showToast('Không tìm thấy thẻ!', 'error');
  if (card.status !== 'pending') return showToast('Thẻ không ở trạng thái chờ!', 'warning');

  const { error: updErr } = await sb.from('card_deposits').update({ status: 'rejected', admin_note: reason }).eq('card_code', code);
  if (updErr) { console.error('Reject card error:', updErr); return showToast('Lỗi từ chối: ' + updErr.message, 'error'); }

  await notifyUser(card.username, '❌ Thẻ bị từ chối', `Thẻ cào bị từ chối. Lý do: ${reason}`, 'card');
  await logAdmin('Từ chối thẻ', code, reason);

  showToast('✅ Đã từ chối thẻ', 'success');
  loadCards();
  loadAdminStats();
}

// ===== TICKETS =====
async function loadTickets() {
  try {
    const { data } = await sb.from('tickets').select('*').order('created_at', { ascending: false });
    const t = document.getElementById('ticketsTable');
    if (!data || data.length === 0) { t.innerHTML = '<p style="text-align:center;padding:30px;color:var(--text-dim);">Không có ticket</p>'; return; }
    t.innerHTML = `<table class="data-table"><thead><tr>
      <th>Mã</th><th>KH</th><th>Tiêu đề</th><th>Nội dung</th><th>Phản hồi</th><th>Trạng thái</th><th>TG</th><th>Hành động</th>
    </tr></thead><tbody>` + data.map(tk => {
      const sc = 'status-' + (tk.status || 'open');
      return `<tr>
        <td class="code-cell">${tk.ticket_code}</td>
        <td>${escapeHtml(tk.username)}</td>
        <td>${escapeHtml(tk.subject)}</td>
        <td style="max-width:200px;word-break:break-word;font-size:0.8rem;">${escapeHtml(tk.message)}</td>
        <td style="max-width:200px;word-break:break-word;font-size:0.8rem;color:var(--accent);">${escapeHtml(tk.admin_reply || '')}</td>
        <td><span class="status-badge ${sc}">${tk.status || 'open'}</span></td>
        <td style="font-size:0.72rem;white-space:nowrap;">${fmtDate(tk.created_at)}</td>
        <td>
          <button class="admin-action-btn edit" onclick="replyTicket('${tk.ticket_code}')">Trả lời</button>
          <button class="admin-action-btn approve" onclick="closeTicket('${tk.ticket_code}')">Đóng</button>
        </td>
      </tr>`;
    }).join('') + `</tbody></table>`;
  } catch (e) { console.error(e); }
}

async function replyTicket(code) {
  const reply = prompt('Nhập phản hồi:');
  if (!reply) return;

  const { data: tk, error: tkErr } = await sb.from('tickets').select('username').eq('ticket_code', code).maybeSingle();
  if (tkErr) return showToast('Lỗi tải: ' + tkErr.message, 'error');
  if (!tk) return showToast('Không tìm thấy ticket!', 'error');

  const { error: updErr } = await sb.from('tickets').update({ admin_reply: reply, status: 'answered' }).eq('ticket_code', code);
  if (updErr) { console.error('replyTicket error:', updErr); return showToast('Lỗi trả lời: ' + updErr.message, 'error'); }

  await notifyUser(tk.username, '💬 Phản hồi ticket', `Ticket ${code}: ${reply}`, 'ticket');
  await logAdmin('Trả lời ticket', code, reply);
  showToast('✅ Đã trả lời', 'success');
  loadTickets();
  loadAdminStats();
}

async function closeTicket(code) {
  const { error: updErr } = await sb.from('tickets').update({ status: 'closed' }).eq('ticket_code', code);
  if (updErr) return showToast('Lỗi: ' + updErr.message, 'error');
  await logAdmin('Đóng ticket', code, '');
  showToast('✅ Đã đóng ticket', 'success');
  loadTickets();
  loadAdminStats();
}

// ===== USERS =====
async function loadUsers() {
  try {
    const { data } = await sb.from('users').select('*').order('created_at', { ascending: false });
    cachedUsers = data || [];
    renderUsersTable();
  } catch (e) { console.error(e); }
}

function renderUsersTable() {
  const search = (document.getElementById('userSearch')?.value || '').toLowerCase();
  let rows = cachedUsers;
  if (search) rows = rows.filter(u => (u.username || '').toLowerCase().includes(search) || (u.email || '').toLowerCase().includes(search));

  const t = document.getElementById('usersTable');
  if (rows.length === 0) { t.innerHTML = '<p style="text-align:center;padding:30px;color:var(--text-dim);">Không có user</p>'; return; }

  t.innerHTML = `<table class="data-table"><thead><tr>
    <th>ID</th><th>Username</th><th>Email</th><th>Zalo</th><th>Số dư</th><th>Đã nạp</th><th>Đã chi</th><th>MK</th><th>Last Login</th><th>Hành động</th>
  </tr></thead><tbody>` + rows.map(u => {
    return `<tr>
      <td>${u.id}</td>
      <td><strong>${escapeHtml(u.username)}</strong> ${u.is_locked ? '🔒' : ''}</td>
      <td>${escapeHtml(u.email || '')}</td>
      <td>${escapeHtml(u.zalo || '')}</td>
      <td class="text-accent">${fmtPrice(u.balance)}</td>
      <td>${fmtPrice(u.total_deposited)}</td>
      <td>${fmtPrice(u.total_spent)}</td>
      <td><span class="mono">***</span> <button class="copy-btn" onclick="copyText('${escapeHtml(u.password)}')">📋</button></td>
      <td style="font-size:0.72rem;">${u.last_login ? fmtDate(u.last_login) + '<br>IP: ' + escapeHtml(u.last_ip || '') : 'Chưa đăng nhập'}</td>
      <td>
        <button class="admin-action-btn approve" onclick="adjustBalance('${u.username}')">💰</button>
        <button class="admin-action-btn edit" onclick="resetUserPass('${u.username}')">🔑</button>
        <button class="admin-action-btn warn" onclick="toggleLockUser('${u.username}', ${u.is_locked})">${u.is_locked ? '🔓' : '🔒'}</button>
        <button class="admin-action-btn delete" onclick="deleteUser('${u.username}')">🗑️</button>
      </td>
    </tr>`;
  }).join('') + `</tbody></table>`;
}

async function adjustBalance(username) {
  const input = prompt('Nhập số (dương=cộng, âm=trừ, =xxx=đặt ví dụ =50000):');
  if (input === null) return;

  const { data: user, error: userErr } = await sb.from('users').select('balance').eq('username', username).maybeSingle();
  if (userErr) return showToast('Lỗi tải user: ' + userErr.message, 'error');
  if (!user) return showToast('Không tìm thấy user!', 'error');

  let newBal;
  if (input.startsWith('=')) newBal = parseInt(input.substring(1)) || 0;
  else newBal = (user.balance || 0) + (parseInt(input) || 0);
  if (newBal < 0) newBal = 0;

  const { error: updErr } = await sb.from('users').update({ balance: newBal }).eq('username', username);
  if (updErr) { console.error('adjustBalance error:', updErr); return showToast('Lỗi cập nhật (có thể RLS): ' + updErr.message, 'error'); }

  await notifyUser(username, '💰 Cập nhật số dư', `Số dư mới: ${fmtPrice(newBal)}`, 'balance');
  await logAdmin('Sửa số dư', username, '→ ' + fmtPrice(newBal));
  showToast(`✅ Đã cập nhật. Số dư mới: ${fmtPrice(newBal)}`, 'success');
  loadUsers();
}

async function resetUserPass(username) {
  const newPass = prompt('Nhập mật khẩu mới (≥ 6 ký tự):');
  if (!newPass) return;
  if (newPass.length < 6) return showToast('Mật khẩu phải ≥ 6 ký tự', 'error');

  const { error: updErr } = await sb.from('users').update({ password: newPass }).eq('username', username);
  if (updErr) { console.error('resetPass error:', updErr); return showToast('Lỗi reset: ' + updErr.message, 'error'); }

  await notifyUser(username, '🔑 Mật khẩu đã reset', `Mật khẩu mới của bạn là: ${newPass}. Vui lòng đổi lại sau khi đăng nhập.`, 'security');
  await logAdmin('Reset MK', username, '');
  showToast('✅ Đã reset mật khẩu', 'success');
  loadUsers();
}

async function toggleLockUser(username, isLocked) {
  const { error: updErr } = await sb.from('users').update({ is_locked: !isLocked }).eq('username', username);
  if (updErr) { console.error('toggleLock error:', updErr); return showToast('Lỗi: ' + updErr.message, 'error'); }

  await notifyUser(username, isLocked ? '🔓 Tài khoản đã mở khóa' : '🔒 Tài khoản bị khóa', isLocked ? 'Tài khoản của bạn đã được mở khóa.' : 'Tài khoản của bạn đã bị khóa. Liên hệ admin để biết thêm.', 'security');
  await logAdmin(isLocked ? 'Mở khóa user' : 'Khóa user', username, '');
  showToast(isLocked ? '✅ Đã mở khóa' : '✅ Đã khóa', 'success');
  loadUsers();
}

async function deleteUser(username) {
  if (!confirm(`Xóa user "${username}"? Hành động này không thể hoàn tác!`)) return;
  const { error: delErr } = await sb.from('users').delete().eq('username', username);
  if (delErr) { console.error('deleteUser error:', delErr); return showToast('Lỗi xóa: ' + delErr.message, 'error'); }
  await logAdmin('Xóa user', username, '');
  showToast('✅ Đã xóa user', 'success');
  loadUsers();
  loadAdminStats();
}

// ===== SCRIPTS =====
async function loadScripts() {
  try {
    const { data } = await sb.from('scripts').select('*').order('created_at', { ascending: false });
    const t = document.getElementById('scriptsTable');
    if (!data || data.length === 0) { t.innerHTML = '<p style="text-align:center;padding:30px;color:var(--text-dim);">Không có script</p>'; return; }
    t.innerHTML = `<table class="data-table"><thead><tr>
      <th>ID</th><th>Tên</th><th>Game</th><th>Giá</th><th>Trạng thái</th><th>Hành động</th>
    </tr></thead><tbody>` + data.map(s => `
      <tr>
        <td>${s.id}</td>
        <td>${escapeHtml(s.name)}</td>
        <td>${escapeHtml(s.game)}</td>
        <td class="text-accent">${fmtPrice(s.price)}</td>
        <td><span class="status-badge ${s.active ? 'status-completed' : 'status-cancelled'}">${s.active ? 'Hoạt động' : 'Tạm dừng'}</span></td>
        <td>
          <button class="admin-action-btn warn" onclick="toggleScript(${s.id}, ${s.active})">${s.active ? '⏸ Pause' : '▶ Play'}</button>
          <button class="admin-action-btn delete" onclick="deleteScript(${s.id})">🗑️</button>
        </td>
      </tr>
    `).join('') + `</tbody></table>`;
  } catch (e) { console.error(e); }
}

async function addScript() {
  const name = document.getElementById('scriptName').value.trim();
  const game = document.getElementById('scriptGame').value.trim();
  const price = parseInt(document.getElementById('scriptPrice').value);
  if (!name || !game) return showToast('Nhập đủ thông tin', 'error');

  const { error } = await sb.from('scripts').insert({ name, game, price: price || 0, active: true });
  if (error) { console.error('addScript error:', error); return showToast('Lỗi thêm: ' + error.message, 'error'); }
  await logAdmin('Thêm script', name, game + ' ' + fmtPrice(price));
  showToast('✅ Đã thêm script', 'success');
  ['scriptName', 'scriptGame', 'scriptPrice'].forEach(id => document.getElementById(id).value = '');
  loadScripts();
}

async function toggleScript(id, active) {
  const { error } = await sb.from('scripts').update({ active: !active }).eq('id', id);
  if (error) { console.error('toggleScript error:', error); return showToast('Lỗi: ' + error.message, 'error'); }
  await logAdmin(active ? 'Pause script' : 'Play script', id, '');
  loadScripts();
}

async function deleteScript(id) {
  if (!confirm('Xóa script?')) return;
  const { error } = await sb.from('scripts').delete().eq('id', id);
  if (error) return showToast('Lỗi xóa: ' + error.message, 'error');
  await logAdmin('Xóa script', id, '');
  showToast('✅ Đã xóa', 'success');
  loadScripts();
}

// ===== HOT DEALS =====
async function loadDeals() {
  try {
    const { data } = await sb.from('hot_deals').select('*').order('created_at', { ascending: false });
    const t = document.getElementById('dealsTable');
    if (!data || data.length === 0) { t.innerHTML = '<p style="text-align:center;padding:30px;color:var(--text-dim);">Không có deal</p>'; return; }
    t.innerHTML = `<table class="data-table"><thead><tr>
      <th>ID</th><th>Sản phẩm</th><th>Giá gốc</th><th>% giảm</th><th>Giá mới</th><th>Mô tả</th><th>Trạng thái</th><th>Hành động</th>
    </tr></thead><tbody>` + data.map(d => {
      const newPrice = Math.round(d.original_price * (1 - d.discount_percent / 100));
      return `<tr>
        <td>${d.id}</td>
        <td>${escapeHtml(d.product_name)}</td>
        <td><span style="text-decoration:line-through;">${fmtPrice(d.original_price)}</span></td>
        <td class="text-warning">-${d.discount_percent}%</td>
        <td class="text-accent">${fmtPrice(newPrice)}</td>
        <td style="max-width:200px;font-size:0.8rem;">${escapeHtml(d.description || '')}</td>
        <td><span class="status-badge ${d.active ? 'status-completed' : 'status-cancelled'}">${d.active ? 'Bật' : 'Tắt'}</span></td>
        <td>
          <button class="admin-action-btn warn" onclick="toggleDeal(${d.id}, ${d.active})">${d.active ? 'Tắt' : 'Bật'}</button>
          <button class="admin-action-btn delete" onclick="deleteDeal(${d.id})">🗑️</button>
        </td>
      </tr>`;
    }).join('') + `</tbody></table>`;
  } catch (e) { console.error(e); }
}

async function addDeal() {
  const name = document.getElementById('dealName').value.trim();
  const original = parseInt(document.getElementById('dealOriginal').value);
  const discount = parseInt(document.getElementById('dealDiscount').value);
  const desc = document.getElementById('dealDesc').value.trim();
  if (!name || !original) return showToast('Nhập đủ thông tin', 'error');

  const { error } = await sb.from('hot_deals').insert({ product_name: name, original_price: original, discount_percent: discount || 0, description: desc, active: true });
  if (error) { console.error('addDeal error:', error); return showToast('Lỗi tạo deal: ' + error.message, 'error'); }
  await logAdmin('Thêm deal', name, fmtPrice(original) + ' -' + (discount || 0) + '%');
  showToast('✅ Đã tạo deal', 'success');
  ['dealName', 'dealOriginal', 'dealDiscount', 'dealDesc'].forEach(id => document.getElementById(id).value = '');
  loadDeals();
}

async function toggleDeal(id, active) {
  const { error } = await sb.from('hot_deals').update({ active: !active }).eq('id', id);
  if (error) return showToast('Lỗi: ' + error.message, 'error');
  loadDeals();
}

async function deleteDeal(id) {
  if (!confirm('Xóa deal?')) return;
  const { error } = await sb.from('hot_deals').delete().eq('id', id);
  if (error) return showToast('Lỗi xóa: ' + error.message, 'error');
  showToast('✅ Đã xóa', 'success');
  loadDeals();
}

// ===== VOUCHERS =====
async function loadVouchers() {
  try {
    const { data } = await sb.from('vouchers').select('*').order('created_at', { ascending: false });
    const t = document.getElementById('vouchersTable');
    if (!data || data.length === 0) { t.innerHTML = '<p style="text-align:center;padding:30px;color:var(--text-dim);">Không có voucher</p>'; return; }
    t.innerHTML = `<table class="data-table"><thead><tr>
      <th>ID</th><th>Code</th><th>% giảm</th><th>Đã dùng</th><th>Tối đa</th><th>Hết hạn</th><th>Trạng thái</th><th>Hành động</th>
    </tr></thead><tbody>` + data.map(v => `
      <tr>
        <td>${v.id}</td>
        <td class="code-cell">${escapeHtml(v.code)}</td>
        <td class="text-warning">-${v.discount_percent}%</td>
        <td>${v.used_count || 0}</td>
        <td>${v.max_uses}</td>
        <td style="font-size:0.75rem;">${v.expires_at ? fmtDate(v.expires_at) : 'Không giới hạn'}</td>
        <td><span class="status-badge ${v.active ? 'status-completed' : 'status-cancelled'}">${v.active ? 'Hoạt động' : 'Tắt'}</span></td>
        <td>
          <button class="admin-action-btn warn" onclick="toggleVoucher(${v.id}, ${v.active})">${v.active ? 'Tắt' : 'Bật'}</button>
          <button class="admin-action-btn delete" onclick="deleteVoucher(${v.id})">🗑️</button>
        </td>
      </tr>
    `).join('') + `</tbody></table>`;
  } catch (e) { console.error(e); }
}

async function addVoucher() {
  let code = document.getElementById('voucherCode').value.trim().toUpperCase();
  const percent = parseInt(document.getElementById('voucherPercent').value);
  const max = parseInt(document.getElementById('voucherMax').value);
  if (!code || !percent) return showToast('Nhập đủ thông tin', 'error');

  const { error } = await sb.from('vouchers').insert({ code, discount_percent: percent, max_uses: max || 999999, used_count: 0, active: true });
  if (error) { console.error('addVoucher error:', error); return showToast('Lỗi tạo voucher (code đã tồn tại?): ' + error.message, 'error'); }
  await logAdmin('Tạo voucher', code, '-' + percent + '%');
  showToast('✅ Đã tạo voucher', 'success');
  ['voucherCode', 'voucherPercent', 'voucherMax'].forEach(id => document.getElementById(id).value = '');
  loadVouchers();
}

async function toggleVoucher(id, active) {
  const { error } = await sb.from('vouchers').update({ active: !active }).eq('id', id);
  if (error) return showToast('Lỗi: ' + error.message, 'error');
  loadVouchers();
}

async function deleteVoucher(id) {
  if (!confirm('Xóa voucher?')) return;
  const { error } = await sb.from('vouchers').delete().eq('id', id);
  if (error) return showToast('Lỗi xóa: ' + error.message, 'error');
  showToast('✅ Đã xóa', 'success');
  loadVouchers();
}

// ===== REVIEWS =====
async function loadReviews() {
  try {
    const { data } = await sb.from('reviews').select('*').order('created_at', { ascending: false });
    const t = document.getElementById('reviewsTable');
    if (!data || data.length === 0) { t.innerHTML = '<p style="text-align:center;padding:30px;color:var(--text-dim);">Không có đánh giá</p>'; return; }
    t.innerHTML = `<table class="data-table"><thead><tr>
      <th>ID</th><th>User</th><th>Sản phẩm</th><th>Sao</th><th>Bình luận</th><th>Ngày</th><th>Hành động</th>
    </tr></thead><tbody>` + data.map(r => `
      <tr>
        <td>${r.id}</td>
        <td>${escapeHtml(r.username)}</td>
        <td>${escapeHtml(r.service)}</td>
        <td class="text-gold">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</td>
        <td style="max-width:250px;word-break:break-word;font-size:0.8rem;">${escapeHtml(r.comment)}</td>
        <td style="font-size:0.72rem;white-space:nowrap;">${fmtDate(r.created_at)}</td>
        <td><button class="admin-action-btn delete" onclick="deleteReview(${r.id})">🗑️</button></td>
      </tr>
    `).join('') + `</tbody></table>`;
  } catch (e) { console.error(e); }
}

async function deleteReview(id) {
  if (!confirm('Xóa đánh giá?')) return;
  const { error } = await sb.from('reviews').delete().eq('id', id);
  if (error) return showToast('Lỗi xóa: ' + error.message, 'error');
  showToast('✅ Đã xóa', 'success');
  loadReviews();
}

// ===== BROADCAST =====
async function sendBroadcast() {
  const title = document.getElementById('broadcastTitle').value.trim();
  const message = document.getElementById('broadcastMessage').value.trim();
  if (!title || !message) return showToast('Nhập đủ thông tin', 'error');

  // Save broadcast
  const { error: bErr } = await sb.from('broadcasts').insert({ title, message });
  if (bErr) { console.error('Broadcast save error:', bErr); return showToast('Lỗi lưu broadcast: ' + bErr.message, 'error'); }

  // Get all users
  const { data: users, error: uErr } = await sb.from('users').select('username');
  if (uErr) { console.error('Fetch users error:', uErr); return showToast('Lỗi tải users: ' + uErr.message, 'error'); }

  if (users && users.length > 0) {
    const notifs = users.map(u => ({ username: u.username, title, message, type: 'broadcast', read: false }));
    // Insert in batches
    for (let i = 0; i < notifs.length; i += 50) {
      const { error: nErr } = await sb.from('notifications').insert(notifs.slice(i, i + 50));
      if (nErr) console.error('Notify batch error:', nErr);
    }
  }
  await logAdmin('Broadcast', title, message);
  showToast(`✅ Đã gửi cho ${users ? users.length : 0} user`, 'success');
  document.getElementById('broadcastTitle').value = '';
  document.getElementById('broadcastMessage').value = '';
  loadBroadcastHistory();
}

async function loadBroadcastHistory() {
  try {
    const { data } = await sb.from('broadcasts').select('*').order('created_at', { ascending: false }).limit(20);
    const el = document.getElementById('broadcastHistory');
    if (!data || data.length === 0) { el.innerHTML = '<p style="color:var(--text-dim);padding:16px;">Chưa có broadcast</p>'; return; }
    el.innerHTML = data.map(b => `
      <div class="hud-card" style="padding:14px;margin-bottom:10px;">
        <strong>${escapeHtml(b.title)}</strong>
        <p style="font-size:0.85rem;margin-top:4px;color:var(--text-dim);">${escapeHtml(b.message)}</p>
        <p style="font-size:0.72rem;color:var(--text-dim);margin-top:4px;">${fmtDate(b.created_at)}</p>
      </div>
    `).join('');
  } catch (e) {}
}

// ===== LOGIN HISTORY =====
async function loadLogins() {
  try {
    const { data } = await sb.from('login_history').select('*').order('created_at', { ascending: false }).limit(100);
    const t = document.getElementById('loginsTable');
    if (!data || data.length === 0) { t.innerHTML = '<p style="text-align:center;padding:30px;color:var(--text-dim);">Chưa có lịch sử</p>'; return; }
    t.innerHTML = `<table class="data-table"><thead><tr>
      <th>Username</th><th>IP</th><th>Thiết bị</th><th>Browser</th><th>Kết quả</th><th>Thời gian</th>
    </tr></thead><tbody>` + data.map(l => `
      <tr>
        <td><strong>${escapeHtml(l.username)}</strong></td>
        <td class="mono">${escapeHtml(l.ip || '')}</td>
        <td>${escapeHtml(l.device || '')}</td>
        <td>${escapeHtml(l.browser || '')}</td>
        <td>${l.success ? '<span class="status-badge status-completed">Thành công</span>' : '<span class="status-badge status-cancelled">Thất bại</span>'}</td>
        <td style="font-size:0.72rem;white-space:nowrap;">${fmtDate(l.created_at)}</td>
      </tr>
    `).join('') + `</tbody></table>`;
  } catch (e) { console.error(e); }
}

// ===== ADMIN LOGS =====
async function loadLogs() {
  try {
    const { data } = await sb.from('admin_logs').select('*').order('created_at', { ascending: false }).limit(100);
    const t = document.getElementById('logsTable');
    if (!data || data.length === 0) { t.innerHTML = '<p style="text-align:center;padding:30px;color:var(--text-dim);">Chưa có log</p>'; return; }
    t.innerHTML = `<table class="data-table"><thead><tr>
      <th>Action</th><th>Target</th><th>Details</th><th>Thời gian</th>
    </tr></thead><tbody>` + data.map(l => `
      <tr>
        <td><strong>${escapeHtml(l.action)}</strong></td>
        <td class="code-cell">${escapeHtml(l.target || '')}</td>
        <td style="max-width:300px;word-break:break-word;font-size:0.8rem;">${escapeHtml(l.details || '')}</td>
        <td style="font-size:0.72rem;white-space:nowrap;">${fmtDate(l.created_at)}</td>
      </tr>
    `).join('') + `</tbody></table>`;
  } catch (e) { console.error(e); }
}

// ===== EXCEL EXPORT =====
async function exportExcel(type) {
  try {
    let data = [], filename = '';
    if (type === 'orders') {
      const { data: d } = await sb.from('orders').select('*').order('created_at', { ascending: false });
      data = (d || []).map(o => ({ 'Mã': o.order_code, 'KH': o.username, 'Dịch vụ': o.service, 'Giá': o.price, 'TK Game': o.game_username, 'MK Game': o.game_password, 'Trạng thái': o.status, 'Tiến độ': o.progress, 'Thời gian': fmtDate(o.created_at) }));
      filename = 'orders';
    } else if (type === 'deposits') {
      const { data: d } = await sb.from('deposits').select('*').order('created_at', { ascending: false });
      data = (d || []).map(o => ({ 'Mã': o.deposit_code, 'KH': o.username, 'Số tiền': o.amount, 'PT': o.method, 'Ghi chú': o.note, 'Trạng thái': o.status, 'Thời gian': fmtDate(o.created_at) }));
      filename = 'deposits';
    } else if (type === 'cards') {
      const { data: d } = await sb.from('card_deposits').select('*').order('created_at', { ascending: false });
      data = (d || []).map(o => ({ 'Mã': o.card_code, 'KH': o.username, 'Nhà mạng': o.telco, 'Mệnh giá': o.amount, 'Seri': o.serial, 'Mã thẻ': o.code, 'Nhận': o.actual_amount, 'Trạng thái': o.status, 'Thời gian': fmtDate(o.created_at) }));
      filename = 'cards';
    } else if (type === 'users') {
      const { data: d } = await sb.from('users').select('*').order('created_at', { ascending: false });
      data = (d || []).map(o => ({ 'ID': o.id, 'Username': o.username, 'Email': o.email, 'Zalo': o.zalo, 'Số dư': o.balance, 'Đã nạp': o.total_deposited, 'Đã chi': o.total_spent, 'Mã GT': o.referral_code, 'Khóa': o.is_locked ? 'Có' : 'Không', 'Tạo': fmtDate(o.created_at) }));
      filename = 'users';
    }
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, filename);
    const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    XLSX.writeFile(wb, `KNOX_${filename}_${ts}.xlsx`);
    logAdmin('Export Excel', filename, data.length + ' rows');
    showToast('Đã xuất ' + data.length + ' dòng', 'success');
  } catch (e) { showToast('Lỗi: ' + e.message, 'error'); }
}

// ===== BACKUP =====
async function exportBackup() {
  try {
    const tables = ['users', 'orders', 'deposits', 'card_deposits', 'scripts', 'hot_deals', 'vouchers', 'reviews', 'tickets', 'notifications', 'login_history', 'broadcasts', 'admin_logs'];
    const backup = {};
    for (const t of tables) {
      const { data, error } = await sb.from(t).select('*');
      backup[t] = error ? { error: error.message } : (data || []);
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    a.download = `KNOX_backup_${ts}.json`;
    a.click();
    URL.revokeObjectURL(url);
    logAdmin('Backup DB', '', '13 tables');
    showToast('Đã backup toàn bộ database', 'success');
  } catch (e) { showToast('Lỗi: ' + e.message, 'error'); }
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {
  if (!checkAdminAuth()) return;
  initStars();
  await loadAdminStats();
  await loadRevenueChart(7);

  // Auto refresh every 30s
  adminRefreshInterval = setInterval(() => {
    loadAdminStats();
  }, 30000);
});
