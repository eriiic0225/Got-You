// app/(main)/explore/page.tsx
// Server Component：在 server 端抓初始用戶資料（共同地點 Tab、預設篩選），
// 透過 props 注入給 ExploreClient，避免進頁面時還要等 client-side useEffect 才看到內容

import { createClient } from '@/lib/supabase/server'
import ExploreClient from '@/components/explore/ExploreClient'
import type { UserCardProfile } from '@/components/explore/UserCard'

export default async function ExplorePage() {
  const supabase = await createClient()

  // 預設條件：共同地點 Tab、不限運動 / 性別、年齡 18-60
  // 後續使用者切篩選、切 Tab、改搜尋字串時，由 ExploreClient 內的 hook 自行重抓
  const { data } = await supabase.rpc('get_recommended_users', {
    p_tab: 'common',
    p_sport_ids: [],
    p_genders: [],
    p_age_min: 18,
    p_age_max: 60,
  })

  const initialUsers = (data ?? []) as UserCardProfile[]

  return <ExploreClient initialUsers={initialUsers} />
}
