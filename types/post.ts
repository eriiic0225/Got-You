
// 對應 group_posts 資料表的一筆資料（原始欄位）
export interface GroupPost {
  id: string
  author_id: string
  sport_type_id: string
  title: string
  location_area: string | null
  location_detail: string | null
  datetime: string | null
  description: string
  max_participants: number | null
  created_at: string
}

export type UserPreviewInfo = {
  id: string
  nickname: string
  avatar_url: string | null
}

// 查詢列表/詳情時 join 過來的完整資料（含作者暱稱、頭像、運動類型名稱）
export interface PostWithDetails {
  id: string
  author: UserPreviewInfo
  sport: { id: string, name: string, icon: string}
  title: string
  description: string
  location_area: string | null
  location_detail: string | null
  datetime: string | null
  participants_count: number
  comment_count: number
  max_participants: number | null
  created_at: string
}

// 對應 post_comments 資料表
export interface PostComment {
  id: string
  post_id: string
  user_id: string
  parent_id?: string | null
  content: string
  created_at: string
}

// 留言區顯示用(加入用user_id join回來的顯示用資料)
export interface PostCommentWithAuthor extends PostComment {
  author: UserPreviewInfo
}


// 對應 post_participants 資料表
export interface PostParticipant {
  post_id: string
  user_id: string
  created_at: string
}