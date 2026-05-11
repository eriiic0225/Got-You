import { supabase } from "@/lib/supabase/client";
import { useExploreStore } from "@/stores/useExploreStore";
import { useUserStore } from "@/stores/useUserStore";
import { useEffect, useRef, useState } from "react";
import type { UserCardProfile } from '@/components/explore/UserCard'

interface UseExploreUserOptions {
  initialUsers?: UserCardProfile[]
}

function useExploreUser({ initialUsers = [] }: UseExploreUserOptions = {}){

  const profile = useUserStore(state => state.profile)
  const { activeTab, filters }= useExploreStore()

  const [matchedUsers, setMatchedUsers] = useState<UserCardProfile[]>(initialUsers)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 首次 client-side effect 跳過 fetch，沿用 Server Component 給的 initialUsers，
  // 避免進頁面後立刻重抓一次相同資料造成閃爍
  const hasUsedInitial = useRef(true)

  useEffect(()=>{
    if (!profile?.id) return

    if (hasUsedInitial.current) {
      hasUsedInitial.current = false
      return
    }

    const ac = new AbortController()

    async function fetchUsers() {
      setIsLoading(true)
      const { data, error } = await supabase
        .rpc(
          'get_recommended_users',
          { p_tab: activeTab ,
            p_sport_ids: filters.sportTypeIds,
            p_genders: filters.genders,
            p_age_min: filters.ageRange[0],
            p_age_max: filters.ageRange[1],
            ...(activeTab === 'nearby' && { p_max_distance: filters.maxDistance })
          })
        .abortSignal(ac.signal)

      if (ac.signal.aborted) return

      if (error) {
        console.error(error)
        setError(error.message)
        setIsLoading(false)
      } else {
        const userList: UserCardProfile[] = data.map((r: UserCardProfile) => ({
          id: r.id,
          nickname: r.nickname,
          gender: r.gender,
          birthday: r.birthday,
          bio: r.bio,
          avatar_url: r.avatar_url,
          latitude: r.latitude,
          longitude: r.longitude,
          sport_types: r.sport_types,
          locations: r.locations,
          distance_km: r.distance_km
        }))
        setMatchedUsers(userList)
        setIsLoading(false)
      }
    }
    fetchUsers()

    return () => ac.abort()

  }, [filters, profile?.id, activeTab])

  return { matchedUsers, isLoading, error }
}

export default useExploreUser