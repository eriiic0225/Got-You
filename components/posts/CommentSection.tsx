'use client'
// components/posts/CommentSection.tsx
// 留言列表 + 開啟留言輸入框的按鈕
// Realtime：監聽他人留言，自己的留言由 CommentInput 樂觀更新處理

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { useUserStore } from '@/stores/useUserStore'
import { formatCreatedAt } from '@/lib/utils'
import type { PostCommentWithAuthor } from '@/types/post'
import CommentInput from './CommentInput'

interface Props {
  postId: string
}

export default function CommentSection({ postId }: Props) {

  const profile = useUserStore(state => state.profile)
  const [comments, setComments] = useState<PostCommentWithAuthor[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // ── Effect 1：初始載入留言列表 ──
  useEffect(() => {
    async function fetchComments() {
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          id, post_id, user_id, parent_id, content, created_at,
          author:users!user_id(id, nickname, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('載入留言失敗', error.message)
        setIsLoading(false)
        return
      }

      setComments((data ?? []).map(c => ({
        ...c,
        author: c.author as unknown as PostCommentWithAuthor['author']
      })))
      setIsLoading(false)
    }

    fetchComments()
  }, [postId])

  // ── Effect 2：Realtime 監聽他人留言 ──
  useEffect(() => {
    const channel = supabase
      .channel(`post_comments:${postId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'post_comments', filter: `post_id=eq.${postId}` },
        async (payload) => {
          const row = payload.new as {
            id: string; post_id: string; user_id: string
            parent_id: string | null; content: string; created_at: string
          }

          // 自己的留言已由樂觀更新處理，忽略避免重複
          if (row.user_id === profile?.id) return

          // 別人的留言：補抓作者資訊
          const { data: authorData } = await supabase
            .from('users')
            .select('id, nickname, avatar_url')
            .eq('id', row.user_id)
            .single()

          setComments(prev => [...prev, {
            ...row,
            author: authorData ?? { id: row.user_id, nickname: '未知用戶', avatar_url: null }
          }])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [postId, profile])

  // 由 CommentInput 呼叫：樂觀新增留言
  const handleCommentSent = (newComment: PostCommentWithAuthor) => {
    setComments(prev => [...prev, newComment])
  }

  // 由 CommentInput 呼叫：送出失敗時移除樂觀留言
  const handleRollback = (tempId: string) => {
    setComments(prev => prev.filter(c => c.id !== tempId))
  }

  return (
    <>
      {/* ── 留言列表（無卡片包裝，接續上方的統一卡片） ── */}
      <div className="divide-y divide-border border-t border-border">
        {isLoading ? (
          // 留言載入中：顯示 3 則骨架留言
          <div className="animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-6 py-4 flex gap-3">
                <div className="size-8 rounded-full bg-bg-tertiary shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-16 bg-bg-tertiary rounded" />
                    <div className="h-3 w-20 bg-bg-tertiary rounded" />
                  </div>
                  <div className="h-3 w-full bg-bg-tertiary rounded" />
                  <div className="h-3 w-3/4 bg-bg-tertiary rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-text-secondary text-sm px-6 py-8">
            還沒有留言，快來說點什麼
          </p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="px-6 py-4 flex gap-3">

              {/* 頭像（點擊前往該用戶個人頁） */}
              <Link href={`/profile/${comment.author.id}`} className="shrink-0 mt-0.5">
                {comment.author.avatar_url
                  ? <img
                      src={comment.author.avatar_url}
                      alt={comment.author.nickname}
                      className="size-8 rounded-full border border-border object-cover hover:opacity-80 transition-opacity"
                    />
                  : <div className="size-8 bg-bg-tertiary rounded-full border border-border flex items-center justify-center hover:opacity-80 transition-opacity">
                      <span className="text-xs text-text-secondary">{comment.author.nickname[0]}</span>
                    </div>
                }
              </Link>

              {/* 內容 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <Link
                    href={`/profile/${comment.author.id}`}
                    className="text-sm font-medium text-text-primary hover:text-primary transition-colors"
                  >
                    {comment.author.nickname}
                  </Link>
                  <span
                    className="text-xs text-text-secondary/50"
                    suppressHydrationWarning
                  >
                    {formatCreatedAt(comment.created_at)}
                  </span>
                </div>
                <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>

            </div>
          ))
        )}
      </div>

      {/* 固定在底部的留言輸入框 */}
      <CommentInput
        postId={postId}
        onCommentSend={handleCommentSent}
        onRollback={handleRollback}
      />
    </>
  )
}
