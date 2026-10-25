-- Schema SQL cho Hệ Thống Quản Lý & Tra Cứu Phòng Cho Thuê (Rented Room) - Đội Sale
-- Chạy đoạn mã này trong SQL Editor của Supabase Dashboard

-- 1. Bảng buildings (Toà nhà / Cụm căn hộ)
CREATE TABLE IF NOT EXISTS buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  district TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'TP.HCM',
  total_floors INT NOT NULL DEFAULT 5,
  manager_name TEXT,
  manager_phone TEXT,
  shared_amenities TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bảng rooms (Phòng cho thuê)
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code TEXT NOT NULL,
  building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
  building_name TEXT NOT NULL,
  district TEXT NOT NULL,
  address TEXT NOT NULL,
  floor INT NOT NULL DEFAULT 1,
  type TEXT NOT NULL CHECK (type IN ('studio', '1pn', '2pn', 'duplex', 'dorm')),
  area NUMERIC NOT NULL,
  price NUMERIC NOT NULL,
  deposit NUMERIC NOT NULL,
  commission TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'holding', 'deposited', 'occupied', 'soon_available')),
  available_date DATE,
  images TEXT[] DEFAULT '{}',
  video_url TEXT,
  furniture TEXT[] DEFAULT '{}',
  service_fees JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes_for_sale TEXT,
  allow_pet BOOLEAN DEFAULT FALSE,
  has_elevator BOOLEAN DEFAULT TRUE,
  has_balcony BOOLEAN DEFAULT FALSE,
  max_tenants INT DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bảng room_holds (Lịch giữ chỗ dẫn khách của Sale)
CREATE TABLE IF NOT EXISTS room_holds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  room_code TEXT NOT NULL,
  sale_name TEXT NOT NULL,
  sale_phone TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  held_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

-- Kích hoạt Realtime trên bảng rooms để đồng bộ tức thì cho toàn bộ đội Sale
ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE room_holds;

-- Chỉ mục tối ưu tốc độ tra cứu (Zero latency indexing)
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_district ON rooms(district);
CREATE INDEX IF NOT EXISTS idx_rooms_price ON rooms(price);
CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms(type);
