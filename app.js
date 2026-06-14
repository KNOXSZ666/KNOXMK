const SUPABASE_URL = 'https://lsievokkismxxaiezdlm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzaWV2b2traXNteHhhaWV6ZGxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MjY0NzgsImV4cCI6MjA5NzAwMjQ3OH0.TZ6_NlpDIrl6xDucsc8S4hqA23RQVWsVLrQRjtr6YmQ';
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'nguyenmm2803';

let sb = null;
let currentVoucher = null;
let currentRating = 0;
let currentReviewService = '';

const PRICES = {
    'Mod Skill - 10.000đ': 10000, 'Mod Cá - 20.000đ': 20000, 'Mod Level - 10.000đ': 10000,
    'Mod Item - 20.000đ': 20000, 'Mod Pet - 20.000đ': 20000, 'Mod Kim Cương - 30.000đ/1tr KC': 30000,
    'Câu Cá Vạn Cân Full - Liên hệ': 0, 'Script Sniper Arena - 15.000đ': 15000,
    'Bản Mod Tự Mod - 85.000đ': 85000, 'Câu Chung Theo Giờ - 20.000đ/giờ': 20000
};

const VIP_TIERS = [
    { min: 0, level: 0, name: 'NEW', discount: 0, icon: '🆕' },
    { min: 100000, level: 1, name: 'VIP 1', discount: 5, icon: '🥉' },
    { min: 500000, level: 2, name: 'VIP 2', discount: 10, icon: '🥈' },
    { min: 1000000, level: 3, name: 'VIP 3', discount: 15, icon: '🥇' },
    { min: 5000000, level: 4, name: 'VIP 4', discount: 20, icon: '💎' }
];

function getVipInfo(totalDeposited) {
    for (let i = VIP_TIERS.length - 1; i >= 0; i--) {
        if (totalDeposited >= VIP_TIERS[i].min) return VIP_TIERS[i];
    }
    return VIP_TIERS[0];
}

function initSupabase() {
    try {
        if (window.supabase) {
            sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            return true;
        }
    } catch (e) { console.error(e); }
    return false;
}

function getUser() {
    try { return JSON.parse(localStorage.getItem('knox_user')); } catch { return null; }
}
function setUser(u) { localStorage.setItem('knox_user', JSON.stringify(u)); }
function clearUser() { localStorage.removeItem('knox_user'); }
function formatMoney(n) { return new Intl.NumberFormat('vi-VN').format(n || 0) + 'đ'; }
function getPrice(svc) {
    if (PRICES[svc] !== undefined) return PRICES[svc];
    const m = svc.match(/(\d+(?:[,.]\d+)*)\s*đ/);
    return m ? parseInt(m[1].replace(/[,.]/g, '')) : 0;
}
function genCode(prefix) {
    return prefix + '-' + Date.now().toString().slice(-6) + Math.floor(Math.random()*1000);
}

window.addEventListener('DOMContentLoaded', () => {
    initSupabase();
    initParticles();
    initNavbar();
    initGravity();
    initCountUp();
    initRatingStars();
    checkAuth();
    if (sb) {
        loadScripts();
        loadReviews();
    }
});

function initParticles() {
    const c = document.getElementById('particles');
    if (!c) return;
    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random()*100+'%';
        p.style.animationDuration = (Math.random()*6+4)+'s';
        p.style.animationDelay = Math.random()*8+'s';
        c.appendChild(p);
    }
}

function initNavbar() {
    window.addEventListener('scroll', () => {
        const n = document.getElementById('navbar');
        if (n) n.classList.toggle('scrolled', window.scrollY > 50);
    });
}

function toggleMenu() {
    document.getElementById('navLinks')?.classList.toggle('active');
}
function closeMobileMenu() {
    document.getElementById('navLinks')?.classList.remove('active');
}
function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) {
        const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
    }
    closeMobileMenu();
}

function initGravity() {
    if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('.gravity-item').forEach(i => i.classList.add('visible'));
        return;
    }
    const obs = new IntersectionObserver(es => {
        es.forEach(e => {
            if (e.isIntersecting) e.target.querySelectorAll('.gravity-item').forEach(i => i.classList.add('visible'));
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.gravity-container').forEach(c => obs.observe(c));
}

function initCountUp() {
    if (!('IntersectionObserver' in window)) return;
    const obs = new IntersectionObserver(es => {
        es.forEach(e => {
            if (e.isIntersecting) {
                e.target.querySelectorAll('.stat-number').forEach(c => animateCount(c, parseInt(c.getAttribute('data-count'))));
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.5 });
    const s = document.querySelector('.hero-stats');
    if (s) obs.observe(s);
}
function animateCount(el, target) {
    let c = 0, step = target/125;
    const t = setInterval(() => {
        c += step;
        if (c >= target) { c = target; clearInterval(t); }
        el.textContent = Math.floor(c);
    }, 16);
}

function initRatingStars() {
    document.querySelectorAll('#ratingStars i').forEach(s => {
        s.onclick = () => {
            currentRating = parseInt(s.getAttribute('data-rating'));
            document.querySelectorAll('#ratingStars i').forEach(x => {
                x.classList.toggle('active', parseInt(x.getAttribute('data-rating')) <= currentRating);
            });
        };
    });
}

async function checkAuth() {
    const u = getUser();
    if (u) {
        showUserBar(u.username);
        if (sb && !u.isAdmin) {
            await refreshUserInfo();
            await loadNotificationCount();
        }
    }
}

async function refreshUserInfo() {
    const u = getUser();
    if (!u || !sb || u.isAdmin) return;
    try {
        const { data } = await sb.from('users').select('*').eq('username', u.username).maybeSingle();
        if (data) {
            const balEl = document.getElementById('userBalance');
            if (balEl) {
                const oldBal = parseInt(balEl.textContent.replace(/\D/g, '')) || 0;
                balEl.textContent = formatMoney(data.balance);
                if (oldBal !== data.balance && oldBal > 0 && data.balance > oldBal) {
                    toast(`💰 Đã nhận thêm ${formatMoney(data.balance - oldBal)}!`, 'success');
                    addNotification('💰 Nhận tiền', `Bạn vừa nhận ${formatMoney(data.balance - oldBal)} vào tài khoản!`);
                }
            }
            const ts = document.getElementById('totalSpent');
            const td = document.getElementById('totalDeposited');
            if (ts) ts.textContent = formatMoney(data.total_spent);
            if (td) td.textContent = formatMoney(data.total_deposited);
            
            const vip = getVipInfo(data.total_deposited || 0);
            const vipEl = document.getElementById('vipBadge');
            if (vipEl) {
                vipEl.innerHTML = `${vip.icon} ${vip.name}`;
                vipEl.className = `nav-vip-badge nav-vip-${vip.level}`;
            }
            
            const refEl = document.getElementById('myReferralCode');
            if (refEl) refEl.value = data.referral_code || 'REF' + data.id;
        }
    } catch (e) { console.error(e); }
}

setInterval(refreshUserInfo, 10000);

async function register() {
    if (!sb) return toast('Database chưa kết nối!', 'error');
    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const zalo = document.getElementById('regZalo').value.trim();
    const password = document.getElementById('regPassword').value;
    const password2 = document.getElementById('regPassword2').value;
    const referral = document.getElementById('regReferral').value.trim();

    if (!username || !email || !password) return toast('Vui lòng điền đầy đủ!', 'error');
    if (username.length < 3) return toast('Tên đăng nhập từ 3 ký tự!', 'error');
    if (password.length < 6) return toast('Mật khẩu từ 6 ký tự!', 'error');
    if (password !== password2) return toast('Mật khẩu không khớp!', 'error');
    if (username === ADMIN_USERNAME) return toast('Tên này không dùng được!', 'error');

    toast('Đang đăng ký...', 'info');
    try {
        const { data: existing } = await sb.from('users').select('username').eq('username', username).maybeSingle();
        if (existing) return toast('Tên đăng nhập đã tồn tại!', 'error');

        const refCode = 'REF' + Date.now().toString().slice(-6);
        const insertData = {
            username, email, zalo, password,
            balance: 0, total_spent: 0, total_deposited: 0,
            vip_level: 0, referral_code: refCode
        };
        if (referral) insertData.referred_by = referral;

        const { error } = await sb.from('users').insert([insertData]);
        if (error) return toast('Lỗi: ' + error.message, 'error');

        toast('Đăng ký thành công!', 'success');
        closeModal('registerModal');
        openModal('loginModal');
    } catch (err) { toast('Lỗi kết nối!', 'error'); }
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
        const { data: user, error } = await sb.from('users').select('*').eq('username', username).eq('password', password).maybeSingle();
        if (error) return toast('Lỗi: ' + error.message, 'error');
        if (!user) {
            const { data: cu } = await sb.from('users').select('username').eq('username', username).maybeSingle();
            if (!cu) return toast('❌ Tên đăng nhập KHÔNG TỒN TẠI!', 'error');
            return toast('❌ Mật khẩu SAI!', 'error');
        }
        setUser({ username: user.username, isAdmin: false });
        toast('✅ Đăng nhập thành công!', 'success');
        closeModal('loginModal');
        showUserBar(user.username);
        await refreshUserInfo();
    } catch (err) { toast('Lỗi: ' + err.message, 'error'); }
}

function logout() {
    clearUser();
    document.getElementById('navUserSection')?.classList.add('hidden');
    document.getElementById('btnNotifMobile')?.classList.add('hidden');
    const bl = document.getElementById('btnLogin');
    if (bl) bl.style.display = 'inline-flex';
    toast('Đã đăng xuất!', 'info');
    closeMobileMenu();
}

function showUserBar(username) {
    document.getElementById('navUserSection')?.classList.remove('hidden');
    document.getElementById('btnNotifMobile')?.classList.remove('hidden');
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
                <div class="script-card-header"><div class="script-icon">🎯</div><span class="script-game">${s.game}</span></div>
                <h3>${s.name}</h3>
                <p class="script-desc">Script chất lượng cao cho game ${s.name}.</p>
                <div class="script-price">${s.price}</div>
                <button class="btn-order" onclick="orderItem('Script ${s.name} - ${s.price}')"><i class="fas fa-shopping-cart"></i> Đặt mua</button>
                <button class="btn-review" onclick="openReview('Script ${s.name}')"><i class="fas fa-star"></i> Đánh giá</button>
            </div>
        `).join('');
        scripts.forEach(s => {
            const opt = document.createElement('option');
            opt.value = `Script ${s.name} - ${s.price}`;
            opt.textContent = `Script ${s.name} - ${s.price}`;
            if (grp) grp.appendChild(opt);
            const m = s.price.match(/(\d+(?:[,.]\d+)*)/);
            if (m) PRICES[`Script ${s.name} - ${s.price}`] = parseInt(m[1].replace(/[,.]/g, ''));
        });
    } catch (e) { console.error(e); }
}

function orderItem(svc) {
    const u = getUser();
    if (!u) { toast('Vui lòng đăng nhập!', 'info'); openModal('loginModal'); return; }
    const select = document.getElementById('orderService');
    if (select) for (let i = 0; i < select.options.length; i++) if (select.options[i].value === svc) { select.selectedIndex = i; break; }
    updateOrderPrice();
    openModal('orderModal');
}

function updateOrderPrice() {
    const svc = document.getElementById('orderService')?.value;
    const el = document.getElementById('orderPriceDisplay');
    if (el && svc) {
        const price = getPrice(svc);
        if (price > 0) {
            let display = `Giá: <strong>${formatMoney(price)}</strong>`;
            if (currentVoucher) {
                const discount = Math.floor(price * currentVoucher.discount_percent / 100);
                display += `<br><small>Giảm: -${formatMoney(discount)} = <strong>${formatMoney(price-discount)}</strong></small>`;
            }
            el.innerHTML = display;
            el.style.display = 'block';
        } else {
            el.innerHTML = `<em>Liên hệ để biết giá</em>`;
            el.style.display = 'block';
        }
    }
}

async function applyVoucher() {
    const code = document.getElementById('voucherCode').value.trim().toUpperCase();
    const status = document.getElementById('voucherStatus');
    if (!code) { currentVoucher = null; status.textContent = ''; updateOrderPrice(); return; }
    
    try {
        const { data: v } = await sb.from('vouchers').select('*').eq('code', code).eq('active', true).maybeSingle();
        if (!v) { status.textContent = '❌ Mã không hợp lệ'; status.className = 'error'; currentVoucher = null; }
        else if (v.used_count >= v.max_uses) { status.textContent = '❌ Mã đã hết lượt'; status.className = 'error'; currentVoucher = null; }
        else {
            currentVoucher = v;
            status.innerHTML = `✅ Giảm ${v.discount_percent}%`;
            status.className = 'success';
        }
        updateOrderPrice();
    } catch (e) { status.textContent = 'Lỗi kiểm tra mã'; }
}

async function placeOrder() {
    const u = getUser();
    if (!u || !sb) return toast('Vui lòng đăng nhập!', 'error');
    const service = document.getElementById('orderService').value;
    const note = document.getElementById('orderNote').value.trim();
    let price = getPrice(service);
    const code = genCode('KNX');

    if (price === 0) {
        try {
            await sb.from('orders').insert([{ order_code: code, username: u.username, service, payment: 'Liên hệ', note, price: 0, status: 'pending' }]);
            toast(`Đặt đơn thành công! Mã: ${code}`, 'success');
            closeModal('orderModal');
        } catch (e) { toast('Lỗi!', 'error'); }
        return;
    }

    if (currentVoucher) {
        price = Math.floor(price * (100 - currentVoucher.discount_percent) / 100);
    }

    toast('Đang xử lý...', 'info');
    try {
        const { data: userData } = await sb.from('users').select('balance, total_spent').eq('username', u.username).maybeSingle();
        if (!userData) return toast('Lỗi tài khoản!', 'error');
        const balance = userData.balance || 0;
        if (balance < price) {
            toast(`Số dư không đủ! Cần ${formatMoney(price)}, có ${formatMoney(balance)}`, 'error');
            setTimeout(() => { closeModal('orderModal'); openModal('depositModal'); }, 1500);
            return;
        }

        await sb.from('users').update({ 
            balance: balance - price,
            total_spent: (userData.total_spent || 0) + price
        }).eq('username', u.username);

        await sb.from('orders').insert([{ 
            order_code: code, username: u.username, service, 
            payment: currentVoucher ? `Số dư (Voucher ${currentVoucher.code})` : 'Số dư', 
            note, price, status: 'pending' 
        }]);

        if (currentVoucher) {
            await sb.from('vouchers').update({ used_count: currentVoucher.used_count + 1 }).eq('code', currentVoucher.code);
        }

        addNotification('🛒 Mua hàng', `Đặt mua "${service}" thành công! Đã trừ ${formatMoney(price)}.`);
        toast(`✅ Đặt đơn thành công! Đã trừ ${formatMoney(price)}. Mã: ${code}`, 'success');
        closeModal('orderModal');
        document.getElementById('orderNote').value = '';
        document.getElementById('voucherCode').value = '';
        currentVoucher = null;
        await refreshUserInfo();
    } catch (e) { toast('Lỗi: ' + e.message, 'error'); }
}

async function requestDeposit() {
    const u = getUser();
    if (!u || !sb) return toast('Vui lòng đăng nhập!', 'error');
    const amount = parseInt(document.getElementById('depositAmount').value);
    const method = document.getElementById('depositMethod').value;
    const note = document.getElementById('depositNote').value.trim();
    if (!amount || amount < 10000) return toast('Tối thiểu 10.000đ!', 'error');
    if (amount > 10000000) return toast('Tối đa 10.000.000đ!', 'error');

    const code = genCode('NAP');
    try {
        await sb.from('deposits').insert([{ deposit_code: code, username: u.username, amount, method, note, status: 'pending' }]);
        addNotification('💰 Yêu cầu nạp', `Yêu cầu nạp ${formatMoney(amount)} đã được gửi. Chờ admin duyệt.`);
        toast(`✅ Đã gửi yêu cầu nạp ${formatMoney(amount)}!`, 'success');
        closeModal('depositModal');
        document.getElementById('depositAmount').value = '';
        document.getElementById('depositNote').value = '';
        setTimeout(() => {
            alert(`📌 HƯỚNG DẪN THANH TOÁN\n\nMã GD: ${code}\nSố tiền: ${formatMoney(amount)}\n\n💳 Vietcombank:\nSTK: 1064291846\nChủ TK: NGUYEN TRUNG NGUYEN\nNội dung: NAP666\n\nAdmin sẽ duyệt trong 5-15 phút.`);
            scrollToSection('home');
        }, 300);
    } catch (e) { toast('Lỗi: ' + e.message, 'error'); }
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
        const sm = { 'pending': { l: 'Chờ', c: 'pending' }, 'processing': { l: 'Xử lý', c: 'processing' }, 'completed': { l: 'Hoàn thành', c: 'completed' }, 'cancelled': { l: 'Đã hủy', c: 'cancelled' } };
        let html = '';
        if (deposits?.length) {
            html += '<h3>💰 Lịch sử nạp tiền</h3>';
            html += deposits.map(d => {
                const s = sm[d.status] || sm.pending;
                return `<div class="order-item"><div class="order-item-header"><span class="order-id">${d.deposit_code}</span><span class="order-status ${s.c}">${s.l}</span></div><p><strong>Số tiền:</strong> ${formatMoney(d.amount)}</p><p><strong>Phương thức:</strong> ${d.method}</p>${d.note?`<p><strong>Ghi chú:</strong> ${d.note}</p>`:''}<p><strong>Thời gian:</strong> ${new Date(d.created_at).toLocaleString('vi-VN')}</p></div>`;
            }).join('');
        }
        if (orders?.length) {
            html += '<h3 style="margin-top:20px">🛒 Lịch sử đặt mua</h3>';
            html += orders.map(o => {
                const s = sm[o.status] || sm.pending;
                return `<div class="order-item"><div class="order-item-header"><span class="order-id">${o.order_code}</span><span class="order-status ${s.c}">${s.l}</span></div><p><strong>Dịch vụ:</strong> ${o.service}</p>${o.price>0?`<p><strong>Giá:</strong> ${formatMoney(o.price)}</p>`:''}<p><strong>TT:</strong> ${o.payment}</p>${o.note?`<p><strong>Ghi chú:</strong> ${o.note}</p>`:''}<p><strong>Thời gian:</strong> ${new Date(o.created_at).toLocaleString('vi-VN')}</p></div>`;
            }).join('');
        }
        if (!html) html = '<p class="empty-state"><i class="fas fa-inbox"></i> Chưa có giao dịch</p>';
        c.innerHTML = html;
    } catch (e) { c.innerHTML = '<p class="empty-state">Lỗi tải dữ liệu</p>'; }
}

async function loadDashboard() {
    const u = getUser();
    if (!u || !sb) return;
    const c = document.getElementById('dashboardContent');
    c.innerHTML = '<p class="empty-state"><i class="fas fa-spinner fa-spin"></i> Đang tải...</p>';
    try {
        const [{ data: user }, { data: orders }, { data: deposits }] = await Promise.all([
            sb.from('users').select('*').eq('username', u.username).maybeSingle(),
            sb.from('orders').select('*').eq('username', u.username),
            sb.from('deposits').select('*').eq('username', u.username).eq('status', 'completed')
        ]);
        
        const totalOrders = orders?.length || 0;
        const completedOrders = orders?.filter(o => o.status === 'completed').length || 0;
        const vip = getVipInfo(user?.total_deposited || 0);
        const nextVip = VIP_TIERS.find(v => v.min > (user?.total_deposited || 0));
        const remaining = nextVip ? nextVip.min - (user?.total_deposited || 0) : 0;
        
        c.innerHTML = `
            <div class="dashboard-stats">
                <div class="dash-stat"><div class="dash-stat-icon">💰</div><div class="dash-stat-value">${formatMoney(user?.balance || 0)}</div><div class="dash-stat-label">Số dư hiện tại</div></div>
                <div class="dash-stat"><div class="dash-stat-icon">📈</div><div class="dash-stat-value">${formatMoney(user?.total_deposited || 0)}</div><div class="dash-stat-label">Tổng đã nạp</div></div>
                <div class="dash-stat"><div class="dash-stat-icon">🛒</div><div class="dash-stat-value">${formatMoney(user?.total_spent || 0)}</div><div class="dash-stat-label">Tổng chi tiêu</div></div>
                <div class="dash-stat"><div class="dash-stat-icon">📦</div><div class="dash-stat-value">${totalOrders}</div><div class="dash-stat-label">Tổng đơn hàng</div></div>
                <div class="dash-stat"><div class="dash-stat-icon">✅</div><div class="dash-stat-value">${completedOrders}</div><div class="dash-stat-label">Đơn hoàn thành</div></div>
                <div class="dash-stat"><div class="dash-stat-icon">${vip.icon}</div><div class="dash-stat-value" style="font-size:1.1rem">${vip.name}</div><div class="dash-stat-label">Hạng VIP</div></div>
            </div>
            ${nextVip ? `
                <div style="background:rgba(139,92,246,0.1);border:1px solid var(--primary);padding:15px;border-radius:var(--radius-sm);margin-top:15px;text-align:center">
                    <p style="color:var(--accent);font-weight:600">🎯 Nạp thêm ${formatMoney(remaining)} để lên ${nextVip.name} (giảm ${nextVip.discount}%)</p>
                </div>
            ` : `
                <div style="background:linear-gradient(135deg,rgba(245,158,11,0.1),rgba(192,132,252,0.1));border:1px solid #f59e0b;padding:15px;border-radius:var(--radius-sm);margin-top:15px;text-align:center">
                    <p style="color:#f59e0b;font-weight:600">🏆 Bạn đã đạt hạng VIP cao nhất!</p>
                </div>
            `}
            <div style="margin-top:15px;background:rgba(34,197,94,0.05);border:1px solid rgba(34,197,94,0.3);padding:12px;border-radius:var(--radius-sm)">
                <p style="color:#22c55e;font-size:0.9rem"><i class="fas fa-tag"></i> Ưu đãi của bạn: <strong>Giảm ${vip.discount}%</strong> cho tất cả đơn hàng</p>
            </div>
        `;
    } catch (e) { c.innerHTML = '<p class="empty-state">Lỗi tải dữ liệu</p>'; }
}

async function loadNotifications() {
    const u = getUser();
    if (!u || !sb) return;
    const c = document.getElementById('notificationContent');
    c.innerHTML = '<p class="empty-state"><i class="fas fa-spinner fa-spin"></i> Đang tải...</p>';
    try {
        const { data } = await sb.from('notifications').select('*').eq('username', u.username).order('created_at', { ascending: false }).limit(50);
        if (!data?.length) { c.innerHTML = '<p class="empty-state"><i class="fas fa-bell-slash"></i> Chưa có thông báo</p>'; return; }
        c.innerHTML = data.map(n => `
            <div class="notif-item ${n.read ? '' : 'unread'}" onclick="markNotifRead(${n.id})">
                <div class="notif-icon"><i class="fas fa-bell"></i></div>
                <div class="notif-content">
                    <h4>${n.title}</h4>
                    <p>${n.message || ''}</p>
                    <small>${new Date(n.created_at).toLocaleString('vi-VN')}</small>
                </div>
            </div>
        `).join('');
        // Mark all as read
        await sb.from('notifications').update({ read: true }).eq('username', u.username).eq('read', false);
        await loadNotificationCount();
    } catch (e) { c.innerHTML = '<p class="empty-state">Lỗi tải dữ liệu</p>'; }
}

async function loadNotificationCount() {
    const u = getUser();
    if (!u || !sb) return;
    try {
        const { data } = await sb.from('notifications').select('id').eq('username', u.username).eq('read', false);
        const count = data?.length || 0;
        const badge1 = document.getElementById('notifBadge');
        const badge2 = document.getElementById('notifBadgeMobile');
        if (count > 0) {
            if (badge1) { badge1.textContent = count; badge1.classList.remove('hidden'); }
            if (badge2) { badge2.textContent = count; badge2.classList.remove('hidden'); }
        } else {
            if (badge1) badge1.classList.add('hidden');
            if (badge2) badge2.classList.add('hidden');
        }
    } catch (e) {}
}

async function markNotifRead(id) {
    if (!sb) return;
    try { await sb.from('notifications').update({ read: true }).eq('id', id); } catch (e) {}
}

async function addNotification(title, message, type = 'info') {
    const u = getUser();
    if (!u || !sb || u.isAdmin) return;
    try {
        await sb.from('notifications').insert([{ username: u.username, title, message, type }]);
        await loadNotificationCount();
    } catch (e) {}
}

async function changePassword() {
    const u = getUser();
    if (!u || !sb) return toast('Vui lòng đăng nhập!', 'error');
    const old = document.getElementById('oldPass').value;
    const newP = document.getElementById('newPass').value;
    const newP2 = document.getElementById('newPass2').value;
    if (!old || !newP || !newP2) return toast('Điền đầy đủ!', 'error');
    if (newP.length < 6) return toast('Mật khẩu mới từ 6 ký tự!', 'error');
    if (newP !== newP2) return toast('Mật khẩu xác nhận không khớp!', 'error');
    try {
        const { data: user } = await sb.from('users').select('password').eq('username', u.username).maybeSingle();
        if (!user || user.password !== old) return toast('Mật khẩu cũ sai!', 'error');
        await sb.from('users').update({ password: newP }).eq('username', u.username);
        toast('✅ Đổi mật khẩu thành công!', 'success');
        addNotification('🔐 Đổi mật khẩu', 'Bạn vừa đổi mật khẩu thành công');
        closeModal('changePassModal');
        document.getElementById('oldPass').value = '';
        document.getElementById('newPass').value = '';
        document.getElementById('newPass2').value = '';
    } catch (e) { toast('Lỗi: ' + e.message, 'error'); }
}

function openReview(service) {
    const u = getUser();
    if (!u) { toast('Vui lòng đăng nhập!', 'info'); openModal('loginModal'); return; }
    currentReviewService = service;
    currentRating = 0;
    document.getElementById('reviewService').textContent = service;
    document.getElementById('reviewComment').value = '';
    document.querySelectorAll('#ratingStars i').forEach(s => s.classList.remove('active'));
    openModal('reviewModal');
}

async function submitReview() {
    const u = getUser();
    if (!u || !sb) return toast('Vui lòng đăng nhập!', 'error');
    if (currentRating === 0) return toast('Vui lòng chọn số sao!', 'error');
    const comment = document.getElementById('reviewComment').value.trim();
    if (!comment) return toast('Vui lòng nhập bình luận!', 'error');
    try {
        await sb.from('reviews').insert([{ username: u.username, service: currentReviewService, rating: currentRating, comment }]);
        toast('✅ Đã gửi đánh giá!', 'success');
        closeModal('reviewModal');
        loadReviews();
    } catch (e) { toast('Lỗi: ' + e.message, 'error'); }
}

async function loadReviews() {
    if (!sb) return;
    const grid = document.getElementById('reviewsGrid');
    if (!grid) return;
    try {
        const { data } = await sb.from('reviews').select('*').order('created_at', { ascending: false }).limit(12);
        if (!data?.length) { grid.innerHTML = '<p class="empty-state"><i class="fas fa-comments"></i> Chưa có đánh giá</p>'; return; }
        grid.innerHTML = data.map(r => {
            const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
            return `<div class="review-card">
                <div class="review-header">
                    <span class="review-author">${r.username}</span>
                    <span class="review-stars">${stars}</span>
                </div>
                <div class="review-service">${r.service}</div>
                <div class="review-comment">"${r.comment}"</div>
                <div class="review-date">${new Date(r.created_at).toLocaleDateString('vi-VN')}</div>
            </div>`;
        }).join('');
    } catch (e) {}
}

function copyReferral() {
    const code = document.getElementById('myReferralCode').value;
    copyText(code);
}

function toggleChat() {
    const box = document.getElementById('chatBox');
    if (box) box.classList.toggle('hidden');
}

window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.getElementById('chatWidget')?.classList.remove('hidden');
    }, 2000);
});

function openModal(id) {
    const m = document.getElementById(id);
    if (m) {
        m.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (id === 'historyModal') loadHistory();
        if (id === 'orderModal') updateOrderPrice();
        if (id === 'dashboardModal') loadDashboard();
        if (id === 'notificationModal') loadNotifications();
        if (id === 'referralModal') refreshUserInfo();
    }
    closeMobileMenu();
}
function closeModal(id) {
    const m = document.getElementById(id);
    if (m) { m.classList.remove('active'); document.body.style.overflow = ''; }
}
function switchModal(from, to) { closeModal(from); setTimeout(() => openModal(to), 200); }
document.addEventListener('click', e => {
    if (e.target.classList.contains('modal')) { e.target.classList.remove('active'); document.body.style.overflow = ''; }
});

function toast(msg, type = 'info') {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.className = `toast ${type} show`;
    setTimeout(() => t.classList.remove('show'), 3500);
}

function copyText(text) {
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => toast('Đã copy: ' + text, 'success'));
    else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        toast('Đã copy: ' + text, 'success');
    }
        }
