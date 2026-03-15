'use client'

import { useState } from "react"
import { useUserStore, type UserProfile } from '@/stores/useUserStore'
import { supabase } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import PlacesAutocomplete from "../shared/PlacesAutocomplete"
import { IoLocationSharp } from "react-icons/io5";
import { MdAddLocationAlt } from "react-icons/md";
import { MdClose } from 'react-icons/md';

interface EditGymLocationsSectionProps {
  profile: UserProfile
}

interface Place {
  place_id: string
  name: string
}

const MAX_LOCATIONS = 3

export default function EditGymLocationsSection({profile}:EditGymLocationsSectionProps){

  const fetchUser = useUserStore(state => state.fetchUser)
  const [selectedPlaces, setSelectedPlaces] = useState<Place[]>(profile.gym_locations!)
  const [error, setError] = useState("")

  const onPlaceSelect = async(place: google.maps.places.Place | null) => {
    if (!place) return
    if (selectedPlaces.length >= MAX_LOCATIONS){
      setError("最多只能選取 3 個常去地點！請刪除部分後重試")
      setTimeout(() => setError(""), 5000)
      return
    }

    const newLocation = {
      google_place_id: place.id,
      name: place.displayName,
      address: place.formattedAddress,
      latitude: place.location?.lat() ?? null,
      longitude: place.location?.lng() ?? null
    }
    const { error: newLocationError } = await supabase
      .from('gym_locations')
      .upsert(newLocation)

    const { error: userLocationError } = await supabase
      .from("user_gym_locations")
      .upsert({ user_id: profile.id, location_id: place.id })

    if (userLocationError) {
      console.error(newLocationError || userLocationError)
      setError("新增常去地點失敗，請再試一次")
      return
    }

    // DB 成功後才更新 UI state（避免失敗時要回滾）
    setSelectedPlaces(prev => [...prev, { place_id: place.id, name: place.displayName! }])
    fetchUser()
  }

  const onPlaceDelete = async(placeId: string) => {
    const { error } = await supabase
      .from("user_gym_locations")
      .delete()
      .eq("user_id", profile.id)
      .eq("location_id", placeId)

    if (error) {
      setError("刪除地點失敗，請再試一次")
      return
    }

    // DB 成功後才更新 UI state
    setSelectedPlaces(prev => prev.filter(l => l.place_id !== placeId))
    fetchUser()
  }
  return (
    <div className="bg-bg-secondary rounded-2xl p-6 shadow">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold">編輯常去地點</h3>
        {/* 已選數量提示：接近上限時提醒使用者 */}
        <span 
          className={cn("text-xs text-text-secondary",
            selectedPlaces.length >= MAX_LOCATIONS && "text-primary"
        )}>
          {selectedPlaces.length} / {MAX_LOCATIONS}
        </span>
      </div>
      {/* 這邊顯示所有已選中的地點 */}
      <div className="mb-2 text-sm text-text-secondary flex items-center gap-1.5">
        <IoLocationSharp className="text-primary"/>
        <p>已選擇的地點</p>
      </div>

      <div className="flex flex-col gap-1.5 mb-4 px-2">
        {selectedPlaces.map((loc) => (
          <div key={loc.place_id} className="group relative w-fit">
            <p className="text-xs px-2.5 py-1.5 rounded-md bg-bg-tertiary text-text-secondary border border-border hover:border-primary-hover">
              📍 {loc.name}
            </p>
            <button
              onClick={() => onPlaceDelete(loc.place_id)}
              className="absolute -top-1.5 -right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition cursor-pointer"
            >
              <MdClose size={12} className="text-white" />
            </button>
          </div>
        ))}
      </div>

      { error && <p className="text-red-400 text-xs mb-2">{error}</p> }
      
      <div className="mb-2 text-sm text-text-secondary flex items-center gap-1.5">
        <MdAddLocationAlt className="text-primary"/>
        <p>搜尋以新增更多地點</p>
      </div>
      <div className="px-2">
        <PlacesAutocomplete onPlaceSelect={onPlaceSelect}/>
      </div>
    </div>
  )
}