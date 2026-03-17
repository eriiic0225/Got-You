'use client'
// MobileBottomNav.tsx
// 手機版底部導航 + 底部 spacer 的組合元件
// 在個別聊天室（/chats/[userId]）時，兩者同時隱藏，讓聊天室可以貼底顯示

import { usePathname } from 'next/navigation'
import BottomNav from './BottomNav'

export default function MobileBottomNav() {
  const pathname = usePathname()
  // /chats/xxx 才算是個別聊天室，/chats 本身（列表頁）仍顯示 nav
  const isConversation = /^\/chats\/.+/.test(pathname)

  if (isConversation) return null

  return (
    <>
      {/* spacer：撐開底部空間，避免內容被 BottomNav 遮住（只在手機顯示）*/}
      <div className="h-[65px] md:hidden" />
      {/* BottomNav 是 fixed，放在這裡只是讓它跟 spacer 一起受 isConversation 控制 */}
      <BottomNav />
    </>
  )
}
