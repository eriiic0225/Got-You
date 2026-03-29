// components/posts/SkeletonPostCard.tsx
// 揪團列表載入中時的佔位卡片，結構與 PostCard 一致，用 animate-pulse 呈現

function SkeletonPostCard() {
  return (
    <div className="bg-bg-secondary border border-border rounded-lg flex overflow-hidden">
      {/* 左側裝飾條 */}
      <div className="bg-bg-tertiary w-1 shrink-0" />

      {/* 內容區 */}
      <div className="p-4 grow">

        {/* 上排：badge + 作者 */}
        <div className="flex justify-between items-center mb-3">
          {/* 運動類型 badge + 發文時間 */}
          <div className="flex items-center gap-2">
            <div className="h-6 w-20 bg-bg-tertiary rounded-full" />
            <div className="h-3 w-24 bg-bg-tertiary rounded" />
          </div>
          {/* 作者頭像 + 名稱 */}
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-bg-tertiary shrink-0" />
            <div className="h-3 w-14 bg-bg-tertiary rounded" />
          </div>
        </div>

        {/* 活動時間列 */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="size-3.5 bg-bg-tertiary rounded shrink-0" />
          <div className="h-3 w-32 bg-bg-tertiary rounded" />
        </div>

        {/* 地點列 */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="size-3.5 bg-bg-tertiary rounded shrink-0" />
          <div className="h-3 w-40 bg-bg-tertiary rounded" />
        </div>

        {/* 標題 */}
        <div className="h-4 w-3/5 bg-bg-tertiary rounded mb-2" />

        {/* 說明（兩行） */}
        <div className="space-y-1.5 mb-4">
          <div className="h-3 bg-bg-tertiary rounded w-full" />
          <div className="h-3 bg-bg-tertiary rounded w-4/5" />
        </div>

        {/* 底部：人數 + 留言數 */}
        <div className="flex justify-between items-center pt-3 border-t border-border">
          <div className="h-3 w-20 bg-bg-tertiary rounded" />
          <div className="h-3 w-16 bg-bg-tertiary rounded" />
        </div>

      </div>
    </div>
  )
}

// 列表頁預設顯示 4 張骨架卡，包在 animate-pulse 外層統一控制動畫
export default function SkeletonPostList() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonPostCard key={i} />
      ))}
    </div>
  )
}
