'use client'
import { useAutocompleteSuggestions } from "@/hooks/useAutocompleteSuggestions"
import { useMapsLibrary } from "@vis.gl/react-google-maps"
import { useState } from "react"
// useCallback 已移除：這個專案有裝 React Compiler，它會自動處理 memoization，
// 手動寫 useCallback 反而會和 compiler 的分析衝突，造成警告。
import { IoLocationSharp } from "react-icons/io5";


interface Props {
    onPlaceSelect: (place: google.maps.places.Place | null) => void
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

    // placePrediction.toPlace() 把建議轉成 Place 物件，
    // 但此時 Place 只有基本資訊，還沒有座標、viewport 等詳細資料。
    const place = suggestion.placePrediction.toPlace();

    // fetchFields 向 API 要求指定欄位的詳細資料
    await place.fetchFields({
      fields: ['displayName', 'formattedAddress', 'location']
    });

    setInputValue('');
    // fetchFields 之後 session token 會失效，必須重置，
    // 確保下一次搜尋開啟新的計費 session
    resetSession();
    onPlaceSelect(place);
  };


  return(
    <div className="relative">
      <input
        type="search"
        onInput={event => handleInput(event)}
        value={inputValue}
        placeholder="🔍 搜尋運動場所"
        className="bg-bg-secondary w-full rounded-md px-3 py-2 border border-border text-sm focus:outline-none focus:border-primary transition"
      />

      {suggestions.length > 0 && (
        // absolute 讓 dropdown 浮在內容上方，不影響頁面排版
        // max-h + overflow-y-auto 限制最多顯示約 4 筆，超過可捲動
        <ul className="absolute z-10 top-full mt-1 px-1 w-full bg-bg-secondary drop-shadow-xl rounded-md overflow-y-auto max-h-75">
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
