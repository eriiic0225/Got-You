'use client'
// components/posts/PostCard.tsx
// 揪團列表的單張卡片元件，顯示貼文的摘要資訊

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LuCalendar, LuMapPin, LuUsers, LuMessageCircle } from 'react-icons/lu'
import { formatPostTime } from "@/lib/utils"
import type { PostWithDetails } from "@/types/post"

interface Props {
  post: PostWithDetails
}

function PostCard({ post }: Props){
  const router = useRouter()
  // 組合地點文字：過濾掉 null，用「·」連接
  // e.g. ["大安區", "World Gym 大安店"] → "大安區 · World Gym 大安店"
  const locationText = [post.location_area, post.location_detail]
    .filter(Boolean) // 過濾掉陣列中所有虛假值(false, 0, 空字串, null...)  
    .join(' · ')

  return (
    // Link 包住整張卡片，點任何地方都能進詳情頁
    // block 讓 Link 撐滿整個 article 寬度（預設是 inline）
    <Link href={`/posts/${post.id}`} className="block">
    <article
      className={`bg-bg-secondary border border-border rounded-lg
      flex overflow-hidden
      hover:border-primary/50 hover:bg-bg-tertiary transition-colors cursor-pointer`}>

      {/* 左側裝飾條 */}
      <div className='bg-primary w-1 hover:bg-primary-hover'/>

      {/* 內容區 */}
      <div className='p-4 grow'>

        {/* ── 上排：運動類型 badge + 發文者資訊 ── */}
        <div className="flex justify-between items-center mb-3">

          {/* 運動類型：icon + 名稱，用主色調的半透明背景做 badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/15 rounded-full">
            <span>{post.sport.icon}</span>
            <span className="text-sm font-medium text-primary">{post.sport.name}</span>
          </div>

          {/* 發文者：頭貼 + 暱稱（點擊跳個人頁，stopPropagation 避免觸發外層卡片 Link） */}
          <div
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
            onClick={e => { e.preventDefault(); e.stopPropagation(); router.push(`/profile/${post.author.id}`) }}
          >
            {post.author.avatar_url
              ? <img
                  className="size-8 rounded-full border border-border object-cover"
                  src={post.author.avatar_url}
                  alt={post.author.nickname}
                />
              // 沒有頭貼時顯示暱稱第一個字作為預設頭像
              : <div className="size-8 bg-bg-tertiary rounded-full border border-border flex items-center justify-center">
                  <span className="text-xs text-text-secondary">{post.author.nickname[0]}</span>
                </div>
            }
            <span className="text-sm text-text-secondary">{post.author.nickname}</span>
          </div>
        </div>

        {/* ── 活動時間（選填，null 時整行不顯示）── */}
        {post.event_date && (
          <div className="flex items-center gap-1.5 text-sm text-text-secondary mb-1.5">
            <LuCalendar className="size-3.5 shrink-0 text-primary" strokeWidth={1.5} />
            <span>{formatPostTime(post.event_date, post.event_time)}</span>
          </div>
        )}

        {/* ── 地點（area 和 detail 都沒填時整行不顯示）── */}
        {locationText && (
          <div className="flex items-center gap-1.5 text-sm text-text-secondary mb-1.5">
            <LuMapPin className="size-3.5 shrink-0 text-primary" strokeWidth={1.5} />
            <span>{locationText}</span>
          </div>
        )}

        {/* ── 活動說明（最多顯示兩行，超出截斷）── */}
        <h3
          className='font-semibold'
        >
          {post.title}
        </h3>

        {/* ── 活動說明（最多顯示兩行，超出截斷）── */}
        <p className="text-sm text-text-secondary line-clamp-2 leading-relaxed mb-4">
          {post.description}
        </p>

        {/* ── 底部：參與人數 + 留言數，用上邊框隔開 ── */}
        <div className="flex justify-between items-center pt-3 border-t border-border">

          {/* 參與人數：目前人數用強調色顯示，上限用次要色 */}
          <div className="flex items-center gap-1.5 text-sm">
            <LuUsers className="size-3.5 shrink-0" strokeWidth={1.5} />
            <span className="text-accent font-medium">{post.participants_count}</span>
            {post.max_participants && post.max_participants > 0 && (
              <span className="text-text-secondary">/ {post.max_participants}</span>
            )}
            <span className="text-text-secondary ml-0.5">人參加</span>
          </div>

          {/* 留言數 */}
          <div className="flex items-center gap-1.5 text-sm text-text-secondary">
            <LuMessageCircle className="size-3.5 shrink-0 text-primary" strokeWidth={1.5} />
            <span>{post.comment_count} 則留言</span>
          </div>
        </div>

      </div>


    </article>
    </Link>
  )
}

export default PostCard