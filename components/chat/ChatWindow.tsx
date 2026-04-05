'use client'

import { useEffect, useRef, useState, Fragment } from "react"
import { supabase } from "@/lib/supabase/client"
import { useUserStore } from "@/stores/useUserStore"
import type { ConversationPartner, Message } from "@/types/chat"
import ChatInput from "./ChatInput"
import MessageBubble from "./MessageBubble"
import SkeletonChatWindow from "./SkeletonChatWindow"
import Link from "next/link"
import { IoMdArrowBack } from "react-icons/io";
import { isTimeDiffExceeded } from "@/lib/utils"
import { useChatStore } from "@/stores/useChatStore"
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'

interface Props {
  partnerId: string
}

export default function ChatWindow({ partnerId }: Props){

  const profile = useUserStore((state) => state.profile)
  const setCurrentConversationId = useChatStore((state) => state.setCurrentConversationId)
  const [messages, setMessages] = useState<Message[]>([])
  const [partner, setPartner] = useState<ConversationPartner | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const firstUnreadRef = useRef<HTMLDivElement>(null)   // 未讀提示的錨點
  const hasInitialScrolled = useRef(false)               // 是否已完成初次捲動

  // 1. 查詢對方的基本資料
  useEffect(() => {
    // partnerId 是 prop，同步就能拿到，不需要等 fetchPartner 回來才設
    // 若等 async query 完成才 setCurrentConversationId，會和 markAsRead（Effect 3）產生 race condition：
    // markAsRead 的 UPDATE 觸發 Realtime → fetchTotalUnread 執行時 currentConversationId 還是 ""
    // → totalUnread 沒有正確排除當前對話 → TopNav badge 不歸零
    setCurrentConversationId(partnerId)

    async function fetchPartner() {
      const { data, error } = await supabase
        .from('users')
        .select('id, nickname, avatar_url')
        .eq('id', partnerId)
        .single()

      if (error) {
        console.error('查詢對方資料失敗', error)
        return
      }

      setPartner(data as ConversationPartner)
    }

    fetchPartner()

    return () => { setCurrentConversationId("") }
  },[partnerId, setCurrentConversationId])


  // 2. 查詢兩人之間的訊息記錄，完成後再標記已讀
  // 注意：markAsRead 必須在 setMessages 之後執行，否則會有 race condition：
  // 若 UPDATE 先 commit，SELECT 讀到的 is_read 全為 true，firstUnreadIndex = -1，無法捲到未讀位置
  useEffect(() => {
    if (!profile?.id) return

    async function fetchMessages(){
      hasInitialScrolled.current = false
      setIsLoading(true)
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        // 取出「我傳給對方」OR「對方傳給我」的所有訊息
        .or(
          `and(sender_id.eq.${profile!.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${profile!.id})`
        )
        .order('created_at', { ascending: true }) // 從舊到新排列

      if (error) {
        console.error('查詢訊息失敗', error)
        setIsLoading(false)
        return
      }

      // 先更新 local state（保留原始 is_read，firstUnreadIndex 才能正確計算）
      setMessages(data as Message[])
      setIsLoading(false)

      // 再標記已讀（觸發 UPDATE → useChatStore Realtime 自動更新 totalUnread）
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('receiver_id', profile!.id)
        .eq('sender_id', partnerId)
        .eq('is_read', false)
    }
    fetchMessages()

  }, [profile, partnerId])

  // 4. Realtime：訂閱對方傳來的新訊息
  useEffect(() => {
    if (!profile?.id) return

    const channel = supabase.channel(`chat-window-${partnerId}`)
      .on<Message>(
        'postgres_changes', 
        {
          event:'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${profile.id}`
        },
        async (payload) => {

          if (payload.new.sender_id !== partnerId) return

          setMessages((prev) => [...prev, payload.new])

          // 即時標記為已讀（因為使用者正在看這個對話）
          await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('id', payload.new.id)
        }
      ).subscribe()

      return () => { 
        supabase.removeChannel(channel)
      }

  }, [profile, partnerId])


  // 捲動到最早一次未讀 ＆ messages 更新時捲到底
  useEffect(() => {
    if (!messages.length) return

    if (!hasInitialScrolled.current){
      hasInitialScrolled.current = true
      // 有未讀 → 捲到橫槓位置；沒有 → 捲到底
      const target = firstUnreadRef.current ?? messagesEndRef.current
      target?.scrollIntoView({ behavior: 'smooth' })
    }else {
      // 後續的新訊息 → 永遠捲到底
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  
  const firstUnreadIndex = messages.findIndex(
    msg => msg.receiver_id === profile?.id && !(msg.is_read)
  )
  
  
  // 用來樂觀更新自己送出的訊息（加上 Realtime 監聽不到自己傳的訊息）
  const handleMessageSent = (newMessage: Message) => {
    setMessages(prev => [...prev, newMessage])
  }

  // 回滾樂觀更新了但其實沒送出的訊息
  const handleRollback = (tempId: string) => {
    setMessages(prev => prev.filter(m => m.id !== tempId))
  }

  return (
      <div className="flex flex-col h-full border-r border-border">

        {/* header */}
        <header className="flex gap-2 items-center border-b border-border p-2 shadow">
          {/* 返回按鍵 */}
          <Link 
            href="/chats" 
            title="返回聊天室列表"
            className="flex items-center p-1.5 rounded-full hover:bg-bg-tertiary"
          >
            <IoMdArrowBack size={20} className="text-primary"/>
          </Link>
          {/* 頭貼 + 名稱：點擊前往對方的個人頁 */}
          <Link
            href={`/profile/${partnerId}`}
            title="前往用戶資料頁"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            {partner?.avatar_url
              ? <img
                  src={partner?.avatar_url}
                  alt="頭貼"
                  className="size-8 rounded-full border border-border object-cover"
                />
              : <div className="size-8 rounded-full bg-bg-tertiary border border-border" />}
            {isLoading ? (
              <div className="h-4 bg-bg-tertiary rounded w-24 animate-pulse" />
            ) : (
              <h3 className="font-semibold">{partner?.nickname}</h3>
            )}
          </Link>
        </header>

        {/* 訊息列表：載入中顯示 skeleton，載入完顯示訊息 */}
        <OverlayScrollbarsComponent 
          className="flex-1 pt-2"
          element="div"
          options={{
            scrollbars: {
              autoHide: 'scroll',
              autoHideDelay: 500,
              theme: 'os-theme-light', // 淺色模式：白色半透明滾動條
            },
          }}
        >
          {isLoading ? (
            <SkeletonChatWindow />
          ) : (
            <>
              {messages.map((msg, index)=>{
                const isFirstUnread = index === firstUnreadIndex // 第一則未讀的狀態
                const isOwn = msg.sender_id === profile!.id
                const nextMsg = messages[index + 1]
                const isTimeExceeded = isTimeDiffExceeded(msg, nextMsg)
                const isDifferentSender = nextMsg?.sender_id !== msg.sender_id;
                const showAvatar = !isOwn && (isDifferentSender || isTimeExceeded)
                // 有下一則訊息 && 是同一個人 && 時間超過了 或 是不同人傳的 -> 加大間距
                const hasExtraMargin = (nextMsg && !isDifferentSender && isTimeExceeded) || (isDifferentSender)
                return (
                  <Fragment key={msg.id}>
                    {isFirstUnread && (
                      <div ref={firstUnreadRef} className="flex items-center gap-3 px-4 py-3">
                        <div className="flex-1 h-px bg-primary/30" />
                        <span className="text-xs text-primary/60 font-medium shrink-0">
                          以下為未讀訊息
                        </span>
                        <div className="flex-1 h-px bg-primary/30" />
                      </div>
                    )}
                    <MessageBubble
                      message={msg} isOwn={isOwn}
                      showAvatar={showAvatar}
                      hasExtraMargin={hasExtraMargin}
                      partnerAvatar={partner?.avatar_url ?? null}
                    />
                  </Fragment>
                )
              })}
              <div ref={messagesEndRef} />  {/* 捲動錨點 */}
            </>
          )}
        </OverlayScrollbarsComponent>


        {/* 輸入框 */}
        <div className="shrink-0">
          <ChatInput receiverId={partnerId} onMessageSent={handleMessageSent} onRollback={handleRollback}/>
        </div>
      </div>
    )
}