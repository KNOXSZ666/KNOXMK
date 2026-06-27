// ============================================================
//  KNOX SHOP - MULTI-LANGUAGE (Vietnamese / English)
// ============================================================

const LANG = {
  vi: {
    // Nav
    nav_home: 'Trang chủ',
    nav_products: 'Sản phẩm',
    nav_deposit: 'Nạp tiền',
    nav_history: 'Lịch sử',
    nav_dashboard: 'Dashboard',
    nav_login: 'Đăng nhập',
    nav_register: 'Đăng ký',
    nav_logout: 'Đăng xuất',
    nav_admin: 'Admin Panel',
    nav_balance: 'Số dư',
    nav_vip: 'Hạng',
    nav_topup: 'Nạp tiền',
    nav_lang: 'EN',

    // Hero
    hero_title: 'KNOX LUXURY',
    hero_subtitle: 'Cửa hàng Mod Game Premium #1 Việt Nam',
    hero_desc: 'Mod Game Câu Cá Vạn Cân • Script Roblox • Giá tốt • Hỗ trợ nhanh',
    hero_cta: 'Khám phá ngay',
    hero_features: 'Nạp tự động 24/7 • Giao dịch nhanh • Bảo hành trọn đời',

    // Products
    products_title: 'BẢNG GIÁ DỊCH VỤ',
    products_subtitle: 'Chọn dịch vụ phù hợp với bạn',
    cat_mod: '🎮 MOD GAME - CÂU CÁ VẠN CÂN',
    cat_script: '💻 SCRIPT ROBLOX',
    cat_other: '📦 SẢN PHẨM KHÁC',
    btn_buy: 'Mua ngay',
    btn_contact: 'Liên hệ',
    in_stock: 'Còn hàng',

    // Buy modal
    buy_title: 'Đặt hàng',
    buy_service: 'Dịch vụ',
    buy_price: 'Giá',
    buy_gameuser: 'Tài khoản game',
    buy_gamepass: 'Mật khẩu game',
    buy_voucher: 'Mã giảm giá',
    buy_voucher_placeholder: 'Nhập mã voucher (tùy chọn)',
    buy_note: 'Ghi chú thêm',
    buy_note_placeholder: 'Ghi chú cho admin...',
    buy_payment: 'Phương thức thanh toán',
    buy_final_price: 'Thành tiền',
    buy_balance: 'Số dư ví',
    buy_confirm: 'Xác nhận mua',
    buy_check_voucher: 'Áp dụng',
    buy_applied: 'Đã áp dụng',
    buy_invalid_voucher: 'Mã không hợp lệ hoặc hết lượt',
    buy_not_enough: 'Số dư không đủ',
    buy_no_money_open: 'Không đủ tiền! Đang mở form nạp tiền...',
    buy_success: 'Đặt hàng thành công!',
    buy_order_code: 'Mã đơn hàng',
    buy_free_order: 'Đơn liên hệ - không trừ tiền',
    buy_validate_game: 'Vui lòng nhập tài khoản + mật khẩu game (≥3 ký tự)',
    buy_vip_discount: 'Giảm VIP',

    // Deposit
    deposit_title: 'NẠP TIỀN',
    deposit_subtitle: 'Chọn phương thức nạp',
    deposit_bank: '🏦 Ngân hàng (VCB/GCoin)',
    deposit_card: '📱 Thẻ cào',
    deposit_amount: 'Số tiền',
    deposit_method: 'Phương thức',
    deposit_note: 'Ghi chú',
    deposit_note_placeholder: 'Ghi chú cho admin...',
    deposit_submit: 'Tạo lệnh nạp',
    deposit_code: 'Mã nạp',
    deposit_pending: 'Đang chờ duyệt',
    deposit_success_title: 'YÊU CẦU NẠP ĐÃ TẠO',
    deposit_bank_info: 'Thông tin chuyển khoản',
    deposit_bank_name: 'Ngân hàng',
    deposit_stk: 'Số tài khoản',
    deposit_owner: 'Chủ tài khoản',
    deposit_content: 'Nội dung CK',
    deposit_amount_label: 'Số tiền',
    deposit_copy: 'Sao chép',
    deposit_copied: 'Đã sao chép!',
    deposit_back_home: 'Về trang chủ',

    // Card deposit
    card_title: 'NẠP THẺ CÀO',
    card_telco: 'Nhà mạng',
    card_amount: 'Mệnh giá',
    card_serial: 'Số serial',
    card_code: 'Mã thẻ',
    card_receive: 'Bạn sẽ nhận',
    card_discount: 'Chiết khấu',
    card_submit: 'Gửi thẻ',
    card_success: 'Gửi thẻ thành công! Chờ admin duyệt',
    card_validate: 'Vui lòng nhập đầy đủ thông tin thẻ',

    // History
    history_title: 'LỊCH SỬ GIAO DỊCH',
    tab_orders: 'Đơn hàng',
    tab_deposits: 'Nạp tiền',
    tab_cards: 'Thẻ cào',
    history_no_orders: 'Chưa có đơn hàng nào',
    history_no_deposits: 'Chưa có lệnh nạp nào',
    history_no_cards: 'Chưa có thẻ cào nào',
    history_game_info: 'Thông tin game',
    history_reject: 'Lý do từ chối',
    history_progress: 'Tiến độ',
    history_download: 'Tải xuống',
    history_cancel: 'Hủy đơn',
    history_review: 'Đánh giá',
    history_rate: 'Chọn số sao',
    history_comment: 'Bình luận',
    history_submit_review: 'Gửi đánh giá',
    history_status_pending: 'Chờ xử lý',
    history_status_processing: 'Đang xử lý',
    history_status_completed: 'Hoàn thành',
    history_status_cancelled: 'Đã hủy',
    history_cancel_confirm: 'Hủy đơn này? Tiền sẽ hoàn lại ví.',
    history_cancel_success: 'Đã hủy đơn + hoàn tiền',

    // Dashboard
    dash_title: 'DASHBOARD CÁ NHÂN',
    dash_balance: 'Số dư',
    dash_deposited: 'Tổng nạp',
    dash_spent: 'Tổng chi',
    dash_orders: 'Đơn hàng',
    dash_completed: 'Hoàn thành',
    dash_vip: 'Hạng VIP',
    dash_next_vip: 'Nạp thêm để lên',
    dash_discount: 'Ưu đãi hiện tại',

    // VIP
    vip_new: 'NEW',
    vip_1: 'VIP 1',
    vip_2: 'VIP 2',
    vip_3: 'VIP 3',
    vip_4: 'VIP 4',
    vip_need: 'Cần nạp thêm',

    // Top month
    top_title: '🏆 TOP NẠP THÁNG',
    top_no_data: 'Chưa có dữ liệu',

    // Referral
    ref_title: '👥 GIỚI THIỆU BẠN BÈ',
    ref_code: 'Mã giới thiệu của bạn',
    ref_count: 'Số người đã giới thiệu',
    ref_reward: 'Thưởng +10.000đ / người nạp lần đầu',
    ref_share: 'Chia sẻ',
    ref_referral_placeholder: 'Mã giới thiệu (tùy chọn)',

    // Tickets
    ticket_title: 'YÊU CẦU HỖ TRỢ',
    ticket_new: 'Tạo ticket',
    ticket_subject: 'Tiêu đề',
    ticket_message: 'Nội dung',
    ticket_submit: 'Gửi ticket',
    ticket_reply: 'Phản hồi admin',
    ticket_status_open: 'Đang mở',
    ticket_status_answered: 'Đã trả lời',
    ticket_status_closed: 'Đã đóng',
    ticket_no: 'Chưa có ticket nào',

    // Reviews
    reviews_title: 'ĐÁNH GIÁ KHÁCH HÀNG',
    reviews_no: 'Chưa có đánh giá',

    // Auth
    reg_title: 'ĐĂNG KÝ TÀI KHOẢN',
    reg_username: 'Tên đăng nhập',
    reg_email: 'Email',
    reg_zalo: 'Zalo',
    reg_password: 'Mật khẩu',
    reg_confirm: 'Xác nhận mật khẩu',
    reg_referral: 'Mã giới thiệu (tùy chọn)',
    reg_submit: 'Đăng ký',
    reg_success: 'Đăng ký thành công! Mời đăng nhập',
    reg_err_username: 'Username phải ≥ 3 ký tự',
    reg_err_username_admin: 'Không thể đăng ký tên "admin"',
    reg_err_password: 'Mật khẩu phải ≥ 6 ký tự',
    reg_err_match: 'Mật khẩu không khớp',
    reg_err_taken: 'Tên đăng nhập đã tồn tại',
    reg_err_referral: 'Mã giới thiệu không tồn tại',

    login_title: 'ĐĂNG NHẬP',
    login_username: 'Tên đăng nhập',
    login_password: 'Mật khẩu',
    login_submit: 'Đăng nhập',
    login_err_notfound: 'Tên không tồn tại',
    login_err_pass: 'Mật khẩu sai',
    login_err_adminpass: 'Mật khẩu Admin sai',
    login_err_locked: 'Tài khoản bị khóa',
    login_success: 'Đăng nhập thành công!',

    // Change password
    changepass_title: 'ĐỔI MẬT KHẨU',
    changepass_old: 'Mật khẩu cũ',
    changepass_new: 'Mật khẩu mới',
    changepass_confirm: 'Xác nhận mật khẩu mới',
    changepass_submit: 'Đổi mật khẩu',
    changepass_err_old: 'Mật khẩu cũ không đúng',
    changepass_success: 'Đổi mật khẩu thành công!',

    // Forgot
    forgot_title: 'QUÊN MẬT KHẨU',
    forgot_desc: 'Vui lòng liên hệ admin để reset mật khẩu:',
    forgot_zalo: 'Zalo',
    forgot_telegram: 'Telegram',

    // Notifications
    notif_title: 'THÔNG BÁO',
    notif_empty: 'Không có thông báo',
    notif_mark_read: 'Đánh dấu đã đọc',

    // Toast
    toast_added_money: '💰 Bạn vừa nhận tiền!',
    toast_welcome_back: 'Chào mừng trở lại!',

    // Misc
    contact_title: 'LIÊN HỆ',
    contact_hours: 'Giờ hoạt động',
    open_chat: 'Mở chat',
    music_title: 'Nhạc nền',
    footer_text: '© 2026 KNOX Luxury. All rights reserved.',
    loading: 'Đang tải...',
    no_data: 'Chưa có dữ liệu',
    close: 'Đóng',
    cancel: 'Hủy',
    confirm: 'Xác nhận',
    copy: 'Sao chép',
    copied: 'Đã sao chép!',
    save: 'Lưu',
    delete: 'Xóa',
    edit: 'Sửa',
    search: 'Tìm kiếm...',
    all: 'Tất cả',
    active: 'Hoạt động',
    inactive: 'Tạm dừng',
    yes: 'Có',
    no: 'Không',

    // Install banner
    install_title: 'Cài đặt KNOX Luxury',
    install_desc: 'Trải nghiệm nhanh hơn với app!',
    install_btn: 'Cài đặt',
    install_dismiss: 'Để sau'
  },

  en: {
    nav_home: 'Home',
    nav_products: 'Products',
    nav_deposit: 'Deposit',
    nav_history: 'History',
    nav_dashboard: 'Dashboard',
    nav_login: 'Login',
    nav_register: 'Register',
    nav_logout: 'Logout',
    nav_admin: 'Admin Panel',
    nav_balance: 'Balance',
    nav_vip: 'Rank',
    nav_topup: 'Deposit',
    nav_lang: 'VI',

    hero_title: 'KNOX LUXURY',
    hero_subtitle: '#1 Premium Game Mod Shop in Vietnam',
    hero_desc: 'Game Mods • Roblox Scripts • Good Prices • Fast Support',
    hero_cta: 'Explore now',
    hero_features: 'Auto topup 24/7 • Fast transactions • Lifetime warranty',

    products_title: 'SERVICE PRICE LIST',
    products_subtitle: 'Choose the right service for you',
    cat_mod: '🎮 GAME MODS - CÂU CÁ VẠN CÂN',
    cat_script: '💻 ROBLOX SCRIPTS',
    cat_other: '📦 OTHER PRODUCTS',
    btn_buy: 'Buy now',
    btn_contact: 'Contact',
    in_stock: 'In stock',

    buy_title: 'Place Order',
    buy_service: 'Service',
    buy_price: 'Price',
    buy_gameuser: 'Game account',
    buy_gamepass: 'Game password',
    buy_voucher: 'Voucher code',
    buy_voucher_placeholder: 'Enter voucher code (optional)',
    buy_note: 'Additional note',
    buy_note_placeholder: 'Note for admin...',
    buy_payment: 'Payment method',
    buy_final_price: 'Total',
    buy_balance: 'Wallet balance',
    buy_confirm: 'Confirm purchase',
    buy_check_voucher: 'Apply',
    buy_applied: 'Applied',
    buy_invalid_voucher: 'Invalid code or used up',
    buy_not_enough: 'Insufficient balance',
    buy_no_money_open: 'Not enough money! Opening deposit form...',
    buy_success: 'Order placed successfully!',
    buy_order_code: 'Order code',
    buy_free_order: 'Contact order - no charge',
    buy_validate_game: 'Please enter game account + password (≥3 chars)',
    buy_vip_discount: 'VIP discount',

    deposit_title: 'DEPOSIT',
    deposit_subtitle: 'Choose deposit method',
    deposit_bank: '🏦 Bank (VCB/GCoin)',
    deposit_card: '📱 Phone card',
    deposit_amount: 'Amount',
    deposit_method: 'Method',
    deposit_note: 'Note',
    deposit_note_placeholder: 'Note for admin...',
    deposit_submit: 'Create deposit',
    deposit_code: 'Deposit code',
    deposit_pending: 'Pending approval',
    deposit_success_title: 'DEPOSIT REQUEST CREATED',
    deposit_bank_info: 'Transfer info',
    deposit_bank_name: 'Bank',
    deposit_stk: 'Account number',
    deposit_owner: 'Account holder',
    deposit_content: 'Transfer content',
    deposit_amount_label: 'Amount',
    deposit_copy: 'Copy',
    deposit_copied: 'Copied!',
    deposit_back_home: 'Back to home',

    card_title: 'PHONE CARD DEPOSIT',
    card_telco: 'Carrier',
    card_amount: 'Face value',
    card_serial: 'Serial number',
    card_code: 'Card code',
    card_receive: 'You will receive',
    card_discount: 'Discount',
    card_submit: 'Submit card',
    card_success: 'Card submitted! Waiting for admin approval',
    card_validate: 'Please fill in all card info',

    history_title: 'TRANSACTION HISTORY',
    tab_orders: 'Orders',
    tab_deposits: 'Deposits',
    tab_cards: 'Cards',
    history_no_orders: 'No orders yet',
    history_no_deposits: 'No deposits yet',
    history_no_cards: 'No cards yet',
    history_game_info: 'Game info',
    history_reject: 'Reject reason',
    history_progress: 'Progress',
    history_download: 'Download',
    history_cancel: 'Cancel order',
    history_review: 'Review',
    history_rate: 'Select stars',
    history_comment: 'Comment',
    history_submit_review: 'Submit review',
    history_status_pending: 'Pending',
    history_status_processing: 'Processing',
    history_status_completed: 'Completed',
    history_status_cancelled: 'Cancelled',
    history_cancel_confirm: 'Cancel this order? Money will be refunded.',
    history_cancel_success: 'Order cancelled + money refunded',

    dash_title: 'PERSONAL DASHBOARD',
    dash_balance: 'Balance',
    dash_deposited: 'Total deposited',
    dash_spent: 'Total spent',
    dash_orders: 'Orders',
    dash_completed: 'Completed',
    dash_vip: 'VIP Rank',
    dash_next_vip: 'Deposit more to reach',
    dash_discount: 'Current discount',

    vip_new: 'NEW',
    vip_1: 'VIP 1',
    vip_2: 'VIP 2',
    vip_3: 'VIP 3',
    vip_4: 'VIP 4',
    vip_need: 'Need to deposit',

    top_title: '🏆 TOP DEPOSITORS',
    top_no_data: 'No data yet',

    ref_title: '👥 REFER FRIENDS',
    ref_code: 'Your referral code',
    ref_count: 'People referred',
    ref_reward: '+10.000đ reward per first-time depositor',
    ref_share: 'Share',
    ref_referral_placeholder: 'Referral code (optional)',

    ticket_title: 'SUPPORT TICKETS',
    ticket_new: 'New ticket',
    ticket_subject: 'Subject',
    ticket_message: 'Message',
    ticket_submit: 'Submit ticket',
    ticket_reply: 'Admin reply',
    ticket_status_open: 'Open',
    ticket_status_answered: 'Answered',
    ticket_status_closed: 'Closed',
    ticket_no: 'No tickets yet',

    reviews_title: 'CUSTOMER REVIEWS',
    reviews_no: 'No reviews yet',

    reg_title: 'REGISTER ACCOUNT',
    reg_username: 'Username',
    reg_email: 'Email',
    reg_zalo: 'Zalo',
    reg_password: 'Password',
    reg_confirm: 'Confirm password',
    reg_referral: 'Referral code (optional)',
    reg_submit: 'Register',
    reg_success: 'Registration successful! Please login',
    reg_err_username: 'Username must be ≥ 3 characters',
    reg_err_username_admin: 'Cannot register name "admin"',
    reg_err_password: 'Password must be ≥ 6 characters',
    reg_err_match: 'Passwords do not match',
    reg_err_taken: 'Username already exists',
    reg_err_referral: 'Referral code does not exist',

    login_title: 'LOGIN',
    login_username: 'Username',
    login_password: 'Password',
    login_submit: 'Login',
    login_err_notfound: 'Username not found',
    login_err_pass: 'Wrong password',
    login_err_adminpass: 'Wrong Admin password',
    login_err_locked: 'Account is locked',
    login_success: 'Login successful!',

    changepass_title: 'CHANGE PASSWORD',
    changepass_old: 'Current password',
    changepass_new: 'New password',
    changepass_confirm: 'Confirm new password',
    changepass_submit: 'Change password',
    changepass_err_old: 'Current password is wrong',
    changepass_success: 'Password changed successfully!',

    forgot_title: 'FORGOT PASSWORD',
    forgot_desc: 'Please contact admin to reset your password:',
    forgot_zalo: 'Zalo',
    forgot_telegram: 'Telegram',

    notif_title: 'NOTIFICATIONS',
    notif_empty: 'No notifications',
    notif_mark_read: 'Mark as read',

    toast_added_money: '💰 You received money!',
    toast_welcome_back: 'Welcome back!',

    contact_title: 'CONTACT',
    contact_hours: 'Working hours',
    open_chat: 'Open chat',
    music_title: 'Background music',
    footer_text: '© 2026 KNOX Luxury. All rights reserved.',
    loading: 'Loading...',
    no_data: 'No data yet',
    close: 'Close',
    cancel: 'Cancel',
    confirm: 'Confirm',
    copy: 'Copy',
    copied: 'Copied!',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search...',
    all: 'All',
    active: 'Active',
    inactive: 'Paused',
    yes: 'Yes',
    no: 'No',

    install_title: 'Install KNOX Luxury',
    install_desc: 'Faster experience with the app!',
    install_btn: 'Install',
    install_dismiss: 'Later'
  }
};

// Language manager
let currentLang = 'vi';
(function detectLang() {
  const saved = localStorage.getItem('knox_lang');
  if (saved) { currentLang = saved; return; }
  const browser = (navigator.language || navigator.userLanguage || 'vi').slice(0, 2);
  currentLang = (browser === 'vi') ? 'vi' : 'en';
})();

function t(key) {
  return (LANG[currentLang] && LANG[currentLang][key]) || LANG.vi[key] || key;
}

function applyLang() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (el.tagName === 'INPUT' && el.type !== 'hidden') {
      if (el.placeholder !== undefined) el.placeholder = val;
    } else {
      el.textContent = val;
    }
  });
  document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
    el.placeholder = t(el.getAttribute('data-i18n-ph'));
  });
  document.documentElement.lang = currentLang;
}

function toggleLang() {
  currentLang = (currentLang === 'vi') ? 'en' : 'vi';
  localStorage.setItem('knox_lang', currentLang);
  applyLang();
}
