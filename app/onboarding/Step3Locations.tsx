"use client";
import LocationChip from "@/components/onbaording/LocationChip";
import PlacesAutocomplete from "@/components/shared/PlacesAutocomplete";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import ButtonLoadingSpinner from "@/components/shared/ButtonLoadingSpinner";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { MdOutlineMyLocation } from "react-icons/md";
import { IoLocationSharp } from "react-icons/io5";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

interface Step3LocationsProps {
  selectedPlaces: google.maps.places.Place[]
  setSelectedPlaces: (places: google.maps.places.Place[]) => void
  completeOnboarding: () => Promise<void>
  isSubmitting: boolean
  submitError: string
  setCoords: (coords: { latitude: number | null; longitude: number | null }) => void
}


function Step3Locations({selectedPlaces, setSelectedPlaces, completeOnboarding, isSubmitting, submitError, setCoords}:Step3LocationsProps) {

  const [ placeError, setPlaceError ] = useState<string>("")

  // useMapsLibrary('places') 會在 Places 函式庫載入完成後回傳該函式庫物件
  // 回傳值本身不重要，重要的是：它不為 null 就代表 google.maps.places.* 已可使用
  // 這個 hook 是 @vis.gl/react-google-maps 提供的，需要在 APIProvider 內才能使用
  const placesLib = useMapsLibrary('places')

  // nearbyPlaces：目前顯示的附近地點推薦清單（IP 或 GPS 定位後取得）
  const [nearbyPlaces, setNearbyPlaces] = useState<google.maps.places.Place[]>([])
  // isLoadingNearby：正在搜尋附近地點中（顯示 loading spinner）
  const [isLoadingNearby, setIsLoadingNearby] = useState(false)
  // coordSource：目前定位來源，用來顯示對應的說明文字
  //   'ip'  → 依網路位置估算（精確度較低，但不需要使用者授權）
  //   'gps' → 依 GPS 定位（精確，需要使用者授權）
  //   null  → 尚未定位
  const [coordSource, setCoordSource] = useState<'ip' | 'gps' | null>(null)
  // isLocating：使用者點擊「使用目前位置」後，等待 GPS 回應的期間
  const [isLocating, setIsLocating] = useState(false)

  // ─── 附近搜尋核心函式 ────────────────────────────────────────────
  // 接收座標，呼叫 Google Places API (New) 的 Nearby Search 取得附近運動場所
  const searchNearbyPlaces = async (lat: number, lng: number, radius: number) => {
    setIsLoadingNearby(true)
    try {
      // Place.searchNearby() 是 New Places API 的靜態方法
      // fields：要求 API 回傳的欄位（只取需要的，避免多餘計費）
      // locationRestriction：搜尋範圍（圓形，單位：公尺）
      // includedTypes：限定地點類型，參考 Google Place Types 文件
      // maxResultCount：最多回傳幾筆（最大 20）
      const { places } = await google.maps.places.Place.searchNearby({
        fields: ['id', 'displayName', 'formattedAddress', 'location'],
        locationRestriction: {
          center: { lat, lng },
          radius,
        },
        includedTypes: ['gym', 'fitness_center', 'yoga_studio', 'stadium'],
        maxResultCount: 5,
      })
      setNearbyPlaces(places)
    } catch (err) {
      // 搜尋失敗就靜默處理，不擋使用者操作（附近推薦是輔助功能）
      console.log('Nearby search error:', err)
    } finally {
      setIsLoadingNearby(false)
    }
  }

  // ─── 步驟一：頁面載入時，用 IP 位置做基礎推薦 ────────────────────
  // placesLib 載入完才執行，確保 google.maps.places.* 已可用
  useEffect(() => {
    if (!placesLib) return

    async function fetchNearbyByIP() {
      setIsLoadingNearby(true)
      try {
        // ipapi.co 是免費的 IP 地理位置服務，回傳 city、latitude、longitude 等
        // IP 定位精確度：城市級（誤差可能幾公里），所以用較大的搜尋半徑 5000m
        const res = await fetch('https://ipapi.co/json/')
        const data = await res.json()

        if (data.latitude && data.longitude) {
          setCoordSource('ip')
          setCoords({latitude: data.latitude, longitude: data.longitude})
          await searchNearbyPlaces(data.latitude, data.longitude, 5000)
        }
      } catch (err) {
        // IP 定位失敗就不顯示推薦，不影響主流程
        console.log('IP geolocation error:', err)
        setIsLoadingNearby(false)
      }
    }

    fetchNearbyByIP()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placesLib]) // placesLib 從 null 變成函式庫物件時觸發一次

  // ─── 步驟二：使用者主動授權，用 GPS 取得精確推薦 ────────────────
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return
    setIsLocating(true)

    // getCurrentPosition 是非同步的（callback 形式，不是 Promise）
    navigator.geolocation.getCurrentPosition(
      // 成功 callback：取得精確座標後重新搜尋，GPS 精確所以縮小半徑到 2000m
      async (position) => {
        const { latitude, longitude } = position.coords
        setCoordSource('gps')
        setCoords({latitude, longitude})
        await searchNearbyPlaces(latitude, longitude, 2000)
        setIsLocating(false)
      },
      // 失敗 callback：使用者拒絕授權，或裝置沒有 GPS
      (error) => {
        console.log('GPS error:', error)
        setIsLocating(false)
      }
    )
  }

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
      <button
        type="button"
        onClick={handleUseCurrentLocation}
        disabled={isLocating}
        className="flex items-center gap-2 px-2 py-1 text-primary cursor-pointer max-w-[150px] rounded-full transition hover:bg-bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLocating
          ? <ButtonLoadingSpinner color="border-primary" gapColor={null}/>
          : <MdOutlineMyLocation size={20}/>
        }
        <span className="text-sm">{isLocating ? "定位中..." : "使用目前位置"}</span>
      </button>

      {/* 附近推薦區塊 */}
      <div>
        {/* 標題列：說明目前定位來源 */}
        <div className="flex items-center gap-2 mb-2">
          <p className="text-text-secondary text-xs">附近的運動場所</p>
          {/* coordSource 決定顯示哪種說明文字 */}
          {/* {coordSource === 'ip'  && <span className="text-text-secondary text-xs">（依您網路位置估算）</span>} */}
          {coordSource === 'gps' && <span className="text-xs text-accent">（已取得 GPS 定位）</span>}
        </div>

        {isLoadingNearby ? (
          // 搜尋中：顯示 loading spinner
          <LoadingSpinner />
        ) : nearbyPlaces.length > 0 ? (
          // 有結果：列出地點卡片，過濾掉已選的避免重複
          <ul className="space-y-2">
            {nearbyPlaces
              .filter(place => !selectedPlaces.some(s => s.id === place.id))
              .map(place => (
                <li key={place.id}>
                  <button
                    type="button"
                    onClick={() => onPlaceSelect(place)}
                    className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl border border-border hover:bg-bg-tertiary hover:border-primary transition"
                  >
                    {/* <IoLocationSharp size={18} className="shrink-0 text-primary ml-1" /> */}
                    <div className="shrink-0 text-primary ml-1 text-2xl">📍</div>
                    <div className="min-w-0 p-0.5 flex-1 space-y-1">
                      <p className="text-sm text-text-primary font-semibold truncate">{place.displayName}</p>
                      <p className="text-xs text-text-secondary truncate">{place.formattedAddress}</p>
                    </div>
                    {/* 右側 + 提示使用者可點擊新增 */}
                    <span className="text-primary font-semibold text-2xl shrink-0 mr-2">+</span>
                  </button>
                </li>
              ))
            }
          </ul>
        ) : coordSource !== null && (
          // 有定位但搜尋無結果
          <p className="text-text-secondary text-xs text-center py-4">附近沒有找到運動場所</p>
        )}
      </div>

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