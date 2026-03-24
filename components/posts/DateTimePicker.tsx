'use client'
import { cn } from '@/lib/utils'
import * as Popover from '@radix-ui/react-popover'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'
import { LuCalendar } from 'react-icons/lu'

interface Props {
  date: string       // "2026-03-25"，空字串 = 未選
  time: string       // "14:30"，空字串 = 未選
  onDateChange: (date: string) => void
  onTimeChange: (time: string) => void
}

function DateTimePicker({ date, time, onDateChange, onTimeChange }: Props){

  // "2026-03-25" → Date 物件（DayPicker 需要 Date 型別）
  const selectedDate = date ? new Date(date) : undefined

  // DayPicker 選完日期後，把 Date 物件轉回 "YYYY-MM-DD" 字串
  // toLocaleDateString('sv') 利用瑞典語 locale 剛好輸出 ISO 格式
  const handleSelect = (day: Date | undefined) => {
    if (!day) {
      onDateChange('')  // 清除日期
      onTimeChange('')  // 連時間也一起清
      return
    }
    onDateChange(day.toLocaleDateString('sv'))
  }

  // 把 "HH:MM" 拆成獨立的 hours / minutes，讓兩個 select 各自控制
  const hours = time ? time.split(':')[0] : ''
  const minutes = time ? time.split(':')[1] : ''

  // 時改變：保留現有分鐘，若分鐘還沒選則預設 '00'
  const handleHourChange = (h: string) => {
    const m = minutes || '00'
    onTimeChange(h ? `${h}:${m}` : '')
  }

  // 分改變：保留現有小時，若小時還沒選則預設 '00'
  const handleMinuteChange = (m: string) => {
    const h = hours || '00'
    onTimeChange(`${h}:${m}`)
  }

  // Trigger 顯示的文字：有日期就組合日期＋時間，否則顯示 placeholder
  const triggerLabel = date
    ? `${date}${time ? ' ' + time : ''}`
    : '選擇日期'

  return (
    <Popover.Root>

      {/* asChild：讓 Trigger 直接渲染成 button，不多包一層 DOM */}
      <Popover.Trigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg border border-border",
            "bg-bg-tertiary text-sm text-text-secondary hover:border-primary transition-colors"
          )}
        >
          <LuCalendar className="size-4 shrink-0" strokeWidth={1.5} />
          <span>{triggerLabel}</span>
        </button>
      </Popover.Trigger>

      {/* Portal：把 Popover 傳送到 body，避免被父元素 overflow:hidden 截斷 */}
      <Popover.Portal>
        <Popover.Content
          sideOffset={8}
          align="start"          // ← 靠 Trigger 左側對齊，不要置中
          collisionPadding={16}  // ← 距離螢幕邊緣保留 16px，防止超出畫面
          className="z-50 bg-bg-secondary border border-border rounded-xl p-3 shadow-lg"
        >
          {/* 日曆 */}
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            disabled={{ before: new Date() }}  // 不能選過去日期
            style={{
              '--rdp-accent-color': '#C4DC4A',
              '--rdp-accent-background-color': 'rgba(196, 220, 74, 0.15)',
              '--rdp-today-color': '#C4DC4A',
              '--rdp-day-button-hover-background-color': '#2F3545',
            } as React.CSSProperties}
          />

          {/* 分隔線 */}
          <div className="border-t border-border my-2" />

          {/* 時間選擇（選填） */}
          <div className="flex items-center gap-2 px-1 pb-1">
            <span className="text-xs text-text-secondary">時間</span>

            {/* 小時 select：00 ~ 23 */}
            <select
              value={hours}
              onChange={(e) => handleHourChange(e.target.value)}
              className="bg-bg-tertiary border border-border rounded-lg px-2 py-1
                text-sm text-text-primary cursor-pointer"
            >
              <option value="">--</option>
              {Array.from({ length: 24 }, (_, i) => {
                const val = String(i).padStart(2, '0')
                return <option key={val} value={val}>{val}</option>
              })}
            </select>

            <span className="text-text-secondary">:</span>

            {/* 分鐘 select：每 5 分鐘一格 */}
            <select
              value={minutes}
              onChange={(e) => handleMinuteChange(e.target.value)}
              className="bg-bg-tertiary border border-border rounded-lg px-2 py-1
                text-sm text-text-primary cursor-pointer"
            >
              {['00','05','10','15','20','25','30','35','40','45','50','55'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

        </Popover.Content>
      </Popover.Portal>

    </Popover.Root>
  )
}

export default DateTimePicker