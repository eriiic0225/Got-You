'use client'
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form"


export type gender = 'male'|'female'|'nonBinary'|null

export type userInfo = {
  nickname: string,
  gender: gender,
  birthday: string,
  bio: string
}

interface Step1ProfileProps {
  toNextStep: () => void
  setFormData: (data: userInfo) => void
}


function Step1Profile({ toNextStep, setFormData }:Step1ProfileProps){

  const [ gender, setGender ] = useState<gender>(null)
  const [genderError, setGenderError] = useState("")

  const { register, handleSubmit, formState:{ errors } } = useForm<userInfo>()

  const onStep1Submit: SubmitHandler<userInfo> = (data)=>{

    if (!gender){
      setGenderError("請選擇性別")
      return
    }

    setFormData({
      nickname: data.nickname,
      gender: gender,
      birthday: data.birthday,
      bio: data.bio
    })
    toNextStep()
  }

  return (
    <>
      {/* 個人資料填寫：step 1 */}
      <div>
        <h2 className="text-text-primary font-semibold">完善你的個人資料</h2>
        <p className="text-text-secondary text-xs mt-1">讓大家更認識熱愛運動的你</p>
      </div>
      <form className="space-y-6" id="profileStep1" onSubmit={handleSubmit(onStep1Submit)}>
        <div className="flex justify-center">
          <div className="h-25 w-25 rounded-[50%] bg-text-tertiary">[上傳頭貼]</div>
        </div>

        <div>
          <h3 className="text-text-secondary text-sm mb-1">暱稱</h3>
          <input 
            {...register("nickname",{
              required: "請輸入暱稱",
              maxLength: { value: 20, message: "暱稱最多 20 個字" },
              pattern: {
                value: /^[\u4e00-\u9fa5a-zA-Z0-9\s]+$/,
                message: "暱稱不能包含特殊符號"
              }
            })} 
            type="text" placeholder="e.g. 健身狂魔阿豪"
            className="bg-bg-tertiary inline-block w-full rounded-md px-3 py-1.5 border-2 border-border"
          />
          {errors.nickname && (
            <p className="text-red-400 text-xs mt-1">{errors.nickname.message}</p>
          )}
        </div>

        <div>
          <h3 className="text-text-secondary text-sm mb-1">性別</h3>
          <div className="flex gap-2">
            <button type="button" onClick={()=>(setGender("male"))}
              className={`grow rounded-md px-3 py-1.5 border cursor-pointer transition bg-bg-tertiary
                ${gender === 'male'
                  ? 'border-primary'
                  : 'bg-bg-tertiary border-border text-text-primary hover:bg-text-tertiary hover:border-primary'
                }`}
              >男性 ♂
            </button>
            <button type="button" onClick={()=>(setGender("female"))}
              className={`grow rounded-md px-3 py-1.5 border cursor-pointer transition bg-bg-tertiary
                ${gender === 'female'
                  ? 'border-primary'
                  : 'bg-bg-tertiary border-border text-text-primary hover:bg-text-tertiary hover:border-primary'
                }`}
              >女性 ♀ 
            </button>
            <button type="button" onClick={()=>(setGender("nonBinary"))}
              className={`grow rounded-md px-3 py-1.5 border cursor-pointer transition bg-bg-tertiary
                ${gender === 'nonBinary'
                  ? 'border-primary'
                  : 'bg-bg-tertiary border-border text-text-primary hover:bg-text-tertiary hover:border-primary'
                }`}
              >非二元 ⚲
            </button>
          </div>
          {genderError && <p className="text-red-400 text-xs mt-1">{genderError}</p>}
        </div>
        
        <div>
          <h3 className="text-text-secondary text-sm mb-1">生日</h3>
          <input 
            {...register("birthday",{
              required: "請選擇生日"
            })} 
            type="date"
            className="bg-bg-tertiary inline-block w-full rounded-md px-3 py-1.5 border border-border"
          />
          {errors.birthday && (
            <p className="text-red-400 text-xs mt-1">{errors.birthday.message}</p>
          )}
        </div>

        <div>
          <h3 className="text-text-secondary text-sm mb-1">自我介紹</h3>
          <textarea 
            {...register("bio",{
              required: "請填寫自我介紹"
            })}
            placeholder="📝 簡單介紹一下你自己吧"
            className="bg-bg-tertiary inline-block min-h-30 w-full rounded-md px-3 py-1.5 border border-border"></textarea>
          {errors.bio && (
              <p className="text-red-400 text-xs mt-1">{errors.bio.message}</p>
            )}
        </div>
      </form>
      
      <div className="flex-1" />
      <button
        form="profileStep1"
        type="submit"
        className="bg-primary text-bg-secondary font-semibold w-full px-3 py-2 rounded-md hover:bg-primary-hover transition"
        >
        下一步 →
      </button>
    </>
  )
}

export default Step1Profile