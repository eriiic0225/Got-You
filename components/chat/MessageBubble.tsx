'use client'
// MessageBubble.tsx
// 聊天室中的單則訊息氣泡
// 根據 isOwn 決定左右對齊與顏色；showAvatar 控制頭像是否顯示（連續訊息不重複顯示）

import { cn, formatMessageBubbleTime } from "@/lib/utils"
import type { Message } from "@/types/chat"
import dayjs from "dayjs"

interface Props {
  message: Message              // 訊息資料（對應 messages 資料表）
  isOwn: boolean                // true = 自己發的（靠右）；false = 對方發的（靠左）
  showAvatar: boolean           // 是否顯示頭像（連續訊息只在最後一則顯示 or 對方隔太久才傳下一則訊息）
  hasExtraMargin: boolean       // 是否加大間距（隔太久才傳下一則訊息）
  partnerAvatar: string | null  // 對方的頭像 URL，null 時顯示預設色塊
}

export default function MessageBubble({ message, isOwn, showAvatar, hasExtraMargin, partnerAvatar }: Props) {
  return (
    // 最外層：控制整列的水平對齊
    // isOwn → flex-row-reverse 讓氣泡靠右；對方 → flex-row 靠左
    <div className={cn(
      "flex items-end gap-2 px-3 mb-[1px]",
      isOwn ? "flex-row-reverse" : "flex-row",
      hasExtraMargin && "mb-1.5" // 超過五分鐘就加間距（在上層計算好的）
    )}>

      {/* ── 頭像區（只有對方訊息才渲染） ──────────────────────── */}
      {!isOwn && (
        // 固定寬度容器：showAvatar 時顯示頭像，否則留空當 spacer
        // spacer 的作用：讓連續訊息的氣泡左邊緣對齊，不因有無頭像而錯位
        <div className="w-8 shrink-0 shadow-bg-tertiary shadow-2xl">
          {showAvatar && (
            partnerAvatar
              ? <img
                  src={partnerAvatar}
                  alt="頭貼"
                  className="size-8 rounded-full border border-border object-cover"
                />
              : <div className="size-8 rounded-full bg-bg-tertiary border border-border" />
          )}
        </div>
      )}

      {/* ── 氣泡主體 ──────────────────────────────────── */}
      {/* max-w-xxx 限制氣泡長度，避免文字過長撐破版面 */}
      <div className={cn(
        "max-w-[80%] px-3 py-2 text-sm",
        isOwn
          // 自己的訊息：主色背景、深色文字、右下角不圓（視覺上「尾巴朝右」）
          ? "bg-primary text-bg-primary rounded-2xl rounded-br-sm"
          // 對方的訊息：次要背景、白色文字、左下角不圓（視覺上「尾巴朝左」）
          : "bg-bg-tertiary text-text-primary rounded-2xl rounded-bl-sm"
      )}>

        {/* 圖片訊息（預留，上傳功能完成後啟用） */}
        {message.image_url && (
          <img
            src={message.image_url}
            alt="圖片訊息"
            className="max-w-full rounded-lg"
          />
        )}

        {/* 文字訊息：whitespace-pre-wrap 保留換行；break-words 防止長字串溢出 */}
        {message.content && (
          <p className="whitespace-pre-wrap break-words leading-relaxed">
            {message.content}
          </p>
        )}

        {/* 傳送時間：顯示在氣泡右下角*/}
        <p className={cn(
          "text-[10px] mt-0.5 text-right",
          isOwn ? "text-bg-primary/60" : "text-text-secondary"
        )}>
          {/* {dayjs(message.created_at).format('HH:mm')} */}
          {formatMessageBubbleTime(message.created_at)}
        </p>

      </div>
    </div>
  )
}
