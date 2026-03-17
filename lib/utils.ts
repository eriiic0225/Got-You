import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

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
    return date.format('H:mm')
  }

  if (isYesterday){
    return "昨天"
  }

  return date.format('M/D')
  
}

export function formatChatBubbleTime(isoString: string): string {
  const date = dayjs(isoString)
  const now = dayjs()

  const isToday = date.isSame(now, 'date')
  const isYesterday = date.isSame(now.subtract(1, 'day'), 'date')

  if (isToday){
    return date.format('H:mm')
  }

  if (isYesterday){
    return `昨天 ${date.format('H:mm')}`
  }

  return `${date.format('M/D')} ${date.format('H:mm')}`
}