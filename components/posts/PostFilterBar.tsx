'use client'
// components/posts/PostFilterBar.tsx
// 揪團列表的篩選列：運動類型 chips + 快速篩選 toggles
// 所有篩選都是 client-side（父元件用 useMemo 過濾已抓資料），不重新 fetch

import { cn } from '@/lib/utils'

// ── 型別 ─────────────────────────────────────────────────────────

export interface PostFilters {
  sportTypeIds: string[]  // 空陣列 = 全部不篩
  onlyUpcoming: boolean   // 只顯示活動時間尚未過期的（或未填時間的）
  hasSlots: boolean       // 只顯示還有名額的（未設人數上限視為無限）
}

interface Props {
  sports: { id: string; name: string; icon: string }[]
  filters: PostFilters
  onChange: (filters: PostFilters) => void
}

// ── 元件 ─────────────────────────────────────────────────────────

export default function PostFilterBar({ sports, filters, onChange }: Props) {

  // 切換單一運動類型（已選則取消，未選則加入）
  const toggleSport = (id: string) => {
    const next = filters.sportTypeIds.includes(id)
      ? filters.sportTypeIds.filter(s => s !== id)
      : [...filters.sportTypeIds, id]
    onChange({ ...filters, sportTypeIds: next })
  }

  return (
    <div className="space-y-2 mb-5">

      {/* ── 運動類型：橫向捲動 chips ── */}
      <div className="flex gap-1 overflow-x-auto pb-0.5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

        {/* 「全部」chip */}
        <button
          onClick={() => onChange({ ...filters, sportTypeIds: [] })}
          className={cn(
            "shrink-0 px-2 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer",
            filters.sportTypeIds.length === 0
              ? "bg-primary text-bg-primary"
              : "bg-bg-secondary border border-border text-text-secondary hover:border-primary/50"
          )}
        >
          全部
        </button>

        {sports.map(sport => {
          const isActive = filters.sportTypeIds.includes(sport.id)
          return (
            <button
              key={sport.id}
              onClick={() => toggleSport(sport.id)}
              className={cn(
                "shrink-0 flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium transition-colors cursor-pointer",
                isActive
                  ? "bg-primary text-bg-primary"
                  : "bg-bg-secondary border border-border text-text-secondary hover:border-primary/50"
              )}
            >
              {/* <span>{sport.icon}</span> */}
              <span>{sport.name}</span>
            </button>
          )
        })}
      </div>

      {/* ── 快速篩選 toggles ── */}
      <div className="flex gap-2">

        <button
          onClick={() => onChange({ ...filters, onlyUpcoming: !filters.onlyUpcoming })}
          className={cn(
            "px-2 py-1 rounded-full text-sm font-medium transition-colors cursor-pointer",
            filters.onlyUpcoming
              ? "bg-primary/15 border border-primary/40 text-primary"
              : "bg-bg-secondary border border-border text-text-secondary hover:border-primary/50"
          )}
        >
          即將舉行
        </button>

        <button
          onClick={() => onChange({ ...filters, hasSlots: !filters.hasSlots })}
          className={cn(
            "px-2 py-1 rounded-full text-sm font-medium transition-colors cursor-pointer",
            filters.hasSlots
              ? "bg-primary/15 border border-primary/40 text-primary"
              : "bg-bg-secondary border border-border text-text-secondary hover:border-primary/50"
          )}
        >
          還有名額
        </button>

      </div>

    </div>
  )
}
