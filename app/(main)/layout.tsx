// app/(main)/layout.tsx
// (main) 群組下所有頁面共用的 layout（explore、posts、chats、profile）
// 自動套用 TopNav（桌機）和 BottomNav（手機）

import TopNav from '@/components/shared/TopNav'
import MobileBottomNav from '@/components/shared/MobileBottomNav'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* 桌機版：頂部導航，高度 56px（h-14），內容需要 pt-14 避免被遮住 */}
      <TopNav />

      {/* 主要內容區：
          - md:pt-14 → 桌機版讓出頂部 nav 的高度
          - 底部留白改由 MobileBottomNav 內的 spacer 處理，
            這樣在聊天室（/chats/[userId]）時可以連同 spacer 一起隱藏 */}
      <main className="md:pt-14">
        {children}
        {/* 手機版底部 nav + spacer（聊天室內會自動隱藏） */}
        <MobileBottomNav />
      </main>
    </div>
  )
}
