'use client'
import { useState, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form"
import { calculateAge } from "@/lib/utils";
import useImage from "@/hooks/useImage";
import { RxAvatar } from "react-icons/rx";
import { MdOutlinePhotoCamera } from "react-icons/md";


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
  formData: userInfo  // 從父層傳入，用來在回上一步時恢復已填的資料
  onAvatarSelect: (avatar:File) => void
  avatarPreviewUrl: string | null
}


function Step1Profile({ toNextStep, setFormData, formData, onAvatarSelect, avatarPreviewUrl }:Step1ProfileProps){

  // 用父層傳來的 formData.gender 當初始值，回上一步時恢復選擇
  const [ gender, setGender ] = useState<gender>(formData.gender)
  const [ genderError, setGenderError ] = useState("")

  // defaultValues 讓 useForm 在初始化時填入已有的資料
  const { register, handleSubmit, formState:{ errors } } = useForm<userInfo>({
    defaultValues: formData
  })

  const { inputRef } = useImage()


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

  const handleUploadAndNotify = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onAvatarSelect(file)  // 直接從 event 拿 File，不依賴非同步的 image state
  }

  return (
    <>
      {/* 個人資料填寫：step 1 */}
      <div>
        <h2 className="text-text-primary font-semibold">完善你的個人資料</h2>
        <p className="text-text-secondary text-xs mt-1">讓大家更認識熱愛運動的你</p>
      </div>
      <form className="space-y-4" id="profileStep1" onSubmit={handleSubmit(onStep1Submit)}>
        {/* 頭貼上傳區塊 */}
        <div className="flex justify-center">
          {/* 隱藏的 file input，由下方 button 觸發 */}
          <input type="file" accept="image/*" ref={inputRef} onChange={handleUploadAndNotify} className="hidden"/>

          {/* 頭貼預覽區，點擊觸發 file input */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()} // 點button等同點開隱藏的file input
            className="group relative h-44 w-44 rounded-lg overflow-hidden bg-bg-tertiary drop-shadow-xs"
          >
            { avatarPreviewUrl ? ( // 如果有上傳的圖片就顯示預覽
              <>
                <img src={avatarPreviewUrl!} alt="頭貼預覽" className="w-full h-full object-cover" />
                {/* 甜甜圈遮罩：圓形內透明（圓形預覽）、圓形外暗（方形全貌） */}
                <div
                  className="absolute inset-0"
                  style={{ background: 'radial-gradient(circle closest-side, transparent 100%, rgba(0,0,0,0.65) 100%)' }}
                />
              </>
            ) : ( // 沒有就顯示預設 icon
              <div className="w-full h-full flex items-center justify-center">
                <RxAvatar size={56} className="text-text-secondary" />
              </div>
            )}
            {/* hover 遮罩：提示可點擊重新上傳 */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition">
              <MdOutlinePhotoCamera size={26} className="text-white opacity-0 group-hover:opacity-100 transition" />
            </div>
          </button>
        </div>
        {/* 個人資料輸入區 */}
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
                  ? 'border-primary text-primary'
                  : 'bg-bg-tertiary border-border text-text-primary hover:bg-text-tertiary hover:border-primary'
                }`}
              >男性 ♂
            </button>
            <button type="button" onClick={()=>(setGender("female"))}
              className={`grow rounded-md px-3 py-1.5 border cursor-pointer transition bg-bg-tertiary
                ${gender === 'female'
                  ? 'border-primary text-primary'
                  : 'bg-bg-tertiary border-border text-text-primary hover:bg-text-tertiary hover:border-primary'
                }`}
              >女性 ♀ 
            </button>
            <button type="button" onClick={()=>(setGender("nonBinary"))}
              className={`grow rounded-md px-3 py-1.5 border cursor-pointer transition bg-bg-tertiary
                ${gender === 'nonBinary'
                  ? 'border-primary text-primary'
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
              required: "請選擇生日",
              // 日期驗證
              validate: (value) => {
                const birthDate = new Date(value)
                const today = new Date()

                // 不能是未來日期
                if (birthDate > today) return "生日不能是未來日期"
                const age = calculateAge(value)

                if (age < 10) return `確定才 ${age} 歲嗎🤔`
                if (age < 13) return "年齡需滿 13 歲才能使用"
                if (age > 120) return "請輸入有效的生日日期"
                return true
              }
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