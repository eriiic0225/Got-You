"use client"

import GoogleButton from "@/components/ui/GoogleButton"
import { supabase } from "@/lib/supabase/client"
import { useAuthStore } from "@/stores/useAuthStore"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"



const LoginSchema = z.object({
  email: z.email('請輸入有效的 Email'),
  password: z.string().min(6, '密碼至少需要 6 個字元')
})

type LoginInput = z.infer<typeof LoginSchema>

const inputClasses = "bg-bg-tertiary inline-block w-full rounded-md px-3 py-1.5 border border-text-tertiary"



function LoginPage(){

  const router = useRouter()

  const setUser = useAuthStore((state)=> state.setUser)

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema)
  })


  const onSubmit: SubmitHandler<LoginInput> = async (payload) => {
    const { data, error } = await supabase.auth.signInWithPassword(payload)
    if (error){
      console.error("登入失敗", error.message)
      setError("root", { message: "帳號或密碼錯誤"})
      return
    }
    
    if (!data.user){
      setError("root", { message: "登入狀態異常，請重試" })
      return
    }

    setUser(data.user)

    // 登入後到supabase檢查Onboarding是否已填完
    const { data: profile } = await supabase
      .from("users")
      .select("onboarding_completed")
      .eq('id', data.user.id)
      .single()

    // 有找到資料 = 已完成
    if (profile?.onboarding_completed){
      router.push("/explore")
    }else{
      router.push("/onboarding")
    }
  }

  async function handleGoogleLogin(){
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error){
      console.error("使用Google登入失敗", error.message)
      return
    }
}


  return (
    <div className="w-full min-h-screen grid place-items-center px-4">
      {/* 整體卡牌 */}
      <div className="bg-bg-secondary w-full max-w-96 rounded-none md:rounded-2xl text-center p-8 space-y-6 grid justify-center shadow-lg border border-border">
        {/* 主標 & 副標 */}
        <div>
          <h2 className="text-2xl font-semibold min-w-60.25">歡迎回來！</h2>
          <p className="text-sm text-text-secondary mt-2">在 Got You 咖揪 繼續你的旅程</p>
        </div>

        {/* Google登入按鈕 */}
        <GoogleButton onClick={handleGoogleLogin}/>

        {/* 分割線 + "或" */}
        <div className="flex items-center gap-4">
          <div className="flex-1 border-t border-border"></div>
          <span className="text-text-secondary">或</span>
          <div className="flex-1 border-t border-border"></div>
        </div>
        {/* Email/Password 表單 */}
        <form onSubmit={handleSubmit(onSubmit)} className="grid max-w-2xs gap-3">
          <div className="">
            <label htmlFor="email" className="block mb-2 text-left text-sm">Email</label>
            <input {...register("email")} id="email" type="email" name="email" placeholder="輸入電子郵件地址"
              className={inputClasses}/>
              {errors.email && (
                <p className="text-error text-sm mt-1 text-left">{errors.email.message}</p>
              )}
          </div>
          <div>
            <label htmlFor="password" className="block mb-2 text-left text-sm">密碼</label>
            <input {...register("password")} id="password" type="password" name="password" placeholder="密碼"
              className={inputClasses}/>
              {errors.password && (
                <p className="text-error text-sm mt-1 text-left">{errors.password.message}</p>
              )}
          </div>
          <div>
            <button disabled={isSubmitting} type="submit" className="inline-block mt-2.5 px-6 py-2 bg-primary text-bg-primary font-semibold rounded-lg hover:bg-primary-hover transition hover:animate-pulse cursor-pointer">
              {isSubmitting ? "登入中..." : "登入"}
            </button>
          </div>
          {errors.root && (<p className="text-error text-sm mt-1 text-center">{errors.root.message}</p>)}
        </form>
        <p className="text-text-secondary">
          還沒有帳號嗎？
          <Link href="/signup"
            className="text-primary hover:underline ml-1">
            點此註冊
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage