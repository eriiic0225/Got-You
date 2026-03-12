// components/explore/MobileFilterModal.tsx
// 手機版篩選器：全螢幕 overlay，從上方滑入
// md 以上隱藏（桌機改用 DesktopFilterSidebar）

'use client'

import { useEffect } from 'react'
import FilterContent from './FilterContent'
import type { ExploreTab } from '@/stores/useExploreStore'

interface MobileFilterModalProps {
  isOpen: boolean
  onClose: () => void
  activeTab: ExploreTab
}

export default function MobileFilterModal({
  isOpen,
  onClose,
  activeTab,
}: MobileFilterModalProps) {

  // Modal 開啟時，鎖定 body 捲動（防止背景跟著滾）
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    // cleanup：元件卸載時確保恢復捲動
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    // fixed inset-0：覆蓋整個視窗
    // z-50：確保在 BottomNav（z-40）上方
    // md:hidden：桌機不顯示
    <div className="fixed inset-0 z-50 md:hidden flex flex-col bg-bg-primary p-2">

      {/* 可捲動的篩選器內容區 */}
      <div className="flex-1 overflow-y-auto">
        <FilterContent activeTab={activeTab} onClose={onClose} />
      </div>

    </div>
  )
}
