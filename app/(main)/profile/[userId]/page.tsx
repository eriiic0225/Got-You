'use client'

import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import UserProfileView, { UserProfileData } from '@/components/profile/UserProfileView'
import { supabase } from "@/lib/supabase/client"
import { useUserStore } from "@/stores/useUserStore"

function UserProfilePage(){
  
  const { userId } = useParams<{ userId: string }>() // 在這邊取的 url 中的userId
  const router = useRouter()
  const profile = useUserStore(state=>state.profile)
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfileData | null>(null)


  useEffect(()=>{
    
    if (!profile || !userId) return

    if (profile.id === userId){
      router.push('/profile/me')
    }

    async function fetchUserProfile(){
      const { data, error } = await supabase
        .from('users')
        .select(`id, nickname, gender, birthday, bio, avatar_url, longitude, latitude, 
          user_sport_preferences(sport_types ( id, name )), 
          user_gym_locations(gym_locations ( place_id:google_place_id, name ))`)
        .eq('id', userId)
        .single()

      if (data) { 
        const userProfile = {
          id: data.id,
          nickname: data.nickname,
          gender: data.gender,
          birthday: data.birthday,
          bio: data.bio,
          avatar_url: data.avatar_url,
          longitude: data.longitude,
          latitude: data.latitude,
          sport_types: data.user_sport_preferences
            .flatMap(s => s.sport_types)     // 展平（處理陣列型別）
            .filter(Boolean)                  // 過濾掉 null/undefined/空陣列or字串/0 -> Boolean是js的內建物件/函式
            .map((s: { name: string }) => s.name),  // 取名稱

          locations: data.user_gym_locations
            .flatMap(l => l.gym_locations)
            .filter(Boolean)
            .map((l: { name: string }) => l.name)
        }
        setCurrentUserProfile(userProfile)
      }
    }
    fetchUserProfile()
  },[profile, router, userId])
  

  // currentUserProfile 還是 null 代表資料尚未載入完成
  if (!currentUserProfile) return <div>載入中...</div>

  return (
    <div className="max-w-[1000px] mx-auto py-5 px-5">
      <UserProfileView profile={currentUserProfile} />
    </div>
)
}

export default UserProfilePage