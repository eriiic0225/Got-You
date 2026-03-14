// 使用者相關的共用型別定義
// 各頁面元件可以從這裡 extend，加上自己需要的欄位

// 所有使用者資料頁面共用的基礎欄位
export interface UserBase {
  id: string
  avatar_url: string | null
  nickname: string
  birthday: string
  gender: 'male' | 'female' | 'nonBinary' | null
  bio: string
  latitude: number | null
  longitude: number | null
  sport_types: string[]   // 運動偏好名稱列表，e.g. ['重訓', '游泳']
  locations: string[]     // 常去地點名稱列表，e.g. ['World Gym 信義']
}
