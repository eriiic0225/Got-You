'use client'
// components/posts/CommentInput.tsx
// 固定在畫面底部的留言輸入框，永遠顯示
// /posts/[postId] 的 BottomNav 已隱藏，直接 bottom-0 即可

import { useRef, useState } from 'react'
import { IoSend } from 'react-icons/io5'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { useUserStore } from '@/stores/useUserStore'
import type { PostCommentWithAuthor } from '@/types/post'

interface Props {
  postId: string
  onCommentSend: (newComment: PostCommentWithAuthor) => void
  onRollback: (tempId: string) => void
}

export default function CommentInput({ postId, onCommentSend, onRollback }: Props) {

  const profile = useUserStore(state => state.profile)
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 自動調整高度：隨內容增減，最高 8 行
  const handleResize = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'               // 先重置，讓 scrollHeight 正確反映內容高度
    el.style.height = `${el.scrollHeight}px`
  }

  const handleSend = async () => {
    if (!content.trim() || !profile || isSubmitting) return

    const sentContent = content.trim()
    const tempId = crypto.randomUUID()

    // 1. 清空輸入框 + 高度重置 + 樂觀更新
    setContent('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    onCommentSend({
      id: tempId,
      post_id: postId,
      user_id: profile.id!,
      parent_id: null,
      content: sentContent,
      created_at: new Date().toISOString(),
      author: {
        id: profile.id!,
        nickname: profile.nickname!,
        avatar_url: profile.avatar_url ?? null,
      }
    })

    // 2. 背景 INSERT
    setIsSubmitting(true)
    const { error } = await supabase
      .from('post_comments')
      .insert({ post_id: postId, user_id: profile.id, content: sentContent })

    if (error) {
      console.error('留言失敗', error.message)
      onRollback(tempId)
      setContent(sentContent)
    }
    setIsSubmitting(false)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-bg-secondary border-t border-border px-4 py-3">
      <div className="max-w-[1000px] mx-auto flex items-end gap-3">

        {/* 自己的頭像 */}
        {profile?.avatar_url
          ? <img src={profile.avatar_url} alt={profile.nickname ?? ''} className="size-8 rounded-full border border-border object-cover shrink-0 mb-0.5" />
          : <div className="size-8 bg-bg-tertiary rounded-full border border-border flex items-center justify-center shrink-0 mb-0.5">
              <span className="text-xs text-text-secondary">{profile?.nickname?.[0]}</span>
            </div>
        }

        {/* 輸入框 */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={e => { setContent(e.target.value); handleResize() }}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="留言..."
          rows={1}
          className={cn(
            "flex-1 bg-bg-tertiary border border-border rounded-lg px-3 py-2",
            "text-sm text-text-primary placeholder:text-text-secondary/50",
            "focus:outline-none focus:border-primary/50 transition-colors resize-none",
            "overflow-y-auto",   // 超過 max-h 後出現捲軸
          )}
          style={{ maxHeight: 'calc(1.5rem * 8 + 1rem)' }} // 8 行 × line-height 1.5rem + 上下 padding
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!content.trim() || isSubmitting}
          className="shrink-0 mb-0.5 cursor-pointer bg-primary text-bg-primary rounded-lg p-2 transition-colors hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <IoSend size={16} />
        </button>

      </div>
    </div>
  )
}
