// types/chat.ts
// 聊天功能相關的 TypeScript 型別定義
// 這裡的型別分兩類：
//   1. 對應 DB 資料表欄位的「資料型別」（Message）
//   2. 前端組合顯示用的「UI 型別」（ConversationPartner、Conversation）

// ============================================================
// 1. Message — 對應 messages 資料表的一筆(row)資料
// ============================================================
// 使用方式：
//   - Supabase 查詢回傳值的型別標注
//   - Realtime 訂閱的泛型參數：channel.on<Message>(...)
//     傳入後，payload.new / payload.old 就會是 Message 型別

export interface Message {
  id: string           // UUID，訊息唯一識別碼
  sender_id: string    // UUID，寄件人（關聯 users.id）
  receiver_id: string  // UUID，收件人（關聯 users.id）
  content: string | null    // 文字內容；純圖片訊息時為 null
  image_url: string | null  // 圖片網址；純文字訊息時為 null
  is_read: boolean     // 已讀狀態，收件人讀取後改為 true
  created_at: string   // ISO 8601 時間字串，如 "2026-03-16T12:00:00.000Z"
                       // Supabase 回傳的 timestamp 在 JS 端是 string，需要時再用 new Date() 轉換
}

// ============================================================
// 2. ConversationPartner — 對話對象的基本資料
// ============================================================
// 這個型別不對應任何單一資料表，是從 users 表 join 過來的部分欄位。
// 放在這裡的目的：讓 ChatList 和 ChatWindow 都能描述「對方是誰」。

export interface ConversationPartner {
  id: string                  // UUID，對方的 user id
  nickname: string            // 對方的暱稱，顯示在對話列表和聊天標題列
  avatar_url: string | null   // 對方的頭像網址；null 時顯示預設頭像
}

// ============================================================
// 3. Conversation — 聊天列表中的一個對話項目
// ============================================================
// 這個型別不直接存在 DB，是前端從 messages 表聚合計算出來的結果：
//   - 找出「我參與的所有對話」（以對方為單位）
//   - 每個對話取「最後一則訊息」作為預覽
//   - 計算「我還沒讀的訊息數」
// 用於渲染 ChatList 中的每一列對話項目。

export interface Conversation {
  partner: ConversationPartner  // 對話對象的基本資料
  last_message: Message         // 最後一則訊息（用於列表預覽和排序）
  unread_count: number          // 對方傳給我、我還沒讀的訊息數
                                // = SELECT COUNT(*) WHERE receiver_id = 我 AND sender_id = 對方 AND is_read = false
}
