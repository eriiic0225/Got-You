# 核心認證與 Onboarding 實作計劃

> **For Claude:** 實作時請按照 CLAUDE.md 的學習階段規範，每段程式碼都要加上詳細的解說註解。

**Goal:** 完成認證系統（登入頁、路由保護、Auth Store 初始化）+ Onboarding 流程，讓使用者能完整地註冊、登入、填寫個人資料。

**Architecture:** 使用 Next.js Middleware 保護路由，Zustand 管理全域認證狀態，在 Root Layout 初始化 Auth Store。Onboarding 頁面讓新使用者在第一次登入後完善個人資料。

**Tech Stack:** Next.js 15 App Router、Supabase Auth、Zustand、React Hook Form、Zod、Tailwind CSS

---

## 目前進度

### ✅ 已完成
- Landing Page (`/`)
- 註冊頁面 (`/signup`) — Email/Password + Google OAuth
- Supabase Client (`lib/supabase/client.ts`)
- Auth Callback Route (`/auth/callback`)
- Auth Store (`stores/useAuthStore.ts`) — 已建立但尚未初始化
- 測試用 Explore 頁面 (`/explore`)

### ⬜ 待完成
- 登入頁面 (`/login`)
- Root Layout 初始化 Auth Store
- Middleware 路由保護
- Onboarding 流程

---

## Phase A：完成認證系統

### Task 1：在 Root Layout 初始化 Auth Store

**問題：** `useAuthStore` 已建立，但從未被呼叫。
**解法：** 在 Root Layout 建立一個 Client Component 來初始化。

**為什麼不直接在 Layout 呼叫？**
Next.js 的 `layout.tsx` 預設是 Server Component，無法使用 `useState`、`useEffect`、Zustand 等客戶端功能，所以需要拆出一個獨立的 Client Component。

**Files:**
- 建立: `components/shared/AuthInitializer.tsx`
- 修改: `app/layout.tsx`

**Step 1: 建立 AuthInitializer 元件**

```tsx
// components/shared/AuthInitializer.tsx
'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/useAuthStore'

// 這個元件負責在 App 啟動時初始化認證狀態
// 放在 Root Layout 中，確保每個頁面都能取得登入狀態
export function AuthInitializer() {
  const initAuth = useAuthStore((state) => state.initAuth)

  useEffect(() => {
    // App 啟動時呼叫一次，從 Supabase 取得目前的登入使用者
    initAuth()
  }, [initAuth])

  // 這個元件不渲染任何 UI，只負責初始化
  return null
}
```

**Step 2: 在 Root Layout 引入 AuthInitializer**

```tsx
// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { AuthInitializer } from '@/components/shared/AuthInitializer'

export const metadata: Metadata = {
  title: 'Got You 咖揪',
  description: '找到你的運動夥伴',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-TW">
      <body className="antialiased">
        {/* 初始化認證狀態，不渲染任何 UI */}
        <AuthInitializer />
        {children}
      </body>
    </html>
  )
}
```

**Step 3: 測試**
- 開啟 http://localhost:3000
- 打開 React DevTools → 找到 useAuthStore
- 確認 `isLoading` 從 `true` 變成 `false`
- 如果已登入，`user` 應該有值

---

### Task 2：建立完整的登入頁面

**Files:**
- 修改: `app/(auth)/login/page.tsx`

**Step 1: 登入頁面完整程式碼**

```tsx
// app/(auth)/login/page.tsx
'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm, SubmitHandler } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/lib/supabase/client'
import { useAuthStore } from '@/stores/useAuthStore'
import GoogleButton from '@/components/ui/GoogleButton'

// 登入表單的驗證 Schema（和 signup 類似，但不需要其他欄位）
const LoginSchema = z.object({
  email: z.email('請輸入有效的 Email'),
  password: z.string().min(6, '密碼至少需要 6 個字元'),
})

type LoginInput = z.infer<typeof LoginSchema>

// 共用的 input 樣式
const inputClasses = 'bg-bg-tertiary w-full rounded-md px-3 py-1.5 border border-text-tertiary'

export default function LoginPage() {
  const router = useRouter()
  const setUser = useAuthStore((state) => state.setUser)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  })

  // Email/Password 登入
  const onSubmit: SubmitHandler<LoginInput> = async (data) => {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      // 用 setError 把錯誤顯示在表單上（而不是 alert）
      setError('root', { message: '帳號或密碼錯誤' })
      return
    }

    // 登入成功，更新 Zustand store 的使用者狀態
    setUser(authData.user)
    router.push('/explore')
  }

  // Google OAuth 登入
  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      console.error('Google 登入失敗', error.message)
    }
  }

  return (
    <div className="w-full min-h-screen grid place-items-center px-4">
      <div className="bg-bg-secondary w-full max-w-96 rounded-none md:rounded-2xl text-center p-8 space-y-6 border border-border shadow-lg">
        {/* 標題 */}
        <div>
          <h2 className="text-2xl font-semibold">歡迎回來</h2>
          <p className="text-sm text-text-secondary mt-2">登入 Got You 咖揪</p>
        </div>

        {/* Google 登入 */}
        <GoogleButton onClick={handleGoogleLogin} />

        {/* 分隔線 */}
        <div className="flex items-center gap-4">
          <div className="flex-1 border-t border-border"></div>
          <span className="text-text-secondary">或</span>
          <div className="flex-1 border-t border-border"></div>
        </div>

        {/* Email/Password 表單 */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
          <div>
            <label htmlFor="email" className="block mb-2 text-sm">Email</label>
            <input
              {...register('email')}
              id="email"
              type="email"
              placeholder="輸入電子郵件地址"
              className={inputClasses}
            />
            {errors.email && (
              <p className="text-error text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block mb-2 text-sm">密碼</label>
            <input
              {...register('password')}
              id="password"
              type="password"
              placeholder="密碼"
              className={inputClasses}
            />
            {errors.password && (
              <p className="text-error text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* 整體錯誤訊息（如帳號密碼錯誤） */}
          {errors.root && (
            <div className="bg-error/10 text-error px-4 py-3 rounded-lg text-sm">
              {errors.root.message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 bg-primary text-bg-primary font-semibold rounded-lg hover:bg-primary-hover transition disabled:opacity-50"
          >
            {isSubmitting ? '登入中...' : '登入'}
          </button>
        </form>

        {/* 註冊連結 */}
        <p className="text-text-secondary text-sm">
          還沒有帳號？
          <Link href="/signup" className="text-primary hover:underline ml-1">
            註冊
          </Link>
        </p>
      </div>
    </div>
  )
}
```

**Step 2: 測試**
- 前往 http://localhost:3000/login
- 測試輸入錯誤帳號密碼 → 應顯示「帳號或密碼錯誤」
- 測試用之前註冊的帳號登入 → 應導向 /explore

---

### Task 3：建立 Middleware 路由保護

**什麼是 Middleware？**
Next.js 的 Middleware 在每個 request 執行，可以攔截請求並做重定向。我們用它來：
- 未登入者訪問 `/explore` 等頁面 → 導向 `/login`
- 已登入者訪問 `/login`、`/signup` → 導向 `/explore`

**Files:**
- 建立: `middleware.ts`（放在專案根目錄，和 `app/` 同層）

**Step 1: 建立 Middleware**

```ts
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 需要登入才能訪問的路徑（保護的路由）
const protectedRoutes = ['/explore', '/posts', '/chats', '/profile']

// 不需要登入就能訪問的路徑（公開的路由）
const publicRoutes = ['/login', '/signup', '/']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 從 cookie 中取得 Supabase session
  // 注意：在 middleware 中不能用一般的 supabase client
  // 需要從 request 的 cookie 中讀取
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()

  // 未登入者嘗試訪問保護路由 → 導向 /login
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )
  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 已登入者嘗試訪問 /login 或 /signup → 導向 /explore
  const isAuthRoute = ['/login', '/signup'].includes(pathname)
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/explore', request.url))
  }

  return NextResponse.next()
}

// 設定 Middleware 要攔截的路徑
export const config = {
  matcher: [
    // 排除靜態檔案和 API 路由
    '/((?!_next/static|_next/image|favicon.ico|auth/callback).*)',
  ],
}
```

**Step 2: 測試**
- 在未登入狀態直接訪問 http://localhost:3000/explore → 應被導向 /login
- 在已登入狀態訪問 http://localhost:3000/login → 應被導向 /explore

---

## Phase B：Onboarding 流程

### Task 4：建立 Onboarding 頁面

**目的：** 新使用者（剛註冊）需要完善個人資料後才能使用 App。

**流程：**
```
使用者註冊/Google 登入成功
    ↓
/auth/callback
    ↓
/onboarding（填寫暱稱、性別、自我介紹）
    ↓
/explore
```

**Files:**
- 建立: `app/onboarding/page.tsx`
- 修改: `app/auth/callback/route.ts`（改導向到 /onboarding）
- 修改: `app/(auth)/signup/page.tsx`（Email 註冊成功後導向 /onboarding）

**Step 1: 建立 Onboarding 頁面**

```tsx
// app/onboarding/page.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useForm, SubmitHandler } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/lib/supabase/client'

// Onboarding 表單驗證 Schema
const OnboardingSchema = z.object({
  name: z.string().min(1, '請輸入暱稱').max(20, '暱稱最多 20 個字'),
  gender: z.enum(['male', 'female', 'other'], {
    errorMap: () => ({ message: '請選擇性別' }),
  }),
  bio: z.string().max(200, '自我介紹最多 200 個字').optional(),
})

type OnboardingInput = z.infer<typeof OnboardingSchema>

const inputClasses = 'bg-bg-tertiary w-full rounded-md px-3 py-1.5 border border-text-tertiary'

export default function OnboardingPage() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(OnboardingSchema),
  })

  const onSubmit: SubmitHandler<OnboardingInput> = async (data) => {
    // 1. 取得當前使用者
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 2. 更新 public.users 表的個人資料
    const { error } = await supabase
      .from('users')
      .update({
        name: data.name,
        gender: data.gender,
        bio: data.bio || null,
      })
      .eq('id', user.id)

    if (error) {
      console.error('更新個人資料失敗', error.message)
      return
    }

    // 3. 導向探索頁面
    router.push('/explore')
  }

  return (
    <div className="w-full min-h-screen grid place-items-center px-4">
      <div className="bg-bg-secondary w-full max-w-96 rounded-none md:rounded-2xl p-8 space-y-6 border border-border shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">完善你的個人資料</h2>
          <p className="text-sm text-text-secondary mt-2">
            讓我們更了解你，為你找到最合適的運動夥伴
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 暱稱 */}
          <div>
            <label htmlFor="name" className="block mb-2 text-sm">暱稱</label>
            <input
              {...register('name')}
              id="name"
              type="text"
              placeholder="輸入你的暱稱"
              className={inputClasses}
            />
            {errors.name && (
              <p className="text-error text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* 性別 */}
          <div>
            <label className="block mb-2 text-sm">性別</label>
            <div className="flex gap-3">
              <label className="flex-1 flex items-center justify-center gap-2 py-2 bg-bg-tertiary border border-text-tertiary rounded-md cursor-pointer">
                <input {...register('gender')} type="radio" value="male" className="hidden" />
                ♂ 男性
              </label>
              <label className="flex-1 flex items-center justify-center gap-2 py-2 bg-bg-tertiary border border-text-tertiary rounded-md cursor-pointer">
                <input {...register('gender')} type="radio" value="female" className="hidden" />
                ♀ 女性
              </label>
            </div>
            {errors.gender && (
              <p className="text-error text-sm mt-1">{errors.gender.message}</p>
            )}
          </div>

          {/* 自我介紹 */}
          <div>
            <label htmlFor="bio" className="block mb-2 text-sm">自我介紹（選填）</label>
            <textarea
              {...register('bio')}
              id="bio"
              rows={3}
              placeholder="簡單介紹一下你自己..."
              className={`${inputClasses} resize-none`}
            />
            {errors.bio && (
              <p className="text-error text-sm mt-1">{errors.bio.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-primary text-bg-primary font-semibold rounded-lg hover:bg-primary-hover transition disabled:opacity-50"
          >
            {isSubmitting ? '儲存中...' : '下一步 →'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

**Step 2: 修改 auth/callback 導向到 /onboarding**

修改 `app/auth/callback/route.ts`：
```ts
// 原本：導向 /explore
return NextResponse.redirect(new URL('/explore', requestUrl.origin))

// 改成：導向 /onboarding
return NextResponse.redirect(new URL('/onboarding', requestUrl.origin))
```

**Step 3: 修改 signup 的成功導向**

在 `app/(auth)/signup/page.tsx` 的 `onSubmit` 中：
```tsx
// Email 註冊成功後導向 /onboarding（而不是 alert）
alert("註冊成功") // ← 刪掉這行
router.push('/onboarding') // ← 改成這樣
```

**Step 4: 在 Middleware 排除 /onboarding**

確保 `/onboarding` 是受保護的路由（需要登入）：
```ts
const protectedRoutes = ['/explore', '/posts', '/chats', '/profile', '/onboarding']
```

**Step 5: 測試完整流程**
1. 重新註冊一個新帳號
2. 應自動導向 /onboarding
3. 填寫暱稱、性別、自我介紹
4. 點「下一步」→ 應導向 /explore
5. 確認 Supabase 後台的 users 表有更新

---

## 完成後的整體流程

```
新使用者：
/ → [開始使用] → /signup → 填表單 → /onboarding → 填資料 → /explore

老使用者：
/ → [已有帳號？登入] → /login → 填表單 → /explore

Google 登入：
/signup 或 /login → [使用 Google 登入] → Google OAuth → /onboarding → /explore
```

---

## 注意事項

- **Middleware 的 Supabase Client** 需要特別處理（從 cookie 讀取），和一般的 client 不同
- **Onboarding 後**，之後如果使用者再次登入，不應該再跳到 /onboarding（需要判斷是否已有 name）
- **Google OAuth** 的使用者名稱可以從 `user_metadata.full_name` 取得，可以預填到 Onboarding 表單
