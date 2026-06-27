# KNOX LUXURY - Bản nâng cấp giao diện Premium

## 📦 Cấu trúc file

```
├── database.sql     ← Chạy trong Supabase SQL Editor
├── index.html       ← Trang chính (khách hàng)
├── admin.html       ← Admin panel
├── style.css        ← Toàn bộ CSS (gaming galaxy theme)
├── app.js           ← JavaScript khách hàng (24 tính năng)
├── admin.js         ← JavaScript admin (15 tính năng)
├── lang.js          ← Đa ngôn ngữ Việt/Anh
├── manifest.json    ← PWA manifest
└── sw.js            ← Service Worker (offline cache)
```

## 🚀 Bước 1: Cài đặt Database

1. Vào [Supabase Dashboard](https://supabase.com/dashboard) → chọn project `lsievokkismxxaiezdlm`
2. Mở **SQL Editor** → **New Query**
3. Copy toàn bộ nội dung file `database.sql` → Paste → **Run**
4. Kiểm tra: 13 bảng đã tạo + dữ liệu mặc định (3 vouchers, 1 script, 2 hot deals)

## 🔐 Ghi chú bảo mật

- Đã bỏ mật khẩu admin dạng plaintext khỏi README/source và chuyển sang kiểm tra SHA-256 ở frontend.
- Với shop thật có nạp tiền/đơn hàng, khuyến nghị tiếp theo là dùng Supabase Auth + RLS/API server để bảo mật chuẩn production.

## 🚀 Bước 3: Deploy

### Cách 1: GitHub Pages
```bash
git init
git add .
git commit -m "KNOX Luxury Premium UI"
git push origin main
# Vào Settings → Pages → Source: main branch
```

### Cách 2: Vercel / Netlify
- Kéo thả toàn bộ file vào [Vercel](https://vercel.com) hoặc [Netlify](https://netlify.com)
- Không cần build command

### Cách 3: Test local
```bash
python3 -m http.server 8080
# Mở http://localhost:8080
```

## 🔑 Tài khoản

- Admin: dùng tài khoản admin hiện tại của chủ shop. Không công khai mật khẩu trong README.
- Khách: tự đăng ký trên web.

## ✨ Nâng cấp trong bản này

- Giao diện Dark Luxury Gaming UI.
- Hero 3D/Gravity premium visual.
- Bộ ảnh SVG nội bộ cho từng sản phẩm trong `assets/products/`.
- Product card có ảnh, badge, stock, bảo hành, CTA rõ.
- Hot Deals premium có ảnh, limited badge, fallback nếu database chưa có deal.
- Trust section và review mẫu nếu database chưa có review.
- Tối ưu mobile và CTA liên hệ.

## 📋 39 Tính năng

### Khách hàng (24):
1. Đăng ký (tự tạo mã referral REFxxxxxx)
2. Đăng nhập (phân biệt lỗi cụ thể)
3. Đổi mật khẩu
4. Quên mật khẩu (popup liên hệ)
5. Ví điện tử (real-time 2s)
6. Nạp ngân hàng (NAP + 5 số cố định/khách)
7. Nạp thẻ cào (chiết khấu 12-15%)
8. Mua hàng (10 sản phẩm, auto trừ tiền)
9. Voucher (KNOX10/KNOX20/NEWUSER)
10. VIP 5 cấp (NEW→VIP4)
11. Hot Deals
12. Top nạp tháng
13. Giới thiệu bạn bè (+10K/người)
14. Hủy đơn (auto hoàn tiền)
15. Tải file (Google Drive link)
16. Đánh giá sao 1-5
17. Ticket hỗ trợ
18. Lịch sử giao dịch (3 tab)
19. Dashboard cá nhân (6 stats)
20. Thông báo real-time
21. Đa ngôn ngữ VI/EN
22. PWA (install + offline)
23. Music player (anime, volume 30%)
24. Chat widget (Zalo + Telegram)

### Admin (15):
25. Biểu đồ doanh thu (Chart.js 7/30/365 ngày)
26. Quản lý đơn hàng (filter/search/export)
27. Duyệt nạp tiền
28. Check thẻ cào (copy seri/code)
29. Trả lời ticket
30. Quản lý user (cộng tiền/reset MK/khóa/xóa)
31. Quản lý scripts
32. Tạo hot deals
33. Tạo voucher
34. Quản lý đánh giá
35. Broadcast (gửi tất cả user)
36. Lịch sử đăng nhập (100 gần nhất)
37. Log hoạt động admin (100 gần nhất)
38. Xuất Excel (4 bảng)
39. Backup database (JSON)

## 💳 Thông tin thanh toán

- **Vietcombank**: 1064291846 - NGUYEN TRUNG NGUYEN
- **Nội dung CK**: NAP666 (shop) / NAP + 5 số (khách)
- **Thẻ cào**: Viettel, Mobi, Vina, Vietnamobile (12-15%)
- **GCOIN**: Liên hệ Zalo

## 📞 Liên hệ

- Zalo: 0564 721 862
- Telegram: @ngonthe666
- Email: n799903@gmail.com
- Giờ: 8:00 - 22:00

## 🎨 Công nghệ

- Supabase (database + API)
- Chart.js (biểu đồ doanh thu)
- SheetJS/xlsx (xuất Excel)
- Google Fonts: Orbitron + Rajdhani
- CSS animations (60fps, GPU accelerated)
- PWA (manifest + service worker)

## 💰 Bảng giá

### Mod Game - Câu Cá Vạn Cân
- Mod Skill: 10.000đ
- Mod Cá: 20.000đ
- Mod Level: 10.000đ
- Mod Item: 20.000đ
- Mod Pet: 20.000đ
- Mod Kim Cương: 30.000đ/1tr KC
- Câu Cá Vạn Cân Full: Liên hệ

### Script Roblox
- Sniper Arena: 15.000đ

### Khác
- Bản Mod (Tự Mod): 85.000đ
- Câu Chung (Theo Giờ): 20.000đ/giờ
