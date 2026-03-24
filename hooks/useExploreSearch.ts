import { useState, useEffect } from "react"
import type { UserCardProfile } from "@/components/explore/UserCard"
import { supabase } from "@/lib/supabase/client"

type SportPrefRow = { sport_types: { name: string } | null }
type GymLocRow = { gym_locations: { name: string } | null }

export default function useExploreSearch(query: string){
  const [results, setResults] = useState<UserCardProfile[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    
    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setResults([])
        return 
      }
      setIsSearching(true)

      const newQuery = query.startsWith("@") 
        ? `%${query.slice(1)}%`
        : `%${query}%`

      let userList

      if (query.startsWith('@')) {
        const { data } = await supabase
          .from('users')
          .select(`
            id, nickname, avatar_url, birthday, gender, bio, latitude, longitude,
            user_sport_preferences(sport_types(name)),
            user_gym_locations(gym_locations(name))
          `)
          .ilike('nickname', newQuery)

        userList = data?.map((r) => ({
          id: r.id,
          nickname: r.nickname,
          gender: r.gender,
          birthday: r.birthday,
          bio: r.bio,
          avatar_url: r.avatar_url,
          latitude: r.latitude,
          longitude: r.longitude,
          sport_types: (r.user_sport_preferences as unknown as SportPrefRow[])
            .map(sp => sp.sport_types?.name)
            .filter((n): n is string => !!n),
          locations: (r.user_gym_locations as unknown as GymLocRow[])
            .map(ul => ul.gym_locations?.name)
            .filter((n): n is string => !!n), 
        }))

        setResults(userList ?? [])

      } else {
        const { data: locations } = await supabase
          .from('gym_locations')
          .select(`place_id:google_place_id`)
          .or(`name.ilike.${newQuery},address.ilike.${newQuery}`)

        if (locations){
          const { data: userIds } = await supabase
            .from('user_gym_locations')
            .select(`user_id`)
            .in('location_id', locations.map(s => s.place_id))

          if (userIds) {
            const { data: users } = await supabase
              .from('users')
              .select(`
                id, nickname, avatar_url, birthday, gender, bio, latitude, longitude,
                user_sport_preferences(sport_types(name)),
                user_gym_locations(gym_locations(name))
              `)
              .in('id', userIds.map(u => u.user_id))

              userList = users?.map((r) => ({
                id: r.id,
                nickname: r.nickname,
                gender: r.gender,
                birthday: r.birthday,
                bio: r.bio,
                avatar_url: r.avatar_url,
                latitude: r.latitude,
                longitude: r.longitude,
                sport_types: (r.user_sport_preferences as unknown as SportPrefRow[])
                  .map(sp => sp.sport_types?.name)
                  .filter((n): n is string => !!n),
                locations: (r.user_gym_locations as unknown as GymLocRow[])
                  .map(ul => ul.gym_locations?.name)
                  .filter((n): n is string => !!n),
              }))
              setResults(userList ?? [])
          }
        }

        
      }

      setIsSearching(false)
    }, 300)

    return () => clearTimeout(timer)  // 清掉上一次的 timer（這就是 debounce）
  }, [query])

  return { results, isSearching }

}