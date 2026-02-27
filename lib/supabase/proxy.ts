// lib/supabase/proxy.ts
// 職責：建立 server 端的 Supabase client，並處理 session 的讀取與更新
// 每次 request 進來時都會執行，確保 JWT token 保持最新狀態

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {

  // Step 1: 建立一個「預設放行」的 response 物件
  // NextResponse.next() 的意思是：「這個 request 正常繼續，不做任何攔截」
  // 我們用 let 宣告，因為後面 setAll 可能會重新建立它
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Step 2: 建立 server 端專用的 Supabase client
  // 注意：這裡不能用 lib/supabase/client.ts 的 browser client
  // 因為 browser client 讀 localStorage，但 server 端沒有 localStorage
  // server 端只能透過 Cookie 讀取 session
  //
  // ⚠️ 官方警告：不要把這個 client 存成全域變數
  //    必須每次 request 都重新建立，避免不同使用者的 session 互相污染
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        // getAll：告訴 Supabase 怎麼從 request 讀取 Cookie
        // request.cookies.getAll() 會回傳所有 cookie 的陣列
        getAll() {
          return request.cookies.getAll()
        },

        // setAll：告訴 Supabase 怎麼把更新後的 Cookie 寫回去
        // 當 JWT token 快過期時，Supabase 會自動更新 token 並呼叫這個方法
        // 必須同時寫進 request 和 response：
        //   - 寫進 request：讓這次 request 後續的程式碼能看到新 token
        //   - 寫進 response：讓瀏覽器收到新 token，下次 request 時帶上它
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    }
  )

  // Step 3: 取得當前使用者的登入狀態
  // getClaims() 直接讀取 Cookie 裡的 JWT token 內容，不需要發 request 給 Supabase server
  // 比 getUser()（需要網路請求）快很多，適合在每次 request 都執行的 proxy 裡用
  //
  // ⚠️ 官方警告：createServerClient 和 getClaims() 之間不要插入其他程式碼
  //    否則可能導致使用者隨機被登出（token 更新時機的問題）
  const { data } = await supabase.auth.getClaims()

  // claims 包含 JWT 裡的使用者資訊（user id、email 等）
  // 如果沒有登入，claims 會是 null
  const user = data?.claims

  // Step 4: 路由保護邏輯
  // 根據「有沒有登入」和「現在在哪個頁面」決定要不要導向
  const pathname = request.nextUrl.pathname

  const isPublicPath =
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/auth')

  // 規則一：沒登入 + 不是公開路徑 → 導向 /login
  if (!user && !isPublicPath){
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 規則二：已登入 + 在登入/註冊頁 → 導向 /explore
  if (user && (pathname.startsWith('/login') || pathname.startsWith('/signup'))){
    const url = request.nextUrl.clone()
    url.pathname = '/explore'
    return NextResponse.redirect(url)
  }

  // Step 5: 回傳 response
  // ⚠️ 重要：必須回傳 supabaseResponse，不能自己 new 一個新的 NextResponse
  // 因為 supabaseResponse 裡帶有 Supabase 更新過的 Cookie
  // 如果回傳別的 response，更新後的 token 就不會傳回給瀏覽器，導致 session 異常
  return supabaseResponse
}
