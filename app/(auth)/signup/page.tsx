"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"

const SignUpSchema = z.object({
  email: z.email(),
  password: z.string()
})

type SignUpInput = z.infer<typeof SignUpSchema>

export default function SignUpPage(){
  const { register, handleSubmit, formState: { errors } } = useForm<SignUpInput>({
    resolver: zodResolver(SignUpSchema)
  })

  const onSubmit: SubmitHandler<SignUpInput> = (data) => {
    console.log(data)
  }


  return (
    <div className="w-full min-h-screen grid place-items-center px-4">
      <div className="bg-bg-secondary w-full max-w-md 
        rounded-none md:rounded-2xl text-center p-8 space-y-6 grid justify-center shadow-lg border border-border">
        <div>
          <h2 className="text-2xl font-semibold">開始尋找運動夥伴</h2>
          <p className="text-sm text-text-secondary mt-2">加入 Got You 咖揪，探索你的運動社群</p>
        </div>
        <button>使用Google登入</button>
        <div>
          <span></span>
          或
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="grid max-w-2xs gap-2">
          <div className="">
            <label htmlFor="email" className="block mb-2 text-left text-sm">Email</label>
            <input {...register("email")} id="email" type="email" name="email" placeholder="輸入電子郵件地址"
              className="bg-bg-tertiary inline-block w-full rounded-md px-3 py-1.5 border border-text-tertiary"/>
          </div>
          <div>
            <label htmlFor="password" className="block mb-2 text-left text-sm">密碼</label>
            <input {...register("password")} id="password" type="password" name="password" placeholder="密碼"
              className="bg-bg-tertiary inline-block w-full rounded-md px-3 py-1.5 border border-text-tertiary"/>
          </div>
          <div>
            <button type="submit" 
              className="inline-block mt-2.5 px-6 py-2 bg-primary text-bg-primary 
              font-semibold rounded-lg hover:bg-primary-hover transition
              hover:animate-pulse">註冊</button>
          </div>
        </form>
      </div>
    </div>
  )
}