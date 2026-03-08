import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code') //取得google給的code參數(臨時授權碼)

  // 預設跳 onboarding，後續確認用戶狀態後再決定最終路徑
  let redirectPath = '/onboarding'

  // 原本的做法是「先建立 redirectResponse，再把 cookie 寫進去」
  // 但現在跳轉路徑要等查完資料庫才能確定，所以改成：
  // 步驟1：先用陣列暫存 cookie
  // 步驟2：查 DB 確認跳轉路徑
  // 步驟3：建立 redirectResponse，再把暫存的 cookie 全部寫進去
  const collectedCookies: { name: string; value: string; options: object }[] = []

  if (code) {
    // 建立 server client，把 cookie 暫存到 collectedCookies（不直接寫進 response）
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            // 先收集，稍後寫入 response
            collectedCookies.push(...cookiesToSet)
          },
        },
      }
    )

    // 用 Google 給的臨時授權碼換取正式 session，並將 session 存入 cookie
    await supabase.auth.exchangeCodeForSession(code)

    // 取得剛登入的用戶資料
    // 判斷新/老用戶的邏輯：gender 有值 = 已完成 onboarding = 老用戶
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('users')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()

      // gender 有值代表已完成 onboarding，直接進 explore
      if (profile?.onboarding_completed) redirectPath = '/explore'
    }
  }

  // 確定路徑後建立 redirect response，再把先前收集的 cookie 全部寫進去
  const redirectResponse = NextResponse.redirect(
    new URL(redirectPath, requestUrl.origin)
  )
  collectedCookies.forEach(({ name, value, options }) =>
    redirectResponse.cookies.set(name, value, options)
  )

  return redirectResponse
}
