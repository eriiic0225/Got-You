import { supabase } from '@/lib/supabase/client'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code') //取得google給的code參數(臨時授權碼)

  if (code) {
    await supabase.auth.exchangeCodeForSession(code) // 拿code跟supabase換session
  }

  // 導向到探索頁面
  return NextResponse.redirect(new URL('/onboarding', requestUrl.origin))
}
