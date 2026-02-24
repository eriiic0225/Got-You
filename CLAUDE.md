# Got You 咖揪 - Claude 開發指南

> 這份文件提供給 Claude Code CLI 和其他 AI 助手參考  
> 最後更新：2026-02-21  
> 作者：Eric

---

## 📋 目錄

1. [專案概述](#專案概述)
2. [技術棧](#技術棧)
3. [專案結構](#專案結構)
4. [技術決策](#技術決策)
5. [開發規範](#開發規範)
6. [環境設定](#環境設定)
7. [資料庫架構](#資料庫架構)
8. [API 整合](#api-整合)
9. [常用指令](#常用指令)
10. [問題排查](#問題排查)

---

## 專案概述

### 基本資訊
- **專案名稱**：Got You 咖揪
- **專案類型**：運動揪團平台 Web App
- **主要技術**：Next.js 15 + TypeScript + Supabase
- **開發期限**：6 週
- **目標**：求職作品集（前端工程師）

### 核心功能
1. **會員系統**：註冊、登入、個人資料管理
2. **探索功能**：找附近的運動夥伴（基於地點 + 運動偏好）
   - Tab 1: 共同地點（基於常去健身房配對）
   - Tab 2: 附近的人（PostGIS 距離查詢）
3. **揪團功能**：發佈/瀏覽揪團、留言互動
   - 篩選功能：快速篩選（橫向標籤）+ 進階篩選（彈窗）
   - 揪團詳情 + 留言區（取代報名系統）
4. **聊天功能**：一對一即時聊天
5. **通知系統**：⭐ 分離式設計
   - 🔔 Header 通知中心：揪團相關通知（留言、回覆）
   - 💬 聊天 Tab 紅點：私人訊息未讀數

### 產品定位
- 幫助在新環境的運動愛好者找到訓練夥伴
- 支援所有運動類型（不只健身房）
- 兩種使用情境：找固定夥伴 + 臨時揪團

### 開發優先級

**Phase 1（Week 0-5）- 核心功能：**
- ✅ 會員系統（註冊、登入、個人資料）
- ✅ 探索功能（雙 Tab：共同地點 + 附近的人）
- ✅ 揪團功能（發佈、列表、詳情、留言、篩選）
- ✅ 聊天功能（即時訊息、未讀標記）
- ✅ 通知系統（即時通知中心）
- ✅ Landing Page（簡化版：只有登入/註冊按鈕）⭐

**Phase 2（Week 6）- 加分功能：**
- Email 通知系統（Supabase Edge Functions + Resend）
- 運動打卡系統
- 活躍徽章系統
- Landing Page 美化（標語、功能介紹、使用流程）

**Landing Page 策略：**
```
Week 0-5: 簡化版
┌─────────────────────────────┐
│    🏋️ Got You 咖揪          │
│    找到你的運動夥伴          │
│                             │
│    [開始使用]  [登入]        │
└─────────────────────────────┘

Week 6: 完整版（時間允許）
- 加入產品標語
- 加入問題說明
- 加入功能介紹
- 加入使用流程
- 可能加入動畫、截圖
```

---

## 技術棧

### 前端
- **Framework**: Next.js 15 (App Router)
- **語言**: TypeScript
- **UI 框架**: React 19
- **樣式**: Tailwind CSS
- **表單**: React Hook Form
- **狀態管理**: Zustand ✅
  - 比 Context API 更直覺
  - 不需要 Provider wrapper
  - 效能更好（精準 re-render）
  - 學習曲線低

### 後端 / BaaS
- **Supabase**:
  - PostgreSQL 資料庫（含 PostGIS）
  - Supabase Auth（Email + Google OAuth）
  - Supabase Realtime（WebSocket）
  - Supabase Storage（圖片上傳）
  - Row Level Security (RLS)
  - **推薦 Region**: Northeast Asia (Tokyo) ⭐
    - 延遲最低（~40-50ms 從台灣）
    - 其他選項：Seoul (~50-60ms), Singapore (~60-70ms)

### 第三方服務
- **Google Maps Platform**:
  - Places API（地點搜尋）
  - Maps JavaScript API（可選）
- **React 套件**: `@react-google-maps/api`

### 開發工具
- **版本控制**: Git
- **部署**: Vercel
- **套件管理**: npm

---

## 專案結構

### 推薦的資料夾結構

```
got-you/
├── app/                      # Next.js App Router
│   ├── (auth)/               # 認證相關頁面群組
│   │   ├── login/
│   │   ├── signup/
│   │   └── layout.tsx
│   ├── (main)/               # 登入後主要頁面群組
│   │   ├── explore/
│   │   │   ├── page.tsx
│   │   │   └── [userId]/
│   │   ├── posts/
│   │   │   ├── page.tsx
│   │   │   ├── create/
│   │   │   └── [postId]/
│   │   ├── chats/
│   │   │   ├── page.tsx
│   │   │   └── [userId]/
│   │   ├── profile/
│   │   │   ├── me/
│   │   │   └── edit/
│   │   └── layout.tsx        # 包含底部導航
│   ├── onboarding/
│   ├── page.tsx              # Landing Page
│   └── layout.tsx            # Root Layout
│
├── components/               # React 元件
│   ├── ui/                   # 基礎 UI 元件
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── shared/               # 共用元件
│   │   ├── Header.tsx
│   │   ├── BottomNav.tsx
│   │   └── ...
│   ├── explore/              # 探索頁專用元件
│   ├── posts/                # 揪團專用元件
│   ├── chat/                 # 聊天專用元件
│   └── profile/              # 個人頁專用元件
│
├── lib/                      # 工具函式與設定
│   ├── supabase/
│   │   ├── client.ts         # Supabase Client
│   │   ├── server.ts         # Server Component 用
│   │   └── middleware.ts     # Auth Middleware
│   ├── utils/
│   │   ├── date.ts
│   │   ├── validation.ts
│   │   └── ...
│   └── constants.ts
│
├── types/                    # TypeScript 型別定義
│   ├── database.types.ts     # Supabase 自動生成
│   ├── user.ts
│   ├── post.ts
│   └── ...
│
├── hooks/                    # Custom Hooks
│   ├── useUser.ts
│   ├── useChat.ts
│   └── ...
│
├── contexts/                 # React Context
│   ├── AuthContext.tsx
│   └── ...
│
├── public/                   # 靜態資源
│   ├── images/
│   └── icons/
│
├── .env.local                # 環境變數（不 commit）
├── .env.example              # 環境變數範例
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md
```

### 檔案命名規範
- **元件**: PascalCase（如 `UserCard.tsx`）
- **工具函式**: camelCase（如 `formatDate.ts`）
- **頁面**: Next.js 規範（`page.tsx`, `layout.tsx`）
- **常數**: SCREAMING_SNAKE_CASE（如 `API_ENDPOINTS`）

---

## 技術決策

### 為什麼選 Supabase？
1. **展現 SQL 能力**（vs Firebase 的 NoSQL）
2. **Row Level Security**（展現資料安全理解）
3. **PostgreSQL 地理位置查詢**（PostGIS）
4. **即時功能簡單**（Realtime WebSocket）
5. **履歷更亮眼**（新技術學習能力）

### 為什麼選 Google Places API？
1. **最準確的地點資料**（Google 的資料庫）
2. **免費額度充足**（每月 $200 美金）
3. **良好的開發體驗**（`@react-google-maps/api`）
4. **展現第三方 API 整合能力**

### 狀態管理策略
- **選擇**: Zustand ✅
- **理由**:
  - 開發者實際使用過 Context API，覺得不直覺
  - Zustand 解決了 Context API 的所有痛點：
    - 不需要 Provider wrapper（程式碼更簡潔）
    - 不需要 useContext hook（使用更直覺）
    - 效能更好（只 re-render 需要的 component）
    - 支援 DevTools
  - 學習曲線低（30 分鐘就會）
  - 檔案小（只有 3KB）
  - 社群活躍、文件完整
- **不使用**: 
  - Context API（不夠直覺、效能問題、boilerplate 太多）
  - Jotai（概念較抽象、對此專案太複雜）
  - Redux（太重、學習曲線高）

### Zustand Stores 架構
專案會使用以下 Stores：

```typescript
stores/
├── useAuthStore.ts        // 使用者認證狀態
├── useExploreStore.ts     // 探索頁篩選狀態
├── useNotificationStore.ts // 通知狀態 ⭐
└── useUIStore.ts          // UI 狀態（modal, toast）
```

### 表單處理
- **推薦**: React Hook Form
- **理由**: 效能好、易用、支援 TypeScript
- **驗證**: Zod（可選，與 React Hook Form 搭配）

---

## 開發規範

### Component 結構

```typescript
// 標準元件結構範例

import { FC } from 'react';

// 1. 型別定義
interface UserCardProps {
  userId: string;
  name: string;
  age: number;
  onClick?: () => void;
}

// 2. 元件定義（使用 FC）
export const UserCard: FC<UserCardProps> = ({
  userId,
  name,
  age,
  onClick,
}) => {
  // 3. Hooks
  const [isHovered, setIsHovered] = useState(false);
  
  // 4. 處理函式
  const handleClick = () => {
    onClick?.();
  };
  
  // 5. 渲染
  return (
    <div 
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="p-4 rounded-lg shadow hover:shadow-lg transition"
    >
      <h3>{name}</h3>
      <p>{age} 歲</p>
    </div>
  );
};
```

### Tailwind CSS 使用原則
- ✅ 優先使用 Tailwind utility classes
- ✅ 重複的樣式抽成元件
- ❌ 避免過長的 className（考慮拆分元件）
- ✅ 使用 `clsx` 或 `cn` 處理條件樣式

```typescript
import { cn } from '@/lib/utils';

<button 
  className={cn(
    "px-4 py-2 rounded",
    isPrimary ? "bg-blue-500 text-white" : "bg-gray-200",
    isDisabled && "opacity-50 cursor-not-allowed"
  )}
>
  {children}
</button>
```

### API 呼叫方式

```typescript
// lib/api/posts.ts

import { supabase } from '@/lib/supabase/client';
import type { Post } from '@/types/post';

export async function getPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from('group_posts')
    .select(`
      *,
      author:users(id, name, photo_url),
      sport_type:sport_types(id, name)
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}
```

### 錯誤處理

```typescript
// 統一的錯誤處理

try {
  const posts = await getPosts();
  setPosts(posts);
} catch (error) {
  console.error('Failed to fetch posts:', error);
  toast.error('無法載入揪團列表');
}
```

---

## 環境設定

### Supabase 專案建立

```bash
# Step 1: 註冊 Supabase
1. 前往 https://supabase.com/
2. 用 GitHub 登入或 Email 註冊

# Step 2: 建立新專案
1. 點「New project」
2. 填寫：
   - Name: got-you
   - Database Password: [設定密碼並記好]
   - Region: Northeast Asia (Tokyo) ⭐ 推薦
     * Tokyo: ~40-50ms 延遲（最佳）
     * Seoul: ~50-60ms 延遲
     * Singapore: ~60-70ms 延遲
3. 點「Create new project」
4. 等待 1-2 分鐘建立完成

# Step 3: 取得連線資訊
1. 左側選單 → Project Settings → API
2. 複製：
   - Project URL
   - anon/public key
3. 存到 .env.local
```

### 環境變數

```bash
# .env.local（不 commit）

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-key

# App URL（部署後）
NEXT_PUBLIC_APP_URL=https://gotyou.app
```

### 環境變數使用

```typescript
// ✅ 正確：使用 NEXT_PUBLIC_ 前綴（客戶端可訪問）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

// ❌ 錯誤：沒有 NEXT_PUBLIC_ 前綴（客戶端無法訪問）
const apiKey = process.env.SUPABASE_ANON_KEY; // undefined in browser
```

### 初始化設定

```bash
# 1. 安裝依賴
npm install

# 2. 複製環境變數範例
cp .env.example .env.local

# 3. 填寫環境變數（Supabase URL & Key）

# 4. 啟動開發環境
npm run dev
```

---

## 資料庫架構

### 核心資料表

```sql
-- 1. 使用者（加入地理位置欄位）
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  gender TEXT,
  age INTEGER,
  photo_url TEXT,
  bio TEXT,
  latitude DECIMAL(10, 8),  -- 地理位置（用於「附近的人」）⭐
  longitude DECIMAL(11, 8), -- 地理位置（用於「附近的人」）⭐
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. 運動類型（預設資料）
CREATE TABLE sport_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT, -- 'gym' | 'ball' | 'cardio'
  is_preset BOOLEAN DEFAULT true
);

-- 3. 使用者運動偏好（多對多）
CREATE TABLE user_sport_preferences (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sport_type_id UUID REFERENCES sport_types(id),
  skill_level TEXT, -- 'beginner' | 'intermediate' | 'advanced'
  PRIMARY KEY (user_id, sport_type_id)
);

-- 4. 地點（健身房、運動場）
CREATE TABLE gym_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  google_place_id TEXT UNIQUE,
  name TEXT NOT NULL,
  address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  type TEXT, -- 'gym' | 'stadium' | 'park'
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. 使用者常去地點（多對多）
CREATE TABLE user_gym_locations (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  location_id UUID REFERENCES gym_locations(id),
  PRIMARY KEY (user_id, location_id)
);

-- 6. 揪團貼文
CREATE TABLE group_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sport_type_id UUID REFERENCES sport_types(id),
  location_id UUID REFERENCES gym_locations(id), -- 可為 null
  location_area TEXT, -- 手動輸入的區域（如「大安區」）
  datetime TIMESTAMP, -- 可為 null
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 7. 留言
CREATE TABLE post_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES group_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 8. 聊天訊息
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 9. 對話隱藏狀態（單向刪除）
CREATE TABLE conversation_visibility (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  hidden BOOLEAN DEFAULT false,
  last_message_at TIMESTAMP,
  PRIMARY KEY (user_id, partner_id)
);

-- 10. 封鎖名單
CREATE TABLE blocked_users (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  blocked_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, blocked_user_id)
);

-- 11. 通知 ⭐ 新增
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- 接收者
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- 通知類型
  type TEXT NOT NULL, -- 'new_message' | 'post_comment' | 'comment_reply'
  
  -- 相關資料
  related_id UUID,    -- message_id 或 comment_id
  actor_id UUID REFERENCES users(id), -- 誰觸發的（發訊息的人、留言的人）
  
  -- 通知內容
  title TEXT NOT NULL,
  message TEXT,
  
  -- 連結
  link TEXT,  -- 點擊後要跳到哪（如 /chats/user-id）
  
  -- 狀態
  read BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 索引（效能優化）

```sql
-- 提升查詢效能的索引
CREATE INDEX idx_posts_created_at ON group_posts(created_at DESC);
CREATE INDEX idx_posts_sport_type ON group_posts(sport_type_id);
CREATE INDEX idx_comments_post_id ON post_comments(post_id, created_at);
CREATE INDEX idx_messages_receiver ON messages(receiver_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id, created_at DESC);

-- 通知相關索引 ⭐ 新增
CREATE INDEX idx_notifications_user_unread 
  ON notifications(user_id, read, created_at DESC);
CREATE INDEX idx_notifications_user_created 
  ON notifications(user_id, created_at DESC);

-- 地理位置索引（PostGIS）⭐ 新增
CREATE INDEX idx_users_location 
  ON users USING GIST (ST_MakePoint(longitude, latitude));
```

### PostGIS 函式（附近的人）⭐ 新增

```sql
-- 啟用 PostGIS 擴充功能
CREATE EXTENSION IF NOT EXISTS postgis;

-- 查詢附近的使用者
CREATE OR REPLACE FUNCTION nearby_users(
  user_lat FLOAT,
  user_lng FLOAT,
  distance_km FLOAT DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  age INT,
  photo_url TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  distance_km FLOAT
) AS $$
  SELECT 
    u.id,
    u.name,
    u.age,
    u.photo_url,
    u.latitude,
    u.longitude,
    ST_Distance(
      ST_MakePoint(u.longitude, u.latitude)::geography,
      ST_MakePoint(user_lng, user_lat)::geography
    ) / 1000 AS distance_km  -- 轉成公里
  FROM users u
  WHERE 
    u.latitude IS NOT NULL 
    AND u.longitude IS NOT NULL
    AND u.id != auth.uid()  -- 排除自己
    AND ST_DWithin(
      ST_MakePoint(u.longitude, u.latitude)::geography,
      ST_MakePoint(user_lng, user_lat)::geography,
      distance_km * 1000  -- 公里轉公尺
    )
  ORDER BY distance_km;
$$ LANGUAGE sql SECURITY DEFINER;
```

### Row Level Security (RLS)

```sql
-- 啟用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 範例：使用者只能看到自己的訊息或發給自己的訊息
CREATE POLICY "Users can view their own messages"
  ON messages
  FOR SELECT
  USING (
    auth.uid() = sender_id OR 
    auth.uid() = receiver_id
  );

-- 範例：使用者只能刪除自己的貼文
CREATE POLICY "Users can delete their own posts"
  ON group_posts
  FOR DELETE
  USING (auth.uid() = author_id);
```

---

## API 整合

### Supabase Client 設定

```typescript
// lib/supabase/client.ts

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

### Supabase Auth

```typescript
// 註冊
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
});

// 登入
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
});

// Google OAuth
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  },
});

// 登出
await supabase.auth.signOut();

// 取得當前使用者
const { data: { user } } = await supabase.auth.getUser();
```

### Supabase Realtime（即時訂閱）

```typescript
// 訂閱留言更新
const channel = supabase
  .channel(`post-${postId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'post_comments',
      filter: `post_id=eq.${postId}`,
    },
    (payload) => {
      console.log('New comment:', payload.new);
      setComments((prev) => [...prev, payload.new]);
    }
  )
  .subscribe();

// 取消訂閱
return () => {
  channel.unsubscribe();
};
```

### Google Places API

```typescript
// 使用 @react-google-maps/api

import { Autocomplete, LoadScript } from '@react-google-maps/api';

function GymSelector() {
  const [autocomplete, setAutocomplete] = useState(null);
  
  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      
      // 儲存地點資訊
      const gymData = {
        google_place_id: place.place_id,
        name: place.name,
        address: place.formatted_address,
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
      };
      
      saveGymLocation(gymData);
    }
  };
  
  return (
    <LoadScript
      googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
      libraries={['places']}
    >
      <Autocomplete
        onLoad={setAutocomplete}
        onPlaceChanged={onPlaceChanged}
        options={{
          types: ['gym', 'stadium'],
          componentRestrictions: { country: 'tw' },
        }}
      >
        <input placeholder="搜尋健身房..." />
      </Autocomplete>
    </LoadScript>
  );
}
```

---

## 狀態管理（Zustand）⭐ 新增

### 安裝

```bash
npm install zustand
```

### Store 範例

```typescript
// stores/useAuthStore.ts
import { create } from 'zustand';
import { supabase } from '@/lib/supabase/client';

interface AuthState {
  user: any | null;
  isLoading: boolean;
  setUser: (user: any) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
}));

// 使用（超簡單）
function Header() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  
  return <button onClick={logout}>{user?.name}</button>;
}
```

---

## 通知系統 ⭐ 分離式設計

### 設計邏輯

```
🔔 Header 通知中心（揪團通知）：
   - 揪團留言（post_comment）
   - 留言回覆（comment_reply）
   - 顯示在所有頁面的 Header

💬 聊天 Tab 紅點（私人訊息）：
   - 新訊息未讀數
   - 顯示在底部導航的聊天 Tab

分離理由：
- 符合主流設計（Instagram、Facebook）
- 清楚區分「公開互動」vs「私人訊息」
- 不同的緊急程度和使用情境
```

### 建立揪團通知

```typescript
// 揪團留言時建立通知
export async function createPostComment(postId: string, content: string) {
  const currentUser = useAuthStore.getState().user;
  
  // 1. 儲存留言
  const { data: comment } = await supabase
    .from('post_comments')
    .insert({ post_id: postId, content })
    .select()
    .single();
  
  // 2. 取得揪團作者
  const { data: post } = await supabase
    .from('group_posts')
    .select('author_id')
    .eq('id', postId)
    .single();
  
  // 3. 建立通知（給揪團作者）
  if (post.author_id !== currentUser.id) {
    await supabase.from('notifications').insert({
      user_id: post.author_id,
      type: 'post_comment',
      actor_id: currentUser.id,
      related_id: comment.id,
      title: '揪團新留言',
      message: content.substring(0, 50),
      link: `/posts/${postId}`,
    });
  }
}
```

### Header 通知中心

```typescript
// 🔔 訂閱揪團通知（只訂閱 post_comment 和 comment_reply）
const notificationChannel = supabase
  .channel(`notifications-${user.id}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications',
    filter: `user_id=eq.${user.id}`,
  }, (payload) => {
    // 只處理揪團相關通知
    if (['post_comment', 'comment_reply'].includes(payload.new.type)) {
      setNotificationCount(prev => prev + 1);
    }
  })
  .subscribe();
```

### 聊天 Tab 未讀數

```typescript
// 💬 計算聊天未讀數（直接查詢 messages 表）
const { count: unreadCount } = await supabase
  .from('messages')
  .select('*', { count: 'exact' })
  .eq('receiver_id', user.id)
  .eq('read', false);

// 即時訂閱新訊息
const messageChannel = supabase
  .channel(`messages-${user.id}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `receiver_id=eq.${user.id}`,
  }, () => {
    setMessageCount(prev => prev + 1);
  })
  .subscribe();
```

### 通知類型定義

```typescript
// notifications 表的 type 欄位：
type NotificationType = 
  | 'post_comment'     // 揪團留言（顯示在 🔔）
  | 'comment_reply';   // 留言回覆（顯示在 🔔）

// 注意：'new_message' 不使用 notifications 表
// 訊息未讀直接從 messages 表計算
```

---

## PostGIS 距離查詢 ⭐ 新增

```typescript
// hooks/useNearbyUsers.ts
export function useNearbyUsers(distance = 3) {
  const [users, setUsers] = useState([]);
  
  const fetchNearby = async (lat: number, lng: number) => {
    const { data } = await supabase.rpc('nearby_users', {
      user_lat: lat,
      user_lng: lng,
      distance_km: distance,
    });
    setUsers(data);
  };
  
  // 取得使用者位置
  navigator.geolocation.getCurrentPosition((pos) => {
    fetchNearby(pos.coords.latitude, pos.coords.longitude);
  });
  
  return { users };
}
```

---

## 揪團篩選功能 ⭐ 新增

### 混合式設計

```
揪團列表頁設計：

Header: [揪團] [篩選] 🔔 [發佈]
           ↑
    點擊開啟進階篩選彈窗

快速篩選（橫向滾動標籤）：
[全部] [🏸 羽球] [💪 重訓] [🏃 跑步] ...
  ↑
選中狀態：藍色背景
```

### 快速篩選實作

```typescript
// 快速篩選（運動類型）
const [selectedSport, setSelectedSport] = useState<string | null>(null);

const quickFilters = [
  { id: null, label: '全部' },
  { id: 'badminton', label: '🏸 羽球' },
  { id: 'gym', label: '💪 重訓' },
  { id: 'running', label: '🏃 跑步' },
  // ...
];

// 查詢
const { data: posts } = await supabase
  .from('group_posts')
  .select('*')
  .eq('sport_type_id', selectedSport)  // 篩選運動類型
  .order('datetime', { ascending: true });
```

### 進階篩選彈窗

```typescript
// 進階篩選狀態
interface AdvancedFilter {
  sportTypes: string[];           // 運動類型（多選）
  timeRange: 'all' | 'today' | 'tomorrow' | 'week' | 'custom';
  area?: string;                  // 地點（選填）
}

// 彈窗 UI
<FilterModal>
  <FilterSection title="運動類型（多選）">
    <CheckboxGroup>
      <Checkbox value="badminton">🏸 羽球</Checkbox>
      <Checkbox value="gym">💪 重訓</Checkbox>
      {/* ... */}
    </CheckboxGroup>
  </FilterSection>
  
  <FilterSection title="時間">
    <RadioGroup>
      <Radio value="all">全部</Radio>
      <Radio value="today">今天</Radio>
      <Radio value="tomorrow">明天</Radio>
      <Radio value="week">本週</Radio>
    </RadioGroup>
  </FilterSection>
  
  <FilterSection title="地點（選填）">
    <Input placeholder="請輸入區域，如：大安區" />
  </FilterSection>
  
  <Actions>
    <Button variant="secondary">重置</Button>
    <Button>套用篩選</Button>
  </Actions>
</FilterModal>

// 查詢邏輯
const { data: posts } = await supabase
  .from('group_posts')
  .select('*')
  .in('sport_type_id', filters.sportTypes)
  .gte('datetime', startDate)
  .lte('datetime', endDate)
  .ilike('location_area', `%${filters.area}%`)
  .order('datetime', { ascending: true });
```

---

## 常用指令

### 開發環境

```bash
# 啟動開發伺服器
npm run dev

# 建置專案
npm run build

# 啟動生產環境
npm start

# TypeScript 型別檢查
npm run type-check

# Lint 檢查
npm run lint
```

### Supabase CLI（可選）

```bash
# 安裝 Supabase CLI
npm install -g supabase

# 登入
supabase login

# 連結專案
supabase link --project-ref your-project-ref

# 生成 TypeScript 型別
supabase gen types typescript --project-id your-project-id > types/database.types.ts

# 本地開發（Docker）
supabase start
supabase stop
```

### Git 工作流程

```bash
# 建立功能分支
git checkout -b feature/user-authentication

# 提交變更
git add .
git commit -m "feat: implement user authentication"

# 推送到遠端
git push origin feature/user-authentication

# 合併到主分支（本地）
git checkout main
git merge feature/user-authentication
git push origin main
```

---

## 問題排查

### 常見問題

#### 1. Supabase Auth 無法登入
```
錯誤：Invalid login credentials

解決：
- 檢查 email/password 是否正確
- 確認使用者已在 Supabase Dashboard 註冊
- 檢查 Supabase URL 和 Key 是否正確
```

#### 2. Google Places API 沒有反應
```
錯誤：API Key 無效或被限制

解決：
- 確認 API Key 已啟用 Places API
- 檢查 API Key 的網域限制設定
- 確認免費額度未用盡
```

#### 3. Realtime 訂閱沒有收到更新
```
錯誤：訂閱建立但沒有觸發 callback

解決：
- 確認 Supabase Realtime 已啟用
- 檢查 RLS 權限設定
- 確認 filter 條件正確
- 檢查 channel 名稱唯一性
```

#### 4. 圖片上傳失敗
```
錯誤：Failed to upload image

解決：
- 確認 Supabase Storage bucket 已建立
- 檢查 bucket 的 public/private 設定
- 確認檔案大小未超過限制（預設 50MB）
- 檢查 RLS 權限
```

### Debug 技巧

```typescript
// 1. 使用 console.log 追蹤資料
console.log('User data:', user);

// 2. 使用 React DevTools
// 安裝瀏覽器擴充功能，檢查 Component 狀態

// 3. 使用 Supabase Dashboard
// 直接在 Dashboard 查看資料庫資料

// 4. 使用 Network Tab
// 檢查 API 請求與回應
```

---

## 重要提醒

### ⚠️ 安全性

1. **永遠不要 commit .env.local**
   - 加入 `.gitignore`
   - 使用 `.env.example` 作為範本

2. **API Key 保護**
   - Google Maps API Key 設定網域限制
   - Supabase Anon Key 可以公開（有 RLS 保護）

3. **RLS 權限**
   - 所有敏感資料表都要啟用 RLS
   - 測試各種權限情境

### 📝 程式碼品質

1. **TypeScript**
   - 避免使用 `any`
   - 定義清楚的型別

2. **註解**
   - 複雜邏輯要加註解
   - 使用 JSDoc 說明函式

3. **錯誤處理**
   - 所有 API 呼叫都要 try-catch
   - 給使用者友善的錯誤訊息

### 🚀 效能優化

1. **圖片優化**
   - 使用 Next.js Image 元件
   - 設定適當的尺寸

2. **程式碼分割**
   - 使用 dynamic import
   - 避免一次載入所有程式碼

3. **資料快取**
   - 使用 React Query（可選）
   - 避免重複請求

---

## 參考資源

### 官方文件
- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Google Maps Platform](https://developers.google.com/maps)

### 推薦套件
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/) - 驗證
- [date-fns](https://date-fns.org/) - 日期處理
- [clsx](https://github.com/lukeed/clsx) - className 處理

---

## 更新紀錄

- **2026-02-15 v1.0**: 初版建立
  - 專案架構說明
  - 技術決策記錄
  - 開發規範定義
  - 資料庫 Schema
  - API 整合指引

- **2026-02-15 v1.1**: 技術決策確定 ⭐
  - 狀態管理：確定使用 Zustand
  - 探索功能：加入「附近的人」（PostGIS）
  - 通知系統：即時通知 + Email
  - 更新完整 Schema（含 notifications、PostGIS）
  - 新增 Zustand Stores 架構
  - 新增 Email 通知實作指引

- **2026-02-21 v1.2**: UI/UX 設計確定 ⭐⭐
  - 通知系統：確定分離式設計（揪團通知 vs 訊息未讀）
  - Header 設計：每個頁面都有 Header + 通知鈴鐺
  - 揪團篩選：混合式設計（快速篩選 + 進階篩選）
  - Landing Page：簡化策略（Phase 1 簡化，Phase 2 美化）
  - Supabase Region：確定使用 Tokyo（延遲最低）
  - 更新通知實作邏輯（分離訂閱）
  - 加入揪團篩選實作範例

---

**這份文件會持續更新，記錄所有重要的技術決策和解決方案** 📝
