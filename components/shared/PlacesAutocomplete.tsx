'use client'
import { useAutocompleteSuggestions } from "@/hooks/useAutocompleteSuggestions"
import { useMapsLibrary } from "@vis.gl/react-google-maps"
import { useState } from "react"
// useCallback 已移除：這個專案有裝 React Compiler，它會自動處理 memoization，
// 手動寫 useCallback 反而會和 compiler 的分析衝突，造成警告。
import { IoLocationSharp } from "react-icons/io5";
import { supabase } from "@/lib/supabase/client";
import type { SelectedPlace } from "@/types/place";


interface Props {
  // 使用者選取地點後的 callback，回傳 SelectedPlace（與 Google SDK 型別解耦）
  onPlaceSelect: (place: SelectedPlace) => void
}

function PlacesAutocomplete({onPlaceSelect}: Props){
  const places = useMapsLibrary('places')

  const [inputValue, setInputValue] = useState<string>("")
  const {suggestions, resetSession} = useAutocompleteSuggestions(inputValue, {
    includedRegionCodes: ['tw'],
    // includedPrimaryTypes: ['gym', 'fitness_center', 'sports_activity_location', 'park', 'playground'],
  }); // 後面的物件參數是用來強化特定類別的搜尋結果（測試後發現加上限制建議會變太嚴格，導致部分地點無法被搜尋到）

  const handleInput = (event: React.FormEvent<HTMLInputElement>) => {
    setInputValue(event.currentTarget.value);
  };

  const handleSuggestionClick = async (suggestion: google.maps.places.AutocompleteSuggestion) => {
    if (!places) return;
    if (!suggestion.placePrediction) return;

    // placePrediction.toPlace() 把建議轉成 Place 物件。
    // 此時 place.id（Google Place ID）已可用，但 displayName、location 等詳細欄位尚未載入。
    const place = suggestion.placePrediction.toPlace();
    const placeId = place.id;

    setInputValue('');
    // session token 在使用者做出選擇後就要重置，
    // 確保下一次搜尋開啟新的計費 session
    resetSession();

    // ── 步驟 1：查詢本地快取（Supabase gym_locations）────────────────────────
    // Google Places API 的 fetchFields 是付費呼叫，
    // 若此地點已被其他使用者儲存過，直接使用資料庫快取，避免重複計費。
    const { data: cached } = await supabase
      .from('gym_locations')
      .select('google_place_id, name, address, latitude, longitude')
      .eq('google_place_id', placeId)
      .maybeSingle()

    if (cached) {
      // 快取命中：直接回傳資料庫內的地點資料，不呼叫 Google Places API
      onPlaceSelect({
        id: cached.google_place_id,
        displayName: cached.name,
        formattedAddress: cached.address,
        latitude: cached.latitude,
        longitude: cached.longitude,
      });
      return;
    }

    // ── 步驟 2：快取未命中，才向 Google Places API 要求詳細欄位 ──────────────
    await place.fetchFields({
      fields: ['displayName', 'formattedAddress', 'location']
    });

    onPlaceSelect({
      id: placeId,
      displayName: place.displayName ?? '',
      formattedAddress: place.formattedAddress ?? null,
      latitude: place.location?.lat() ?? null,
      longitude: place.location?.lng() ?? null,
    });
  };


  return(
    <div className="relative">
      <input
        type="search"
        onInput={event => handleInput(event)}
        value={inputValue}
        placeholder="🔍 搜尋運動場所"
        className="bg-bg-secondary w-full rounded-md px-3 py-2 border border-border text-base md:text-sm focus:outline-none focus:border-primary transition"
      />

      {suggestions.length > 0 && (
        // absolute 讓 dropdown 浮在內容上方，不影響頁面排版
        // max-h + overflow-y-auto 限制最多顯示約 4 筆，超過可捲動
        <ul className="absolute z-10 top-full mt-1 px-1 w-full bg-bg-secondary drop-shadow-xl drop-shadow-border rounded-md overflow-y-auto max-h-75">
          {suggestions.map((suggestion, index) => {
            const prediction = suggestion.placePrediction
            return (
              <li key={index} className="border-b border-border last:border-b-0">
                <button
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="flex items-center gap-2 w-full text-left px-3 py-2.5 my-1 hover:bg-bg-tertiary hover:rounded-md focus:rounded-md transition cursor-pointer">
                  <IoLocationSharp size={30} className="rounded-full p-1.5 bg-border shrink-0"/>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    {/* 主要文字：地點名稱 */}
                    <span className="text-sm text-text-primary truncate">
                      {prediction?.mainText?.text}
                    </span>
                    {/* 次要文字：地址，較小較淡 */}
                    <span className="text-xs text-text-secondary truncate">
                      {prediction?.secondaryText?.text}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  )
}

export default PlacesAutocomplete
