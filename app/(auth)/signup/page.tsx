"use client"

import GoogleButton from "@/components/ui/GoogleButton"
import { supabase } from "@/lib/supabase/client"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"


const SignUpSchema = z.object({
  email: z.email('請輸入有效的 Email'),
  password: z.string().min(6, '密碼至少需要 6 個字元')
})

type SignUpInput = z.infer<typeof SignUpSchema>

const inputClasses = "bg-bg-tertiary inline-block w-full rounded-md px-3 py-1.5 border border-text-tertiary"



function SignUpPage(){

  const router = useRouter()
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<SignUpInput>({
    resolver: zodResolver(SignUpSchema)
  })


  const onSubmit: SubmitHandler<SignUpInput> = async (data) => {
    const {error: signUpError} = await supabase.auth.signUp(data)
    if (signUpError){
      console.error("註冊失敗", signUpError.message)
      const errorMessage = signUpError.message === 'User already registered'
        ? '此 Email 已被註冊，請直接登入'
        : signUpError.message
      setError("root", { message: errorMessage })
      return
    }
    router.push("/onboarding")
  }

  async function SignUpWithGoogle(){
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error){
      console.error("使用Google註冊失敗", error.message)
      return
    }
}


  return (
    <div className="w-full min-h-screen grid place-items-center px-4">
      {/* 整體卡牌 */}
      <div className="bg-bg-secondary w-full max-w-96 rounded-none md:rounded-2xl text-center p-8 space-y-6 grid justify-center shadow-lg border border-border">
        {/* 主標 & 副標 */}
        <div>
          <h2 className="text-2xl font-semibold">開始尋找運動夥伴</h2>
          <p className="text-sm text-text-secondary mt-2">加入 Got You 咖揪，探索你的運動社群</p>
        </div>

        {/* Google登入按鈕 */}
        <GoogleButton onClick={SignUpWithGoogle}/>

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
              {isSubmitting ? "註冊中..." : "註冊"}
            </button>
          </div>
          {errors.root && (<p className="text-error text-sm mt-1 text-center">{errors.root.message}</p>)}
        </form>
        {/* 次要連結 */}
        <p className="text-text-secondary">
          已有帳號？
          <Link href="/login"
            className="text-primary hover:underline ml-1">
            登入
          </Link>
        </p>
      </div>
    </div>
  )
}

export default SignUpPage