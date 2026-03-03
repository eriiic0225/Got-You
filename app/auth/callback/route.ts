  import { createServerClient } from '@supabase/ssr'
  import { NextResponse } from 'next/server'
  import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code') //取得google給的code參數(臨時授權碼)

  // 先建立 redirect response，之後把 cookie 寫進這個 response 回傳給瀏覽器
  const redirectResponse = NextResponse.redirect(
    new URL('/onboarding', requestUrl.origin)
  )

  if (code) {
    // 建立 server client，並把 cookie 寫進 redirectResponse
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              redirectResponse.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    await supabase.auth.exchangeCodeForSession(code)
  }

  return redirectResponse
}
