// SkeletonChatList.tsx
// ChatList 載入中時的佔位元件，結構與 ChatList 一致，用 animate-pulse 呈現

// 單筆對話列的 skeleton
function SkeletonChatItem() {
  return (
    <div className="flex gap-3 items-center mx-2 px-3 py-3">
      {/* 頭像圓圈 */}
      <div className="size-10 rounded-full bg-bg-tertiary shrink-0" />
      {/* 名稱 + 最後訊息 */}
      <div className="grow space-y-2">
        <div className="h-3.5 bg-bg-tertiary rounded w-1/3" />
        <div className="h-3 bg-bg-tertiary rounded w-2/3" />
      </div>
      {/* 時間 + 未讀 badge */}
      <div className="flex flex-col gap-2 items-center shrink-0">
        <div className="h-3 bg-bg-tertiary rounded w-8" />
        <div className="size-[18px] rounded-full bg-bg-tertiary" />
      </div>
    </div>
  )
}

export default function SkeletonChatList() {
  return (
    <div className="animate-pulse">
      <div className="h-3.5 bg-bg-tertiary rounded w-16 ml-3 mb-2" />
      <ul className="space-y-0.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i}>
            <SkeletonChatItem />
          </li>
        ))}
      </ul>
    </div>
  )
}
