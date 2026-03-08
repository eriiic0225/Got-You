'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'
import { supabase } from '@/lib/supabase/client'

function AuthInitializer(){
  const initAuth = useAuthStore((state) => state.initAuth)
  const setUser = useAuthStore((state) => state.setUser)

  useEffect(()=>{
    // 先做一次初始化（處理一般登入、重整頁面的情況）
    initAuth()

    // 監聽 auth 狀態變化
    // OAuth 登入後 session 建立好時，會觸發 SIGNED_IN 事件，確保 user 被正確寫入 store
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null) // 所有類型的 event 都會觸發並更新全域 User state
      }
    )

    // 元件卸載時取消監聽
    return () => subscription.unsubscribe()
  },[initAuth, setUser]) // deps陣列底的東西其實不會改變，只是為了Eslint不要報錯

  return null
}

export default AuthInitializer