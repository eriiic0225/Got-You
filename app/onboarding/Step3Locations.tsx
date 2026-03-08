"use client";
import LocationChip from "@/components/onbaording/LocationChip";
import PlacesAutocomplete from "@/components/shared/PlacesAutocomplete";
import { supabase } from "@/lib/supabase/client";
import { useState } from "react";
import { MdOutlineMyLocation } from "react-icons/md";
import ButtonLoadingSpinner from "@/components/shared/ButtonLoadingSpinner";

interface Step3LocationsProps {
  selectedPlaces: google.maps.places.Place[]
  setSelectedPlaces: (places: google.maps.places.Place[]) => void
  completeOnboarding: () => Promise<void>
  isSubmitting: boolean
  submitError: string
}


function Step3Locations({selectedPlaces, setSelectedPlaces, completeOnboarding, isSubmitting, submitError}:Step3LocationsProps) {

  const [ placeError, setPlaceError ] = useState<string>("")
  
  const onPlaceSelect = async(place: google.maps.places.Place | null)=>{
    if(place){
      if(selectedPlaces.length < 3 ){
        setSelectedPlaces([place, ...selectedPlaces])
        const newLocation = {
          google_place_id: place.id,
          name: place.displayName,
          address: place.formattedAddress,
          latitude: place.location?.lat() ?? null,
          longitude: place.location?.lng() ?? null
        }
        const { error } = await supabase
          .from('gym_locations')
          .upsert(newLocation)
      }else{
        setPlaceError("最多只能選取 3 個常去地點！")
        setTimeout(() => setPlaceError(""), 5000)
      }
    }
  }

  const deletLocation = (id:string)=>{
    setSelectedPlaces(selectedPlaces.filter(place => place.id !== id))
  }

  return (
    <>
      <div>
        <h2 className="text-text-primary font-semibold">
          選擇你常去的運動地點
        </h2>
        <p className="text-text-secondary text-xs mt-1">
          我們會為你推薦附近的運動的夥伴
        </p>
      </div>
      {/* 地點搜尋 + 建議combobox */}
      <PlacesAutocomplete onPlaceSelect={onPlaceSelect}/>
      {/* 取得使用者現在位址的定位按鈕 */}
      <button className="flex items-center gap-2 px-2 py-1 text-primary cursor-pointer max-w-[140px] rounded-full transition hover:bg-bg-tertiary">
        <MdOutlineMyLocation size={20}/>
        <span className="text-sm">使用目前位置</span>
      </button>

      <div className="flex-1" />

      {selectedPlaces.length > 0 && (
        <div>
          <p className="text-text-secondary text-xs mb-2 ml-2">已選擇的地點</p>
          <ul className="flex flex-wrap gap-2">
            {selectedPlaces.map((place)=>(
              <LocationChip key={place.id} onDelete={deletLocation} place={place}/>
            ))}
          </ul>
        </div>
      )}
      

      {placeError && <p className="text-center text-red-400 text-xs mt-1">{placeError}</p>}
      {submitError && <p className="text-center text-red-400 text-xs mt-1">{submitError}</p>}
      <button
        type="button"
        onClick={completeOnboarding}
        className="bg-primary text-bg-secondary font-semibold w-full px-3 py-2 rounded-md hover:bg-primary-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isSubmitting}
        >
        {isSubmitting ? <ButtonLoadingSpinner color={"border-bg-primary"} gapColor={null}/> : "完成設定"}
      </button>
    </>
  );
}

export default Step3Locations