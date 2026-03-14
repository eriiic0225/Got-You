import { create } from "zustand";
import type { Gender } from "./useExploreStore";
import { supabase } from "@/lib/supabase/client";

// 用戶本人的資料型別，跟其他 UserBase 的不同，需要多儲存運動和地點的 id (之後搜尋用)
export interface UserProfile {
  id: string | null
  nickname: string | null,
  gender: Gender | null, 
  birthday: string | null,
  bio: string | null,
  avatar_url: string | null,
  longitude: number | null,
  latitude: number | null,
  sport_preferences: { id: string; name: string }[] | null
  gym_locations: { place_id: string; name: string }[] | null
}

interface UserState {
  profile : UserProfile | null
  fetchUser: () => Promise<void>
}

export const useUserStore = create<UserState>((set)=>({
  profile: null,
  
  fetchUser: async () => { 
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data, error } = await supabase
      .from('users')
      .select(`id, nickname, gender, birthday, bio, avatar_url, longitude, latitude, 
        user_sport_preferences(sport_types ( id, name )), 
        user_gym_locations(gym_locations ( place_id:google_place_id, name ))`)
      .eq('id', session.user.id)
      .single()

    console.log(data)

    if (error) { console.error(error); return }
    
    set(
      {profile: {
        id: data.id,
        nickname: data.nickname,
        gender: data.gender,
        birthday: data.birthday,
        bio: data.bio,
        avatar_url: data.avatar_url,
        longitude: data.longitude,
        latitude: data.latitude,
        sport_preferences: data.user_sport_preferences.flatMap(s => s.sport_types),
        gym_locations: data.user_gym_locations.flatMap(l => l.gym_locations)
      }
    })

  }
}))