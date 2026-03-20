'use client'

import { useEffect, useRef, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import { useUserStore } from "@/stores/useUserStore"
import type { ConversationPartner, Message } from "@/types/chat"
import ChatInput from "./ChatInput"
import MessageBubble from "./MessageBubble"
import SkeletonChatWindow from "./SkeletonChatWindow"
import Link from "next/link"
import { IoMdArrowBack } from "react-icons/io";
import { isTimeDiffExceeded } from "@/lib/utils"


interface Props {
  partnerId: string
}

export default function ChatWindow({ partnerId }: Props){

  const profile = useUserStore((state) => state.profile)
  const [messages, setMessages] = useState<Message[]>([])
  const [partner, setPartner] = useState<ConversationPartner | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 1. 查詢對方的基本資料
  useEffect(() => {
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
  },[partnerId])


  // 2. 查詢兩人之間的訊息記錄
  useEffect(() => {
    if (!profile?.id) return

    async function fetchMessages(){
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

      setMessages(data as Message[])
      setIsLoading(false)
    }
    fetchMessages()

  }, [profile, partnerId])

  // 3. 進入聊天室時，將對方傳來的未讀訊息標記為已讀
  // 觸發 UPDATE -> useChatStore 的 Realtime 訂閱會自動更新 totalUnread
  useEffect(() => {
    if (!profile?.id) return

    async function markAsRead(){
      await supabase
        .from('messages')
        .update({is_read: true})
        .eq('receiver_id', profile!.id)
        .eq('sender_id', partnerId)
        .eq('is_read', false)
    }
    markAsRead()

  },[profile, partnerId])

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
        (payload) => {

          if (payload.new.sender_id !== partnerId) return

          setMessages((prev) => [...prev, payload.new])

          // 即時標記為已讀（因為使用者正在看這個對話）
          supabase
            .from('messages')
            .update({ is_read: true })
            .eq('id', payload.new.id)
        }
      ).subscribe()

      return () => { 
        supabase.removeChannel(channel)
      }

  }, [profile, partnerId])

  // messages 更新時捲到底
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
        <div className="flex-1 overflow-y-auto pt-2">
          {isLoading ? (
            <SkeletonChatWindow />
          ) : (
            <>
              {messages.map((msg, index)=>{
                const isOwn = msg.sender_id === profile!.id
                const nextMsg = messages[index + 1]
                const isTimeExceeded = isTimeDiffExceeded(msg, nextMsg)
                const isDifferentSender = nextMsg?.sender_id !== msg.sender_id;
                const showAvatar = !isOwn && (isDifferentSender || isTimeExceeded)
                // 有下一則訊息 && 是同一個人 && 時間超過了 -> 加大間距
                const hasExtraMargin = nextMsg && !isDifferentSender && isTimeExceeded
                return (
                  <MessageBubble
                    key={msg.id}
                    message={msg} isOwn={isOwn}
                    showAvatar={showAvatar}
                    hasExtraMargin={hasExtraMargin}
                    partnerAvatar={partner?.avatar_url ?? null}
                  />
                )
              })}
              <div ref={messagesEndRef} />  {/* 捲動錨點 */}
            </>
          )}
        </div>


        {/* 輸入框 */}
        <div className="shrink-0">
          <ChatInput receiverId={partnerId} onMessageSent={handleMessageSent} onRollback={handleRollback}/>
        </div>
      </div>
    )
}