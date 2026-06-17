const LANG = {
    vi: {
        // Navbar
        'nav.home': 'Trang chủ',
        'nav.services': 'Dịch vụ',
        'nav.modgame': 'Mod Game',
        'nav.scripts': 'Script',
        'nav.products': 'Sản phẩm',
        'nav.payment': 'Thanh toán',
        'nav.contact': 'Liên hệ',
        'nav.hotdeals': '🔥 Hot Deals',
        'nav.topnap': '🏆 Top Nạp',
        'nav.login': 'Đăng nhập',
        // User bar
        'user.hello': 'Xin chào',
        'user.balance': 'Số dư',
        'user.deposit': 'Nạp tiền',
        'user.order': 'Đặt đơn',
        'user.history': 'Lịch sử',
        'user.dashboard': 'Dashboard',
        'user.notifications': 'Thông báo',
        'user.referral': 'Giới thiệu',
        'user.changepass': 'Đổi mật khẩu',
        'user.support': 'Hỗ trợ',
        'user.logout': 'Đăng xuất',
        'user.totalspent': 'Đã chi',
        'user.totaldeposit': 'Đã nạp',
        // Hero
        'hero.badge': '⚡ #1 Mod Game & Script Shop',
        'hero.welcome': 'CHÀO MỪNG ĐẾN',
        'hero.desc': 'Mod Game Câu Cá Vạn Cân | Script Roblox | Hệ thống VIP',
        'hero.explore': 'Khám phá ngay',
        'hero.contact': 'Liên hệ',
        'hero.customers': 'Khách hàng',
        'hero.orders': 'Đơn hoàn thành',
        'hero.satisfaction': 'Hài lòng',
        // Common
        'btn.buy': 'Đặt mua',
        'btn.review': 'Đánh giá',
        'btn.cancel': 'Hủy',
        'btn.confirm': 'Xác nhận',
        'btn.close': 'Đóng',
        'btn.send': 'Gửi',
        'btn.save': 'Lưu',
        'btn.copy': 'Copy',
        'btn.download': 'Tải xuống',
        'msg.loading': 'Đang tải...',
        'msg.success': 'Thành công!',
        'msg.error': 'Lỗi!',
        'msg.empty': 'Trống',
        // Forms
        'form.username': 'Tên đăng nhập',
        'form.password': 'Mật khẩu',
        'form.email': 'Email',
        'form.zalo': 'Số Zalo',
        'form.note': 'Ghi chú',
        'form.amount': 'Số tiền',
        'form.method': 'Phương thức',
        // Status
        'status.pending': 'Chờ xử lý',
        'status.processing': 'Đang xử lý',
        'status.completed': 'Hoàn thành',
        'status.cancelled': 'Đã hủy'
    },
    en: {
        'nav.home': 'Home',
        'nav.services': 'Services',
        'nav.modgame': 'Mod Game',
        'nav.scripts': 'Scripts',
        'nav.products': 'Products',
        'nav.payment': 'Payment',
        'nav.contact': 'Contact',
        'nav.hotdeals': '🔥 Hot Deals',
        'nav.topnap': '🏆 Top Deposit',
        'nav.login': 'Login',
        'user.hello': 'Hello',
        'user.balance': 'Balance',
        'user.deposit': 'Deposit',
        'user.order': 'Order',
        'user.history': 'History',
        'user.dashboard': 'Dashboard',
        'user.notifications': 'Notifications',
        'user.referral': 'Referral',
        'user.changepass': 'Change Password',
        'user.support': 'Support',
        'user.logout': 'Logout',
        'user.totalspent': 'Spent',
        'user.totaldeposit': 'Deposited',
        'hero.badge': '⚡ #1 Mod Game & Script Shop',
        'hero.welcome': 'WELCOME TO',
        'hero.desc': 'Fishing Game Mods | Roblox Scripts | VIP System',
        'hero.explore': 'Explore Now',
        'hero.contact': 'Contact',
        'hero.customers': 'Customers',
        'hero.orders': 'Completed Orders',
        'hero.satisfaction': 'Satisfied',
        'btn.buy': 'Buy Now',
        'btn.review': 'Review',
        'btn.cancel': 'Cancel',
        'btn.confirm': 'Confirm',
        'btn.close': 'Close',
        'btn.send': 'Send',
        'btn.save': 'Save',
        'btn.copy': 'Copy',
        'btn.download': 'Download',
        'msg.loading': 'Loading...',
        'msg.success': 'Success!',
        'msg.error': 'Error!',
        'msg.empty': 'Empty',
        'form.username': 'Username',
        'form.password': 'Password',
        'form.email': 'Email',
        'form.zalo': 'Zalo Number',
        'form.note': 'Note',
        'form.amount': 'Amount',
        'form.method': 'Method',
        'status.pending': 'Pending',
        'status.processing': 'Processing',
        'status.completed': 'Completed',
        'status.cancelled': 'Cancelled'
    }
};

// Auto detect ngôn ngữ trình duyệt
const browserLang = (navigator.language || 'vi').startsWith('en') ? 'en' : 'vi';
let currentLang = localStorage.getItem('knox_lang') || browserLang;

function t(key) {
    return LANG[currentLang]?.[key] || LANG.vi[key] || key;
}

function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('knox_lang', lang);
    applyLang();
}

function applyLang() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });
    const btn = document.getElementById('langToggle');
    if (btn) btn.textContent = currentLang === 'vi' ? '🇬🇧 EN' : '🇻🇳 VI';
}

window.addEventListener('DOMContentLoaded', applyLang);
