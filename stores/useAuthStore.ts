import { create } from 'zustand'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  initAuth: () => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  setUser: (user) => set({ user, isLoading: false }),

  // 初始化：從 Supabase 取得當前使用者
  initAuth: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      set({ user, isLoading: false })
    } catch (error) {
      console.error('Failed to initialize auth:', error)
      set({ user: null, isLoading: false })
    }
  },

  // 登出
  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null })
  }
}))