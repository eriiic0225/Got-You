'use client'

import SkeletonProfile from "@/components/profile/SkeletonProfile"
import UserProfileView from "@/components/profile/UserProfileView"
import { useUserStore } from "@/stores/useUserStore"


export default function ProfileMePage(){

  const profile = useUserStore(state => state.profile)
  
  if (!profile) return (
      <div className="max-w-[1000px] mx-auto py-5 px-5">
        <SkeletonProfile/>
      </div>
    )

  // profile 在上方已確認不是 null，不需要 ?.
  // ?? -> 處理 UserProfile 中可能是 null 的欄位，確保符合 UserProfileData 的型別要求
  const profileInfo = {
    id: profile.id ?? '',
    nickname: profile.nickname ?? '',
    gender: profile.gender,
    birthday: profile.birthday ?? '',
    bio: profile.bio ?? '',
    avatar_url: profile.avatar_url,
    longitude: profile.longitude,
    latitude: profile.latitude,
    sport_types: (profile.sport_preferences ?? []).map(s => s.name),
    locations: (profile.gym_locations ?? []).map(l => l.name),
  }

  return (
    <div className="max-w-[1000px] mx-auto py-5 px-5">
      <UserProfileView profile={profileInfo} isOwnProfile={true}/>
    </div>
  )

}