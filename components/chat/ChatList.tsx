'use client'

import { supabase } from "@/lib/supabase/client"
import { cn, formatChatTime } from "@/lib/utils"
import { useUserStore } from "@/stores/useUserStore"
import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface Chat {
  partner_id: string
  sender_id: string
  nickname: string
  avatar_url: string | null
  last_message: string
  unread_count: number
  created_at: string
}


export default function ChatList(){

  const profile = useUserStore(state => state.profile)
  const [chats, setChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const lastpath = usePathname().split("/chats")[1]

  useEffect(()=>{
    if (!profile) return
    async function fetchChatsPreview(myId: string) {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *, 
          sender:users!sender_id(nickname, avatar_url), 
          receiver:users!receiver_id(nickname, avatar_url)
          `)
        .or(`sender_id.eq.${myId},receiver_id.eq.${myId}`)
        .order('created_at', { ascending: false });

      if (error) {
        setError("載入聊天列表失敗")
        setIsLoading(false)
        return
      }

      if (data){
        // 聚合邏輯
        // console.log(data)
        const grouped = data.reduce((acc, msg)=>{
          // Step 1: 除了本人以外，對話的另一方是誰
          const partnerId = msg.sender_id === myId ? msg.receiver_id : msg.sender_id
          const partnerInfo = msg.sender_id === myId ? msg.receiver : msg.sender

          // Step 2: 第一次看到這個 partner → 建立記錄（第一筆 = 最新訊息，因為已排序 DESC）
          if (!acc[partnerId]){
            acc[partnerId] = {
              sender_id: msg.sender_id,
              partner_id: partnerId,
              nickname: partnerInfo.nickname,
              avatar_url: partnerInfo.avatar_url ?? null,
              last_message: msg.content ?? '📷 圖片',
              unread_count: 0,
              created_at: msg.created_at,
            }
          }

          // Step 3: 累加未讀數（條件：receiver 是我 且 還沒讀）
          if (msg.receiver_id === myId && !msg.is_read){
            acc[partnerId].unread_count++
          }

          return acc
        }, {} as Record<string, Chat>)
        // 最後轉成陣列
        const chatList = Object.values(grouped)
        console.log("聊天室列表資訊", chatList)
        setChats(chatList as Chat[])
      }
    }
    // 初始 fetch
    fetchChatsPreview(profile.id!)

    // 訂閱 Realtime，才能即時更新狀態
    const myId = profile.id!
    const channel = supabase.channel(`chatlist-${myId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', // 別人傳給我的訊息
        filter: `receiver_id=eq.${myId}` }, () => fetchChatsPreview(myId))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', // 我已讀了訊息
        filter: `receiver_id=eq.${myId}` }, () => fetchChatsPreview(myId))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', // 我傳出去的訊息
        filter: `sender_id=eq.${myId}` }, () => fetchChatsPreview(myId))
      .subscribe()

    return () => supabase.removeChannel(channel)

  },[profile])

  return (
    <div>
      <h3 className="ml-3 md:-mt-1 pb-1 md:pb-0 font-semibold text-sm text-text-secondary tracking-wider">
        聊天室列表
      </h3>
      { chats ? (
        <ul className="space-y-0.5">
          {chats.map(chat => {
            const isActive = lastpath === `/${chat.partner_id}`
            return (
            <li key={chat.partner_id}>
              <Link
                href={`/chats/${chat.partner_id}`}
                className={cn("flex gap-3 items-center mx-2 px-3 py-3 hover:bg-bg-tertiary rounded-lg transition-colors",
                  isActive && "bg-bg-tertiary"
                )}
              >
                {/* 頭像 */}
                {chat.avatar_url
                  ? <img
                      className="size-10 aspect-square rounded-full border border-border shrink-0 shadow-bg-tertiary shadow-2xl"
                      src={chat.avatar_url} alt="頭貼"/>
                  : <div
                      className="size-10 bg-bg-tertiary rounded-full border border-border shrink-0 shadow-bg-tertiary shadow-2xl"
                  ></div>}
                {/* 人名跟最後一則訊息 */}
                <div className="grow min-w-0">
                  <h3 className="text-sm font-semibold truncate">{chat.nickname}</h3>
                  <p className="text-xs text-text-secondary truncate">{chat.sender_id === profile?.id && "你："}{chat.last_message}</p>
                </div>
                {/* 時間跟未讀 */}
                <div className="flex flex-col gap-1 items-center shrink-0">
                  <p className="text-xs text-text-secondary">{formatChatTime(chat.created_at)}</p>
                  <div className={cn(
                    "bg-[tomato] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1",
                    chat.unread_count === 0 && "invisible"
                  )}>{chat.unread_count > 99 ? '99+' : chat.unread_count}</div>
                </div>
              </Link>
            </li>
          )})}
        </ul>
      ):(
        <div>還沒有任何聊天</div>
      )}
    </div>
  )
}