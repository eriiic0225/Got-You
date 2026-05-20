// lib/utils.test.ts
// 純函式單元測試
// 執行：`npm test`（watch 模式）/ `npx vitest run`（一次性 CI 用）

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { calculateAge, isTimeDiffExceeded, urlExtract, formatPostTime, formatChatTime } from './utils'
import type { Message } from '@/types/chat'

describe('calculateAge', () => {
  // calculateAge 內部用 `new Date()` 取「現在」，
  // 若不 mock，每次執行測試年齡都會變 → 不是 deterministic test。
  // vi.useFakeTimers() + vi.setSystemTime() 把「現在」凍結在一個固定時間點。
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-19'))
  })

  // afterEach 還原成真實時間，避免污染其他 describe block。
  afterEach(() => {
    vi.useRealTimers()
  })

  it('今年生日已過', () => {
    // 生日 3/15、今天 5/19 → 已過生日
    expect(calculateAge('2000-03-15')).toBe(26)
  })

  it('今年生日還沒到', () => {
    // 生日 8/15、今天 5/19 → 還沒到生日
    expect(calculateAge('2000-08-15')).toBe(25)
  })

  it('同月但生日日子還沒到', () => {
    // 生日 5/20、今天 5/19 → 同月但日子還沒到
    expect(calculateAge('2000-05-20')).toBe(25)
  })

  it('今天剛好是生日', () => {
    // 生日 5/19、今天 5/19 → 剛好生日
    expect(calculateAge('2000-05-19')).toBe(26)
  })

  it('同月但生日日子已過', () => {
    // 生日 5/18、今天 5/19 → 同月但生日已過
    expect(calculateAge('2000-05-18')).toBe(26)
  })
})

const mockMessage: Message = {
    id: "fakeMsgId1",
    sender_id: "fakeUserId1",
    receiver_id: "fakeUserId2",
    content: "testing",
    image_url: null,
    is_read: true,
    created_at: "2026-05-15 14:06:24.868348+00"
}

const mockNextMessage: Message = {
    ...mockMessage,
    is_read: false,
    created_at: "2026-05-15 14:06:35.56629+00"
}

const mockLatestMessage: Message = {
    ...mockMessage,
    is_read: false,
    created_at: "2026-05-15 14:20:35.56629+00"
}

const mock5MinLaterMessage: Message = {
    ...mockMessage,
    is_read: false,
    created_at: "2026-05-15 14:11:24.868348+00"
}

describe('isTimeDiffExceeded', ()=>{
  it('兩則訊息之間不超過5分鐘', ()=>{
    expect(isTimeDiffExceeded(mockMessage, mockNextMessage)).toBe(false)
  })

  it('兩則訊息之間已超過5分鐘', ()=>{
    expect(isTimeDiffExceeded(mockMessage, mockLatestMessage)).toBe(true)
  })

  it('沒有下一則訊息', ()=>{
    expect(isTimeDiffExceeded(mockMessage, undefined)).toBe(false)
  })

  it('兩則訊息剛好間隔五分鐘', ()=>{
    expect(isTimeDiffExceeded(mockMessage, mock5MinLaterMessage)).toBe(true)
  })
})

describe('urlExtract', ()=>{
  it('純文字、無 URL → 空陣列', () => {
    // 注意：toBe 比 reference（同一個 array 才相等），toEqual 比內容
    // 我們要的是「內容上是空陣列」→ 用 toEqual
    expect(urlExtract('hello world')).toEqual([])
  })

  it('含一個完整 URL → 回傳一個物件', () => {
    expect(urlExtract('看這個 https://google.com 很棒')).toEqual([
      {
        text: 'https://google.com',
        url: 'https://google.com',
        index: 4,
        lastIndex: 22,
      },
    ])
  })

  it('沒 protocol 的 URL → 自動補上 http 前綴', () => {
    expect(urlExtract('看這個 google.com 很棒')).toEqual([
      {
        text: 'google.com',
        url: 'http://google.com', // linkify-it 預設 http，瀏覽器會自動導向到https
        index: 4,
        lastIndex: 14,
      },
    ])
  })
})

describe('formatPostTime', ()=>{
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-19T12:00:00+08:00')) 
    // 因為 dayjs 被設定在 UTC +8，mocktime 同步調整
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('無 eventTime + 同年 → M/D（週幾）', () => {
    expect(formatPostTime('2026-03-25', null)).toBe('3/25（三）')
  })

  it('無 eventTime + 不同年 → YYYY/M/D（週幾）', () => {
    expect(formatPostTime('2025-03-25', null)).toBe('2025/3/25（二）')
  })

  it('有 eventTime + 同年 → M/D（週幾）A h:mm', () => {
    expect(formatPostTime('2026-03-25', '14:00')).toBe('3/25（三）下午 2:00')
  })

  it('有 eventTime + 不同年 → YYY/M/D（週幾） H:mm', () => {
    expect(formatPostTime('2025-03-25', '14:00')).toBe('2025/3/25（二）14:00')
  })
})

describe('formatChatTime', ()=>{
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-20T12:00:00+08:00')) // 2026-05-20 = 星期三
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('當天訊息 → H:mm', () => {
    expect(formatChatTime('2026-05-20T10:00:00+08:00')).toBe('10:00')
  })

  it('昨天訊息 → 昨天', () => {
    expect(formatChatTime('2026-05-19T10:00:00+08:00')).toBe('昨天')
  })

  it('一週內的訊息(2-7天內) → 星期幾', () => {
    expect(formatChatTime('2026-05-14T10:00:00+08:00')).toBe('星期四')
  })

  it('一週以前 & 一年以內 → M/D', () => {
    expect(formatChatTime('2026-05-13T10:00:00+08:00')).toBe('5/13')
  })

  it('一週以前 & 超過一年前內 → YYYY/M/D', () => {
    expect(formatChatTime('2025-05-13T10:00:00+08:00')).toBe('2025/5/13')
  })

  it('邊界：剛好 7 天前（isAfter 是嚴格大於 → 不算一週內）', () => {
  expect(formatChatTime('2026-05-13T12:00:00+08:00')).toBe('5/13')
})
})