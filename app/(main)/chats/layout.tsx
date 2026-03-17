'use client'

import ChatList from "@/components/chat/ChatList"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"


export default function ChatsLayout ({ children }: { children: React.ReactNode }) {

  const pathname = usePathname()
  const isConversation = pathname.startsWith('/chats/')

  return (
    <div className="flex h-[100dvh] md:h-[calc(100dvh-56px)] max-w-[1000px] mx-auto shadow">

      {/* 左側 - 聊天列表：手機的/chats 主畫面，桌機永遠顯示 */}
      <aside className={cn(
        "md:w-[300px] border-r border-border overflow-y-scroll bg-bg-secondary py-2",
        isConversation ? "hidden md:block" : "w-full"
      )}>
        <ChatList />
      </aside>

      {/* 右側 - 一對一聊天室內部：手機只在 /chats/[userId] 顯示，桌機永遠顯示 */}
      <main className={cn(
        "flex-1 flex-col overflow-hidden",
        isConversation 
        ? "flex" // 是個別對話就顯示
        : "hidden md:flex" // 不是的話就隱藏（手機畫面）
      )}>
        {children}
      </main>
    </div>
  )
}