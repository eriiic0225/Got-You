import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

// 用 discriminated union 表達 auth 的三種狀態，避免「user + isLoading」兩個 boolean
// 隱性組合出的不合法狀態（例如 isLoading=true 卻有 user）
export type AuthState =
  | { status: 'initializing' }                       // 還沒問過 Supabase
  | { status: 'unauthenticated' }                    // 確認未登入
  | { status: 'authenticated'; user: User }          // 已登入，user 必有值

interface AuthStore {
  auth: AuthState
  setUser: (user: User | null) => void
  initAuth: () => Promise<void>
  logout: () => Promise<void>
}

// 把 User | null 對應到 AuthState 的 helper
const toAuthState = (user: User | null): AuthState =>
  user ? { status: 'authenticated', user } : { status: 'unauthenticated' }

export const useAuthStore = create<AuthStore>((set) => ({
  auth: { status: 'initializing' },

  setUser: (user) => set({ auth: toAuthState(user) }),

  // 初始化：從 Supabase 取得當前使用者
  initAuth: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      set({ auth: toAuthState(user) })
    } catch (error) {
      console.error('Failed to initialize auth:', error)
      set({ auth: { status: 'unauthenticated' } })
    }
  },

  // 登出
  logout: async () => {
    await supabase.auth.signOut()
    set({ auth: { status: 'unauthenticated' } })
  }
}))
