# Deploy KNOX Luxury Premium UI

## Cách deploy nhanh lên Vercel

1. Giải nén file `knoxluxury-premium-deploy.zip`.
2. Vào Vercel → Add New Project.
3. Upload/import toàn bộ thư mục đã giải nén.
4. Framework Preset: Other hoặc Static.
5. Build Command: để trống.
6. Output Directory: để trống hoặc `.`.
7. Deploy.

## File chính

- `index.html`: trang shop khách hàng.
- `style.css`: giao diện premium/luxury mới.
- `app.js`: logic khách hàng.
- `admin.html`: admin panel.
- `admin.js`: logic admin.
- `assets/products/`: bộ ảnh SVG sản phẩm/hero nội bộ.
- `database.sql`: database Supabase.

## Lưu ý

- Web dùng Supabase CDN nên khi mở local bằng preview offline có thể thiếu kết nối database, nhưng khi deploy lên Vercel sẽ hoạt động có internet.
- Password admin plaintext đã được bỏ khỏi README/source và đổi sang hash SHA-256 ở frontend. Tuy nhiên để bảo mật production thật, nên nâng tiếp sang Supabase Auth + RLS/API server.
