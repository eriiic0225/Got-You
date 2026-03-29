// components/posts/SkeletonPostDetail.tsx
// 揪團詳情頁載入中時的佔位元件，對應 PostDetail + ParticipateButton + CommentSection 的版型

// 單則留言的骨架
function SkeletonComment() {
  return (
    <div className="px-6 py-4 flex gap-3 border-t border-border">
      {/* 頭像 */}
      <div className="size-8 rounded-full bg-bg-tertiary shrink-0" />
      {/* 名稱 + 內容 */}
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-3 w-16 bg-bg-tertiary rounded" />
          <div className="h-3 w-20 bg-bg-tertiary rounded" />
        </div>
        <div className="h-3 w-full bg-bg-tertiary rounded" />
        <div className="h-3 w-3/4 bg-bg-tertiary rounded" />
      </div>
    </div>
  )
}

export default function SkeletonPostDetail() {
  return (
    <div className="animate-pulse space-y-4">

      {/* 主卡片：對應 PostDetail + ParticipateButton */}
      <div className="bg-bg-secondary border border-border rounded-xl overflow-hidden">
        {/* 頂部綠條 */}
        <div className="h-1 bg-bg-tertiary" />

        <div className="p-6">
          {/* 上排：badge + 作者 */}
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2">
              <div className="h-6 w-20 bg-bg-tertiary rounded-full" />
              <div className="h-3 w-24 bg-bg-tertiary rounded" />
            </div>
            <div className="flex items-center gap-2">
              <div className="size-9 rounded-full bg-bg-tertiary shrink-0" />
              <div className="h-3 w-16 bg-bg-tertiary rounded" />
            </div>
          </div>

          {/* 標題 */}
          <div className="h-5 w-2/3 bg-bg-tertiary rounded mb-4" />

          {/* 時間 + 地點 */}
          <div className="space-y-2 mb-5">
            <div className="flex items-center gap-2">
              <div className="size-4 bg-bg-tertiary rounded shrink-0" />
              <div className="h-3 w-36 bg-bg-tertiary rounded" />
            </div>
            <div className="flex items-center gap-2">
              <div className="size-4 bg-bg-tertiary rounded shrink-0" />
              <div className="h-3 w-44 bg-bg-tertiary rounded" />
            </div>
          </div>

          {/* 分隔線 */}
          <div className="border-t border-border mb-5" />

          {/* 說明文字（三行） */}
          <div className="space-y-2">
            <div className="h-3 w-full bg-bg-tertiary rounded" />
            <div className="h-3 w-11/12 bg-bg-tertiary rounded" />
            <div className="h-3 w-4/5 bg-bg-tertiary rounded" />
          </div>
        </div>

        {/* ParticipateButton 區域 */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-3 w-16 bg-bg-tertiary rounded" />
            <div className="h-3 w-16 bg-bg-tertiary rounded" />
          </div>
          <div className="h-9 w-24 bg-bg-tertiary rounded-lg" />
        </div>

        {/* 留言區 skeleton（3 則） */}
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonComment key={i} />
        ))}
      </div>

    </div>
  )
}
