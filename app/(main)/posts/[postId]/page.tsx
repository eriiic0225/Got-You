'use client'

import { supabase } from "@/lib/supabase/client"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { LuChevronLeft } from "react-icons/lu"
import type { PostWithDetails } from "@/types/post"
import PostDetail from "@/components/posts/PostDetail"
import ParticipateButton from "@/components/posts/ParticipateButton"
import CommentSection from "@/components/posts/CommentSection"




function IndividualPostPage(){
  
  // useParams：從 URL 動態路由段取值，比 usePathname + split 更正確
  const { postId } = useParams<{ postId: string }>()
  const [postDetail, setPostDetail] = useState<PostWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 抓貼文資料
  useEffect(() => {
    async function fetchPostDetail(postId: string) {
      setIsLoading(true)
      const { data: postData, error } = await supabase
        .from('group_posts')
        .select(`
          id,
          author:users!author_id(id, nickname, avatar_url),
          sport:sport_types(id, name, icon),
          title, description,
          location_area, location_detail,
          event_date, event_time, max_participants, created_at,
          participants_count:post_participants(count),
          comment_count:post_comments(count)
        `)
        .eq('id', postId)
        .single()

        if (error) {
          console.error('載入貼文失敗', error.message)
          setIsLoading(false)
          return
        }

        if (postData) {
          const postInfo = {
            id:               postData.id,
            author:           postData.author        as unknown as PostWithDetails['author'],
            sport:            postData.sport         as unknown as PostWithDetails['sport'],
            title:            postData.title,
            description:      postData.description,
            location_area:    postData.location_area,
            location_detail:  postData.location_detail,
            event_date:       postData.event_date,
            event_time:       postData.event_time,
            max_participants: postData.max_participants,
            created_at:       postData.created_at,
            participants_count: (postData.participants_count as unknown as { count: number }[])[0]?.count ?? 0,
            comment_count:      (postData.comment_count      as unknown as { count: number }[])[0]?.count ?? 0,
          }

          setPostDetail(postInfo)
          setIsLoading(false)
        }
    }
    fetchPostDetail(postId)
  }, [postId])

  if (isLoading) {
    return (
      <div className="max-w-[1000px] mx-auto px-2 py-8">
        <p className="text-text-secondary text-sm">載入中...</p>
      </div>
    )
  }

  if (!postDetail) {
    return (
      <div className="max-w-[1000px] mx-auto px-2 py-8">
        <p className="text-text-secondary text-sm">找不到此揪團</p>
      </div>
    )
  }

  return (
    <div className="max-w-[1000px] mx-auto px-2 pt-3 pb-12 space-y-4">

      {/* 回上頁 */}
      <Link
        href="/posts"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
      >
        <LuChevronLeft className="size-4" strokeWidth={2} />
        揪團列表
      </Link>

      {/* 主卡片：PostDetail + ParticipateButton 合成一張 */}
      <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
        <div className="h-1 bg-primary" />
        <PostDetail post={postDetail} />
        <ParticipateButton
          postId={postDetail.id}
          maxParticipants={postDetail.max_participants}
          initialCount={postDetail.participants_count}
          initialCommentCount={postDetail.comment_count}
        />
      </div>

      <CommentSection postId={postId} />
    </div>
  )
}



export default IndividualPostPage