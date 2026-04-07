// components/posts/PostDetail.tsx
// 揪團詳情頁的主體顯示元件（純顯示，無互動）

import Link from 'next/link'
import { LuCalendar, LuMapPin } from 'react-icons/lu'
import { formatPostTime, formatCreatedAt, urlExtract } from '@/lib/utils'
import type { PostWithDetails } from '@/types/post'

interface Props {
  post: PostWithDetails
}

export default function PostDetail({ post }: Props) {
  // 組合地點文字，過濾掉 null
  const locationText = [post.location_area, post.location_detail]
    .filter(Boolean)
    .join(' · ')

  // 加上提取網址連結並轉換成 <a> 標籤
  function renderContent(content: string){
    const links = urlExtract(content)

    if (!links.length) return content

    const parts: React.ReactNode[] = []
    let lastIndex = 0

    links.forEach((link, idx) => {
      // URL 前的純文字
      if (link.index > lastIndex){
        parts.push(content.slice(lastIndex, link.index))
      }
      // URL 轉 <a> 標籤
      parts.push(
        <a 
          key={idx}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline opacity-80 hover:opacity-100 break-all"
          onClick={e => e.stopPropagation()}
        >
          {link.text}
        </a>
      )
      lastIndex = link.lastIndex
    })

    // URL 後的剩餘文字
    if (lastIndex < content.length){
      parts.push(content.slice(lastIndex))
    }
    return parts
  }

  return (
    <div className="p-6">

        {/* ── 上排：運動類型 badge + 發文者 ── */}
        <div className="flex justify-between items-center mb-5">

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/15 rounded-full">
              <span>{post.sport.icon}</span>
              <span className="text-sm font-medium text-primary">{post.sport.name}</span>
            </div>
            <span
              className="text-xs text-text-secondary/50"
              suppressHydrationWarning
            >
              {formatCreatedAt(post.created_at)}
            </span>
          </div>

          <Link href={`/profile/${post.author.id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            {post.author.avatar_url
              ? <img
                  className="size-9 rounded-full border border-border object-cover"
                  src={post.author.avatar_url}
                  alt={post.author.nickname}
                />
              : <div className="size-9 bg-bg-tertiary rounded-full border border-border flex items-center justify-center">
                  <span className="text-xs text-text-secondary">{post.author.nickname[0]}</span>
                </div>
            }
            <span className="text-sm text-text-secondary">{post.author.nickname}</span>
          </Link>
        </div>

        {/* ── 標題 ── */}
        <h1 className="text-xl font-bold text-text-primary mb-4">
          {post.title}
        </h1>

        {/* ── 時間 & 地點（有填才顯示）── */}
        {(post.event_date || locationText) && (
          <div className="space-y-2 mb-5">
            {post.event_date && (
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <LuCalendar className="size-4 shrink-0 text-primary" strokeWidth={1.5} />
                <span>{formatPostTime(post.event_date, post.event_time)}</span>
              </div>
            )}
            {locationText && (
              <div className="flex items-center gap-2 text-sm text-text-secondary">
                <LuMapPin className="size-4 shrink-0 text-primary" strokeWidth={1.5} />
                <span>{locationText}</span>
              </div>
            )}
          </div>
        )}

        {/* ── 分隔線 ── */}
        <div className="border-t border-border mb-5" />

        {/* ── 活動說明（保留換行）── */}
        <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
          {renderContent(post.description)}
        </p>

    </div>
  )
}
