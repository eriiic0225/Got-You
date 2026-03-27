'use client'
// components/shared/NotificationBell.tsx
// 懸浮通知鈴鐺：固定在畫面右上角，點擊展開 dropdown 通知列表

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { LuBell } from 'react-icons/lu'
import { useNotificationStore, type Notification } from '@/stores/useNotificationStore'
import { cn, formatCreatedAt } from '@/lib/utils'
import useDraggable from '@/hooks/useDraggable'

// 依照通知類型產生說明文字
function getNotificationText(type: Notification['type']) {
  switch (type) {
    case 'post_comment':   return '留言了你的揪團'
    case 'post_join':      return '參加了你的揪團'
    case 'comment_thread': return '留言了你參與的揪團'
  }
}

export default function NotificationBell() {
  const { unreadCount, notifications, markAllRead } = useNotificationStore()
  const [isOpen, setIsOpen] = useState(false)
  const [isOnLeft, setIsOnLeft] = useState(false)
  const [isbelow, setIsbelow] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { isDragging, pos, hasMoved, 
    handlePointerDown, handlePointerMove, handlePointerUp } = useDraggable()

  // 點擊元件外部時關閉 dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 開啟 dropdown 時標記全部已讀
  const handleOpen = () => {
    if (!isOpen) markAllRead()
    const rect = containerRef.current?.getBoundingClientRect()
    const left = rect?.left ?? 0
    const bottom = rect?.bottom ?? 0
    setIsOnLeft(left < window.innerWidth / 2)
    // 距離底部不夠放 dropdown（384px - 預設max-h）就往上開
    setIsbelow(window.innerHeight - bottom < 384)
    setIsOpen(prev => !prev)
  }

  return (
    <div 
      ref={containerRef} 
      className={cn(
        `fixed md:top-25 md:right-4 top-10 right-4 z-50`,
      )}
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        touchAction: 'none' // 防止手機端滾動干擾
      }}
    >

      {/* ── 鈴鐺按鈕 ── */}
      <button
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={(e)=>{
          handlePointerUp(e)
          if (!hasMoved.current) handleOpen()  // 沒移動才展開通知
        }}
        className={cn(`
            relative flex items-center justify-center size-10 rounded-full
            bg-bg-secondary/50 backdrop-blur-sm border border-border/60
            hover:bg-bg-secondary transition-colors cursor-pointer shadow-lg`,
          )}
      >
        <LuBell 
          className={cn(
            "size-5 text-text-secondary hover:text-primary-hover transition-transform",
            isOpen && "text-primary rotate-12"
          )}
          strokeWidth={1.5} 
        />

        {/* 未讀紅點 */}
        {unreadCount > 0 && (
          <span 
            className={cn(
              "absolute -top-0.5 -right-0.5 bg-[tomato] text-white text-[9px] font-bold",
              "rounded-full min-w-[16px] h-4 flex items-center justify-center px-1"
            )}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown ── */}
      {isOpen && (
        <div className={cn(
          "absolute w-80 max-h-96 overflow-y-auto",
          "bg-bg-secondary/90 backdrop-blur-xs border border-border rounded-xl shadow-xl",
          isOnLeft ? "left-0" : "right-0",
          isbelow ? "bottom-12" : "top-12 "
          )}
        >

          {/* 標題列 */}
          <div className="px-4 py-3 border-b border-border">
            <span className="text-sm font-medium text-text-primary">通知</span>
          </div>

          {/* 通知列表 */}
          {notifications.length === 0 ? (
            <p className="text-center text-text-secondary text-sm px-4 py-8">目前沒有通知</p>
          ) : (
            notifications.map(n => (
              <Link
                key={n.id}
                href={`/posts/${n.post_id}`}
                onClick={() => setIsOpen(false)}
                className="flex items-start gap-3 px-4 py-3 hover:bg-bg-tertiary transition-colors border-b border-border/50 last:border-0"
              >
                {/* 發送者頭貼 */}
                {n.sender.avatar_url
                  ? <img src={n.sender.avatar_url} alt={n.sender.nickname}
                      className="size-8 rounded-full border border-border object-cover shrink-0 mt-0.5" />
                  : <div className="size-8 rounded-full border border-border bg-bg-tertiary
                                    flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs text-text-secondary">{n.sender.nickname[0]}</span>
                    </div>
                }

                {/* 內容 */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-secondary leading-snug">
                    <span className="font-medium text-text-primary">{n.sender.nickname}</span>
                    {' '}{getNotificationText(n.type)}
                    {' '}《<span className="text-primary truncate">{n.post.title}</span>》
                  </p>
                  <p className="text-xs text-text-secondary/60 mt-0.5" suppressHydrationWarning>
                    {formatCreatedAt(n.created_at)}
                  </p>
                </div>

                {/* 未讀藍點 */}
                {!n.is_read && (
                  <span className="size-2 rounded-full bg-primary shrink-0 mt-1.5" />
                )}
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}
