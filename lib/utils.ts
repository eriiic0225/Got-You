import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import dayjs from 'dayjs'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import 'dayjs/locale/zh-tw'
import relativeTime from 'dayjs/plugin/relativeTime'
import type { Message } from '@/types/chat';

dayjs.locale('zh-tw')
dayjs.extend(isSameOrBefore)
// utc + timezone：讓 dayjs 正確把 Supabase 回傳的 UTC 時間轉成台灣時間（UTC+8）
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Taipei')

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 用使用者生日來計算年齡
export function calculateAge(birthday: string): number {
  const today = new Date()
  const birthDate = new Date(birthday)

  let age = today.getFullYear() - birthDate.getFullYear() // 先單純看年份差距

  // 還沒到今年生日，要減一歲
  const monthDiff = today.getMonth() - birthDate.getMonth() // 看月份差距
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

// 從ISO轉換時間格式
export function formatChatTime(isoString: string): string {
  const date = dayjs(isoString)
  const now = dayjs()

  const isToday = date.isSame(now, 'date')
  const isYesterday = date.isSame(now.subtract(1, 'day'), 'date')


  if (isToday){
    return date.format('A H:mm')
  }

  if (isYesterday){
    return "昨天"
  }

  // 是否為最近 7 天內 (顯示星期幾)
  if (date.isAfter(date.subtract(7, 'day')))
    return date.format('dddd')

  if (date.isAfter(date.subtract(1, 'year')))
    return date.format('M/D')
  
  return date.format('YYYY/M/D')
}

export function formatMessageBubbleTime(isoString: string): string {
  const date = dayjs(isoString)
  const now = dayjs()

  const isToday = date.isSame(now, 'date')
  const isYesterday = date.isSame(now.subtract(1, 'day'), 'date')

  // 今天 - 7:50
  if (isToday){
    return date.format('A h:mm')
  }

  // 昨天 - 昨天 7:50
  if (isYesterday){
    return `昨天 ${date.format('H:mm')}`
  }

  // 是否為最近 7 天內 (顯示星期幾)
  if (date.isAfter(date.subtract(7, 'day')))
    return `${date.format('dddd')} ${date.format('H:mm')}`

  // 今年內 - 3/18
  if (date.isAfter(date.subtract(1, 'year')))
    return date.format('M/D')

  // 一年前 - 2015/3/14
  return date.format('YYYY/M/D')
}

// 計算是不是過了一段時間才傳下一段訊息
// 用來顯示重複的頭像(?) 跟加大氣泡間隔
export function isTimeDiffExceeded(
  currentMsg: Message,
  nextMsg: Message | undefined,
  thresholdMinutes: number = 5
):boolean{
  if (!nextMsg) return false

  return (
    dayjs(nextMsg.created_at)
      .diff(dayjs(currentMsg.created_at), 'minute') >= thresholdMinutes)
}

// 整理貼文活動時間格式：3/25（三）下午 2:00
// dayjs.utc().tz()：先告訴 dayjs 字串是 UTC，再轉成台灣時間，避免顯示錯 8 小時
export function formatPostTime(isoString: string): string{
  const now = dayjs()
  const date = dayjs.utc(isoString).tz()

  if (date.isSame(now, 'year'))
    return `${date.format('M/D')}（${date.format('dd')}）${date.format('A h:mm')}`

  return `${date.format('YYYY/M/D')} (${date.format('ddd')}) ${date.format('H:mm')}`
}

// 發文時間（created_at）格式：2026/3/24 18:45
export function formatCreatedAt(isoString: string): string {
  return dayjs.utc(isoString).tz().format('YYYY/M/D HH:mm')
}