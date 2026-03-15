import { supabase } from "@/lib/supabase/client";
import { useExploreStore } from "@/stores/useExploreStore";
import { useUserStore } from "@/stores/useUserStore";
import { useEffect, useState } from "react";
import type { UserCardProfile } from '@/components/explore/UserCard'

function useExploreUser(){

  const profile = useUserStore(state => state.profile)
  const { activeTab, filters }= useExploreStore()

  const [matchedUsers, setMatchedUsers] = useState<UserCardProfile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(()=>{

    async function fetchUsers() {
      if (!profile?.id) return // 如過當前用戶資料還沒載入就先跳出
      setIsLoading(true)
      const { data, error } = await supabase
        .rpc(
          'get_recommended_users', 
          { p_tab: activeTab ,
            p_sport_ids: filters.sportTypeIds,
            p_genders: filters.genders,
            p_age_min: filters.ageRange[0],
            p_age_max: filters.ageRange[1],
            ...(activeTab === 'nearby' && { p_max_distance: filters.maxDistance }) // 只有附近用戶模式才傳距離限制
          })

      console.log(data)
      
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
    
  }, [filters, profile, activeTab])

  return { matchedUsers, isLoading, error }
}

export default useExploreUser