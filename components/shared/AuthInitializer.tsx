'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'

function AuthInitializer(){
  const initAuth = useAuthStore((state) => state.initAuth) // 從zustand取得初始化函式

  useEffect(()=>{
    initAuth() //使用useEffect自動運行(一次)
  },[initAuth])

  return null
}

export default AuthInitializer