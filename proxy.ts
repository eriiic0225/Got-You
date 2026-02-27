// proxy.ts（專案根目錄）
// Next.js 16 的請求攔截入口點，概念上等同於舊版的 middleware.ts
// 每次使用者發出 request 時，Next.js 會先執行這裡，再渲染頁面
//
// 這個檔案刻意保持「很薄」，實際邏輯都放在 lib/supabase/proxy.ts
// 這樣職責清楚，也方便之後維護

import { type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/proxy"

// Next.js 規定：函式名稱必須叫做 proxy（就像舊版必須叫 middleware）
export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

// matcher：告訴 Next.js 這個 proxy 要攔截哪些路徑
// 以下這個正規表達式的意思是：
//   攔截「所有路徑」，但排除：
//   - _next/static  → Next.js 的靜態檔案（JS、CSS）
//   - _next/image   → Next.js 的圖片最佳化服務
//   - favicon.ico   → 網站小圖示
//   - 圖片檔案（svg, png, jpg, jpeg, gif, webp）
//
// 為什麼要排除這些？
// 因為這些是靜態資源，不需要做 auth 檢查，排除可以提升效能
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
