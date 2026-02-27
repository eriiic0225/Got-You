-- ============================================================
-- Got You 咖揪 - 資料庫 Schema
-- 最後更新：2026-02-26
-- ============================================================
-- 使用說明：
--   直接貼到 Supabase Dashboard → SQL Editor 執行
--   建議按照順序執行（有外鍵依賴關係）
-- ============================================================


-- ============================================================
-- 前置作業
-- ============================================================

-- 啟用 UUID 生成（通常 Supabase 預設已啟用）
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 啟用 PostGIS 地理位置擴充（用於「附近的人」功能）
CREATE EXTENSION IF NOT EXISTS postgis;


-- ============================================================
-- 1. 使用者資料表
-- ============================================================
-- 對應 Supabase Auth 的 auth.users 表（透過 id 關聯）
-- 儲存使用者的個人資料和地理位置

CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email       TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  gender      TEXT,                    -- 'male' | 'female' | 'other'
  age         INTEGER,
  photo_url   TEXT,                    -- Supabase Storage 的圖片 URL
  bio         TEXT,                    -- 自我介紹
  latitude    DECIMAL(10, 8),          -- 地理位置緯度（用於「附近的人」）
  longitude   DECIMAL(11, 8),          -- 地理位置經度（用於「附近的人」）
  created_at  TIMESTAMP DEFAULT NOW()
);


-- ============================================================
-- 2. 運動類型資料表
-- ============================================================
-- 系統預設的運動類型選項

CREATE TABLE sport_types (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,           -- 如「羽球」、「重訓」、「跑步」
  category    TEXT,                    -- 'gym' | 'ball' | 'cardio' | 'outdoor'
  is_preset   BOOLEAN DEFAULT true     -- true = 系統預設，false = 使用者自訂
);


-- ============================================================
-- 3. 使用者運動偏好（多對多）
-- ============================================================
-- 一個使用者可以有多個運動偏好

CREATE TABLE user_sport_preferences (
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  sport_type_id UUID REFERENCES sport_types(id),
  skill_level   TEXT,                  -- 'beginner' | 'intermediate' | 'advanced'
  PRIMARY KEY (user_id, sport_type_id)
);


-- ============================================================
-- 4. 地點資料表（健身房、運動場）
-- ============================================================
-- 透過 Google Places API 搜尋並儲存的地點

CREATE TABLE gym_locations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  google_place_id TEXT UNIQUE,         -- Google Places 的唯一 ID
  name            TEXT NOT NULL,
  address         TEXT,
  latitude        DECIMAL(10, 8),
  longitude       DECIMAL(11, 8),
  type            TEXT,                -- 'gym' | 'stadium' | 'park' | 'other'
  created_at      TIMESTAMP DEFAULT NOW()
);


-- ============================================================
-- 5. 使用者常去地點（多對多）
-- ============================================================
-- 用於「共同地點」配對功能

CREATE TABLE user_gym_locations (
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  location_id UUID REFERENCES gym_locations(id),
  PRIMARY KEY (user_id, location_id)
);


-- ============================================================
-- 6. 揪團貼文
-- ============================================================

CREATE TABLE group_posts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  sport_type_id UUID REFERENCES sport_types(id),
  location_id   UUID REFERENCES gym_locations(id),  -- 可為 null（使用者未選擇地點）
  location_area TEXT,                 -- 手動輸入的地區，如「大安區」
  datetime      TIMESTAMP,            -- 活動時間（可為 null）
  description   TEXT NOT NULL,
  created_at    TIMESTAMP DEFAULT NOW()
);


-- ============================================================
-- 7. 揪團留言
-- ============================================================

CREATE TABLE post_comments (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id    UUID REFERENCES group_posts(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);


-- ============================================================
-- 8. 聊天訊息
-- ============================================================

CREATE TABLE messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  read        BOOLEAN DEFAULT false,   -- 已讀狀態
  created_at  TIMESTAMP DEFAULT NOW()
);


-- ============================================================
-- 9. 對話隱藏狀態（單向刪除）
-- ============================================================
-- 讓使用者可以「刪除」對話，但不影響對方看到的對話
-- 設計：對方再傳訊息時，此對話會重新出現

CREATE TABLE conversation_visibility (
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  partner_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  hidden          BOOLEAN DEFAULT false,
  last_message_at TIMESTAMP,           -- 最後一則訊息的時間（用於排序）
  PRIMARY KEY (user_id, partner_id)
);


-- ============================================================
-- 10. 封鎖名單
-- ============================================================

CREATE TABLE blocked_users (
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  blocked_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at      TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, blocked_user_id)
);


-- ============================================================
-- 11. 通知
-- ============================================================
-- 只儲存揪團相關通知（post_comment, comment_reply）
-- 聊天未讀數直接從 messages 表計算，不在此表

CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,   -- 接收通知的使用者
  type       TEXT NOT NULL,            -- 'post_comment' | 'comment_reply'
  related_id UUID,                     -- 相關的 comment_id
  actor_id   UUID REFERENCES users(id),-- 觸發通知的使用者（留言者）
  title      TEXT NOT NULL,            -- 通知標題，如「揪團新留言」
  message    TEXT,                     -- 通知內容預覽（前 50 字）
  link       TEXT,                     -- 點擊後跳轉的路徑，如 /posts/xxx
  read       BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);


-- ============================================================
-- 索引（效能優化）
-- ============================================================

-- 揪團貼文：按時間和運動類型查詢
CREATE INDEX idx_posts_created_at  ON group_posts(created_at DESC);
CREATE INDEX idx_posts_sport_type  ON group_posts(sport_type_id);
CREATE INDEX idx_posts_datetime    ON group_posts(datetime ASC);

-- 留言：按貼文查詢
CREATE INDEX idx_comments_post_id  ON post_comments(post_id, created_at);

-- 訊息：按收件人和寄件人查詢
CREATE INDEX idx_messages_receiver ON messages(receiver_id, created_at DESC);
CREATE INDEX idx_messages_sender   ON messages(sender_id, created_at DESC);

-- 通知：按使用者和已讀狀態查詢
CREATE INDEX idx_notifications_user_unread
  ON notifications(user_id, read, created_at DESC);


-- ============================================================
-- PostGIS 函式：查詢附近的使用者
-- ============================================================

CREATE OR REPLACE FUNCTION nearby_users(
  user_lat    FLOAT,
  user_lng    FLOAT,
  distance_km FLOAT DEFAULT 3         -- 預設搜尋半徑 3 公里
)
RETURNS TABLE (
  id          UUID,
  name        TEXT,
  age         INT,
  photo_url   TEXT,
  latitude    DECIMAL,
  longitude   DECIMAL,
  distance_km FLOAT
) AS $$
  SELECT
    u.id,
    u.name,
    u.age,
    u.photo_url,
    u.latitude,
    u.longitude,
    -- 計算距離並轉成公里
    ST_Distance(
      ST_MakePoint(u.longitude, u.latitude)::geography,
      ST_MakePoint(user_lng, user_lat)::geography
    ) / 1000 AS distance_km
  FROM users u
  WHERE
    u.latitude  IS NOT NULL
    AND u.longitude IS NOT NULL
    AND u.id != auth.uid()            -- 排除自己
    AND ST_DWithin(
      ST_MakePoint(u.longitude, u.latitude)::geography,
      ST_MakePoint(user_lng, user_lat)::geography,
      distance_km * 1000              -- 公里轉公尺
    )
  ORDER BY distance_km;
$$ LANGUAGE sql SECURITY DEFINER;


-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
-- 啟用後，使用者只能存取「有權限」的資料

ALTER TABLE users                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_posts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages               ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications          ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sport_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_gym_locations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_visibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users          ENABLE ROW LEVEL SECURITY;

-- 範例 Policy：使用者只能讀/寫自己的訊息
CREATE POLICY "Users can view their own messages"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- 範例 Policy：揪團貼文任何登入者都可以讀
CREATE POLICY "Anyone can view posts"
  ON group_posts FOR SELECT
  USING (auth.role() = 'authenticated');

-- 範例 Policy：只有作者可以刪除自己的貼文
CREATE POLICY "Authors can delete their own posts"
  ON group_posts FOR DELETE
  USING (auth.uid() = author_id);

-- 範例 Policy：使用者只能讀自己的通知
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================
-- 預設資料：運動類型
-- ============================================================

INSERT INTO sport_types (name, category) VALUES
  ('重訓', 'gym'),
  ('瑜珈', 'gym'),
  ('飛輪', 'gym'),
  ('羽球', 'ball'),
  ('籃球', 'ball'),
  ('桌球', 'ball'),
  ('網球', 'ball'),
  ('足球', 'ball'),
  ('排球', 'ball'),
  ('跑步', 'cardio'),
  ('游泳', 'cardio'),
  ('騎車', 'cardio'),
  ('登山', 'outdoor'),
  ('攀岩', 'outdoor'),
  ('衝浪', 'outdoor');
