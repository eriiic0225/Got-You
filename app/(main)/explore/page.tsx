'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'next/navigation';
import { RxAvatar } from 'react-icons/rx';
import { calculateAge } from '@/lib/utils';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

// 從 public.users 取出的個人資料型別
type Profile = {
  nickname: string
  gender: 'male' | 'female' | 'nonBinary' | null
  birthday: string
  bio: string
  avatar_url: string | null
}

// 運動偏好（join sport_types 取得名稱）
// many-to-one 關聯（多筆偏好 → 一個運動類型），Supabase 回傳單一物件而非陣列
type SportPreference = {
  sport_types: { name: string }
}

// 常去地點（join gym_locations 取得名稱）
type UserLocation = {
  gym_locations: { name: string }
}

// 用來把對應的gender轉換為文字
const genderLabel = { male: '男性', female: '女性', nonBinary: '非二元' }

export default function ExplorePage() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const router = useRouter()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [sports, setSports] = useState<string[]>([])
  const [locations, setLocations] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    async function fetchProfile() {
      // 同時發出三個請求，節省時間
      const [profileRes, sportsRes, locationsRes] = await Promise.all([
        supabase
          .from('users')
          .select('nickname, gender, birthday, bio, avatar_url')
          .eq('id', user!.id)
          .single(),
        supabase
          .from('user_sport_preferences')
          .select('sport_types(name)')
          .eq('user_id', user!.id),
        supabase
          .from('user_gym_locations')
          .select('gym_locations(name)')
          .eq('user_id', user!.id)
      ])

      if (profileRes.data) setProfile(profileRes.data)
      // 把 join 的巢狀結構攤平成純字串陣列
      // sport_types & locations 是陣列，取 [0] 拿到該筆的名稱，filter 過濾掉萬一是 undefined 的情況
      if (sportsRes.data) {
        // as unknown as 是 TS 強制轉型的慣用寫法：先轉成 unknown 再轉成目標型別
        // 因為 Supabase 推斷型別和我們手寫的型別有落差，但我們確定資料結構是對的
        setSports((sportsRes.data as unknown as SportPreference[]).map(s => s.sport_types.name))
      }
      if (locationsRes.data) {
        setLocations((locationsRes.data as unknown as UserLocation[]).map(l => l.gym_locations.name))
      }
      setIsLoading(false)
    }

    fetchProfile()
  }, [user])

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 bg-bg-primary text-center">
      <div className="w-full max-w-sm space-y-4">

        <h1 className="text-text-primary font-semibold text-lg">探索</h1>

        {/* 個人資料卡片 */}
        {profile && (
          <div className="bg-bg-secondary rounded-2xl overflow-hidden">
            {/* 頭貼 */}
            <div className="relative h-64 w-full bg-bg-tertiary">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="頭貼"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <RxAvatar size={80} className="text-text-secondary" />
                </div>
              )}
            </div>

            {/* 資料區 */}
            <div className="p-4 space-y-3">
              {/* 名稱 + 年齡 + 性別 */}
              <div>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-text-primary font-bold text-xl">{profile.nickname}</h2>
                  {profile.birthday && (
                    <span className="text-text-secondary text-sm">{calculateAge(profile.birthday)} 歲</span>
                  )}
                  {profile.gender && (
                    <span className="text-text-secondary text-sm">{genderLabel[profile.gender]}</span>
                  )}
                </div>
              </div>

              {/* 自我介紹 */}
              {profile.bio && (
                <p className="text-text-secondary text-sm text-left leading-relaxed">{profile.bio}</p>
              )}

              {/* 運動偏好 */}
              {sports.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {sports.map(sport => (
                    <span
                      key={sport}
                      className="text-xs px-2.5 py-1 rounded-full bg-bg-tertiary text-text-secondary border border-border"
                    >
                      {sport}
                    </span>
                  ))}
                </div>
              )}

              {/* 常去地點 */}
              {locations.length > 0 && (
                <div className="text-left space-y-1 pt-1">
                  <p className="text-text-secondary text-xs">常去地點</p>
                  {locations.map(loc => (
                    <p key={loc} className="text-text-primary text-sm">📍 {loc}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <p className="text-text-secondary">這是探索頁面</p>
        <p className="text-text-secondary text-sm">（目前暫時顯示用戶填寫的資料，後面會開發完整功能）</p>
        {/* 登出按鈕 */}
        <button
          onClick={handleLogout}
          className="w-full py-2 rounded-md border border-border text-text-secondary text-sm hover:bg-bg-secondary transition"
        >
          登出
        </button>
      </div>
    </div>
  )
}
