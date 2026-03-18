# Got You 咖揪 - Claude 開發指南

> 最後更新：2026-03-18 | 作者：Eric（聊天功能完成）

> ⚠️ **給 Claude/Codex 的重要說明**：這份文件是早期規劃時建立的，部分內容可能已過時。
> 若使用者的要求與文件有衝突，**請先向使用者確認**，確認後以使用者說的版本為準，並更新此文件。

---

## 專案概述

- **名稱**：Got You 咖揪
- **類型**：運動揪團平台 Web App
- **技術**：Next.js 15 + TypeScript + Supabase + Zustand
- **期限**：6 週 | **目標**：前端工程師求職作品集

### 核心功能

1. **會員系統**：註冊、登入、個人資料管理
2. **探索功能**：共同地點 Tab + 附近的人 Tab（PostGIS）
3. **揪團功能**：發佈、列表、詳情、留言、快速/進階篩選
4. **聊天功能**：一對一即時聊天（Supabase Realtime）
5. **通知系統**：Header 揪團通知 🔔 + 聊天 Tab 未讀紅點 💬

### 開發優先級

**Phase 1（Week 1-5）核心功能：**

- ✅ Landing Page（簡化版）
- ✅ 會員系統（Email + Google OAuth）
- ✅ Onboarding（Step1 個人資料、Step2 運動偏好、Step3 常去地點＋IP/GPS定位）
- ✅ 探索（RPC 串接完成、共同地點＋附近的人 Tab、加權評分、篩選器、SkeletonCard、GPS 定位）
- ✅ /profile/me（個人資料頁，含生活照區塊）
- ✅ /profile/[userId]（他人公開頁）
- ✅ /profile/me/edit（編輯頭貼、基本資料、運動偏好、常去地點、生活照）
- ✅ 聊天（一對一即時聊天、未讀紅點、Skeleton loading）
- ⬜ 揪團
- ⬜ 通知系統（Header 🔔）

**Phase 2（Week 6）加分功能：**

- Email 通知（Edge Functions + Resend）
- 打卡系統、活躍徽章
- Landing Page 美化
- 搜尋地點（在 Explore 頁搜尋特定地點的使用者）
- 搜尋會員（依暱稱等條件搜尋）
- 聊天圖片傳送

---

## 技術棧

| 類別      | 技術                     | 理由                                         |
| --------- | ------------------------ | -------------------------------------------- |
| Framework | Next.js 15 App Router    | 業界主流                                     |
| 語言      | TypeScript               | 型別安全                                     |
| 樣式      | Tailwind CSS v4          | utility-first                                |
| 表單      | React Hook Form + Zod v4 | 效能好、易用                                 |
| 狀態管理  | Zustand                  | 簡單、不需要 Provider                        |
| 後端      | Supabase                 | PostgreSQL + Auth + Realtime + Storage + RLS |
| 地圖      | Google Places API        | 最準確的地點資料                             |
| 部署      | Vercel                   | Next.js 最佳部署平台                         |

**Supabase Region**：Northeast Asia (Tokyo)（~40-50ms 從台灣）

---

## 專案結構

```
got-you/
├── app/
│   ├── (auth)/           # 認證頁面群組（login, signup）
│   ├── (main)/           # 登入後主要頁面群組（含底部導航 layout）
│   │   ├── explore/      # 探索頁
│   │   ├── posts/        # 揪團頁（含 create, [postId]）
│   │   ├── chats/        # 聊天頁（含 [userId]）
│   │   └── profile/      # 個人頁（含 me, edit）
│   ├── auth/callback/    # OAuth 回調
│   ├── onboarding/       # 新用戶引導（填寫個人資料）
│   ├── page.tsx          # Landing Page
│   └── layout.tsx        # Root Layout（含 AuthInitializer）
├── components/
│   ├── ui/               # 基礎元件（Button, Input, Card...）
│   ├── shared/           # 共用元件（Header, BottomNav, AuthInitializer）
│   ├── explore/          # 探索頁專用
│   ├── posts/            # 揪團頁專用
│   ├── chat/             # 聊天頁專用
│   └── profile/          # 個人頁專用
├── stores/               # Zustand stores
│   ├── useAuthStore.ts
│   ├── useUserStore.ts   # 當前登入用戶的完整 profile（含運動偏好、常去地點）
│   ├── useExploreStore.ts
│   ├── useChatStore.ts   # totalUnread + Realtime 同步
│   ├── useNotificationStore.ts
│   └── useUIStore.ts
├── lib/supabase/
│   ├── client.ts         # Supabase Client（singleton）
│   └── server.ts         # Server Component 用
├── hooks/
│   └── useExploreUsers.ts  # 探索頁 RPC 查詢（get_recommended_users）
├── types/                # TypeScript 型別定義
│   ├── user.ts           # UserBase
│   └── chat.ts           # Message, ConversationPartner, Conversation
└── middleware.ts          # 路由保護
```

**命名規範**：元件 PascalCase、工具函式 camelCase、頁面 page.tsx/layout.tsx、常數 SCREAMING_SNAKE_CASE

---

## 開發規範

### ⭐ 學習階段：詳細註解

此專案處於學習階段，所有程式碼需包含詳細解說：

- **說明「做什麼」、「為什麼」、「和其他部分的關係」**
- **複雜流程**：用步驟序號拆解
- **TypeScript 型別**：說明每個欄位的意義
- **檔案開頭**：一行說明此檔案的作用

### Component 結構

```tsx
'use client' // 若需要 hooks 或事件處理

// 1. 型別定義
interface Props { ... }

// 2. 元件（使用具名函式，方便 debug）
export default function ComponentName({ ... }: Props) {
  // 3. Hooks
  // 4. 處理函式
  // 5. Return JSX
}
```

### Tailwind 原則

- 優先 utility classes，重複樣式抽成元件
- 條件樣式用 `cn()`（來自 `clsx` 或 `tailwind-merge`）
- 避免過長 className（考慮拆元件）

### 錯誤處理

所有 Supabase API 呼叫都要 try-catch，給使用者友善的中文錯誤訊息。

---

## 設計系統（Tailwind v4 自訂色彩）

在 `globals.css` 的 `@theme` 中定義：

- `primary`：#C4DC4A（主色，黃綠）
- `primary-hover`：#B8CF3F
- `bg-primary`：#1A1D29（主背景）
- `bg-secondary`：#252A38
- `bg-tertiary`：#2F3545
- `text-primary`：#FFFFFF
- `text-secondary`：#9CA3AF
- `accent`：#4ADE80（強調色）
- `border`：#3A3F4E

---

## 資料庫資料表

| 資料表                    | 說明                                      |
| ------------------------- | ----------------------------------------- |
| `users`                   | 使用者（含地理位置欄位）                  |
| `sport_types`             | 運動類型（預設資料）                      |
| `user_sport_preferences`  | 使用者運動偏好（多對多）                  |
| `gym_locations`           | 地點（健身房、運動場）                    |
| `user_gym_locations`      | 使用者常去地點（多對多）                  |
| `user_photos`             | 使用者生活照 URL（Storage: user-photos bucket） |
| `group_posts`             | 揪團貼文                                  |
| `post_comments`           | 留言                                      |
| `messages`                | 聊天訊息（sender_id, receiver_id, content, image_url, is_read） |
| `conversation_visibility` | 對話隱藏狀態（單向刪除）                  |
| `blocked_users`           | 封鎖名單                                  |
| `notifications`           | 通知（type: post_comment, comment_reply） |

> 完整 SQL Schema 見 `docs/schema.sql`

### ⚠️ 實際 Schema 與 schema.sql 差異（重要）

| 欄位 | schema.sql 記載 | 實際 DB 型別 |
| ---- | --------------- | ------------ |
| `users.birthday` | `text` | `text`（非 DATE，RPC 內需 `birthday::DATE` 轉型） |
| `user_gym_locations.location_id` | `text` | `text`（FK 指向 `gym_locations.google_place_id`，**非** `gym_locations.id`） |
| `gym_locations.id` | `uuid` | `uuid` |

**影響**：`get_recommended_users` RPC 的 gym_locations JOIN 必須用 `gl.google_place_id = ugl.location_id`，不能用 `gl.id = ugl.location_id`（會 `uuid = text` 錯誤）。

---

## 探索頁設計決策

### 篩選器（FilterContent）

篩選條件依 Tab 分開，避免邏輯衝突：

| 篩選項 | 共同地點 Tab | 附近的人 Tab |
| ------ | ------------ | ------------ |
| 偏好運動 | ✅ | ✅ |
| 性別 | ✅ | ✅ |
| 年齡 | ✅ | ✅ |
| 距離 | ❌（沒意義） | ✅ |
| 地點 | ❌（Tab 本身就是地點篩選） | ❌ |

### RPC：`get_recommended_users`

Supabase PostgreSQL 函式，負責探索頁的用戶推薦與篩選。

**加權評分**（`score` 欄位）：
- 共同常去地點：每個 ×5
- 共同運動偏好：每個 ×3
- 年齡相差 5 歲以內：+2
- 相同性別：+1

---

## 聊天功能架構

- **useChatStore**：只存 `totalUnread`，Realtime 訂閱在 `AuthInitializer` 啟動
- **ChatList**：前端用 `reduce()` 聚合對話列表，Realtime 訂閱（INSERT/UPDATE）收發訊息即時更新
- **ChatWindow**：4 個 useEffect（fetchPartner、fetchMessages、markAsRead、Realtime）
- **自己發的訊息**：Realtime 只訂閱 `receiver_id`，自己發送用樂觀更新（optimistic update）
- **MobileBottomNav**：`/chats/[userId]` 時回傳 null，隱藏 BottomNav + spacer
- **雙欄 layout**：`chats/layout.tsx` 用 `usePathname()` 判斷路由，控制手機端顯示/隱藏

---

## 通知系統設計

- **Header 🔔**：揪團留言（post_comment）、留言回覆（comment_reply）→ 寫入 `notifications` 表
- **聊天 Tab 💬**：直接查 `messages` 表的未讀數，**不使用** `notifications` 表

---

## 常用指令

```bash
npm run dev        # 開發伺服器
npm run build      # 建置
npm run lint       # Lint 檢查
```

---

## 重要提醒

- **絕對不要 commit `.env.local`**
- Supabase Anon Key 可公開（有 RLS 保護）
- Google Maps API Key 需設定網域限制
- 所有敏感資料表都要啟用 RLS
- Production build TypeScript 比開發環境嚴格（Supabase RPC 回傳 unknown，`.map()` 需明確標型別）
