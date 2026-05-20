'use client'
import { useState } from "react";
import { zodResolver } from '@hookform/resolvers/zod'
import { SubmitHandler, useForm } from "react-hook-form"
import z from "zod"
import { cn } from "@/lib/utils";
import SportTypeSelector from "./SportTypeSelector";
import DateTimePicker from "./DateTimePicker"
import { supabase } from "@/lib/supabase/client";
import { useUserStore } from "@/stores/useUserStore";
import { useRouter } from "next/navigation";

const PostSchema = z.object({
  title:            z.string().min(1, '請填寫標題').max(50),
  sport_type_id:    z.string().min(1, '請選擇運動類型'),
  description:      z.string().min(1, '請填寫說明').max(1000),
  date:             z.string().optional(),
  time:             z.string().optional(),
  location_area:    z.string().max(50).optional(),
  location_detail:  z.string().max(100).optional(),
  max_participants: z.number().int().min(2, '人數至少 2 人').optional(),
}).refine(
  (data) => !data.time || !!data.date,{ 
    message: '有填時間時，日期為必填', 
    path: ['date'] // 指定錯誤要掛在哪個欄位
  })

type PostInput = z.infer<typeof PostSchema>

export type Sport = {
  id: string
  name: string
  icon: string
  category: string
}

interface Props {
  sportTypes : Sport[]
}

// section 標題：細線 + 小字，把表單分成視覺區塊
function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-xs font-medium text-text-secondary tracking-wider shrink-0">
        {title}
      </span>
      {/* 分隔橫線 */}
      <div className="flex-1 h-px bg-border" /> 
    </div>
  )
}

export default function PostForm({ sportTypes }: Props){

  const router = useRouter()
  const profile = useUserStore((state) => state.profile)
  const [selectedSport, setSelectedSport] = useState<Sport|null>(null)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')

  const { register, handleSubmit, setError, setValue, formState: { errors, isSubmitting } } = useForm<PostInput>({
    resolver: zodResolver(PostSchema),
    // 設定初始值為空字串（而非 undefined），讓 Zod 的 .min(1, '...') 能觸發中文錯誤訊息
    defaultValues: { sport_type_id: '' }
  })

  const toggleSport = (sport: Sport) => {
    setSelectedSport(sport)
    setValue('sport_type_id', sport.id)
  }

  const handleDateChange = (val: string) => {
    setDate(val)
    setValue('date', val)  // 同步給 RHF 驗證用
  }

  const handleTimeChange = (val: string) => {
    setTime(val)
    setValue('time', val)  // 同步給 RHF 驗證用
  }

  const onSubmit: SubmitHandler<PostInput> = async(payload) => {

    // date/time 分開存（DB 欄位型別：date + time without timezone）
    // 不需要 UTC 轉換，直接儲存使用者輸入的本地日期和時間
    const { error } = await supabase
      .from('group_posts')
      .insert({
        author_id: profile?.id,
        sport_type_id: payload.sport_type_id,
        title: payload.title,
        description: payload.description,
        location_area:    payload.location_area    ?? null,
        location_detail:  payload.location_detail  ?? null,
        event_date:       payload.date             || null,
        event_time:       payload.time             || null,
        max_participants: payload.max_participants ?? null,  // 未填 → NULL（不限人數）
      })

    if (error){
      console.error("發佈失敗", error.message)
      setError("root", { message: "發佈失敗，請重試"})
      return
    }

    router.push('/posts')
  }

  // 共用的 input 樣式，所有文字輸入欄位都套這個，保持視覺一致
  const inputClass = cn(
    "w-full bg-bg-tertiary border border-border rounded-lg px-3 py-2.5",
    "text-base md:text-sm text-text-primary placeholder:text-text-secondary/50",
    "focus:outline-none focus:border-primary/50 transition-colors"
  )

  // 錯誤訊息的共用樣式
  const errorClass = "text-xs text-red-400 mt-1"

  return (
    <div className="space-y-8">
      <form 
        id="post_form" className="space-y-8"
        onSubmit={handleSubmit(onSubmit)}
      >

        {/* ── 基本資訊 ── */}
        <section>
          <SectionHeader title="基本資訊" />
          <div className="space-y-4">

            {/* 運動類型：chips 選擇，不需要 label */}
            <div className="block text-sm text-text-secondary mb-1.5">
              運動類型<span className="text-red-400">*</span>
            </div>
            <div>
              <SportTypeSelector
                sportTypes={sportTypes}
                toggleSport={toggleSport}
                selectedSport={selectedSport}
              />
              {/* sport_type_id 的錯誤訊息 */}
              {errors.sport_type_id && (
                <p className={errorClass}>{errors.sport_type_id.message}</p>
              )}
            </div>

            {/* 標題 */}
            <div>
              <label htmlFor="title" className="block text-sm text-text-secondary mb-1.5">
                標題 <span className="text-red-400">*</span>
              </label>
              <input
                {...register('title')}
                id="title"
                type="text"
                placeholder="簡單說明一下這次揪團"
                className={cn(inputClass, errors.title && "border-red-400/60")}
              />
              {errors.title && <p className={errorClass}>{errors.title.message}</p>}
            </div>

            {/* 活動說明 */}
            <div>
              <label htmlFor="description" className="block text-sm text-text-secondary mb-1.5">
                活動說明 <span className="text-red-400">*</span>
              </label>
              <textarea
                {...register('description')}
                id="description"
                placeholder="詳細說明活動內容、需求、注意事項..."
                rows={5}
                className={cn(inputClass, "resize-none", errors.description && "border-red-400/60")}
              />
              {errors.description && <p className={errorClass}>{errors.description.message}</p>}
            </div>

          </div>
        </section>

        {/* ── 時間與地點（選填）── */}
        <section>
          <SectionHeader title="時間與地點（選填）" />
          <div className="space-y-4">

            {/* 日期時間 */}
            <div>
              <label className="block text-sm text-text-secondary mb-1.5">活動時間</label>
              <DateTimePicker
                date={date}
                time={time}
                onDateChange={handleDateChange}
                onTimeChange={handleTimeChange}
              />
              {errors.date && <p className={errorClass}>{errors.date.message}</p>}
            </div>

            {/* 地點兩欄：手機直排、桌機並排 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="location_area" className="block text-sm text-text-secondary mb-1.5">
                  區域
                </label>
                <input
                  {...register('location_area')}
                  id="location_area"
                  type="text"
                  placeholder="ex: 大安區"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="location_detail" className="block text-sm text-text-secondary mb-1.5">
                  詳細地點
                </label>
                <input
                  {...register('location_detail')}
                  id="location_detail"
                  type="text"
                  placeholder="ex: 大安森林公園"
                  className={inputClass}
                />
              </div>
            </div>

          </div>
        </section>

        {/* ── 其他設定（選填）── */}
        <section>
          <SectionHeader title="其他設定（選填）" />

          <div>
            <label htmlFor="max_participants" className="block text-sm text-text-secondary mb-1.5">
              人數上限
            </label>
            {/* setValueAs：空字串 → undefined，有值 → 轉成 number
                比 valueAsNumber 好，因為後者空白會產生 NaN 導致 Zod 型別錯誤 */}
            <input
              {...register('max_participants', { setValueAs: (v) => v === '' ? undefined : parseInt(v, 10) })}
              id="max_participants"
              type="number"
              placeholder="不填則不限人數"
              className={cn(
                inputClass,
                // 隱藏瀏覽器預設的數字上下箭頭，改用純文字輸入
                "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              )}
            />
            {errors.max_participants && (
              <p className={errorClass}>{errors.max_participants.message}</p>
            )}
          </div>
        </section>

      </form>

      {/* 底部操作列：取消 + 發佈，放在 form 外 */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.push('/posts')}
          className="flex-1 py-3 rounded-lg border border-border text-text-secondary text-sm font-semibold hover:border-primary/50 hover:text-text-primary transition-colors"
        >
          取消
        </button>
        <button
          form="post_form"
          type="submit"
          disabled={isSubmitting}
          className={cn("flex-1 py-3 rounded-lg bg-primary text-bg-primary font-semibold text-sm",
            "hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed")}
        >
          {isSubmitting ? '發佈中...' : '發佈揪團'}
        </button>
      </div>
    </div>
  )
}