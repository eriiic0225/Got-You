'use client'

import { supabase } from "@/lib/supabase/client"
import { useUserStore } from "@/stores/useUserStore"
import { useState } from "react"
import { IoSend, IoClose } from "react-icons/io5"
import type { Message } from "@/types/chat"
import { RiImageAddFill } from "react-icons/ri";
import useImage from "@/hooks/useImage"


interface Props {
  receiverId: string
  onMessageSent: (newMessage: Message) => void
  onRollback: (tempId: string) => void
  }

export default function ChatInput({ receiverId, onMessageSent, onRollback }: Props){
  const profile = useUserStore(state => state.profile)
  const [content, setContent] = useState('')
  const [error, setError] = useState("")
  const [isSubmiting, setIsSubmiting] = useState(false)

  const { image, handleUpload, handlePaste, handleRemove, clearImage, inputRef } = useImage()
  // useImage 管理圖片選取/貼上/預覽/移除
  // clearImage = 程式化清空（不 revoke URL，讓樂觀預覽繼續顯示）
  // handleRemove = 使用者主動移除（revoke URL 釋放記憶體）

  const handleSend = async() => {
    if(!content.trim() && !image ) return
    if (!profile?.id) return
    if (isSubmiting) return
    setError("")

    // 樂觀更新？
    const sentContent = content // 先把input裡的值複製起來
    const sentImage = image

    setContent("")  // ← 立刻清空(不然測試時發現會有一點延遲，UX 體驗不太好)
    if (sentImage) clearImage()  // 不 revoke，讓樂觀 bubble 的圖片繼續顯示

    const tempId = crypto.randomUUID()

    // 在前端樂觀更新用的假資料
    onMessageSent({
      id: tempId,
      sender_id: profile.id,
      receiver_id: receiverId,
      content: sentContent.trim() || null,
      image_url: sentImage?.url ?? null,
      is_read: false,
      created_at: new Date().toISOString()
    })

    setIsSubmiting(true)

    let uploadedImageUrl: string | null = null
    if (sentImage){ // 如果這是有圖片的訊息
      // 路徑格式：{userId}/{timestamp}.{ext}
      // 不使用原始檔名，避免中文/空白等特殊字元造成 Storage Invalid key 錯誤
      const ext = sentImage.file.name.split('.').pop() || 'jpg'
      const filePath = `${profile.id}/${Date.now()}.${ext}`
      const { data, error: uploadError } = await supabase.storage
        .from('chat-images')
        .upload(filePath, sentImage.file)

      if (uploadError){
        console.error(uploadError)
        onRollback(tempId)
        setError("圖片上傳失敗，請再試一次")
        setIsSubmiting(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('chat-images')
        .getPublicUrl(filePath)

      uploadedImageUrl = publicUrl
    }

    const { error: insertError } = await supabase
      .from('messages')
      .insert({
        sender_id: profile.id, 
        receiver_id: receiverId, 
        content: sentContent.trim() || null,
        image_url: uploadedImageUrl // 沒有圖片的話就會是null (上面最初let宣告的值)
      })

    if (insertError) {
      onRollback(tempId)  // 回滾刪除假訊息
      setContent(sentContent) // 回滾復原沒送出的內容
      setError("訊息傳送失敗！請再試一次")
      setIsSubmiting(false)
      return
    }
    setIsSubmiting(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      // isComposing 是指中文輸入還有底線(還沒按enter確認最終選字前)
      // 如果沒加這個判斷，中文按enter選字後會直接送出訊息 但input不會清空
      e.preventDefault()
      handleSend()
    }
    // textarea 空白時按 Backspace → 清除圖片
    if (e.key === 'Backspace' && !content && image) {
      e.preventDefault()
      handleRemove()
    }
  }

  return (
  <>
    {error && <p className="text-red-400 text-xs text-center">{error}</p>}
    <div className="mx-2 py-2">
      <div className="flex items-end gap-1">

        {/* 上傳圖片按鈕：點擊觸發隱藏的 file input */}
        <button
          type="button"
          title="上傳圖片"
          onClick={() => inputRef.current?.click()}
          className="shrink-0 mb-2 p-1 rounded-full cursor-pointer hover:bg-bg-tertiary transition-colors"
        >
          <RiImageAddFill size={20} className="text-text-secondary" />
        </button>

        {/* 輸入框容器：圖片預覽 + textarea 包在同一個 border 框裡 */}
        <div className="flex-1 bg-bg-tertiary border border-border rounded-lg focus-within:border-primary transition overflow-hidden">

          {/* 圖片預覽（選圖/貼圖後才顯示） */}
          {image && (
            <div className="px-2 pt-2">
              <div className="relative inline-block">
                <img
                  src={image.url}
                  alt="預覽圖片"
                  className="h-20 rounded-md object-cover border border-border"
                />
                {/* 叉叉：移除圖片 */}
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute -top-1.5 -right-1.5 bg-bg-primary border border-border rounded-full p-0.5 cursor-pointer hover:bg-bg-tertiary transition-colors"
                >
                  <IoClose size={12} />
                </button>
              </div>
            </div>
          )}

          {/* textarea：支援 Ctrl+V 貼圖、Backspace 刪圖、Enter 送出 */}
          <textarea
            className="w-full resize-none bg-transparent px-3 py-2 text-sm focus:outline-none"
            rows={1} value={content} placeholder="輸入訊息..."
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onChange={(e)=>{setContent(e.target.value)}}/>
        </div>

        {/* 隱藏的 file input，由上方按鈕觸發 */}
        <input
          ref={inputRef}
          type="file" accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />

        {/* 只有有輸入內容才顯示 */}
        {(content.trim() || image) && (
          <button
            type="button"
            title="送出"
            onClick={handleSend}
            className="shrink-0 mb-2 cursor-pointer bg-primary text-bg-primary rounded-full p-2 transition-colors hover:bg-primary-hover"
          >
            <IoSend size={18} />
          </button>
        )}

      </div>
    </div>
  </>
  )
}