// app/(main)/layout.tsx
// (main) 群組下所有頁面共用的 layout（explore、posts、chats、profile）
// 自動套用 TopNav（桌機）和 BottomNav（手機）

import BottomNav from '@/components/shared/BottomNav'
import TopNav from '@/components/shared/TopNav'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* 桌機版：頂部導航，高度 56px（h-14），內容需要 pt-14 避免被遮住 */}
      <TopNav />

      {/* 主要內容區：
          - md:pt-14  → 桌機版讓出頂部 nav 的高度
          - pb-[65px] → 手機版讓出底部 nav 的高度
          - md:pb-0   → 桌機版不需要底部留白 */}
      <main className="md:pt-14 pb-[65px] md:pb-0">
        {children}
      </main>

      {/* 手機版：底部導航 */}
      <BottomNav />
    </div>
  )
}
