// 用來處理總未讀數的store

import { supabase } from "@/lib/supabase/client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";


interface ChatState {
  totalUnread: number
  currentConversationId: string
  startRealtimeSync: () => Promise<void>
  stopRealtimeSync: () => void
  setCurrentConversationId: (id: string) => void
}

// devtools middleware 讓 Redux DevTools 擴充套件可以即時查看 store 狀態變化
export const useChatStore = create<ChatState>()(devtools((set, get) => {

  const fetchTotalUnread = async (user_id: string) => {
    
    const { currentConversationId } = get()  // 從 store 讀最新值

    let query = supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user_id)
      .eq('is_read', false)

    // 如果正在對話內部，排除和該用戶的 unread count
    if (currentConversationId) {
      query = query.neq('sender_id', currentConversationId)
    }
    
    const { count, error } = await query

    console.log('[fetchTotalUnread]', { count, error, currentConversationId })

    if (error) { console.error(error); return }

    set({totalUnread: count ?? 0})
  }

  let channel: ReturnType<typeof supabase.channel> | null = null

  return {
    totalUnread: 0,
    currentConversationId: "",

    startRealtimeSync: async () => {
      const { data: { session } } = await supabase.auth.getSession()
      console.log('[startRealtimeSync]', { hasSession: !!session, hasChannel: !!channel })
      if (!session) return
      // 每次都重抓未讀數（處理 TOKEN_REFRESHED 時 ChatList 已更新但 nav badge 沒跟上的問題）
      await fetchTotalUnread(session.user.id)
      if (channel) return  // 已訂閱就不重複建立 channel，但上面的 fetchTotalUnread 已經跑過了
      channel = supabase.channel(`${session.user.id}_unread_count`)
        .on(
          'postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'messages',
            // 進階：過濾出與自己相關的訊息
            filter: `receiver_id=eq.${session.user.id}`
          }, 
          // callback function
          (payload) => {
            console.log('新訊息！', payload.new)
            fetchTotalUnread(session.user.id) // 重抓unread訊息數
          })
        .subscribe()
    },

    stopRealtimeSync: () => {
      if (channel) {
        supabase.removeChannel(channel)
        channel = null
      }
    },

    setCurrentConversationId: (id: string) => {
      set({currentConversationId: id})
    }
  }
}, { name: 'ChatStore' }))