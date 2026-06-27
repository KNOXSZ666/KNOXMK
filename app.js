/* ============================================================
   KNOX SHOP - APP.JS (User-facing JavaScript)
   All 24 customer features
   ============================================================ */

// ===== CONFIG =====
const SUPABASE_URL = 'https://lsievokkismxxaiezdlm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzaWV2b2traXNteHhhaWV6ZGxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MjY0NzgsImV4cCI6MjA5NzAwMjQ3OH0.TZ6_NlpDIrl6xDucsc8S4hqA23RQVWsVLrQRjtr6YmQ';
const ADMIN_USER = 'admin';
const ADMIN_PASS_HASH = 'ce4015d3018e3a034167f36ad1028b3bf92561d58cf5233251684ba879cbb8e0'; // SHA-256, không lưu plaintext
const BANK = { name: 'Vietcombank', stk: '1064291846', owner: 'NGUYEN TRUNG NGUYEN', content: 'NAP666' };
async function sha256Text(text) { const data = new TextEncoder().encode(text); const hash = await crypto.subtle.digest('SHA-256', data); return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join(''); }
const CONTACTS = { zalo: '0564721862', telegram: 'ngonthe666', email: 'n799903@gmail.com' };

let sb = null;
try { sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY); } catch (e) { console.error('Supabase init failed', e); }

// ===== PRODUCTS (Updated price list) =====
const PRODUCTS = [
  // Mod Game - Câu Cá Vạn Cân
  { id: 'mod_skill',   cat: 'mod',    name: 'Mod Skill',              game: 'Câu Cá Vạn Cân', price: 10000,  icon: '⚔️' },
  { id: 'mod_ca',      cat: 'mod',    name: 'Mod Cá',                 game: 'Câu Cá Vạn Cân', price: 20000,  icon: '🐟' },
  { id: 'mod_level',   cat: 'mod',    name: 'Mod Level',              game: 'Câu Cá Vạn Cân', price: 10000,  icon: '📈' },
  { id: 'mod_item',    cat: 'mod',    name: 'Mod Item',               game: 'Câu Cá Vạn Cân', price: 20000,  icon: '🎒' },
  { id: 'mod_pet',     cat: 'mod',    name: 'Mod Pet',                game: 'Câu Cá Vạn Cân', price: 20000,  icon: '🐾' },
  { id: 'mod_kc',      cat: 'mod',    name: 'Mod Kim Cương (1tr KC)', game: 'Câu Cá Vạn Cân', price: 30000,  icon: '💎' },
  { id: 'mod_full',    cat: 'mod',    name: 'Câu Cá Vạn Cân Full',    game: 'Câu Cá Vạn Cân', price: 0,      icon: '👑' },
  // Script Roblox
  { id: 'script_sniper', cat: 'script', name: 'Sniper Arena',         game: 'Roblox',          price: 15000,  icon: '🎯' },
  // Other
  { id: 'ban_mod',     cat: 'other',  name: 'Bản Mod (Tự Mod)',       game: 'Khác',            price: 85000,  icon: '📦' },
  { id: 'cau_chung',   cat: 'other',  name: 'Câu Chung (Theo Giờ)',   game: 'Khác',            price: 20000,  icon: '⏰' },
];

// ===== STATE =====
let currentUser = null;
let lastBalance = 0;
let balanceInterval = null;
let notifInterval = null;
let activeBuyProduct = null;
let activeVoucher = null;
let activeVoucherPercent = 0;
let activeReviewStars = 0;
let deferredPrompt = null;
let lastNotifCount = 0;

// ===== UTILS =====
function fmtPrice(n) {
  if (n === 0) return t('btn_contact');
  return Number(n).toLocaleString('vi-VN') + 'đ';
}
function fmtPriceRaw(n) { return Number(n).toLocaleString('vi-VN') + 'đ'; }
function fmtDate(d) {
  if (!d) return '';
  const date = new Date(d);
  return date.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function genCode(prefix) { return prefix + '-' + Math.random().toString(36).substring(2, 8).toUpperCase(); }
function genReferralCode() { return 'REF' + Math.floor(100000 + Math.random() * 900000); }
function genNapCode(username) {
  let hash = 0;
  for (let i = 0; i < username.length; i++) { hash = ((hash << 5) - hash) + username.charCodeAt(i); hash |= 0; }
  return String(10000 + (Math.abs(hash) % 20001));
}
function maskName(name) {
  if (!name) return '***';
  if (name.length <= 3) return name[0] + '**';
  return name.substring(0, 3) + '***';
}
function getDeviceInfo() {
  const ua = navigator.userAgent;
  let device = 'Desktop';
  if (/Mobi|Android/i.test(ua)) device = 'Mobile';
  else if (/iPad|Tablet/i.test(ua)) device = 'Tablet';
  let browser = 'Unknown';
  if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) browser = 'Chrome';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Edg/i.test(ua)) browser = 'Edge';
  return { device, browser };
}
function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
async function getUserIP() {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip || 'unknown';
  } catch { return 'unknown'; }
}
function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => showToast(t('copied'), 'success'));
  } else {
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); showToast(t('copied'), 'success'); } catch (e) {}
    document.body.removeChild(ta);
  }
}

// ===== TOAST =====
function showToast(msg, type) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const el = document.createElement('div');
  el.className = 'toast' + (type ? ' ' + type : '');
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => { el.classList.add('removing'); setTimeout(() => el.remove(), 300); }, 3500);
}

// ===== VIP =====
function getVipLevel(totalDeposited) {
  if (totalDeposited >= 5000000) return 4;
  if (totalDeposited >= 1000000) return 3;
  if (totalDeposited >= 500000) return 2;
  if (totalDeposited >= 100000) return 1;
  return 0;
}
function getVipDiscount(level) { return [0, 5, 10, 15, 20][level] || 0; }
function getVipName(level) { return [t('vip_new'), t('vip_1'), t('vip_2'), t('vip_3'), t('vip_4')][level]; }
function getVipThreshold(level) { return [0, 100000, 500000, 1000000, 5000000][level]; }

// ===== BACKGROUND EFFECTS =====
function initBackgroundEffects() {
  // Stars
  const sc = document.getElementById('starsContainer');
  if (sc) {
    for (let i = 0; i < 40; i++) {
      const s = document.createElement('div');
      s.className = 'star';
      s.style.left = Math.random() * 100 + '%';
      s.style.top = Math.random() * 100 + '%';
      s.style.animationDelay = Math.random() * 3 + 's';
      s.style.animationDuration = (2 + Math.random() * 3) + 's';
      sc.appendChild(s);
    }
  }
  // Sakura petals (4)
  const colors = ['#FFB7C5', '#FF69B4', '#FFC0CB', '#FFD1DC'];
  for (let i = 0; i < 4; i++) {
    const p = document.createElement('div');
    p.className = 'sakura';
    p.innerHTML = '🌸';
    p.style.fontSize = (16 + Math.random() * 12) + 'px';
    p.style.left = (Math.random() * 100) + '%';
    p.style.animationDuration = (12 + Math.random() * 10) + 's';
    p.style.animationDelay = (Math.random() * 10) + 's';
    p.style.opacity = 0.4 + Math.random() * 0.3;
    document.body.appendChild(p);
  }
  // Particles (10)
  for (let i = 0; i < 10; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = (Math.random() * 100) + '%';
    p.style.animationDuration = (10 + Math.random() * 15) + 's';
    p.style.animationDelay = (Math.random() * 10) + 's';
    if (i % 3 === 0) p.style.background = '#00B4FF', p.style.boxShadow = '0 0 8px #00B4FF';
    document.body.appendChild(p);
  }
}

// ===== SCROLL REVEAL =====
function initScrollReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.hud-card, .hero, .section').forEach((el) => {
    el.classList.add('reveal');
    obs.observe(el);
  });
}

// ===== MODALS =====
function openModal(id) {
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
}

// ===== NAVIGATION =====
function navTo(section) {
  const el = document.getElementById(section);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ===== MOBILE MENU =====
function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const overlay = document.getElementById('menuOverlay');
  const ham = document.getElementById('hamburger');
  menu.classList.toggle('open');
  overlay.classList.toggle('show');
  ham.classList.toggle('open');
  document.body.classList.toggle('menu-open', menu.classList.contains('open'));
}
function closeMobileMenu() {
  document.getElementById('mobileMenu').classList.remove('open');
  document.getElementById('menuOverlay').classList.remove('show');
  document.getElementById('hamburger').classList.remove('open');
  document.body.classList.remove('menu-open');
}

// ===== NOTIFICATIONS =====
function toggleNotifDropdown(e) {
  if (e) e.stopPropagation();
  document.getElementById('notifDropdown').classList.toggle('open');
}
document.addEventListener('click', (e) => {
  const dd = document.getElementById('notifDropdown');
  const bell = document.getElementById('notifBell');
  if (dd && bell && !bell.contains(e.target) && !dd.contains(e.target)) dd.classList.remove('open');
});

async function loadNotifications() {
  if (!currentUser) return;
  try {
    const { data } = await sb.from('notifications').select('*').eq('username', currentUser.username).order('created_at', { ascending: false }).limit(20);
    const dd = document.getElementById('notifDropdown');
    const unread = (data || []).filter(n => !n.read).length;
    const badge = document.getElementById('notifBadge');
    if (unread > 0) { badge.textContent = unread; badge.classList.remove('hidden'); }
    else { badge.classList.add('hidden'); }

    if (lastNotifCount > 0 && unread > lastNotifCount) {
      showToast(t('toast_added_money'), 'success');
    }
    lastNotifCount = unread;

    if (!data || data.length === 0) {
      dd.innerHTML = '<div class="notif-empty">' + t('notif_empty') + '</div>';
      return;
    }
    dd.innerHTML = data.map(n => `
      <div class="notif-item ${n.read ? '' : 'unread'}" onclick="markNotifRead(${n.id})">
        <div class="notif-item-title">${escapeHtml(n.title)}</div>
        <div class="notif-item-msg">${escapeHtml(n.message)}</div>
        <div class="notif-item-time">${fmtDate(n.created_at)}</div>
      </div>
    `).join('');
  } catch (e) { console.error(e); }
}

async function markNotifRead(id) {
  try { await sb.from('notifications').update({ read: true }).eq('id', id); } catch (e) {}
  loadNotifications();
}

async function markAllNotifsRead() {
  if (!currentUser) return;
  try { await sb.from('notifications').update({ read: true }).eq('username', currentUser.username).eq('read', false); } catch (e) {}
  loadNotifications();
}

async function createNotification(username, title, message, type) {
  try {
    await sb.from('notifications').insert({ username, title, message, type: type || 'info', read: false });
  } catch (e) { console.error(e); }
}

// ===== AUTH UI UPDATE =====
function updateAuthUI() {
  const isAdmin = currentUser && currentUser.username === ADMIN_USER;
  const isUser = currentUser && !isAdmin;

  const navBalance = document.getElementById('navBalance');
  const navBell = document.getElementById('notifBell');
  const navLogin = document.getElementById('navLoginBtn');
  const navReg = document.getElementById('navRegisterBtn');
  const navLogout = document.getElementById('navLogoutBtn');
  const navAdmin = document.getElementById('navAdminBtn');
  const navVip = document.getElementById('navVipBadge');

  if (!currentUser) {
    navBalance.classList.add('hidden'); navBell.classList.add('hidden'); navVip.classList.add('hidden');
    navLogin.classList.remove('hidden'); navReg.classList.remove('hidden');
    navLogout.classList.add('hidden'); navAdmin.classList.add('hidden');
  } else if (isAdmin) {
    navBalance.classList.add('hidden'); navBell.classList.add('hidden'); navVip.classList.add('hidden');
    navLogin.classList.add('hidden'); navReg.classList.add('hidden');
    navLogout.classList.remove('hidden'); navAdmin.classList.remove('hidden');
  } else {
    navBalance.classList.remove('hidden'); navBell.classList.remove('hidden');
    navLogin.classList.add('hidden'); navReg.classList.add('hidden');
    navLogout.classList.remove('hidden'); navAdmin.classList.add('hidden');
    // Show VIP badge on desktop
    const vip = getVipLevel(currentUser.total_deposited);
    navVip.textContent = getVipName(vip);
    navVip.className = 'vip-badge' + (vip === 4 ? ' vip4' : '');
    if (window.innerWidth > 900) navVip.classList.remove('hidden');
    else navVip.classList.add('hidden');
  }

  // Mobile menu
  const mobileUserPanel = document.getElementById('mobileUsername');
  const mobileVip = document.getElementById('mobileVipBadge');
  const mobileDep = document.getElementById('mobileDepositBtns');
  const mobileAuth = document.getElementById('mobileAuthBtns');

  if (!currentUser) {
    mobileUserPanel.textContent = 'Guest';
    mobileVip.style.display = 'none';
    mobileDep.style.display = 'none'; mobileAuth.style.display = 'flex';
  } else if (isAdmin) {
    mobileUserPanel.textContent = 'Admin';
    mobileVip.style.display = 'none';
    mobileDep.style.display = 'none'; mobileAuth.style.display = 'none';
  } else {
    mobileUserPanel.textContent = currentUser.username;
    mobileDep.style.display = 'flex'; mobileAuth.style.display = 'none';
    const vip = getVipLevel(currentUser.total_deposited);
    mobileVip.textContent = getVipName(vip);
    mobileVip.className = 'vip-badge' + (vip === 4 ? ' vip4' : '');
    mobileVip.style.display = 'inline-flex';
  }

  updateBalanceDisplay();
  updateLoginPromptSections();
}

function updateLoginPromptSections() {
  const loggedIn = !!currentUser;
  const isAdmin = currentUser && currentUser.username === ADMIN_USER;
  const showUserContent = loggedIn && !isAdmin;

  document.getElementById('historyLoginPrompt').style.display = showUserContent ? 'none' : 'block';
  document.getElementById('historyContent').style.display = showUserContent ? 'block' : 'none';
  document.getElementById('dashLoginPrompt').style.display = showUserContent ? 'none' : 'block';
  document.getElementById('dashContent').style.display = showUserContent ? 'block' : 'none';
  document.getElementById('ticketLoginPrompt').style.display = showUserContent ? 'none' : 'block';
  document.getElementById('ticketContent').style.display = showUserContent ? 'block' : 'none';
}

// ===== BALANCE =====
async function refreshBalance() {
  if (!currentUser || currentUser.username === ADMIN_USER) return;
  try {
    const { data } = await sb.from('users').select('balance, total_deposited, total_spent, vip_level, is_locked').eq('username', currentUser.username).single();
    if (data) {
      const oldBal = currentUser.balance;
      currentUser.balance = data.balance;
      currentUser.total_deposited = data.total_deposited;
      currentUser.total_spent = data.total_spent;
      currentUser.is_locked = data.is_locked;
      if (data.balance !== oldBal) {
        updateBalanceDisplay(true);
        if (data.balance > oldBal) showToast(t('toast_added_money'), 'success');
      }
      updateBalanceDisplay();
    }
  } catch (e) {}
}

function updateBalanceDisplay(animate) {
  if (!currentUser) return;
  const bal = currentUser.balance || 0;
  const el1 = document.getElementById('navBalanceVal');
  const el2 = document.getElementById('mobileBalanceVal');
  if (el1) el1.textContent = fmtPriceRaw(bal);
  if (el2) el2.textContent = fmtPriceRaw(bal);
  const navBal = document.getElementById('navBalance');
  if (animate && navBal) {
    navBal.classList.add('animate');
    setTimeout(() => navBal.classList.remove('animate'), 600);
  }
}

// ===== REGISTER =====
async function doRegister() {
  const username = document.getElementById('regUsername').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const zalo = document.getElementById('regZalo').value.trim();
  const password = document.getElementById('regPassword').value;
  const confirm = document.getElementById('regConfirm').value;
  const referral = document.getElementById('regReferral').value.trim();

  if (username.length < 3) return showToast(t('reg_err_username'), 'error');
  if (username.toLowerCase() === ADMIN_USER) return showToast(t('reg_err_username_admin'), 'error');
  if (password.length < 6) return showToast(t('reg_err_password'), 'error');
  if (password !== confirm) return showToast(t('reg_err_match'), 'error');

  // Check existing
  try {
    const { data: existing } = await sb.from('users').select('username').eq('username', username).maybeSingle();
    if (existing) return showToast(t('reg_err_taken'), 'error');

    // Check referral
    let referredBy = null;
    if (referral) {
      const { data: refUser } = await sb.from('users').select('username').eq('referral_code', referral).maybeSingle();
      if (!refUser) return showToast(t('reg_err_referral'), 'error');
      referredBy = refUser.username;
    }

    const refCode = genReferralCode();
    await sb.from('users').insert({
      username, password, email, zalo, balance: 0, total_spent: 0, total_deposited: 0,
      vip_level: 0, referral_code: refCode, referred_by: referredBy, is_locked: false
    });

    showToast(t('reg_success'), 'success');
    closeModal('registerModal');
    ['regUsername', 'regEmail', 'regZalo', 'regPassword', 'regConfirm', 'regReferral'].forEach(id => document.getElementById(id).value = '');
    openModal('loginModal');
  } catch (e) { console.error(e); showToast('Lỗi: ' + e.message, 'error'); }
}

// ===== LOGIN =====
async function doLogin() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  const ip = await getUserIP();
  const info = getDeviceInfo();

  // Admin check
  if (username.toLowerCase() === ADMIN_USER) {
    if (await sha256Text(password) === ADMIN_PASS_HASH) {
      // Log login history
      try { await sb.from('login_history').insert({ username: ADMIN_USER, ip, device: info.device, browser: info.browser, success: true }); } catch (e) {}
      currentUser = { username: ADMIN_USER, balance: 0, total_deposited: 0, total_spent: 0 };
      localStorage.setItem('knox_user', JSON.stringify({ username: ADMIN_USER, ts: Date.now() }));
      closeModal('loginModal');
      showToast(t('login_success'), 'success');
      updateAuthUI();
      setTimeout(() => { window.location.href = 'admin.html'; }, 800);
    } else {
      try { await sb.from('login_history').insert({ username: ADMIN_USER, ip, device: info.device, browser: info.browser, success: false }); } catch (e) {}
      showToast(t('login_err_adminpass'), 'error');
    }
    return;
  }

  // User check
  try {
    // First check if username exists
    const { data: user } = await sb.from('users').select('*').eq('username', username).maybeSingle();
    if (!user) {
      try { await sb.from('login_history').insert({ username, ip, device: info.device, browser: info.browser, success: false }); } catch (e) {}
      return showToast(t('login_err_notfound'), 'error');
    }
    // Check password
    if (user.password !== password) {
      try { await sb.from('login_history').insert({ username, ip, device: info.device, browser: info.browser, success: false }); } catch (e) {}
      return showToast(t('login_err_pass'), 'error');
    }
    // Check locked
    if (user.is_locked) {
      try { await sb.from('login_history').insert({ username, ip, device: info.device, browser: info.browser, success: false }); } catch (e) {}
      return showToast(t('login_err_locked'), 'error');
    }

    // Success
    try {
      await sb.from('login_history').insert({ username, ip, device: info.device, browser: info.browser, success: true });
      await sb.from('users').update({ last_login: new Date().toISOString(), last_ip: ip, last_device: info.device }).eq('username', username);
    } catch (e) {}

    currentUser = user;
    lastBalance = user.balance;
    localStorage.setItem('knox_user', JSON.stringify({ username: user.username, ts: Date.now() }));

    closeModal('loginModal');
    showToast(t('login_success'), 'success');
    updateAuthUI();
    loadUserData();
  } catch (e) { console.error(e); showToast('Lỗi kết nối', 'error'); }
}

// ===== LOGOUT =====
function doLogout() {
  currentUser = null;
  localStorage.removeItem('knox_user');
  if (balanceInterval) { clearInterval(balanceInterval); balanceInterval = null; }
  if (notifInterval) { clearInterval(notifInterval); notifInterval = null; }
  updateAuthUI();
  showToast('Đã đăng xuất', 'success');
}

// ===== CHANGE PASSWORD =====
async function changePassword() {
  if (!currentUser) return;
  const oldP = document.getElementById('cpOld').value;
  const newP = document.getElementById('cpNew').value;
  const confP = document.getElementById('cpConfirm').value;
  if (oldP !== currentUser.password) return showToast(t('changepass_err_old'), 'error');
  if (newP.length < 6) return showToast(t('reg_err_password'), 'error');
  if (newP !== confP) return showToast(t('reg_err_match'), 'error');
  try {
    await sb.from('users').update({ password: newP }).eq('username', currentUser.username);
    currentUser.password = newP;
    createNotification(currentUser.username, '🔒 Đổi mật khẩu', 'Mật khẩu của bạn đã được thay đổi thành công.', 'security');
    showToast(t('changepass_success'), 'success');
    closeModal('changepassModal');
    ['cpOld', 'cpNew', 'cpConfirm'].forEach(id => document.getElementById(id).value = '');
  } catch (e) { showToast('Lỗi: ' + e.message, 'error'); }
}

// ===== SESSION RESTORE =====
async function restoreSession() {
  const saved = localStorage.getItem('knox_user');
  if (!saved) return;
  try {
    const parsed = JSON.parse(saved);
    if (Date.now() - parsed.ts > 7 * 24 * 3600 * 1000) { localStorage.removeItem('knox_user'); return; }
    if (parsed.username === ADMIN_USER) {
      currentUser = { username: ADMIN_USER, balance: 0, total_deposited: 0, total_spent: 0 };
      updateAuthUI();
      return;
    }
    const { data } = await sb.from('users').select('*').eq('username', parsed.username).maybeSingle();
    if (data && !data.is_locked) {
      currentUser = data;
      lastBalance = data.balance;
      updateAuthUI();
      loadUserData();
    } else {
      localStorage.removeItem('knox_user');
    }
  } catch (e) {}
}

// ===== LOAD USER DATA =====
async function loadUserData() {
  if (!currentUser || currentUser.username === ADMIN_USER) return;
  refreshBalance();
  loadNotifications();
  loadHistory();
  loadDashboard();
  loadTickets();
  if (!balanceInterval) balanceInterval = setInterval(() => { if (!document.hidden) refreshBalance(); }, 2000);
  if (!notifInterval) notifInterval = setInterval(() => { if (!document.hidden) loadNotifications(); }, 10000);
}

// ===== PRODUCTS DISPLAY =====
function renderProducts() {
  const cats = { mod: 'modGrid', script: 'scriptGrid', other: 'otherGrid' };
  Object.keys(cats).forEach(cat => {
    const grid = document.getElementById(cats[cat]);
    if (!grid) return;
    const items = PRODUCTS.filter(p => p.cat === cat);
    grid.innerHTML = items.map(p => `
      <div class="hud-card product-card product-card-premium reveal">
        <div class="shine"></div>
        <div class="product-media">
          <img src="${p.image}" alt="${escapeHtml(p.game + ' ' + p.name)}" loading="lazy">
          <span class="product-badge ${String(p.badge || '').toLowerCase()}">${p.badge || 'NEW'}</span>
          <span class="product-float-icon">${p.icon}</span>
        </div>
        <div class="product-body">
          <div class="product-game">${escapeHtml(p.game)}</div>
          <div class="product-name">${escapeHtml(p.name)}</div>
          <div class="product-meta-line"><span>✓ ${t('in_stock')}</span><span>Bảo hành</span></div>
          <div class="product-price ${p.price === 0 ? 'free' : ''}">${fmtPrice(p.price)}</div>
        </div>
        <div class="product-footer">
          <button class="btn ${p.price === 0 ? 'btn-secondary' : 'btn-primary'} btn-sm btn-block" onclick="openBuyModal('${p.id}')">
            ${p.price === 0 ? t('btn_contact') : t('btn_buy')}
          </button>
        </div>
      </div>
    `).join('');
  });
  document.querySelectorAll('.product-card.reveal:not(.visible)').forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight) el.classList.add('visible');
  });
}

// ===== BUY MODAL =====
function openBuyModal(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  if (!currentUser || currentUser.username === ADMIN_USER) {
    showToast('Vui lòng đăng nhập để mua hàng', 'warning');
    openModal('loginModal');
    return;
  }
  activeBuyProduct = product;
  activeVoucher = null;
  activeVoucherPercent = 0;

  const vipLevel = getVipLevel(currentUser.total_deposited);
  const vipDiscount = getVipDiscount(vipLevel);
  const basePrice = product.price;
  const afterVip = Math.round(basePrice * (1 - vipDiscount / 100));

  const body = document.getElementById('buyModalBody');
  body.innerHTML = `
    <div class="game-info-box">
      <div class="game-info-row">
        <span class="game-info-label" data-i18n="buy_service">Dịch vụ</span>
        <span class="game-info-val">${product.icon} ${product.name}</span>
      </div>
      <div class="game-info-row">
        <span class="game-info-label" data-i18n="buy_price">Giá</span>
        <span class="game-info-val">${fmtPriceRaw(basePrice)}</span>
      </div>
      ${vipDiscount > 0 ? `
      <div class="game-info-row">
        <span class="game-info-label" data-i18n="buy_vip_discount">Giảm VIP</span>
        <span class="game-info-val text-accent">-${vipDiscount}%</span>
      </div>` : ''}
    </div>
    ${product.price > 0 ? `
    <div class="form-group">
      <label class="form-label" data-i18n="buy_voucher">Mã giảm giá</label>
      <div style="display:flex;gap:8px;">
        <input type="text" class="form-input" id="buyVoucherInput" data-i18n-ph="buy_voucher_placeholder" placeholder="Nhập mã voucher (tùy chọn)">
        <button class="btn btn-secondary btn-sm" data-i18n="buy_check_voucher" onclick="checkVoucher()">Áp dụng</button>
      </div>
      <div id="voucherMsg" style="font-size:0.8rem;margin-top:4px;"></div>
    </div>` : ''}
    <div class="form-group">
      <label class="form-label" data-i18n="buy_gameuser">Tài khoản game</label>
      <input type="text" class="form-input" id="buyGameUser" placeholder="Tài khoản game của bạn">
    </div>
    <div class="form-group">
      <label class="form-label" data-i18n="buy_gamepass">Mật khẩu game</label>
      <input type="text" class="form-input" id="buyGamePass" placeholder="Mật khẩu game của bạn">
    </div>
    <div class="form-group">
      <label class="form-label" data-i18n="buy_note">Ghi chú thêm</label>
      <textarea class="form-textarea" id="buyNote" data-i18n-ph="buy_note_placeholder"></textarea>
    </div>
    <div class="game-info-box">
      <div class="game-info-row">
        <span class="game-info-label" data-i18n="buy_final_price">Thành tiền</span>
        <span class="game-info-val text-accent" style="font-size:1.2rem;" id="buyFinalPrice">${fmtPriceRaw(afterVip)}</span>
      </div>
      <div class="game-info-row">
        <span class="game-info-label" data-i18n="buy_balance">Số dư ví</span>
        <span class="game-info-val">${fmtPriceRaw(currentUser.balance)}</span>
      </div>
    </div>
    <input type="hidden" id="buyBasePrice" value="${afterVip}">
    <button class="btn btn-primary btn-block" data-i18n="buy_confirm" onclick="confirmPurchase()">Xác nhận mua</button>
  `;
  applyLang();
  openModal('buyModal');
}

async function checkVoucher() {
  const code = document.getElementById('buyVoucherInput').value.trim().toUpperCase();
  const msg = document.getElementById('voucherMsg');
  if (!code) return;
  try {
    const { data } = await sb.from('vouchers').select('*').eq('code', code).maybeSingle();
    if (!data || !data.active || data.used_count >= data.max_uses || (data.expires_at && new Date(data.expires_at) < new Date())) {
      msg.innerHTML = '<span class="text-danger">✗ ' + t('buy_invalid_voucher') + '</span>';
      activeVoucher = null; activeVoucherPercent = 0;
      return;
    }
    activeVoucher = code;
    activeVoucherPercent = data.discount_percent;
    msg.innerHTML = '<span class="text-accent">✓ ' + t('buy_applied') + ' -' + data.discount_percent + '%</span>';
    updateBuyFinalPrice();
  } catch (e) { showToast('Lỗi kiểm tra voucher', 'error'); }
}

function updateBuyFinalPrice() {
  if (!activeBuyProduct) return;
  let price = parseInt(document.getElementById('buyBasePrice').value) || activeBuyProduct.price;
  if (activeVoucherPercent > 0) price = Math.round(price * (1 - activeVoucherPercent / 100));
  const el = document.getElementById('buyFinalPrice');
  if (el) el.textContent = fmtPriceRaw(price);
}

async function confirmPurchase() {
  if (!activeBuyProduct || !currentUser) return;
  const gameUser = document.getElementById('buyGameUser').value.trim();
  const gamePass = document.getElementById('buyGamePass').value.trim();
  const note = document.getElementById('buyNote').value.trim();

  if (gameUser.length < 3 || gamePass.length < 3) {
    return showToast(t('buy_validate_game'), 'error');
  }

  let price = parseInt(document.getElementById('buyBasePrice').value) || activeBuyProduct.price;
  if (activeVoucherPercent > 0) price = Math.round(price * (1 - activeVoucherPercent / 100));
  if (activeBuyProduct.price === 0) price = 0;

  // Check balance
  if (price > 0 && price > currentUser.balance) {
    showToast(t('buy_not_enough'), 'error');
    setTimeout(() => { closeModal('buyModal'); navTo('deposit'); }, 1500);
    return;
  }

  const orderCode = genCode('KNX');
  try {
    // Deduct money
    if (price > 0) {
      const newBalance = currentUser.balance - price;
      const newSpent = (currentUser.total_spent || 0) + price;
      await sb.from('users').update({ balance: newBalance, total_spent: newSpent }).eq('username', currentUser.username);
      currentUser.balance = newBalance;
      currentUser.total_spent = newSpent;
    }

    // Create order
    await sb.from('orders').insert({
      order_code: orderCode,
      username: currentUser.username,
      service: activeBuyProduct.icon + ' ' + activeBuyProduct.name,
      payment: 'Ví KNOX',
      note: note,
      price: price,
      status: 'pending',
      progress: 0,
      game_username: gameUser,
      game_password: gamePass
    });

    // Increment voucher usage
    if (activeVoucher) {
      try {
        const { data: v } = await sb.from('vouchers').select('used_count').eq('code', activeVoucher).single();
        if (v) await sb.from('vouchers').update({ used_count: v.used_count + 1 }).eq('code', activeVoucher);
      } catch (e) {}
    }

    createNotification(currentUser.username, '🛒 Đặt hàng thành công', `Đơn ${orderCode} - ${activeBuyProduct.name} đã được tạo.`, 'order');
    showToast(t('buy_success') + ' Mã: ' + orderCode, 'success');
    closeModal('buyModal');
    updateBalanceDisplay(true);
    loadHistory();
  } catch (e) { console.error(e); showToast('Lỗi: ' + e.message, 'error'); }
}

// ===== DEPOSIT =====
function switchDepositTab(tab, btn) {
  document.querySelectorAll('#deposit .tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  else { const btns = document.querySelectorAll('#deposit .tab-btn'); if (btns[tab === 'bank' ? 0 : 1]) btns[tab === 'bank' ? 0 : 1].classList.add('active'); }
  document.getElementById('bankDepositTab').style.display = tab === 'bank' ? 'block' : 'none';
  document.getElementById('cardDepositTab').style.display = tab === 'card' ? 'block' : 'none';
}

function setDepAmount(val, btn) {
  document.getElementById('depAmount').value = val;
  document.querySelectorAll('#bankDepositTab .quick-amount').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

async function createBankDeposit() {
  if (!currentUser) { showToast('Vui lòng đăng nhập', 'warning'); openModal('loginModal'); return; }
  const amount = parseInt(document.getElementById('depAmount').value);
  const method = document.getElementById('depMethod').value;
  const note = document.getElementById('depNote').value.trim();
  if (!amount || amount < 10000) return showToast('Số tiền tối thiểu 10.000đ', 'error');

  const depCode = genCode('NAP');
  const napContent = 'NAP' + genNapCode(currentUser.username);
  const fullNote = '[NDCK: ' + napContent + ']' + (note ? ' ' + note : '');
  try {
    await sb.from('deposits').insert({
      deposit_code: depCode,
      username: currentUser.username,
      amount: amount,
      method: method,
      note: fullNote,
      status: 'pending'
    });

    // Show success with bank info
    const body = document.getElementById('depositSuccessBody');
    body.innerHTML = `
      <p style="text-align:center;margin-bottom:16px;">✅ Vui lòng chuyển khoản theo thông tin bên dưới. Admin sẽ duyệt sau khi nhận được tiền.</p>
      <div class="game-info-box">
        <div class="game-info-row">
          <span class="game-info-label" data-i18n="deposit_bank_name">Ngân hàng</span>
          <span class="game-info-val">Vietcombank</span>
        </div>
        <div class="game-info-row">
          <span class="game-info-label" data-i18n="deposit_stk">Số tài khoản</span>
          <span class="game-info-val">${BANK.stk}</span>
          <button class="copy-btn" onclick="copyToClipboard('${BANK.stk}')">${t('copy')}</button>
        </div>
        <div class="game-info-row">
          <span class="game-info-label" data-i18n="deposit_owner">Chủ tài khoản</span>
          <span class="game-info-val">${BANK.owner}</span>
          <button class="copy-btn" onclick="copyToClipboard('${BANK.owner}')">${t('copy')}</button>
        </div>
        <div class="game-info-row">
          <span class="game-info-label" data-i18n="deposit_content">Nội dung CK</span>
          <span class="game-info-val text-accent" style="font-weight:700;">${napContent}</span>
          <button class="copy-btn" onclick="copyToClipboard('${napContent}')">${t('copy')}</button>
        </div>
        <div class="game-info-row">
          <span class="game-info-label" data-i18n="deposit_amount_label">Số tiền</span>
          <span class="game-info-val text-accent" style="font-weight:700;">${fmtPriceRaw(amount)}</span>
          <button class="copy-btn" onclick="copyToClipboard('${amount}')">${t('copy')}</button>
        </div>
      </div>
      <p style="text-align:center;margin-top:12px;font-size:0.8rem;color:var(--text-dim);">⚠️ Bắt buộc dùng nội dung CK: <strong style="color:var(--accent);">${napContent}</strong></p>
    `;
    applyLang();
    openModal('depositSuccessModal');
    document.getElementById('depAmount').value = '';
    document.getElementById('depNote').value = '';

    // Auto scroll to home after showing modal
    setTimeout(() => { navTo('home'); }, 500);
  } catch (e) { showToast('Lỗi: ' + e.message, 'error'); }
}

// ===== CARD DEPOSIT =====
function getCardDiscount(telco, amount) {
  let base = 12;
  if (amount >= 200000) base = 15;
  else if (amount >= 100000) base = 14;
  else if (amount >= 50000) base = 13;
  else base = 12;
  if (telco === 'Viettel') base = Math.min(base + 1, 15);
  return base;
}

function updateCardReceive() {
  const telco = document.getElementById('cardTelco').value;
  const amount = parseInt(document.getElementById('cardAmount').value);
  const discount = getCardDiscount(telco, amount);
  const receive = Math.round(amount * (1 - discount / 100));
  document.getElementById('cardDiscountDisplay').textContent = discount + '%';
  document.getElementById('cardReceiveDisplay').textContent = fmtPriceRaw(receive);
}

async function createCardDeposit() {
  if (!currentUser) { showToast('Vui lòng đăng nhập', 'warning'); openModal('loginModal'); return; }
  const telco = document.getElementById('cardTelco').value;
  const amount = parseInt(document.getElementById('cardAmount').value);
  const serial = document.getElementById('cardSerial').value.trim();
  const code = document.getElementById('cardCode').value.trim();
  if (!serial || !code) return showToast(t('card_validate'), 'error');

  const discount = getCardDiscount(telco, amount);
  const actual = Math.round(amount * (1 - discount / 100));
  const cardCode = genCode('CARD');

  try {
    await sb.from('card_deposits').insert({
      card_code: cardCode,
      username: currentUser.username,
      telco: telco,
      serial: serial,
      code: code,
      amount: amount,
      actual_amount: actual,
      status: 'pending'
    });
    showToast(t('card_success'), 'success');
    document.getElementById('cardSerial').value = '';
    document.getElementById('cardCode').value = '';
    loadHistory();
  } catch (e) { showToast('Lỗi: ' + e.message, 'error'); }
}

// ===== HISTORY =====
let historyTab = 'orders';
function switchHistoryTab(tab, btn) {
  historyTab = tab;
  document.querySelectorAll('#history .tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.getElementById('historyOrdersTab').style.display = tab === 'orders' ? 'block' : 'none';
  document.getElementById('historyDepositsTab').style.display = tab === 'deposits' ? 'block' : 'none';
  document.getElementById('historyCardsTab').style.display = tab === 'cards' ? 'block' : 'none';
}

async function loadHistory() {
  if (!currentUser || currentUser.username === ADMIN_USER) return;
  try {
    const [ordersRes, depsRes, cardsRes] = await Promise.all([
      sb.from('orders').select('*').eq('username', currentUser.username).order('created_at', { ascending: false }),
      sb.from('deposits').select('*').eq('username', currentUser.username).order('created_at', { ascending: false }),
      sb.from('card_deposits').select('*').eq('username', currentUser.username).order('created_at', { ascending: false })
    ]);

    // Orders
    const ot = document.getElementById('historyOrdersTable');
    if (!ordersRes.data || ordersRes.data.length === 0) {
      ot.innerHTML = '<p style="text-align:center;padding:30px;color:var(--text-dim);">' + t('history_no_orders') + '</p>';
    } else {
      ot.innerHTML = `<table class="data-table"><thead><tr>
        <th>Mã đơn</th><th>Dịch vụ</th><th>Giá</th><th>TK Game</th><th>Tiến độ</th><th>Trạng thái</th><th>Thao tác</th>
      </tr></thead><tbody>` + ordersRes.data.map(o => {
        const statusClass = 'status-' + (o.status || 'pending');
        const statusText = { pending: t('history_status_pending'), processing: t('history_status_processing'), completed: t('history_status_completed'), cancelled: t('history_status_cancelled') }[o.status] || o.status;
        let actions = '';
        if (o.status === 'pending') actions += `<button class="admin-action-btn delete" onclick="cancelOrder('${o.order_code}')">${t('history_cancel')}</button>`;
        if (o.status === 'completed' && o.download_link) actions += `<button class="admin-action-btn approve" onclick="copyToClipboard('${escapeHtml(o.download_link)}')">${t('history_download')}</button>`;
        if (o.status === 'completed' && !o.rating) actions += `<button class="admin-action-btn edit" onclick="openReviewModal('${o.order_code}','${escapeHtml(o.service)}')">${t('history_review')}</button>`;
        return `<tr>
          <td class="code-cell">${o.order_code}</td>
          <td>${escapeHtml(o.service)}</td>
          <td>${fmtPriceRaw(o.price)}</td>
          <td>
            <div class="game-info-box" style="margin:0;padding:6px;">
              <div class="game-info-row"><span class="game-info-label">ID:</span><span class="game-info-val">${escapeHtml(o.game_username)}</span></div>
              <div class="game-info-row"><span class="game-info-label">MK:</span><span class="game-info-val">${escapeHtml(o.game_password)}</span></div>
            </div>
            <button class="copy-btn" onclick="copyToClipboard('ID: ${escapeHtml(o.game_username)} | MK: ${escapeHtml(o.game_password)}')">${t('copy')}</button>
          </td>
          <td>
            <div class="progress-bar"><div class="progress-fill" style="width:${o.progress || 0}%"></div></div>
            <span style="font-size:0.7rem;">${o.progress || 0}%</span>
          </td>
          <td><span class="status-badge ${statusClass}">${statusText}</span></td>
          <td>${actions || '-'}</td>
        </tr>`;
      }).join('') + `</tbody></table>`;
    }

    // Deposits
    const dt = document.getElementById('historyDepositsTable');
    if (!depsRes.data || depsRes.data.length === 0) {
      dt.innerHTML = '<p style="text-align:center;padding:30px;color:var(--text-dim);">' + t('history_no_deposits') + '</p>';
    } else {
      dt.innerHTML = `<table class="data-table"><thead><tr>
        <th>Mã nạp</th><th>Số tiền</th><th>PT</th><th>Ghi chú</th><th>Trạng thái</th><th>Thời gian</th>
      </tr></thead><tbody>` + depsRes.data.map(d => {
        const sc = 'status-' + (d.status === 'completed' ? 'completed' : d.status === 'rejected' ? 'cancelled' : 'pending');
        const st = { pending: t('deposit_pending'), completed: t('history_status_completed'), rejected: t('history_status_cancelled') }[d.status] || d.status;
        return `<tr>
          <td class="code-cell">${d.deposit_code}</td>
          <td class="text-accent">${fmtPriceRaw(d.amount)}</td>
          <td>${escapeHtml(d.method)}</td>
          <td>${escapeHtml(d.note || '')}</td>
          <td><span class="status-badge ${sc}">${st}</span></td>
          <td>${fmtDate(d.created_at)}</td>
        </tr>`;
      }).join('') + `</tbody></table>`;
    }

    // Cards
    const ct = document.getElementById('historyCardsTable');
    if (!cardsRes.data || cardsRes.data.length === 0) {
      ct.innerHTML = '<p style="text-align:center;padding:30px;color:var(--text-dim);">' + t('history_no_cards') + '</p>';
    } else {
      ct.innerHTML = `<table class="data-table"><thead><tr>
        <th>Mã thẻ</th><th>Nhà mạng</th><th>Mệnh giá</th><th>Nhận được</th><th>Trạng thái</th><th>Thời gian</th>
      </tr></thead><tbody>` + cardsRes.data.map(c => {
        const sc = 'status-' + (c.status === 'completed' ? 'completed' : c.status === 'rejected' ? 'cancelled' : 'pending');
        const st = { pending: 'Chờ duyệt', completed: t('history_status_completed'), rejected: t('history_status_cancelled') }[c.status] || c.status;
        return `<tr>
          <td class="code-cell">${c.card_code}</td>
          <td>${escapeHtml(c.telco)}</td>
          <td>${fmtPriceRaw(c.amount)}</td>
          <td class="text-accent">${fmtPriceRaw(c.actual_amount)}</td>
          <td><span class="status-badge ${sc}">${st}</span></td>
          <td>${fmtDate(c.created_at)}</td>
        </tr>`;
      }).join('') + `</tbody></table>`;
    }
  } catch (e) { console.error(e); }
}

async function cancelOrder(orderCode) {
  if (!confirm(t('history_cancel_confirm'))) return;
  try {
    const { data: order } = await sb.from('orders').select('*').eq('order_code', orderCode).single();
    if (!order) return;
    await sb.from('orders').update({ status: 'cancelled', reject_reason: 'Người dùng tự hủy' }).eq('order_code', orderCode);
    // Refund
    if (order.price > 0) {
      const { data: user } = await sb.from('users').select('balance').eq('username', currentUser.username).single();
      if (user) await sb.from('users').update({ balance: user.balance + order.price }).eq('username', currentUser.username);
    }
    createNotification(currentUser.username, '❌ Đơn đã hủy', `Đơn ${orderCode} đã bị hủy. Hoàn ${fmtPriceRaw(order.price)} vào ví.`, 'order');
    showToast(t('history_cancel_success'), 'success');
    loadHistory();
    refreshBalance();
  } catch (e) { showToast('Lỗi: ' + e.message, 'error'); }
}

// ===== REVIEW =====
function openReviewModal(orderId, service) {
  document.getElementById('reviewOrderId').value = orderId;
  document.getElementById('reviewServiceName').textContent = service;
  activeReviewStars = 0;
  document.querySelectorAll('#reviewStars .star-icon').forEach(s => s.classList.remove('filled'));
  document.getElementById('reviewComment').value = '';
  openModal('reviewModal');
}

function setReviewStars(val) {
  activeReviewStars = val;
  document.querySelectorAll('#reviewStars .star-icon').forEach(s => {
    s.classList.toggle('filled', parseInt(s.dataset.val) <= val);
  });
}

async function submitReview() {
  if (activeReviewStars < 1) return showToast('Vui lòng chọn số sao', 'error');
  const orderId = document.getElementById('reviewOrderId').value;
  const comment = document.getElementById('reviewComment').value.trim();
  const serviceName = document.getElementById('reviewServiceName').textContent;
  try {
    await sb.from('reviews').insert({
      username: currentUser.username,
      service: serviceName,
      rating: activeReviewStars,
      comment: comment || 'Tốt'
    });
    await sb.from('orders').update({ rating: activeReviewStars }).eq('order_code', orderId);
    showToast('Cảm ơn đánh giá của bạn!', 'success');
    closeModal('reviewModal');
    loadReviews();
  } catch (e) { showToast('Lỗi: ' + e.message, 'error'); }
}

function renderReviews(data) {
  const list = document.getElementById('reviewsList');
  const reviews = (data && data.length) ? data : PREMIUM_REVIEWS;
  list.className = 'reviews-grid';
  list.innerHTML = reviews.map(r => `
    <div class="hud-card review-card review-card-premium reveal">
      <div class="review-header">
        <div class="review-avatar">${escapeHtml((r.username || 'K')[0]).toUpperCase()}</div>
        <div><span class="review-user">${maskName(r.username)}</span><div class="review-date">${fmtDate(r.created_at)}</div></div>
      </div>
      <div class="review-service">${escapeHtml(r.service)}</div>
      <div class="star-display">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
      <div class="review-comment">“${escapeHtml(r.comment)}”</div>
    </div>
  `).join('');
}

async function loadReviews() {
  try {
    if (!sb) return renderReviews(PREMIUM_REVIEWS);
    const { data } = await sb.from('reviews').select('*').order('created_at', { ascending: false }).limit(20);
    renderReviews(data);
  } catch (e) { console.error(e); renderReviews(PREMIUM_REVIEWS); }
}

// ===== DASHBOARD =====
async function loadDashboard() {
  if (!currentUser || currentUser.username === ADMIN_USER) return;
  try {
    const [ordersRes, userRes] = await Promise.all([
      sb.from('orders').select('status').eq('username', currentUser.username),
      sb.from('users').select('*').eq('username', currentUser.username).single()
    ]);
    const u = userRes.data || currentUser;
    currentUser.balance = u.balance;
    currentUser.total_deposited = u.total_deposited;
    currentUser.total_spent = u.total_spent;

    const orders = ordersRes.data || [];
    const completed = orders.filter(o => o.status === 'completed').length;
    const vipLevel = getVipLevel(u.total_deposited);
    const vipDiscount = getVipDiscount(vipLevel);

    document.getElementById('dashStats').innerHTML = [
      { icon: '💰', label: t('dash_balance'), value: fmtPriceRaw(u.balance), cls: '' },
      { icon: '📥', label: t('dash_deposited'), value: fmtPriceRaw(u.total_deposited), cls: '' },
      { icon: '📤', label: t('dash_spent'), value: fmtPriceRaw(u.total_spent), cls: '' },
      { icon: '🛒', label: t('dash_orders'), value: orders.length, cls: '' },
      { icon: '✅', label: t('dash_completed'), value: completed, cls: '' },
      { icon: '👑', label: t('dash_vip'), value: getVipName(vipLevel), cls: vipLevel === 4 ? 'text-gold' : 'text-accent' }
    ].map(s => `
      <div class="hud-card stat-card">
        <div class="stat-icon">${s.icon}</div>
        <div class="stat-value ${s.cls}">${s.value}</div>
        <div class="stat-label">${s.label}</div>
      </div>
    `).join('');

    // VIP progress
    const nextLevel = vipLevel < 4 ? vipLevel + 1 : 4;
    const currentThreshold = getVipThreshold(vipLevel);
    const nextThreshold = getVipThreshold(nextLevel);
    const needMore = vipLevel < 4 ? Math.max(0, nextThreshold - u.total_deposited) : 0;
    const progress = vipLevel < 4 ? Math.min(100, Math.round((u.total_deposited - currentThreshold) / (nextThreshold - currentThreshold) * 100)) : 100;

    document.getElementById('vipProgressCard').innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <div>
          <span class="vip-badge ${vipLevel === 4 ? 'vip4' : ''}">${getVipName(vipLevel)}</span>
          <span style="margin-left:8px;font-size:0.9rem;">${t('dash_discount')}: <strong class="text-accent">${vipDiscount}%</strong></span>
        </div>
        ${vipLevel < 4 ? `<span style="font-size:0.85rem;">${t('vip_need')}: <strong class="text-accent">${fmtPriceRaw(needMore)}</strong> → ${getVipName(nextLevel)}</span>` : '<span class="text-gold">★ MAX VIP ★</span>'}
      </div>
      ${vipLevel < 4 ? `<div class="progress-bar" style="width:100%;height:12px;"><div class="progress-fill" style="width:${progress}%"></div></div>` : ''}
    `;

    // Referral card
    const refCode = u.referral_code || 'N/A';
    const { count: refCount } = await sb.from('users').select('id', { count: 'exact', head: true }).eq('referred_by', currentUser.username);
    document.getElementById('referralCard').innerHTML = `
      <h4 style="margin-bottom:8px;">${t('ref_title')}</h4>
      <div class="game-info-row" style="margin-bottom:8px;">
        <span class="game-info-label" data-i18n="ref_code">${t('ref_code')}</span>
        <span class="game-info-val text-accent" style="font-weight:700;">${refCode}</span>
        <button class="copy-btn" onclick="copyToClipboard('${refCode}')">${t('copy')}</button>
      </div>
      <p style="font-size:0.85rem;color:var(--text-dim);">${t('ref_count')}: <strong class="text-accent">${refCount || 0}</strong></p>
      <p style="font-size:0.8rem;color:var(--text-dim);margin-top:4px;">${t('ref_reward')}</p>
    `;

    updateBalanceDisplay();
  } catch (e) { console.error(e); }
}

// ===== TOP MONTH =====
async function loadTopMonth() {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const { data } = await sb.from('deposits').select('username, amount').eq('status', 'completed').gte('created_at', monthStart);
    const totals = {};
    (data || []).forEach(d => { totals[d.username] = (totals[d.username] || 0) + d.amount; });
    const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const list = document.getElementById('topMonthList');
    if (sorted.length === 0) {
      list.innerHTML = '<p style="text-align:center;padding:30px;color:var(--text-dim);">' + t('top_no_data') + '</p>';
      return;
    }
    const medals = ['🥇', '🥈', '🥉'];
    list.innerHTML = sorted.map((entry, i) => `
      <div class="top-item">
        <span class="top-rank">${i < 3 ? medals[i] : '#' + (i + 1)}</span>
        <span class="top-user">${maskName(entry[0])}</span>
        <span class="top-amount">${fmtPriceRaw(entry[1])}</span>
      </div>
    `).join('');
  } catch (e) { console.error(e); }
}

// ===== HOT DEALS =====
function renderHotDeals(data) {
  const grid = document.getElementById('hotDealsGrid');
  const deals = (data && data.length) ? data : PREMIUM_HOT_DEALS;
  grid.innerHTML = deals.map((d, i) => {
    const newPrice = Math.round(d.original_price * (1 - d.discount_percent / 100));
    const product = PRODUCTS.find(p => p.id === d.product_id || p.name === d.product_name || d.product_name.includes(p.name));
    const image = product ? product.image : 'assets/products/hero-luxury-pass.svg';
    const btn = product ? `<button class="btn btn-luxury btn-sm" onclick="openBuyModal('${product.id}')">${t('btn_buy')}</button>` : `<button class="btn btn-secondary btn-sm" onclick="toggleChat()">Liên hệ</button>`;
    return `
      <div class="hud-card deal-card deal-card-premium reveal">
        <div class="shine"></div>
        <div class="deal-art"><img src="${image}" alt="${escapeHtml(d.product_name)}" loading="lazy"></div>
        <div class="deal-content">
          <div class="deal-top"><span class="deal-badge">-${d.discount_percent}%</span><span class="deal-timer">LIMITED</span></div>
          <div class="product-name">${escapeHtml(d.product_name)}</div>
          <div class="deal-original">${fmtPriceRaw(d.original_price)}</div>
          <div class="deal-new-price">${fmtPriceRaw(newPrice)}</div>
          ${d.description ? `<p class="deal-desc">${escapeHtml(d.description)}</p>` : ''}
          <div class="deal-actions">${btn}<button class="btn btn-ghost btn-sm" onclick="toggleChat()">Tư vấn</button></div>
        </div>
      </div>
    `;
  }).join('');
  document.querySelectorAll('.deal-card.reveal').forEach(el => { const r = el.getBoundingClientRect(); if (r.top < window.innerHeight) el.classList.add('visible'); });
}

async function loadHotDeals() {
  try {
    if (!sb) return renderHotDeals(PREMIUM_HOT_DEALS);
    const { data } = await sb.from('hot_deals').select('*').eq('active', true).order('created_at', { ascending: false });
    renderHotDeals(data);
  } catch (e) { console.error(e); renderHotDeals(PREMIUM_HOT_DEALS); }
}

// ===== TICKETS =====
async function createTicket() {
  if (!currentUser) return;
  const subject = document.getElementById('ticketSubject').value.trim();
  const message = document.getElementById('ticketMessage').value.trim();
  if (!subject || !message) return showToast('Vui lòng nhập đầy đủ', 'error');
  const ticketCode = genCode('TKT');
  try {
    await sb.from('tickets').insert({
      ticket_code: ticketCode,
      username: currentUser.username,
      subject, message,
      status: 'open'
    });
    showToast('Đã tạo ticket: ' + ticketCode, 'success');
    closeModal('ticketModal');
    document.getElementById('ticketSubject').value = '';
    document.getElementById('ticketMessage').value = '';
    loadTickets();
  } catch (e) { showToast('Lỗi: ' + e.message, 'error'); }
}

async function loadTickets() {
  if (!currentUser || currentUser.username === ADMIN_USER) return;
  try {
    const { data } = await sb.from('tickets').select('*').eq('username', currentUser.username).order('created_at', { ascending: false });
    const list = document.getElementById('ticketList');
    if (!data || data.length === 0) {
      list.innerHTML = '<p style="text-align:center;padding:30px;color:var(--text-dim);">' + t('ticket_no') + '</p>';
      return;
    }
    list.innerHTML = data.map(tk => {
      const sc = 'status-' + (tk.status || 'open');
      const st = { open: t('ticket_status_open'), answered: t('ticket_status_answered'), closed: t('ticket_status_closed') }[tk.status] || tk.status;
      return `
        <div class="hud-card" style="padding:16px;margin-bottom:12px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <strong>${escapeHtml(tk.subject)}</strong>
            <span class="status-badge ${sc}">${st}</span>
          </div>
          <p style="font-size:0.85rem;margin-bottom:8px;">${escapeHtml(tk.message)}</p>
          ${tk.admin_reply ? `<div class="game-info-box"><span class="game-info-label" data-i18n="ticket_reply">Phản hồi admin:</span><p style="margin-top:4px;font-size:0.85rem;color:var(--accent);">${escapeHtml(tk.admin_reply)}</p></div>` : ''}
          <p style="font-size:0.7rem;color:var(--text-dim);margin-top:6px;">${fmtDate(tk.created_at)}</p>
        </div>
      `;
    }).join('');
  } catch (e) { console.error(e); }
}

// ===== CHAT WIDGET =====
function toggleChat() {
  document.getElementById('chatBox').classList.toggle('open');
}

// ===== MUSIC PLAYER =====
let musicPlaying = false;
function toggleMusic() {
  const audio = document.getElementById('musicAudio');
  const btn = document.getElementById('musicBtn');
  const waves = document.getElementById('musicWaves');
  if (musicPlaying) {
    audio.pause();
    btn.textContent = '▶';
    waves.classList.remove('active');
    musicPlaying = false;
  } else {
    audio.volume = 0.3;
    audio.play().then(() => {
      btn.textContent = '⏸';
      waves.classList.add('active');
      musicPlaying = true;
    }).catch(() => {
      showToast('Không thể phát nhạc', 'warning');
    });
  }
}

// ===== PWA INSTALL =====
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (!localStorage.getItem('knox_install_dismissed')) {
    setTimeout(() => { document.getElementById('installBanner').classList.add('show'); }, 3000);
  }
});

function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => {
      deferredPrompt = null;
      document.getElementById('installBanner').classList.remove('show');
    });
  } else {
    showToast('Mua trình đơn → Thêm vào màn hình chính', 'warning');
  }
}

function dismissInstall() {
  document.getElementById('installBanner').classList.remove('show');
  localStorage.setItem('knox_install_dismissed', '1');
}

// ===== SW REGISTER =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

// ===== ENTER KEY HANDLERS =====
function initEnterKeys() {
  const loginPass = document.getElementById('loginPassword');
  if (loginPass) loginPass.addEventListener('keypress', (e) => { if (e.key === 'Enter') doLogin(); });
  const regConfirm = document.getElementById('regConfirm');
  if (regConfirm) regConfirm.addEventListener('keypress', (e) => { if (e.key === 'Enter') doRegister(); });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async () => {
  applyLang();
  initBackgroundEffects();
  initEnterKeys();
  renderProducts();
  updateAuthUI();

  // Load public data
  loadHotDeals();
  loadTopMonth();
  loadReviews();

  // Restore session
  await restoreSession();

  // Scroll reveal after render
  setTimeout(initScrollReveal, 100);

  // Show chat widget after 2s (fade in)
  setTimeout(() => {
    const cb = document.querySelector('.chat-widget');
    if (cb) { cb.style.opacity = '1'; cb.style.transform = 'translateY(0)'; }
  }, 2000);
});
