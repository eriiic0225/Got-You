'use client'
// components/explore/ExploreClient.tsx
// 探索頁：顯示推薦使用者卡片
// 左側（桌機）或頂部按鈕（手機）有篩選器，Tab 切換「共同地點」和「附近的人」
// 初始資料由 app/(main)/explore/page.tsx (Server Component) 透過 props 注入

import { useState, useEffect } from 'react'
import { FiSliders } from 'react-icons/fi'
import { useExploreStore } from '@/stores/useExploreStore'
import UserCard, { type UserCardProfile } from '@/components/explore/UserCard'
import DesktopFilterSidebar from '@/components/explore/DesktopFilterSidebar'
import MobileFilterModal from '@/components/explore/MobileFilterModal'
import { cn } from '@/lib/utils'
import { useUserStore } from '@/stores/useUserStore'
import useExploreUser from '@/hooks/useExploreUsers'
import { supabase } from '@/lib/supabase/client'
import SkeletonCard from '@/components/explore/SkeletonCard'
import useExploreSearch from '@/hooks/useExploreSearch'


interface Props {
  initialUsers: UserCardProfile[]
}

export default function ExploreClient({ initialUsers }: Props) {

  // 從 Zustand 取得目前的 Tab、切換函式、篩選條件
  const { profile, fetchUser } = useUserStore()
  const { activeTab, setActiveTab, filters } = useExploreStore()
  const { isLoading, matchedUsers, error } = useExploreUser({ initialUsers })

  // 手機篩選器 Modal 的開關狀態
  const [showMobileFilter, setShowMobileFilter] = useState(false)


  // 搜尋匡用的 custom hook + search query
  const [searchQuery, setSearchQuery] = useState("")
  const { results: searchResults, isSearching } = useExploreSearch(searchQuery)

  // 切到「附近的人」tab 時，請求 GPS 定位並更新資料庫
  // 確保距離計算使用精確的當前位置，而非 onboarding 時的 IP 定位
  useEffect(() => {
    if (activeTab !== 'nearby') return
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        await supabase
          .from('users')
          .update({ latitude, longitude })
          .eq('id', profile?.id)
        await fetchUser() // 更新 store，觸發 useExploreUsers 重新 fetch
      },
      (err) => {
        console.warn('定位失敗或使用者拒絕授權', err)
      }
    )
  }, [activeTab, profile?.id, fetchUser])


  const isSearchMode = searchQuery.trim().length > 0
  const displayUsers  = isSearchMode ? searchResults : matchedUsers
  const displayLoading = isSearchMode ? isSearching : isLoading // 判斷不同的loading狀態（搜尋模式 -> isSearching, 普通模式 -> isLoading）

  // 計算有幾個篩選條件已啟用（用來在篩選按鈕上顯示數量 badge）
  const activeFilterCount =
    filters.sportTypeIds.length +
    filters.genders.length +
    (filters.ageRange[0] !== 18 || filters.ageRange[1] !== 60 ? 1 : 0) +
    (activeTab === 'nearby' && filters.maxDistance !== 10 ? 1 : 0)

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-[1200px] mx-auto md:grid md:grid-cols-[200px_1fr] md:gap-6 px-4 py-4">

        {/* 桌機版左欄 - 篩選器 */}
        <DesktopFilterSidebar activeTab={activeTab}/>

        {/* 桌機版右欄(手機版全屏) : 搜尋框 + Tab + 卡片*/}
        <div>

          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-3'>

            <div className='flex gap-2 justify-end items-center order-1 md:order-2'>
              {/* 搜尋匡 */}
              <div className='flex content-center rounded-lg overflow-hidden border border-bg-tertiary focus-within:border-primary-hover'>
                <input type="search"
                  className={cn('bg-bg-secondary px-3 py-2 text-sm focus:outline-none')}
                  placeholder='搜尋地點或會員'
                  value={searchQuery}
                  onChange={(e)=>{setSearchQuery(e.target.value)}}
                />
              </div>
              {/* ? icon + tooltip */}
              <div className="relative group">
                <span className="text-text-secondary/50 cursor-default text-sm">?</span>

                <div className={cn(`
                  absolute right-0 top-7 w-57 hidden group-hover:block
                  bg-bg-tertiary border border-border rounded-lg px-3 py-2
                  text-xs text-text-secondary shadow-lg z-50 leading-relaxed
                `)}>
                  <p>輸入 <span className="text-primary font-medium">@暱稱</span> 搜尋特定會員</p>
                  <p>或 <span className="text-primary font-medium">地點名稱/地址</span> 找常去該地點的人</p>
                </div>
              </div>
              {/* 手機版篩選觸發鈕 */}
              <button
                onClick={() => setShowMobileFilter(true)}
                className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-text-secondary text-sm hover:border-primary hover:text-text-primary transition relative"
              >
                <FiSliders size={14} />
                <span>篩選</span>
                {/* 已啟用篩選條件數量 badge */}
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-primary text-bg-primary text-[10px] font-bold rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            <nav className='order-2 md:order-1 flex gap-1 justify-center'>
              <button
                className={cn("px-4 py-2 text-sm font-medium border-b-2 transition",
                  activeTab === 'common'
                    ? 'text-primary border-primary'
                    : 'text-text-secondary border-transparent hover:text-text-primary'
                )}
                onClick={() => setActiveTab('common')}
              >
                共同地點
              </button>
              <button
                className={cn("px-4 py-2 text-sm font-medium border-b-2 transition",
                  activeTab === 'nearby'
                    ? 'text-primary border-primary'
                    : 'text-text-secondary border-transparent hover:text-text-primary'
                )}
                onClick={() => setActiveTab('nearby')}
              >
                附近用戶
              </button>
            </nav>

          </div>

          {/* 用戶卡牌區 */}
          {displayLoading ? (
            // 載入中：skeleton 佔位卡片
            <section className='grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 mt-4'>
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i}/>
              ))}
            </section>
          ) : displayUsers.length === 0 ? (
            // 查無結果
            <div className='mt-16 flex flex-col items-center gap-2 text-text-secondary'>
              <span className='text-4xl'>🔍</span>
              <p className='text-sm'>找不到符合條件的使用者</p>
              <p className='text-xs'>試著調整篩選條件</p>
            </div>
          ) : (
            // !正常顯示卡片 -> 渲染 displayUsers
            <section className='grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-3 mt-4'>
              {displayUsers.map((u) => (
                <UserCard key={u.id} profile={u}/>
              ))}
            </section>
          )}

        </div>

      </div>

      {/* 手機版全螢幕篩選器 Modal */}
      <MobileFilterModal
        isOpen={showMobileFilter}
        onClose={() => setShowMobileFilter(false)}
        activeTab={activeTab}
      />
    </div>
  )
}
