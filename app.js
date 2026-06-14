const SUPABASE_URL = 'https://lsievokkismxxaiezdlm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzaWV2b2traXNteHhhaWV6ZGxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MjY0NzgsImV4cCI6MjA5NzAwMjQ3OH0.TZ6_NlpDIrl6xDucsc8S4hqA23RQVWsVLrQRjtr6YmQ';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'nguyenmm2803';

let sb = null;

const PRICES = {
    'Mod Skill - 10.000đ': 10000,
    'Mod Cá - 20.000đ': 20000,
    'Mod Level - 10.000đ': 10000,
    'Mod Item - 20.000đ': 20000,
    'Mod Pet - 20.000đ': 20000,
    'Mod Kim Cương - 30.000đ/1tr KC': 30000,
    'Câu Cá Vạn Cân Full - Liên hệ': 0,
    'Script Sniper Arena - 15.000đ': 15000,
    'Bản Mod Tự Mod - 85.000đ': 85000,
    'Câu Chung Theo Giờ - 20.000đ/giờ': 20000
};

function initSupabase() {
    try {
        if (window.supabase && window.supabase.createClient) {
            sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            console.log('✅ Supabase connected');
            return true;
        }
    } catch (e) { console.error('Supabase error:', e); }
    return false;
}

function getUser() {
    try { return JSON.parse(localStorage.getItem('knox_user')); }
    catch { return null; }
}
function setUser(u) { localStorage.setItem('knox_user', JSON.stringify(u)); }
function clearUser() { localStorage.removeItem('knox_user'); }

function formatMoney(n) {
    return new Intl.NumberFormat('vi-VN').format(n || 0) + 'đ';
}

function getPrice(serviceText) {
    if (PRICES[serviceText] !== undefined) return PRICES[serviceText];
    const match = serviceText.match(/(\d+(?:[,.]\d+)*)\s*đ/);
    if (match) return parseInt(match[1].replace(/[,.]/g, ''));
    return 0;
}

window.addEventListener('DOMContentLoaded', () => {
    initSupabase();
    initParticles();
    initNavbar();
    initGravity();
    initCountUp();
    checkAuth();
    if (sb) loadScripts();
});

function initParticles() {
    const c = document.getElementById('particles');
    if (!c) return;
    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDuration = (Math.random() * 6 + 4) + 's';
        p.style.animationDelay = Math.random() * 8 + 's';
        c.appendChild(p);
    }
}

function initNavbar() {
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('navbar');
        if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
    });
}
function toggleMenu() { document.getElementById('navLinks')?.classList.toggle('active'); }
function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) {
        const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
    }
    document.getElementById('navLinks')?.classList.remove('active');
}

function initGravity() {
    if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('.gravity-item').forEach(i => i.classList.add('visible'));
        return;
    }
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.querySelectorAll('.gravity-item').forEach(i => i.classList.add('visible'));
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.gravity-container').forEach(c => obs.observe(c));
}

function initCountUp() {
    if (!('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.querySelectorAll('.stat-number').forEach(c => {
                    animateCount(c, parseInt(c.getAttribute('data-count')));
                });
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.5 });
    const s = document.querySelector('.hero-stats');
    if (s) obs.observe(s);
}
function animateCount(el, target) {
    let cur = 0;
    const step = target / 125;
    const t = setInterval(() => {
        cur += step;
        if (cur >= target) { cur = target; clearInterval(t); }
        el.textContent = Math.floor(cur);
    }, 16);
}

async function checkAuth() {
    const u = getUser();
    if (u) {
        showUserBar(u.username);
        if (sb && !u.isAdmin) await refreshBalance();
    }
}

async function refreshBalance() {
    const u = getUser();
    if (!u || !sb || u.isAdmin) return;
    try {
        const { data } = await sb.from('users').select('balance').eq('username', u.username).maybeSingle();
        if (data) {
            const balEl = document.getElementById('userBalance');
            if (balEl) {
                const oldBal = parseInt(balEl.textContent.replace(/\D/g, '')) || 0;
                balEl.textContent = formatMoney(data.balance);
                
                // Hiệu ứng khi số dư thay đổi
                if (oldBal !== data.balance && oldBal > 0) {
                    balEl.style.transition = 'all 0.5s';
                    balEl.style.transform = 'scale(1.3)';
                    balEl.style.color = data.balance > oldBal ? '#22c55e' : '#ef4444';
                    setTimeout(() => {
                        balEl.style.transform = 'scale(1)';
                        if (data.balance > oldBal) {
                            toast(`💰 Đã nhận thêm ${formatMoney(data.balance - oldBal)}!`, 'success');
                        }
                    }, 600);
                }
            }
        }
    } catch (e) { console.error(e); }
}

// Auto refresh balance mỗi 10 giây
setInterval(refreshBalance, 10000);

async function register() {
    if (!sb) return toast('Database chưa kết nối!', 'error');
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const zalo = document.getElementById('regZalo').value.trim();
    const password = document.getElementById('regPassword').value;
    const password2 = document.getElementById('regPassword2').value;

    if (!username || !email || !password) return toast('Vui lòng điền đầy đủ!', 'error');
    if (username.length < 3) return toast('Tên đăng nhập từ 3 ký tự!', 'error');
    if (password.length < 6) return toast('Mật khẩu từ 6 ký tự!', 'error');
    if (password !== password2) return toast('Mật khẩu không khớp!', 'error');
    if (username === ADMIN_USERNAME) return toast('Tên này không dùng được!', 'error');

    toast('Đang đăng ký...', 'info');
    try {
        const { data: existing } = await sb.from('users').select('username').eq('username', username).maybeSingle();
        if (existing) return toast('Tên đăng nhập đã tồn tại!', 'error');

        const { error } = await sb.from('users').insert([{ username, email, zalo, password, balance: 0 }]);
        if (error) return toast('Lỗi: ' + error.message, 'error');

        toast('Đăng ký thành công!', 'success');
        closeModal('registerModal');
        openModal('loginModal');
    } catch (err) {
        toast('Lỗi kết nối!', 'error');
    }
}

async function login() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    if (!username || !password) return toast('Vui lòng nhập đầy đủ!', 'error');

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        setUser({ username: 'admin', isAdmin: true });
        toast('Đăng nhập Admin!', 'success');
        closeModal('loginModal');
        setTimeout(() => window.location.href = 'admin.html', 800);
        return;
    }

    if (!sb) return toast('Database chưa kết nối!', 'error');
    toast('Đang đăng nhập...', 'info');

    try {
        const { data: user, error } = await sb.from('users')
            .select('*')
            .eq('username', username)
            .eq('password', password)
            .maybeSingle();
        
        if (error) {
            console.error('Login error:', error);
            return toast('Lỗi: ' + error.message, 'error');
        }
        
        if (!user) {
            const { data: checkUser } = await sb.from('users')
                .select('username')
                .eq('username', username)
                .maybeSingle();
            if (!checkUser) return toast('❌ Tên đăng nhập KHÔNG TỒN TẠI!', 'error');
            else return toast('❌ Mật khẩu SAI!', 'error');
        }

        setUser({ username: user.username, isAdmin: false });
        toast('✅ Đăng nhập thành công!', 'success');
        closeModal('loginModal');
        showUserBar(user.username);
        await refreshBalance();
    } catch (err) {
        console.error(err);
        toast('Lỗi: ' + (err.message || 'Không xác định'), 'error');
    }
}

function logout() {
    clearUser();
    document.getElementById('userBar')?.classList.add('hidden');
    const bl = document.getElementById('btnLogin');
    if (bl) bl.style.display = 'inline-flex';
    toast('Đã đăng xuất!', 'info');
}

function showUserBar(username) {
    document.getElementById('userBar')?.classList.remove('hidden');
    const du = document.getElementById('displayUsername');
    if (du) du.textContent = username;
    const bl = document.getElementById('btnLogin');
    if (bl) bl.style.display = 'none';
}

async function loadScripts() {
    if (!sb) return;
    try {
        const { data: scripts } = await sb.from('scripts').select('*').eq('active', true).order('id');
        if (!scripts || scripts.length === 0) return;

        const grid = document.getElementById('scriptGrid');
        if (!grid) return;

        const select = document.getElementById('orderService');
        const grp = select?.querySelector('optgroup[label="💻 Script Roblox"]');
        if (grp) grp.innerHTML = '';

        grid.innerHTML = scripts.map((s, i) => `
            <div class="script-card gravity-item visible" style="--delay: ${i}">
                <div class="script-card-header">
                    <div class="script-icon">🎯</div>
                    <span class="script-game">${s.game}</span>
                </div>
                <h3>${s.name}</h3>
                <p class="script-desc">Script chất lượng cao cho game ${s.name}.</p>
                <div class="script-price">${s.price}</div>
                <div class="script-features">
                    <span><i class="fas fa-check-circle"></i> Cập nhật</span>
                    <span><i class="fas fa-check-circle"></i> Bảo hành</span>
                </div>
                <button class="btn-order" onclick="orderItem('Script ${s.name} - ${s.price}')">
                    <i class="fas fa-shopping-cart"></i> Đặt mua
                </button>
            </div>
        `).join('');

        scripts.forEach(s => {
            const opt = document.createElement('option');
            opt.value = `Script ${s.name} - ${s.price}`;
            opt.textContent = `Script ${s.name} - ${s.price}`;
            if (grp) grp.appendChild(opt);
            const priceMatch = s.price.match(/(\d+(?:[,.]\d+)*)/);
            if (priceMatch) PRICES[`Script ${s.name} - ${s.price}`] = parseInt(priceMatch[1].replace(/[,.]/g, ''));
        });
    } catch (err) { console.error(err); }
}

function orderItem(svc) {
    const u = getUser();
    if (!u) {
        toast('Vui lòng đăng nhập!', 'info');
        openModal('loginModal');
        return;
    }
    const select = document.getElementById('orderService');
    if (select) {
        for (let i = 0; i < select.options.length; i++) {
            if (select.options[i].value === svc) {
                select.selectedIndex = i;
                break;
            }
        }
    }
    updateOrderPrice();
    openModal('orderModal');
}

function updateOrderPrice() {
    const svc = document.getElementById('orderService')?.value;
    const priceEl = document.getElementById('orderPriceDisplay');
    if (priceEl && svc) {
        const price = getPrice(svc);
        if (price > 0) {
            priceEl.innerHTML = `Giá: <strong>${formatMoney(price)}</strong>`;
            priceEl.style.display = 'block';
        } else {
            priceEl.innerHTML = `<em>Liên hệ để biết giá</em>`;
            priceEl.style.display = 'block';
        }
    }
}

async function placeOrder() {
    const u = getUser();
    if (!u) return toast('Vui lòng đăng nhập!', 'error');
    if (!sb) return toast('Database chưa kết nối!', 'error');

    const service = document.getElementById('orderService').value;
    const note = document.getElementById('orderNote').value.trim();
    const price = getPrice(service);
    const code = 'KNX-' + Date.now().toString().slice(-8);

    if (price === 0) {
        toast('Đang gửi đơn...', 'info');
        try {
            const { error } = await sb.from('orders').insert([{
                order_code: code, username: u.username, service,
                payment: 'Liên hệ', note, price: 0, status: 'pending'
            }]);
            if (error) return toast('Lỗi: ' + error.message, 'error');
            toast(`Đặt đơn thành công! Liên hệ Zalo để báo giá. Mã: ${code}`, 'success');
            closeModal('orderModal');
            document.getElementById('orderNote').value = '';
        } catch (err) { toast('Lỗi kết nối!', 'error'); }
        return;
    }

    toast('Đang xử lý...', 'info');
    try {
        const { data: userData } = await sb.from('users').select('balance').eq('username', u.username).maybeSingle();
        if (!userData) return toast('Lỗi tài khoản!', 'error');

        const balance = userData.balance || 0;
        if (balance < price) {
            toast(`Số dư không đủ! Cần ${formatMoney(price)}, hiện có ${formatMoney(balance)}`, 'error');
            setTimeout(() => {
                closeModal('orderModal');
                openModal('depositModal');
            }, 1500);
            return;
        }

        const newBalance = balance - price;
        const { error: updateErr } = await sb.from('users').update({ balance: newBalance }).eq('username', u.username);
        if (updateErr) return toast('Lỗi trừ tiền: ' + updateErr.message, 'error');

        const { error: orderErr } = await sb.from('orders').insert([{
            order_code: code, username: u.username, service,
            payment: 'Số dư', note, price, status: 'pending'
        }]);
        if (orderErr) {
            await sb.from('users').update({ balance }).eq('username', u.username);
            return toast('Lỗi đặt đơn!', 'error');
        }

        toast(`✅ Đặt đơn thành công! Đã trừ ${formatMoney(price)}. Mã: ${code}`, 'success');
        closeModal('orderModal');
        document.getElementById('orderNote').value = '';
        await refreshBalance();
    } catch (err) {
        toast('Lỗi kết nối!', 'error');
    }
}

async function requestDeposit() {
    const u = getUser();
    if (!u) return toast('Vui lòng đăng nhập!', 'error');
    if (!sb) return toast('Database chưa kết nối!', 'error');

    const amount = parseInt(document.getElementById('depositAmount').value);
    const method = document.getElementById('depositMethod').value;
    const note = document.getElementById('depositNote').value.trim();

    if (!amount || amount < 10000) return toast('Số tiền tối thiểu 10.000đ!', 'error');
    if (amount > 10000000) return toast('Số tiền tối đa 10.000.000đ!', 'error');

    const code = 'NAP-' + Date.now().toString().slice(-8);
    toast('Đang gửi yêu cầu...', 'info');

    try {
        const { error } = await sb.from('deposits').insert([{
            deposit_code: code, username: u.username, amount, method, note, status: 'pending'
        }]);
        if (error) return toast('Lỗi: ' + error.message, 'error');

        toast(`✅ Đã gửi yêu cầu nạp ${formatMoney(amount)}!`, 'success');
        closeModal('depositModal');
        document.getElementById('depositAmount').value = '';
        document.getElementById('depositNote').value = '';
        
        setTimeout(() => {
            alert(`📌 HƯỚNG DẪN THANH TOÁN\n\n` +
                  `Mã giao dịch: ${code}\n` +
                  `Số tiền: ${formatMoney(amount)}\n` +
                  `Phương thức: ${method}\n\n` +
                  `💳 Vietcombank:\n` +
                  `STK: 1064291846\n` +
                  `Chủ TK: NGUYEN TRUNG NGUYEN\n` +
                  `Nội dung CHUYỂN KHOẢN: NAP666\n\n` +
                  `Sau khi thanh toán, Admin sẽ cộng tiền trong 5-15 phút.\n` +
                  `Bạn có thể xem tiến độ ở "Lịch sử"`);
            
            // Tự động cuộn về trang chủ
            scrollToSection('home');
        }, 300);
    } catch (err) {
        toast('Lỗi kết nối!', 'error');
    }
}

async function loadHistory() {
    const u = getUser();
    if (!u || !sb) return;

    const c = document.getElementById('orderHistory');
    c.innerHTML = '<p class="empty-state"><i class="fas fa-spinner fa-spin"></i> Đang tải...</p>';

    try {
        const [{ data: orders }, { data: deposits }] = await Promise.all([
            sb.from('orders').select('*').eq('username', u.username).order('created_at', { ascending: false }),
            sb.from('deposits').select('*').eq('username', u.username).order('created_at', { ascending: false })
        ]);

        const sm = {
            'pending': { l: 'Chờ xử lý', c: 'pending' },
            'processing': { l: 'Đang xử lý', c: 'processing' },
            'completed': { l: 'Hoàn thành', c: 'completed' },
            'cancelled': { l: 'Đã hủy', c: 'cancelled' }
        };

        let html = '';

        if (deposits && deposits.length > 0) {
            html += '<h3>💰 Lịch sử nạp tiền</h3>';
            html += deposits.map(d => {
                const s = sm[d.status] || sm.pending;
                return `
                    <div class="order-item">
                        <div class="order-item-header">
                            <span class="order-id">${d.deposit_code}</span>
                            <span class="order-status ${s.c}">${s.l}</span>
                        </div>
                        <p><strong>Số tiền:</strong> ${formatMoney(d.amount)}</p>
                        <p><strong>Phương thức:</strong> ${d.method}</p>
                        ${d.note ? `<p><strong>Ghi chú:</strong> ${d.note}</p>` : ''}
                        <p><strong>Thời gian:</strong> ${new Date(d.created_at).toLocaleString('vi-VN')}</p>
                    </div>
                `;
            }).join('');
        }

        if (orders && orders.length > 0) {
            html += '<h3 style="margin-top:20px">🛒 Lịch sử đặt mua</h3>';
            html += orders.map(o => {
                const s = sm[o.status] || sm.pending;
                return `
                    <div class="order-item">
                        <div class="order-item-header">
                            <span class="order-id">${o.order_code}</span>
                            <span class="order-status ${s.c}">${s.l}</span>
                        </div>
                        <p><strong>Dịch vụ:</strong> ${o.service}</p>
                        ${o.price > 0 ? `<p><strong>Giá:</strong> ${formatMoney(o.price)}</p>` : ''}
                        <p><strong>Thanh toán:</strong> ${o.payment}</p>
                        ${o.note ? `<p><strong>Ghi chú:</strong> ${o.note}</p>` : ''}
                        <p><strong>Thời gian:</strong> ${new Date(o.created_at).toLocaleString('vi-VN')}</p>
                    </div>
                `;
            }).join('');
        }

        if (!html) html = '<p class="empty-state"><i class="fas fa-inbox"></i> Chưa có giao dịch nào</p>';
        c.innerHTML = html;
    } catch (err) {
        c.innerHTML = '<p class="empty-state">Lỗi tải dữ liệu</p>';
    }
}

function openModal(id) {
    const m = document.getElementById(id);
    if (m) {
        m.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (id === 'historyModal') loadHistory();
        if (id === 'orderModal') updateOrderPrice();
    }
}
function closeModal(id) {
    const m = document.getElementById(id);
    if (m) {
        m.classList.remove('active');
        document.body.style.overflow = '';
    }
}
function switchModal(from, to) {
    closeModal(from);
    setTimeout(() => openModal(to), 200);
}
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
        document.body.style.overflow = '';
    }
});

function toast(msg, type = 'info') {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.className = `toast ${type} show`;
    setTimeout(() => t.classList.remove('show'), 3500);
}

function copyText(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => toast('Đã copy: ' + text, 'success'));
    } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        toast('Đã copy: ' + text, 'success');
    }
          }
