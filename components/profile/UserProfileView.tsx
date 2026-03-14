'use client'

import type { UserBase } from '@/types/user'
import { RxAvatar } from 'react-icons/rx';
import { calculateAge } from '@/lib/utils';
import { IoLocationSharp } from "react-icons/io5";
import { MdSportsScore } from "react-icons/md";
import { MdSpeakerNotes } from "react-icons/md";

// 個人資料頁專用型別：在共用 UserBase 上加上生活照欄位（之後上傳功能用）
export interface UserProfileData extends UserBase {
  user_pics_url?: string[]
}

// 元件 Props（只有這個檔案用，不對外 export）
interface UserProfileViewProps {
  profile: UserProfileData
  isOwnProfile?: boolean
}

export default function UserProfileView({ profile, isOwnProfile }: UserProfileViewProps) {
  return (
    <div className="md:grid md:grid-cols-[300px_1fr] md:gap-6 space-y-2">
      {/* 左欄：頭像 + 按鈕 */}
      <div>
        {/* 頭貼 ＋ 暱稱 ＋ 年齡 卡牌 */}
        <div className='bg-bg-secondary rounded-2xl h-[300px] p-4 flex flex-col items-center gap-6 shadow'>
          {/* 頭貼：固定尺寸，避免在手機/平板因父層變寬而失控放大 */}
          <div className='size-45 rounded-2xl mt-5'>
            {profile.avatar_url
              ? <img alt='頭貼' src={profile.avatar_url} className="w-full h-full object-cover"/>
              : (
              <div className="w-full h-full flex items-center justify-center rounded-2xl bg-bg-tertiary">
                <RxAvatar size={80} className="text-text-secondary" />
              </div>
          )}
          </div>
          {/* 暱稱 ＋ 年齡 */}
          <div>
            {profile.nickname}, {calculateAge(profile.birthday)}
          </div>

        </div>
      </div>

      {/* 右欄：詳細資料 */}
      <div className='space-y-2 md:space-y-6'>
        {/* 常去的運動場所 */}
        <div className='bg-bg-secondary rounded-2xl p-6 shadow'>
          <div className='flex items-center gap-2'>
            <IoLocationSharp className='text-primary'/>
            <h3 className='font-semibold'>常去的運動場所</h3>
          </div>
          <div className='px-2 mt-2 text-text-secondary text-sm'>
            {profile.locations.map((loc)=>(
              <p key={loc}>📍 {loc}</p>
            ))}
          </div>
        </div>

        {/* 偏好運動 */}
        <div className='bg-bg-secondary rounded-2xl p-6 shadow'>
          <div className='flex items-center gap-2'>
            <MdSportsScore size={20} className='text-primary'/>
            <h3 className='font-semibold'>偏好運動</h3>
          </div>
          <div className='px-2 mt-2 text-text-secondary text-sm flex flex-wrap gap-1.5'>
            {profile.sport_types.map((s)=>(
              <span key={s}
                className="text-xs px-2 py-0.5 rounded-full bg-bg-tertiary text-text-secondary border border-border"
              >{s}</span>
            ))}
          </div>
        </div>

        {/* 自我介紹 */}
        <div className='bg-bg-secondary rounded-2xl p-6 shadow'>
          <div className='flex items-center gap-2'>
            <MdSpeakerNotes className='text-primary'/>
            <h3 className='font-semibold'>自我介紹</h3>
          </div>
          <div className='px-2 mt-2 text-text-secondary text-sm'>
            <p className='boarder border-b-text-primary'>
              {profile.bio
                ? profile.bio
                : "這個人什麼都沒留下..."
              }</p>
          </div>
        </div>

      </div>
    </div>
  )
}
