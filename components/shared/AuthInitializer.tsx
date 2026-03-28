'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useUserStore } from '@/stores/useUserStore'
import { supabase } from '@/lib/supabase/client'
import { useChatStore } from '@/stores/useChatStore'
import { useNotificationStore } from '@/stores/useNotificationStore'
import { useRouter } from 'next/navigation'

function AuthInitializer(){
  const router = useRouter()
  const initAuth = useAuthStore((state) => state.initAuth)
  const setUser = useAuthStore((state) => state.setUser)
  const fetchUser = useUserStore((state) => state.fetchUser)
  const startRealtimeSync = useChatStore(state => state.startRealtimeSync)
  const stopRealtimeSync = useChatStore(state => state.stopRealtimeSync)
  const startRealtimeSyncForNotification = useNotificationStore(state => state.startRealtimeSyncForNotification)
  const stopRealtimeSyncForNotification = useNotificationStore(state => state.stopRealtimeSyncForNotification)

  useEffect(()=>{
    // 先做一次初始化（處理一般登入、重整頁面的情況）
    initAuth()

    // 監聽 auth 狀態變化
    // OAuth 登入後 session 建立好時，會觸發 SIGNED_IN 事件，確保 user 被正確寫入 store
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null) // 所有類型的 event 都會觸發並更新全域 state
        if (session) {        // 登入或 token 刷新時
          fetchUser()         // 重新載入使用者資料
          startRealtimeSync() // 訂閱聊天訊息的 unread 狀態
          startRealtimeSyncForNotification() // 訂閱「揪團」相關的通知的狀態
        }
      }
    )

    // 元件卸載時取消監聽
    return () => {
      subscription.unsubscribe()
      stopRealtimeSync()
      stopRealtimeSyncForNotification()
    }
  },[
    initAuth, setUser, fetchUser, 
    startRealtimeSync, stopRealtimeSync, 
    startRealtimeSyncForNotification, stopRealtimeSyncForNotification
  ]) // deps陣列底的東西其實不會改變，只是為了Eslint不要報錯

  // 處理登出後回上一頁，瀏覽器快照跳過 middleware 導致登入檢查異常的狀態
  useEffect(() => {
    const handlePageShow = async(event: PageTransitionEvent) => {
      if (event.persisted){
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) router.push('/login')
      }
    }

    window.addEventListener('pageshow', handlePageShow)

    return () => { window.removeEventListener('pageshow', handlePageShow) }
  }, [router])

  return null
}

export default AuthInitializer