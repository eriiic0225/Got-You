// components/explore/DesktopFilterSidebar.tsx
// 桌機版篩選器側欄：只在 md 以上顯示，固定在左側
// 用 sticky 讓它跟著頁面滾動但不超出視窗

import FilterContent from './FilterContent'
import type { ExploreTab } from '@/stores/useExploreStore'

interface DesktopFilterSidebarProps {
  activeTab: ExploreTab
}

export default function DesktopFilterSidebar({ activeTab }: DesktopFilterSidebarProps) {
  return (
    // hidden md:block：手機完全隱藏，桌機才顯示
    // w-56：固定寬度 224px
    // sticky top-[72px]：固定在 TopNav（56px）+ 一些間距的下方，隨頁面滾動
    // self-start：讓側欄高度由內容決定，不會撐滿整個 flex row
    <aside className="hidden md:block w-full shrink-0 sticky top-[72px] self-start mt-2">
      <div className="bg-bg-secondary rounded-2xl overflow-y-auto max-h-[calc(100vh-88px)]">
        <FilterContent activeTab={activeTab} />
      </div>
    </aside>
  )
}
