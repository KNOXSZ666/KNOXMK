// KNOX SHOP - Main JS
const SUPABASE_URL = 'https://lsievokkismxxaiezdlm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzaWV2b2traXNteHhhaWV6ZGxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MjY0NzgsImV4cCI6MjA5NzAwMjQ3OH0.TZ6_NlpDIrl6xDucsc8S4hqA23RQVWsVLrQRjtr6YmQ';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'nguyenmm2803';

let sb = null;

// Init Supabase
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

// Session helpers
function getUser() {
    try { return JSON.parse(localStorage.getItem('knox_user')); }
    catch { return null; }
}
function setUser(u) { localStorage.setItem('knox_user', JSON.stringify(u)); }
function clearUser() { localStorage.removeItem('knox_user'); }

// ON LOAD
window.addEventListener('DOMContentLoaded', () => {
    initSupabase();
    initParticles();
    initNavbar();
    initGravity();
    initCountUp();
    checkAuth();
    if (sb) loadScripts();
});

// PARTICLES
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

// NAVBAR
function initNavbar() {
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('navbar');
        if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
    });
}
function toggleMenu() {
    document.getElementById('navLinks')?.classList.toggle('active');
}
function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) {
        const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
    }
    document.getElementById('navLinks')?.classList.remove('active');
}

// GRAVITY
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

// COUNT UP
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

// AUTH
function checkAuth() {
    const u = getUser();
    if (u) showUserBar(u.username);
}

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
        const { data: existing } = await sb.from('users')
            .select('username').eq('username', username).maybeSingle();
        if (existing) return toast('Tên đăng nhập đã tồn tại!', 'error');

        const { error } = await sb.from('users').insert([{ username, email, zalo, password }]);
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
        const { data: user } = await sb.from('users')
            .select('*').eq('username', username).eq('password', password).maybeSingle();
        if (!user) return toast('Sai tên đăng nhập hoặc mật khẩu!', 'error');

        setUser({ username: user.username, isAdmin: false });
        toast('Đăng nhập thành công!', 'success');
        closeModal('loginModal');
        showUserBar(user.username);
    } catch (err) {
        toast('Lỗi kết nối!', 'error');
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

// SCRIPTS
async function loadScripts() {
    if (!sb) return;
    try {
        const { data: scripts } = await sb.from('scripts')
            .select('*').eq('active', true).order('id');

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
        });
    } catch (err) { console.error(err); }
}

// ORDER
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
    openModal('orderModal');
}

async function placeOrder() {
    const u = getUser();
    if (!u) return toast('Vui lòng đăng nhập!', 'error');
    if (!sb) return toast('Database chưa kết nối!', 'error');

    const service = document.getElementById('orderService').value;
    const payment = document.getElementById('orderPayment').value;
    const note = document.getElementById('orderNote').value.trim();
    const code = 'KNX-' + Date.now().toString().slice(-8);

    toast('Đang gửi đơn...', 'info');

    try {
        const { error } = await sb.from('orders').insert([{
            order_code: code, username: u.username, service, payment, note, status: 'pending'
        }]);
        if (error) return toast('Lỗi: ' + error.message, 'error');

        toast(`Đặt đơn thành công! Mã: ${code}`, 'success');
        closeModal('orderModal');
        document.getElementById('orderNote').value = '';
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
        const { data: orders } = await sb.from('orders')
            .select('*').eq('username', u.username).order('created_at', { ascending: false });

        if (!orders || orders.length === 0) {
            c.innerHTML = '<p class="empty-state"><i class="fas fa-inbox"></i> Chưa có đơn hàng nào</p>';
            return;
        }

        const sm = {
            'pending': { l: 'Chờ xử lý', c: 'pending' },
            'processing': { l: 'Đang xử lý', c: 'processing' },
            'completed': { l: 'Hoàn thành', c: 'completed' },
            'cancelled': { l: 'Đã hủy', c: 'cancelled' }
        };

        c.innerHTML = orders.map(o => {
            const s = sm[o.status] || sm.pending;
            return `
                <div class="order-item">
                    <div class="order-item-header">
                        <span class="order-id">${o.order_code}</span>
                        <span class="order-status ${s.c}">${s.l}</span>
                    </div>
                    <p><strong>Dịch vụ:</strong> ${o.service}</p>
                    <p><strong>Thanh toán:</strong> ${o.payment}</p>
                    ${o.note ? `<p><strong>Ghi chú:</strong> ${o.note}</p>` : ''}
                    <p><strong>Thời gian:</strong> ${new Date(o.created_at).toLocaleString('vi-VN')}</p>
                </div>
            `;
        }).join('');
    } catch (err) {
        c.innerHTML = '<p class="empty-state">Lỗi tải dữ liệu</p>';
    }
}

// MODALS
function openModal(id) {
    const m = document.getElementById(id);
    if (m) {
        m.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (id === 'historyModal') loadHistory();
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

// TOAST
function toast(msg, type = 'info') {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.className = `toast ${type} show`;
    setTimeout(() => t.classList.remove('show'), 3500);
}

// COPY
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
