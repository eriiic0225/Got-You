'use client'

// 個人資料編輯頁面：讓使用者修改基本資料、頭貼、生活照
// 版面和 /profile/me 相同（左欄 + 右欄），內容換成可編輯的表單

import { APIProvider } from '@vis.gl/react-google-maps'
import SkeletonProfile from '@/components/profile/SkeletonProfile'
import EditAvatarSection from '@/components/profile/EditAvatarSection'
import EditBasicInfoForm from '@/components/profile/EditBasicInfoForm'
import EditPhotosSection from '@/components/profile/EditPhotosSection'
import EditSportTypesSection from '@/components/profile/EditSportTypesSection'
import EditGymLocationsSection from '@/components/profile/EditGymLocationsSection'
import { useUserStore } from '@/stores/useUserStore'
import BacktoProfileMeBtn from '@/components/explore/BacktoProfileMeBtn'


export default function EditProfilePage() {
  const profile = useUserStore(state => state.profile)

  // profile 尚未從 Zustand 載入時顯示 skeleton
  if (!profile) return (
    <div className="max-w-[1000px] mx-auto py-5 px-5">
      <SkeletonProfile />
    </div>
  )

  return (
    <div className="max-w-[1000px] mx-auto py-5 px-5">
      <div className="md:grid md:grid-cols-[300px_1fr] md:gap-6">

        {/* 左欄：頭貼編輯 */}
        <div className="mb-4 md:mb-0 ">
          <EditAvatarSection
            currentAvatarUrl={profile.avatar_url}
            userId={profile.id!}
          />
          <BacktoProfileMeBtn screenSize={"big"}/>
        </div>

        {/* 右欄：基本資料表單 + 運動偏好 ＋ 地點 ＋ 生活照 */}
        <div className="space-y-4">

          <EditBasicInfoForm profile={profile} />

          <EditSportTypesSection profile={profile} />

          <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!} libraries={['places']}>
            <EditGymLocationsSection profile={profile} />
          </APIProvider>

          <EditPhotosSection userId={profile.id!} />

          {/* 回到個人頁按鈕 */}
          <BacktoProfileMeBtn screenSize={"small"}/>

        </div>

      </div>
    </div>
  )
}
