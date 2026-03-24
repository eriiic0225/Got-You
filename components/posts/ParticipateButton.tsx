'use client'
// components/posts/ParticipateButton.tsx
// 參加/取消按鈕 + 即時人數顯示
// 樂觀更新：先更新 UI，背景再送 request，失敗時還原（同聊天送訊息的模式）

import { useEffect, useState } from 'react'
import { LuUsers, LuMessageCircle } from 'react-icons/lu'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { useUserStore } from '@/stores/useUserStore'

interface Props {
  postId: string
  maxParticipants: number | null  // null = 不限人數
  initialCount: number            // 從 page.tsx 初始 fetch 傳入，避免多一次請求
  initialCommentCount: number     // 留言數，純顯示用
}

export default function ParticipateButton({ postId, maxParticipants, initialCount, initialCommentCount }: Props) {

  const profile = useUserStore(state => state.profile)
  const [count, setCount] = useState(initialCount)
  const [commentCount, setCommentCount] = useState(initialCommentCount)
  const [isParticipating, setIsParticipating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)  // 確認「自己是否已參加」前先 loading

  // 確認當前用戶是否已參加
  useEffect(() => {
    if (!profile) return

    async function checkParticipation() {
      const { data } = await supabase
        .from('post_participants')
        .select('user_id')
        .eq('post_id', postId)
        .eq('user_id', profile!.id)
        .maybeSingle()  // 0 筆回傳 null，不會 throw error

      setIsParticipating(!!data)
      setIsLoading(false)
    }

    checkParticipation()
  }, [postId, profile])

  // Realtime 監聽其他用戶的參加/取消 
  useEffect(() => {
    if (!profile) return

    const channel = supabase
      .channel(`post_participants:${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_participants',
          filter: `post_id=eq.${postId}`,
        },
        (payload) => {
          // 自己觸發的事件已由樂觀更新處理，這裡直接忽略，避免 count 重複計算
          const changedUserId = payload.eventType === 'DELETE'
            ? (payload.old as { user_id: string }).user_id
            : (payload.new as { user_id: string }).user_id

          if (changedUserId === profile.id) return

          // 其他人的變動才更新 count
          if (payload.eventType === 'INSERT') setCount(c => c + 1)
          if (payload.eventType === 'DELETE') setCount(c => c - 1)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [postId, profile])

  // Realtime 監聽留言新增/刪除，更新留言數
  // 注意：自己送出的留言不走這裡（CommentInput 樂觀更新），
  // 但留言數本身沒有樂觀更新，所以這裡不過濾自己，讓 Realtime 統一更新數字
  useEffect(() => {
    const channel = supabase
      .channel(`post_comments_count:${postId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'post_comments', filter: `post_id=eq.${postId}` },
        () => setCommentCount(c => c + 1)
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'post_comments', filter: `post_id=eq.${postId}` },
        () => setCommentCount(c => c - 1)
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [postId])

  // ── 點擊參加/取消 ──
  const handleToggle = async () => {
    if (!profile || isLoading) return

    // 儲存目前狀態，失敗時用來還原
    const prevCount = count
    const prevIsParticipating = isParticipating

    if (isParticipating) {
      // 樂觀更新：先 UI 取消
      setCount(c => c - 1)
      setIsParticipating(false)

      const { error } = await supabase
        .from('post_participants')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', profile.id)

      if (error) {
        console.error('取消參加失敗', error.message)
        setCount(prevCount)
        setIsParticipating(prevIsParticipating)
      }
    } else {
      // 樂觀更新：先 UI 參加
      setCount(c => c + 1)
      setIsParticipating(true)

      const { error } = await supabase
        .from('post_participants')
        .insert({ post_id: postId, user_id: profile.id })

      if (error) {
        console.error('參加失敗', error.message)
        setCount(prevCount)
        setIsParticipating(prevIsParticipating)
      }
    }
  }

  // 人數已達上限且自己未參加 → 額滿
  const isFull = maxParticipants !== null && count >= maxParticipants && !isParticipating

  return (
    <div className="px-6 py-3 flex items-center justify-between border-t border-border">

      {/* 左側：留言數 + 參加人數 */}
      <div className="flex items-center gap-4 text-sm text-text-secondary">

        {/* 留言數 */}
        <div className="flex items-center gap-1.5">
          <LuMessageCircle className="size-4 shrink-0" strokeWidth={1.5} />
          <span>{commentCount}</span>
        </div>

        {/* 參加人數 */}
        <div className="flex items-center gap-1.5">
          <LuUsers className="size-4 shrink-0" strokeWidth={1.5} />
          <span className="text-accent font-medium">{count}</span>
          {maxParticipants && (
            <span>/ {maxParticipants}</span>
          )}
        </div>

      </div>

      {/* 右側：參加按鈕 */}
      <button
        onClick={handleToggle}
        disabled={isFull || isLoading}
        className={cn(
          "px-5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          isParticipating
            // 已參加：灰底，hover 變紅提示可取消
            ? "bg-bg-tertiary border border-border text-text-secondary hover:border-red-400/60 hover:text-red-400"
            // 未參加：主色按鈕
            : "bg-primary text-bg-primary hover:bg-primary-hover",
          // 額滿覆蓋樣式
          isFull && "bg-bg-tertiary border border-border text-text-secondary"
        )}
      >
        {isLoading ? '...' : isFull ? '已額滿' : isParticipating ? '取消' : '+ 1'}
      </button>

    </div>
  )
}
