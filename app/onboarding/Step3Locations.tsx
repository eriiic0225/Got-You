"use client";
import PlacesAutocomplete from "@/components/shared/PlacesAutocomplete";
import { MdOutlineMyLocation } from "react-icons/md";

interface Step3LocationsProps {
  selectedPlaces: google.maps.places.Place[]
  setSelectedPlaces: (places: google.maps.places.Place[]) => void
}


function Step3Locations({selectedPlaces, setSelectedPlaces}:Step3LocationsProps) {
  
  const onPlaceSelect = (place: google.maps.places.Place | null)=>{
    if(place){
      setSelectedPlaces([...selectedPlaces, place])
    }
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
        <MdOutlineMyLocation />
        <span>使用目前位置</span>
      </button>

    </>
  );
}

export default Step3Locations;
