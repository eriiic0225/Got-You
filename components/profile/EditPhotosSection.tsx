'use client'

// 生活照編輯區塊：上傳新照片 + 刪除現有照片
// 照片存於 user-photos bucket（路徑：{userId}/{uuid}.jpg）
// URL 記錄在 user_photos 表

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { MdAddPhotoAlternate, MdClose } from 'react-icons/md'

const MAX_PHOTOS = 6  // 生活照上限張數

interface Photo {
  id: string        // user_photos 表的 id（刪除時使用）
  photo_url: string // 公開圖片 URL
}

interface EditPhotosSectionProps {
  userId: string
}

export default function EditPhotosSection({ userId }: EditPhotosSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<Photo[]>([])   // 儲存現有的照片 id & url
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 初次載入時從 user_photos 表撈取現有照片
  useEffect(() => {
    async function fetchPhotos() {
      const { data, error } = await supabase
        .from('user_photos')
        .select('id, photo_url')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      if (data) setPhotos(data)
      setIsLoading(false)
    }
    fetchPhotos()
  }, [userId])

  // 上傳新照片：Storage → user_photos 表
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (photos.length >= MAX_PHOTOS) {
      setError(`最多只能上傳 ${MAX_PHOTOS} 張照片`)
      return
    }

    setIsUploading(true)
    setError(null)

    // 步驟 1：用時間戳產生唯一檔名，避免覆蓋
    const fileName = `${Date.now()}.jpg`
    const storagePath = `${userId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('user-photos')
      .upload(storagePath, file)

    if (uploadError) {
      setError('上傳失敗，請再試一次')
      setIsUploading(false)
      return
    }

    // 步驟 2：取得公開 URL
    const { data: urlData } = supabase.storage
      .from('user-photos')
      .getPublicUrl(storagePath)

    // 步驟 3：將 URL 寫入 user_photos 表
    const { data: insertData, error: insertError } = await supabase
      .from('user_photos')
      .insert({ user_id: userId, photo_url: urlData.publicUrl })
      .select('id, photo_url') // 新增完資料後直接拉回來
      .single()

    if (insertError || !insertData) {
      setError('記錄失敗，請再試一次')
      setIsUploading(false)
      return
    }

    // 步驟 4：把新照片加入本地 state，畫面即時更新
    setPhotos(prev => [...prev, insertData])
    setIsUploading(false)

    // 清空 file input，讓同一張圖可以再次選取
    if (inputRef.current) inputRef.current.value = ''
  }

  // 刪除照片：Storage + user_photos 表 一起刪
  const handleDelete = async (photo: Photo) => {
    setError(null)

    // 從完整 URL 提取 Storage 路徑（移除 bucket URL 前綴）
    // URL 格式：https://xxx.supabase.co/storage/v1/object/public/user-photos/{userId}/{fileName}
    const storagePath = photo.photo_url.split('/user-photos/')[1] // 取到 -> {userId}/{fileName}

    // 步驟 1：刪 Storage 檔案
    const { error: storageError } = await supabase.storage
      .from('user-photos')
      .remove([storagePath])

    if (storageError) {
      setError('刪除失敗，請再試一次')
      return
    }

    // 步驟 2：刪 user_photos 表記錄
    const { error: dbError } = await supabase
      .from('user_photos')
      .delete()
      .eq('id', photo.id)

    if (dbError) {
      setError('刪除記錄失敗，請再試一次')
      return
    }

    // 步驟 3：更新本地 state，畫面即時移除
    setPhotos(prev => prev.filter(p => p.id !== photo.id))
  }

  return (
    <div className="bg-bg-secondary rounded-2xl p-6 shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">其他照片</h3>
        {/* 顯示 現有照片數/最大照片數 */}
        <span className="text-text-secondary text-xs">{photos.length} / {MAX_PHOTOS}</span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-bg-tertiary animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {/* 現有照片 */}
          {photos.map(photo => (
            <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden group">
              <img src={photo.photo_url} alt="生活照" className="w-full h-full object-cover" />
              {/* 刪除按鈕：hover 才顯示 */}
              <button
                onClick={() => handleDelete(photo)}
                className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
              >
                <MdClose size={14} className="text-white" />
              </button>
            </div>
          ))}

          {/* 新增按鈕（未達上限才顯示） */}
          {photos.length < MAX_PHOTOS && (
            <button
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
              className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-text-secondary hover:border-primary hover:text-primary transition disabled:opacity-50"
            >
              <MdAddPhotoAlternate size={24} />
              <span className="text-xs">{isUploading ? '上傳中...' : '新增'}</span>
            </button>
          )}
        </div>
      )}

      {/* 隱藏的輸入框 */}
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleUpload}
        className="hidden"
      />

      {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
    </div>
  )
}
