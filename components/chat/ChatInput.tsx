'use client'

import { supabase } from "@/lib/supabase/client"
import { useUserStore } from "@/stores/useUserStore"
import { useState } from "react"
import { IoSend } from "react-icons/io5"
import type { Message } from "@/types/chat"


interface Props {
    receiverId: string
    onMessageSent: (newMessage: Message) => void
    onRollback: (tempId: string) => void
  }

export default function ChatInput({ receiverId, onMessageSent, onRollback }:Props){
  const profile = useUserStore(state => state.profile)
  const [content, setContent] = useState('')
  const [image, setImage] = useState<File | null>(null) // 預留給上傳圖片用的
  const [error, setError] = useState("")
  const [isSubmiting, setIsSubmiting] = useState(false)

  const handleSend = async() => {
    if(!content) return // 如果做上傳圖片這邊的判斷條件記得改
    if (!profile?.id) return
    if (isSubmiting) return


    // 樂觀更新？
    const tempId = crypto.randomUUID()
    onMessageSent({
      id: tempId,
      sender_id: profile?.id,
      receiver_id: receiverId,
      content: content,
      image_url: null, // 還沒做圖片上傳，暫定null
      is_read: false,
      created_at: new Date().toISOString()
    })

    setIsSubmiting(true)
    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: profile?.id, 
        receiver_id: receiverId, 
        content: content.trim()
      })

    if (error) {
      onRollback(tempId)  // 回滾刪除假訊息
      setError("訊息傳送失敗！請再試一次")
      setIsSubmiting(false)
      return
    }
    setContent("")
    setImage(null)
    setIsSubmiting(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
  <>
    {error && <p className="text-red-400 text-xs text-center">{error}</p>}
    <div className="w-[calc(full-2px)] mx-2 pb-2">
      <form 
        className="w-full flex items-center" 
        onSubmit={(e) => { e.preventDefault(); handleSend() }}
      >
        <textarea
          className="flex-1 resize-none bg-bg-tertiary rounded-lg px-3 py-2 border border-border text-sm focus:outline-none focus:border-primary transition"
          rows={1} value={content} placeholder="輸入訊息..."
          onKeyDown={handleKeyDown}
          onChange={(e)=>{setContent(e.target.value)}}/>
        <input 
          type="file" accept="image/*" disabled 
          className="hidden"
        />
        {/* 只有有輸入內容才顯示 */}
        {(content.trim() || image )&& (
          <button
            title="送出"
            type="submit"
            className="shrink-0 cursor-pointer ml-0.5 bg-primary text-bg-primary rounded-full p-2 transition-colors hover:bg-primary-hover"
          >
            <IoSend size={18} />
          </button>
        )}

      </form>
    </div>
  </>
  )
}