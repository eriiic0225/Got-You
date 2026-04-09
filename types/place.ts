// 地點資料的精簡型別，供 PlacesAutocomplete 及各父元件共用
// 與 google.maps.places.Place 解耦：父元件不需依賴 Google Maps SDK 的 class 型別，
// 無論資料來源是 Google Places API 還是 Supabase 快取，都用同一個介面表示

export interface SelectedPlace {
  // Google Place ID，對應 gym_locations.google_place_id
  id: string
  // 地點顯示名稱（例如「World Gym 信義店」）
  displayName: string
  // 完整地址（例如「台北市信義區松高路...」），可能為 null
  formattedAddress: string | null
  // 緯度，可能為 null（地點資料不完整時）
  latitude: number | null
  // 經度，可能為 null
  longitude: number | null
}
