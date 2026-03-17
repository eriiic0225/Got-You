'use client'

// 頭貼編輯區塊：選取新圖片預覽 → 點「儲存頭貼」才上傳
// 復用 onboarding 的 avatars bucket，路徑 {userId}/avatar.jpg（upsert 覆蓋）

import { useState } from 'react'
import { RxAvatar } from 'react-icons/rx'
import { MdOutlinePhotoCamera } from 'react-icons/md'
import { supabase } from '@/lib/supabase/client'
import { useUserStore } from '@/stores/useUserStore'
import useImage from '@/hooks/useImage'

interface EditAvatarSectionProps {
  currentAvatarUrl: string | null  // 目前的頭貼 URL（來自 Zustand store）
  userId: string
}

export default function EditAvatarSection({ currentAvatarUrl, userId }: EditAvatarSectionProps) {
  const fetchUser = useUserStore(state => state.fetchUser)
  const { image, handleUpload, handleRemove, inputRef } = useImage()

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [cacheBuster, setCacheBuster] = useState('') // 用來解決快取問題

  // 顯示的預覽 URL：
  // - 有新選圖片 → 用 blob URL（本地預覽，沒有快取問題）
  // - 沒有新圖 → 用 DB 的 URL，加上 cacheBuster 避免瀏覽器快取舊圖
  const previewUrl = image?.url ?? (currentAvatarUrl ? `${currentAvatarUrl}${cacheBuster}` : null)

  const handleSave = async () => {
    if (!image?.file) return  // 沒有新選圖片就不用儲存

    setIsSaving(true)
    setError(null)
    setSuccess(false)

    // 步驟 1：上傳圖片到 avatars bucket，upsert: true 代表覆蓋已有的檔案
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(`${userId}/avatar.jpg`, image.file, { upsert: true })

    if (uploadError) {
      setError('上傳頭貼失敗，請再試一次')
      setIsSaving(false)
      return
    }

    // 步驟 2：只有第一次上傳（avatar_url 為 null）才需要寫入 DB
    // upsert 只覆蓋檔案內容，URL 路徑不變，所以已有頭貼的用戶不需要再更新
    if (!currentAvatarUrl) {
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(`${userId}/avatar.jpg`)

      const { error: updateError } = await supabase
        .from('users')
        .update({ avatar_url: data.publicUrl })
        .eq('id', userId)

      if (updateError) {
        setError('儲存失敗，請再試一次')
        setIsSaving(false)
        return
      }
    }

    // 步驟 3：重新 fetch，讓 Zustand store 和 profile 頁面反映最新頭貼
    await fetchUser()
    setCacheBuster(`?t=${Date.now()}`)  // 只觸發一次
    handleRemove()  // 清除本地預覽狀態
    setSuccess(true)
    setIsSaving(false)
  }

  return (
    <div className="bg-bg-secondary rounded-2xl overflow-hidden shadow">

      {/* Cover 漸層（與 profile 頁面一致） */}
      <div className="h-30 bg-gradient-to-br from-bg-tertiary to-primary/20" />

      <div className="flex flex-col items-center px-4 pb-5 -mt-20 gap-3">
        {/* 頭貼預覽區，點擊觸發 file input */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="group relative size-44 rounded-xl ring-4 bg-bg-tertiary ring-bg-secondary overflow-hidden"
        >
          {previewUrl ? (
            <img src={previewUrl} alt="頭貼預覽" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-bg-tertiary">
              <RxAvatar size={56} className="text-text-secondary" />
            </div>
          )}
          {/* hover 遮罩：提示可以點擊更換 */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 flex items-center justify-center transition">
            <MdOutlinePhotoCamera size={24} className="text-white opacity-0 group-hover:opacity-100 transition" />
          </div>
        </button>

        {/* 隱藏的 file input */}
        <input
          type="file"
          accept="image/*"
          ref={inputRef}
          onChange={handleUpload}
          className="hidden"
        />

        <p className="text-text-secondary text-xs">點擊頭貼更換照片</p>

        {/* 有選新圖片才顯示儲存/取消按鈕 */}
        {image && (
          <div className="flex gap-2 w-full">
            <button
              onClick={handleRemove}
              className="flex-1 py-1.5 rounded-xl border border-border text-text-secondary text-sm hover:text-text-primary transition"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 py-1.5 rounded-xl bg-primary text-bg-primary font-semibold text-sm hover:bg-primary-hover transition disabled:opacity-50"
            >
              {isSaving ? '儲存中...' : '儲存頭貼'}
            </button>
          </div>
        )}

        {error && <p className="text-red-400 text-xs">{error}</p>}
        {success && <p className="text-accent text-xs">頭貼已更新！</p>}
      </div>

    </div>
  )
}
