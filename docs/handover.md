# Got You 咖揪 — Handover Note

**日期**：2026-03-16 | **Branch**：`develop`（已同步 `main` + push GitHub）

---

## 專案狀態

運動揪團平台，Next.js 16 Turbopack + Supabase + Zustand + Tailwind v4。
Phase 1 核心功能進行到一半，目前完成度約 60%。

---

## 已完成

| 功能 | 說明 |
|------|------|
| Landing Page | 簡化版 |
| 會員系統 | Email + Google OAuth，middleware 路由保護 |
| Onboarding | Step1-3，寫入 users / user_sport_preferences / user_gym_locations |
| Explore | RPC `get_recommended_users`，共同地點＋附近的人 Tab，篩選器，PostGIS 距離 |
| Profile | `/me`、`/[userId]`、`/me/edit`（頭貼、基本資料、運動偏好、常去地點、生活照）|

---

## 待開發（優先順序）

1. **聊天**（`/chats` + `/chats/[userId]`）— Supabase Realtime 一對一
2. **揪團**（`/posts`）— 發佈、列表、詳情、留言
3. **通知**（Header 🔔 揪團通知 + 聊天 Tab 💬 未讀紅點）

---

## /chats 佈局規劃（已討論，尚未實作）

### 概念
類 iMessage / Messenger 雙欄佈局：左側對話列表 + 右側聊天視窗。

### RWD 策略

**桌機（md 以上）**：雙欄並排
```
┌─────────────────────────────────────────┐
│  [左欄 300px]        [右欄 flex-1]      │
│  對話列表             聊天訊息視窗       │
│  - 用戶 A             (選中對話)        │
│  - 用戶 B                               │
│  - 用戶 C             輸入框            │
└─────────────────────────────────────────┘
```

**手機**：單欄，路由切換畫面
- `/chats` → 只顯示對話列表
- `/chats/[userId]` → 只顯示聊天視窗（全螢幕，隱藏列表）

### Next.js App Router 實作方式

利用 `layout.tsx` + `children` 的巢狀結構：

```
app/(main)/chats/
├── layout.tsx          # 雙欄容器：左側列表 + children（右側）
├── page.tsx            # /chats 本身（手機：列表全螢幕；桌機：右側顯示佔位提示）
└── [userId]/
    └── page.tsx        # 聊天視窗
```

```tsx
// layout.tsx 核心概念
export default function ChatsLayout({ children }) {
  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* 左側列表：手機只在 /chats 顯示，桌機永遠顯示 */}
      <aside className="w-full md:w-[300px] md:block border-r border-border">
        <ChatList />
      </aside>

      {/* 右側：手機只在 /chats/[userId] 顯示，桌機永遠顯示 */}
      <main className="hidden md:flex flex-1 flex-col">
        {children}
      </main>
    </div>
  )
}
```

手機版的顯示/隱藏靠 URL 判斷（`usePathname()`）：
- pathname === '/chats' → 左側全寬，右側隱藏
- pathname 包含 '/chats/' → 左側隱藏，右側全寬

### 資料表
- `messages`：sender_id、receiver_id、content、is_read、created_at
- `conversation_visibility`：單向刪除（對話從某一方隱藏）
- 未讀數：直接查 `messages` 表（`is_read = false AND receiver_id = 我`），**不使用** notifications 表

### Supabase Realtime
訂閱 `messages` 表，filter by `receiver_id = 我`，收到新訊息即時更新 UI。

---

## 必知地雷

**DB Schema 陷阱**
- `user_gym_locations.location_id` 是 `text`，FK 指向 `gym_locations.google_place_id`，**不是** `gym_locations.id`（uuid）。RPC JOIN 寫錯會出現 `uuid = text` 型別錯誤。

**Production Build**
- Supabase `.rpc()` 回傳型別是 `unknown`，`.map()` 的 callback 參數必須明確標型別，否則 `noImplicitAny` 在 production build 報錯（dev 的 Turbopack 不會）。

**`fetchUser()` 時序**
- 必須在 Supabase 操作成功後才呼叫。不能放在非 async 函式末尾，否則 DB 還沒寫完就 fetch，拿回舊資料。

**Radix UI `data-[state=open]`**
- 只在 Radix 元件本身有效。**子元素**要靠父層加 `group`，子層用 `group-data-[state=open]`。

---

## 關鍵檔案

```
stores/useUserStore.ts          # 登入用戶 profile（跨頁共用）
stores/useExploreStore.ts       # 探索頁篩選器狀態
hooks/useExploreUsers.ts        # RPC 查詢 custom hook
types/user.ts                   # UserBase（profile 頁共用型別）
components/profile/             # 所有 profile 相關元件
app/(main)/profile/             # profile 頁面
app/globals.css                 # Accordion 動畫 keyframes 在這裡定義
docs/schema.sql                 # 完整 DB schema（注意實際型別與文件差異）
```

---

## 開發規範

- 所有程式碼要有**詳細中文註解**（學習階段專案）
- 版面 max-w：`max-w-[1000px] mx-auto px-5`（實際排版效果決定是否改 1200px）
- 條件樣式用 `cn()`
- Supabase 操作要給使用者友善的中文錯誤訊息
