'use client'

import { useEffect, useState } from 'react';
import type { UserBase } from '@/types/user'
import { RxAvatar } from 'react-icons/rx';
import { calculateAge } from '@/lib/utils';
import { IoLocationSharp } from "react-icons/io5";
import { MdSportsScore } from "react-icons/md";
import { MdSpeakerNotes } from "react-icons/md";
import { MdPhotoLibrary } from "react-icons/md";
import { useRouter } from "next/navigation"
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

// 個人資料頁專用型別：沿用 UserBase（生活照在元件內部 fetch，不透過 prop 傳入）
export interface UserProfileData extends UserBase {}

// 元件 Props（只有這個檔案用，不對外 export）
interface UserProfileViewProps {
  profile: UserProfileData
  isOwnProfile?: boolean
}

// 性別代碼轉中文
const genderLabel = { male: '男', female: '女', nonBinary: '非二元' }

export default function UserProfileView({ profile, isOwnProfile }: UserProfileViewProps) {

  const router = useRouter()
  const [photos, setPhotos] = useState<string[]>([])

  // 根據 profile.id 從 user_photos 表撈取生活照 URL
  useEffect(() => {
    async function fetchPhotos() {
      const { data } = await supabase
        .from('user_photos')
        .select('photo_url')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: true })

      if (data) setPhotos(data.map(p => p.photo_url))
    }
    fetchPhotos()
  }, [profile.id])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="md:grid md:grid-cols-[300px_1fr] md:gap-6">

      {/* 左欄：頭像卡牌 + 按鈕 */}
      <div className='mb-4 md:mb-0'>
        <div className='bg-bg-secondary rounded-2xl overflow-hidden shadow'>

          {/* Cover 漸層背景 */}
          <div className='h-30 bg-gradient-to-br from-bg-tertiary to-primary/20' />

          {/* 頭貼 + 基本資料：-mt-16 讓頭貼跨越 cover 邊界，製造層疊感 */}
          <div className='flex flex-col items-center px-4 pb-5 -mt-20 gap-2'>
            {/* ring-4 ring-bg-secondary 製造頭貼浮起的視覺效果 */}
            <div className='size-44 rounded-xl ring-4 bg-bg-tertiary ring-bg-secondary overflow-hidden'>
              {profile.avatar_url
                ? <img alt='頭貼' src={profile.avatar_url} className="w-full h-full object-cover" />
                : (
                  <div className="w-full h-full flex items-center justify-center bg-bg-tertiary">
                    <RxAvatar size={72} className="text-text-secondary" />
                  </div>
                )}
            </div>

            {/* 暱稱 + 年齡 */}
            <p className='font-bold text-lg text-text-primary mt-1'>
              {profile.nickname}, {calculateAge(profile.birthday)}
            </p>

            {/* 性別*/}
            <p className='text-text-secondary text-xs'>{genderLabel[profile.gender!]}</p>

            {/* bio 摘要，最多兩行，引導使用者往下看完整自我介紹 */}
            {profile.bio && (
              <p className='text-text-secondary text-xs text-center line-clamp-2 px-2'>
                {profile.bio}
              </p>
            )}
          </div>

          {/* 按鈕區，用上方分隔線隔開 */}
          <div className='border-t border-border px-4 py-3 flex flex-col gap-2'>
            {isOwnProfile ? (
              <>
                {/* 自己的頁面：編輯資料 + 登出 */}
                <Link
                  href='/profile/me/edit'
                  className='w-full text-center py-2 rounded-lg bg-primary text-bg-primary font-semibold text-sm hover:bg-primary-hover transition'
                >
                  編輯資料
                </Link>
                <button 
                  onClick={handleSignOut}
                  className='w-full text-center py-2 rounded-lg text-text-secondary text-sm hover:text-text-primary transition'>
                  登出
                </button>
              </>
            ) : (
              /* 別人的頁面：發訊息 → 進入聊天室 */
              <Link
                href={`/chats/${profile.id}`}
                className='w-full text-center py-2 rounded-lg bg-primary text-bg-primary font-semibold text-sm hover:bg-primary-hover transition'
              >
                發訊息
              </Link>
            )}
          </div>

        </div>
      </div>

      {/* 右欄：詳細資料區塊 */}
      <div className='space-y-4'>

        {/* 常去的運動場所 */}
        <div className='bg-bg-secondary rounded-2xl p-6 shadow'>
          <div className='flex items-center gap-2 mb-3'>
            <IoLocationSharp className='text-primary' />
            <h3 className='font-semibold'>常去的運動場所</h3>
          </div>
          <ul className='space-y-1.5'>
            {profile.locations.map((loc) => (
              <li key={loc} className='text-sm text-text-secondary'>
                📍 {loc}
              </li>
            ))}
          </ul>
        </div>

        {/* 偏好運動 */}
        <div className='bg-bg-secondary rounded-2xl p-6 shadow'>
          <div className='flex items-center gap-2 mb-3'>
            <MdSportsScore size={20} className='text-primary' />
            <h3 className='font-semibold'>偏好運動</h3>
          </div>
          <div className='flex flex-wrap gap-1.5'>
            {profile.sport_types.map((s) => (
              <span
                key={s}
                className="text-xs px-2.5 py-1 rounded-full bg-bg-tertiary text-text-secondary border border-border"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* 自我介紹 */}
        <div className='bg-bg-secondary rounded-2xl p-6 shadow'>
          <div className='flex items-center gap-2 mb-3'>
            <MdSpeakerNotes className='text-primary' />
            <h3 className='font-semibold'>自我介紹</h3>
          </div>
          <p className='text-text-secondary text-sm leading-relaxed whitespace-pre-wrap'>
            {profile.bio || "這個人什麼都沒留下..."}
          </p>
        </div>

        {/* 生活照 */}
        <div className='bg-bg-secondary rounded-2xl p-6 shadow'>
          <div className='flex items-center gap-2 mb-3'>
            <MdPhotoLibrary className='text-primary' />
            <h3 className='font-semibold'>其他照片</h3>
          </div>
          {photos.length > 0 ? (
            <div className='grid grid-cols-3 gap-2'>
              {photos.map((url) => (
                <div key={url} className='aspect-square rounded-xl overflow-hidden'>
                  <img src={url} alt='生活照' className='w-full h-full object-cover' />
                </div>
              ))}
            </div>
          ) : (
            <p className='text-text-secondary text-sm'>這個人很神秘🕵️‍♂️，沒有上傳更多照片</p>
          )}
        </div>

      </div>
    </div>
  )
}
