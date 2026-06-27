-- ============================================================
--  KNOX SHOP - SUPABASE DATABASE SCHEMA
--  Run this in Supabase SQL Editor
-- ============================================================

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email TEXT,
  zalo TEXT,
  balance BIGINT DEFAULT 0,
  total_spent BIGINT DEFAULT 0,
  total_deposited BIGINT DEFAULT 0,
  vip_level INT DEFAULT 0,
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  is_locked BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMPTZ,
  last_ip TEXT,
  last_device TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 2. ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  order_code TEXT UNIQUE,
  username TEXT NOT NULL,
  service TEXT,
  payment TEXT,
  note TEXT,
  price BIGINT DEFAULT 0,
  status TEXT DEFAULT 'pending',
  progress INT DEFAULT 0,
  download_link TEXT,
  rating INT,
  game_username TEXT,
  game_password TEXT,
  reject_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- 3. DEPOSITS
CREATE TABLE IF NOT EXISTS deposits (
  id BIGSERIAL PRIMARY KEY,
  deposit_code TEXT UNIQUE,
  username TEXT NOT NULL,
  amount BIGINT DEFAULT 0,
  method TEXT,
  note TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE deposits DISABLE ROW LEVEL SECURITY;

-- 4. CARD DEPOSITS
CREATE TABLE IF NOT EXISTS card_deposits (
  id BIGSERIAL PRIMARY KEY,
  card_code TEXT UNIQUE,
  username TEXT NOT NULL,
  telco TEXT,
  serial TEXT,
  code TEXT,
  amount BIGINT DEFAULT 0,
  actual_amount BIGINT DEFAULT 0,
  status TEXT DEFAULT 'pending',
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE card_deposits DISABLE ROW LEVEL SECURITY;

-- 5. SCRIPTS
CREATE TABLE IF NOT EXISTS scripts (
  id BIGSERIAL PRIMARY KEY,
  name TEXT,
  game TEXT,
  price BIGINT DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE scripts DISABLE ROW LEVEL SECURITY;

-- 6. HOT DEALS
CREATE TABLE IF NOT EXISTS hot_deals (
  id BIGSERIAL PRIMARY KEY,
  product_name TEXT,
  original_price BIGINT DEFAULT 0,
  discount_percent INT DEFAULT 0,
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE hot_deals DISABLE ROW LEVEL SECURITY;

-- 7. VOUCHERS
CREATE TABLE IF NOT EXISTS vouchers (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE,
  discount_percent INT DEFAULT 0,
  max_uses INT DEFAULT 999999,
  used_count INT DEFAULT 0,
  expires_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE vouchers DISABLE ROW LEVEL SECURITY;

-- 8. REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
  id BIGSERIAL PRIMARY KEY,
  username TEXT,
  service TEXT,
  rating INT,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- 9. TICKETS
CREATE TABLE IF NOT EXISTS tickets (
  id BIGSERIAL PRIMARY KEY,
  ticket_code TEXT UNIQUE,
  username TEXT,
  subject TEXT,
  message TEXT,
  admin_reply TEXT,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;

-- 10. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  username TEXT,
  title TEXT,
  message TEXT,
  type TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- 11. LOGIN HISTORY
CREATE TABLE IF NOT EXISTS login_history (
  id BIGSERIAL PRIMARY KEY,
  username TEXT,
  ip TEXT,
  device TEXT,
  browser TEXT,
  success BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE login_history DISABLE ROW LEVEL SECURITY;

-- 12. BROADCASTS
CREATE TABLE IF NOT EXISTS broadcasts (
  id BIGSERIAL PRIMARY KEY,
  title TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE broadcasts DISABLE ROW LEVEL SECURITY;

-- 13. ADMIN LOGS
CREATE TABLE IF NOT EXISTS admin_logs (
  id BIGSERIAL PRIMARY KEY,
  action TEXT,
  target TEXT,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE admin_logs DISABLE ROW LEVEL SECURITY;

-- ============================================================
--  DEFAULT DATA
-- ============================================================

-- Vouchers
INSERT INTO vouchers (code, discount_percent, max_uses, used_count, active)
VALUES
  ('KNOX10', 10, 999999, 0, TRUE),
  ('KNOX20', 20, 999999, 0, TRUE),
  ('NEWUSER', 15, 999999, 0, TRUE)
ON CONFLICT (code) DO NOTHING;

-- Scripts
INSERT INTO scripts (name, game, price, active)
VALUES
  ('Sniper Arena', 'Roblox', 15000, TRUE)
ON CONFLICT DO NOTHING;

-- Hot Deals
INSERT INTO hot_deals (product_name, original_price, discount_percent, description, active)
VALUES
  ('Bản Mod (Tự Mod)', 85000, 10, 'Bộ công cụ tự mod game - giảm sốc!', TRUE),
  ('Mod Kim Cương (1tr KC)', 30000, 15, 'Nạp kim cương giá tốt!', TRUE)
ON CONFLICT DO NOTHING;
