"use client"

import { SubmitHandler, useForm } from "react-hook-form"
import { z } from "zod"


interface LoginInput {
  email: string
  password: string
}

export default function LoginPage(){
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>()

  const onSubmit: SubmitHandler<LoginInput> = (data) => {
    console.log(data)
  }


  return (
    <form>
      <div>Email
        <input {...register("email")} type="email" name="email" placeholder="輸入電子郵件地址"/>
      </div>
      <div>密碼
        <input {...register("password")} type="password" name="password" placeholder="密碼"/>
      </div>
      <div>
        <button type="submit">登入</button>
      </div>
    </form>
  )
}