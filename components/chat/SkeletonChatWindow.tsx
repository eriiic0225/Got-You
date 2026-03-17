// SkeletonChatWindow.tsx
// ChatWindow 載入訊息時的佔位元件，結構與 ChatWindow 一致

// 單則訊息 bubble 的 skeleton
// isOwn: true → 靠右（自己），false → 靠左（對方）
function SkeletonBubble({ isOwn, width }: { isOwn: boolean; width: string }) {
  return (
    <div className={`flex items-end gap-2 px-3 py-0.5 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
      {/* 對方才有頭像佔位 */}
      {!isOwn && <div className="size-8 rounded-full bg-bg-tertiary shrink-0" />}
      <div
        className={`h-9 bg-bg-tertiary rounded-2xl ${width}`}
      />
    </div>
  )
}

export default function SkeletonChatWindow() {
  return (
    <div className="flex flex-col h-full animate-pulse">

      {/* header */}
      {/* <header className="flex gap-2 items-center border-b border-border p-2 shadow"> */}
        {/* 返回按鍵佔位 */}
        {/* <div className="size-8 rounded-full bg-bg-tertiary shrink-0" /> */}
        {/* 頭像 */}
        {/* <div className="size-8 rounded-full bg-bg-tertiary shrink-0" /> */}
        {/* 名稱 */}
        {/* <div className="h-4 bg-bg-tertiary rounded w-24" /> */}
      {/* </header> */}

      {/* 訊息列表 */}
      <div className="flex-1 overflow-y-auto py-2 space-y-1">
        {/* 模擬一段對話的排列：對方、對方、自己、自己、對方、自己 */}
        <SkeletonBubble isOwn={false} width="w-40" />
        <SkeletonBubble isOwn={false} width="w-56" />
        <SkeletonBubble isOwn={true}  width="w-32" />
        <SkeletonBubble isOwn={true}  width="w-48" />
        <SkeletonBubble isOwn={false} width="w-44" />
        <SkeletonBubble isOwn={true}  width="w-36" />
        <SkeletonBubble isOwn={false} width="w-52" />
        <SkeletonBubble isOwn={true}  width="w-28" />
      </div>

      {/* 輸入框佔位 */}
      {/* <div className="shrink-0 mx-2 pb-2 pt-1">
        <div className="h-10 bg-bg-tertiary rounded-lg" />
      </div> */}

    </div>
  )
}
