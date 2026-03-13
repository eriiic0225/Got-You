import { supabase } from "@/lib/supabase/client";
import { useExploreStore } from "@/stores/useExploreStore";
import { useUserStore } from "@/stores/useUserStore";
import { useEffect, useState } from "react";
import type { UserCardProfile } from '@/components/explore/UserCard'

function useExploreUser(){

  const profile = useUserStore(state => state.profile)
  const filters = useExploreStore(state => state.filters)

  const [matchedUsers, setMatchedUsers] = useState<UserCardProfile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(()=>{
    
    async function fetchUsers(){
      if (!profile?.id) return // 如過當前用戶資料還沒載入就先跳出
      setIsLoading(true)

      // 基礎 query (沒任何特定條件)
      let query = supabase
        .from('users')
        .select(`id, nickname, gender, birthday, bio, avatar_url, longitude, latitude, 
          user_sport_preferences(sport_types ( id, name )), 
          user_gym_locations(gym_locations ( place_id:google_place_id, name ))`)
        .eq('onboarding_completed', true)
        .neq('id', profile?.id)

      // 加上性別條件
      if (filters.genders.length > 0){
        query = query.in('gender', filters.genders)
      }

      // 加上年齡條件
      if (filters.ageRange[0] !== 18 || filters.ageRange[1] !== 60){
        const today = new Date()

        function pad(n: number){ // 把 get() 取得的數字轉成字串&補齊格式
          return String(n).padStart(2, '0')
        }

        function toDateStr (d:Date){ //把 Date 物件轉成 'YYYY-MM-DD' 字串
          return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
        }


        const minBirthDay = toDateStr(new Date(
          (today.getFullYear() - filters.ageRange[0]),
          today.getMonth(), today.getDate()
      ))

        const maxBirthDay = toDateStr(new Date(
          (today.getFullYear() - filters.ageRange[1]),
          today.getMonth(), today.getDate()
      ))

        query = query
          .gte('birthday', maxBirthDay)
          .lte('birthday', minBirthDay)
      }


      // 加上運動偏好條件（兩段式查詢）
      if (filters.sportTypeIds.length > 0){
        const { data:match, error: matchError } = await supabase // 先在這邊抓回所有選擇這個偏好運動的用戶ID
          .from('user_sport_preferences')
          .select('user_id')
          .in('sport_type_id', filters.sportTypeIds)

      console.log('sportTypeIds:', filters.sportTypeIds)
      console.log('match:', match)
      console.log('matchError:', matchError)

        const matchedIds = match?.map(r => r.user_id)
        console.log('matchedIds:', matchedIds)

        query = query.in('id', matchedIds!)
      }

      const { data, error } = await query

      if (error) {
        console.error(error)
        setError(error.message)
        setIsLoading(false)
      } else {
        const userList = data.map((r)=>{
          return {
            id: r.id,
            avatar_url: r.avatar_url,
            nickname: r.nickname,
            birthday: r.birthday,
            gender: r.gender,
            bio: r.bio,
            latitude: r.latitude,
            longitude: r.longitude,
            sport_types: r.user_sport_preferences.flatMap(s => s.sport_types).map(s => s.name),
            locations: r.user_gym_locations.flatMap(l => l.gym_locations).map(l => l.name)
          }
        })
        setMatchedUsers(userList)
        setIsLoading(false)
      }
    }
    
    fetchUsers()
  }, [filters, profile])

  return { matchedUsers, isLoading, error }
}

export default useExploreUser