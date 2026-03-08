import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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