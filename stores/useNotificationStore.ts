// 處理揪團貼文相關的即時通知

import { supabase } from "@/lib/supabase/client";
import { create } from "zustand";

export interface Notification {
  id: string
  type: 'post_comment' | 'post_join' | 'comment_thread'
  created_at: string
  is_read: boolean
  post_id: string
  sender: {nickname: string, avatar_url: string}
  post: {title: string}
}

interface NotificationState {
  unreadCount: number
  notifications: Notification[]
  startRealtimeSyncForNotification: () => Promise<void>
  stopRealtimeSyncForNotification: () => void
  markAllRead: () => Promise<void>
}

export const useNotificationStore = create<NotificationState>((set) => {

  // 工具函式 - 用來更新通知的最新狀態
  const fetchNotification = async (user_id: string) => {

    const { data, error } = await supabase
      .from('notifications')
      .select(`
        id,
        type,
        created_at,
        is_read,
        post_id,
        sender:sender_id (
          nickname,
          avatar_url
        ),
        post:post_id (
          title
        )
      `)
      .eq('receiver_id', user_id)
      .order('created_at', { ascending: false });

      if (error) { console.error(error); return }
      
      set({
        unreadCount: data.filter(n => !n.is_read).length, 
        notifications: data.map(n => ({
          ...n,
          sender: n.sender as unknown as Notification['sender'],
          post:   n.post   as unknown as Notification['post']
        }))
      })
  }

  let channel: ReturnType<typeof supabase.channel> | null = null


  return {
    unreadCount: 0,
    notifications: [],

    startRealtimeSyncForNotification: async() => {
      if (channel) return
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      await fetchNotification(session.user.id)  // 初始化
      channel = supabase.channel(`${session.user.id}_notification`)
        .on(
          'postgres_changes', 
          {
            event: '*', 
            schema: 'public', 
            table: 'notifications',
            // 進階：過濾出與自己相關的訊息
            filter: `receiver_id=eq.${session.user.id}`
          },
          () => {
            fetchNotification(session.user.id) // 重抓unread訊息數
          })
        .subscribe()
    },

    stopRealtimeSyncForNotification: () => {
      if (channel) {
        supabase.removeChannel(channel)
        channel = null
      }
    },

    markAllRead: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      await supabase
        .from('notifications')
        .update({is_read: true})
        .eq('receiver_id', session.user.id)
        .eq('is_read', false)
    }
  }
})