'use client'

// 基本資料編輯表單：nickname、bio、gender
// 預填現有資料，存檔後更新 Zustand store 讓 /profile/me 即時反映

import { useState } from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { supabase } from '@/lib/supabase/client'
import { useUserStore, type UserProfile } from '@/stores/useUserStore'
import type { Gender } from '@/stores/useExploreStore'

// 表單欄位型別（不含 birthday，不允許修改生日）
interface BasicInfoFormData {
  nickname: string
  bio: string
}

interface EditBasicInfoFormProps {
  profile: UserProfile
}

export default function EditBasicInfoForm({ profile }: EditBasicInfoFormProps) {
  const fetchUser = useUserStore(state => state.fetchUser)

  const [gender, setGender] = useState<Gender | null>(profile.gender)
  const [genderError, setGenderError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // defaultValues 讓表單初始化時帶入現有資料
  const { register, handleSubmit, formState: { errors } } = useForm<BasicInfoFormData>({
    defaultValues: {
      nickname: profile.nickname ?? '',
      bio: profile.bio ?? '',
    }
  })

  const onSubmit: SubmitHandler<BasicInfoFormData> = async (data) => {
    if (!gender) {
      setGenderError('請選擇性別')
      return
    }

    setIsSaving(true)
    setError(null)
    setSuccess(false)

    const { error: updateError } = await supabase
      .from('users')
      .update({
        nickname: data.nickname,
        bio: data.bio,
        gender: gender,
      })
      .eq('id', profile.id!)

    if (updateError) {
      setError('儲存失敗，請再試一次')
      setIsSaving(false)
      return
    }

    // 重新 fetch，讓 Zustand store 更新，/profile/me 會反映最新資料
    await fetchUser()
    setSuccess(true)
    setIsSaving(false)
  }

  // 性別按鈕的共用樣式
  const genderButtonClass = (value: Gender) =>
    `flex-1 py-1.5 rounded-lg border text-sm transition cursor-pointer
    ${gender === value
      ? 'border-primary text-primary bg-bg-tertiary'
      : 'border-border text-text-secondary bg-bg-tertiary hover:border-primary/50 hover:text-text-primary'
    }`

  return (
    <div className="bg-bg-secondary rounded-2xl p-6 shadow">
      <h3 className="font-semibold mb-4">基本資料</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* 暱稱 */}
        <div>
          <label className="text-text-secondary text-sm block mb-1">暱稱</label>
          <input
            {...register('nickname', {
              required: '請輸入暱稱',
              maxLength: { value: 20, message: '暱稱最多 20 個字' },
              pattern: {
                value: /^[\u4e00-\u9fa5a-zA-Z0-9\s]+$/,
                message: '暱稱不能包含特殊符號'
              }
            })}
            type="text"
            className="w-full bg-bg-tertiary rounded-lg px-3 py-2 border border-border text-sm focus:outline-none focus:border-primary transition"
          />
          {errors.nickname && (
            <p className="text-red-400 text-xs mt-1">{errors.nickname.message}</p>
          )}
        </div>

        {/* 性別 */}
        <div>
          <label className="text-text-secondary text-sm block mb-1">性別</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setGender('male')} className={genderButtonClass('male')}>男性 ♂</button>
            <button type="button" onClick={() => setGender('female')} className={genderButtonClass('female')}>女性 ♀</button>
            <button type="button" onClick={() => setGender('nonBinary')} className={genderButtonClass('nonBinary')}>非二元 ⚲</button>
          </div>
          {genderError && <p className="text-red-400 text-xs mt-1">{genderError}</p>}
        </div>

        {/* 自我介紹 */}
        <div>
          <label className="text-text-secondary text-sm block mb-1">自我介紹</label>
          <textarea
            {...register('bio', { required: '請填寫自我介紹' })}
            rows={4}
            className="w-full bg-bg-tertiary rounded-lg px-3 py-2 border border-border text-sm focus:outline-none focus:border-primary transition resize-none" 
            placeholder="📝 寫點什麼讓大家能更認識你吧"
          />
          {errors.bio && (
            <p className="text-red-400 text-xs mt-1">{errors.bio.message}</p>
          )}
        </div>

        {error && <p className="text-red-400 text-xs text-center">{error}</p>}
        {success && <p className="text-accent text-xs text-center">已儲存！</p>}

        <div className='flex justify-center'>
          <button
            type="submit"
            disabled={isSaving}
            className="mx-auto w-1/3 min-w-[270px] py-2 rounded-lg bg-primary text-bg-primary font-semibold text-sm hover:bg-primary-hover transition disabled:opacity-50"
          >
            {isSaving ? '儲存中...' : '儲存基本資料變更'}
          </button>
        </div>

      </form>
    </div>
  )
}
