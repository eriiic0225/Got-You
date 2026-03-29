'use client'

import { useEffect, useState, useMemo } from "react"
import type { PostWithDetails } from "@/types/post"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"
import PostCard from "@/components/posts/PostCard"
import PostFilterBar, { type PostFilters } from "@/components/posts/PostFilterBar"
import SkeletonPostList from "@/components/posts/SkeletonPostCard"

function PostsPage(){

  const [posts, setPosts] = useState<PostWithDetails[]>([])
  const [allSports, setAllSports] = useState<{ id: string; name: string; icon: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 篩選狀態：全部初始為「不篩」
  const [filters, setFilters] = useState<PostFilters>({
    sportTypeIds: [],
    onlyUpcoming: false,
    hasSlots: false,
  })

  // 抓所有運動類型（不管有沒有人發文都要顯示）
  useEffect(() => {
    async function fetchSportTypes() {
      const { data } = await supabase
        .from('sport_types')
        .select('id, name, icon')
        .order('created_order')
      setAllSports(data ?? [])
    }
    fetchSportTypes()
  }, [])

  // 抓貼文資料（只執行一次，篩選由 client-side useMemo 處理）
  useEffect(() => {
    async function fetchPosts() {
      setIsLoading(true)
      const { data, error } = await supabase
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
        .order('created_at', { ascending: false })

      if (error) {
        console.error('載入揪團列表失敗', error.message)
        setIsLoading(false)
        return
      }

      // Supabase 的 count 回傳格式是 [{ count: N }]，需要取出數字
      // author / sport 是多對一關係，Supabase 回傳單一物件，用 as 強制轉型
      const mapped = (data ?? []).map((post) => ({
        id:               post.id,
        author:           post.author        as unknown as PostWithDetails['author'],
        sport:            post.sport         as unknown as PostWithDetails['sport'],
        title:            post.title,
        description:      post.description,
        location_area:    post.location_area,
        location_detail:  post.location_detail,
        event_date:       post.event_date,
        event_time:       post.event_time,
        max_participants: post.max_participants,
        created_at:       post.created_at,
        participants_count: (post.participants_count as unknown as { count: number }[])[0]?.count ?? 0,
        comment_count:      (post.comment_count      as unknown as { count: number }[])[0]?.count ?? 0,
      }))

      setPosts(mapped)
      setIsLoading(false)
    }

    fetchPosts()
  }, [])

  // 套用篩選條件，產生最終要顯示的貼文列表
  const filteredPosts = useMemo(() => {
    const now = new Date()
    return posts.filter(post => {

      // 運動類型：有選才篩，空陣列 = 全部顯示
      if (filters.sportTypeIds.length > 0 && !filters.sportTypeIds.includes(post.sport.id)) return false

      // 即將舉行：有設定日期 且 日期已過 → 過濾掉；沒設日期的不過濾（視為永遠顯示）
      if (filters.onlyUpcoming && post.event_date && new Date(post.event_date) < now) return false

      // 還有名額：有設上限 且 已達上限 → 過濾掉；沒設上限視為名額無限
      if (filters.hasSlots && post.max_participants !== null && post.participants_count >= post.max_participants) return false

      return true
    })
  }, [posts, filters])

  return (
    <div className="max-w-[1000px] mx-auto px-5 py-8">

      {/* 頁首：標題 + 發文按鈕 */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-lg font-semibold text-text-primary">揪團</h1>
        <Link
          href="/posts/create"
          className="px-4 py-2 rounded-lg bg-primary text-bg-primary text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          ＋ 發佈揪團
        </Link>
      </div>

      {/* 篩選列（只有資料載入後才顯示，避免空 chips 一閃而過） */}
      {!isLoading && (
        <PostFilterBar
          sports={allSports}
          filters={filters}
          onChange={setFilters}
        />
      )}

      {/* 載入中：顯示骨架卡；載入後：顯示真實卡片 */}
      {isLoading
        ? <SkeletonPostList />
        : (
          <div className="space-y-4">
            {filteredPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )
      }

      {/* 無結果提示：區分「真的沒資料」和「篩選後無結果」 */}
      {!isLoading && filteredPosts.length === 0 && (
        <p className="text-center text-text-secondary text-sm py-12">
          {posts.length === 0 ? '目前還沒有揪團' : '沒有符合條件的揪團'}
        </p>
      )}

    </div>
  )
}

export default PostsPage
