// 這個 hook 負責向 Google Places API 發出 autocomplete 查詢，
// 並管理 session token 的生命週期。
// 可以在任何需要地點搜尋的元件中重複使用。

import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { useEffect, useRef, useState } from 'react';
// ⚠️ isLoading 已暫時移除：React Compiler 不允許在 useEffect 裡同步呼叫 setState。
// 若之後需要 loading 狀態，可以用 useReducer 或在元件層自行處理。

// ── 回傳值的型別定義 ─────────────────────────────────────────────────────────
export type UseAutocompleteSuggestionsReturn = {
  // 目前搜尋結果的建議陣列，每個元素都是 Google 提供的 AutocompleteSuggestion 物件
  suggestions: google.maps.places.AutocompleteSuggestion[];
  // 呼叫這個函式來「重置 session」——
  // 在使用者選了某個地點並呼叫 fetchFields() 之後必須呼叫，
  // 確保下一次搜尋從新的計費 session 開始。
  resetSession: () => void;
};

/**
 * useAutocompleteSuggestions
 *
 * 一個可重用的 custom hook，封裝了 Google Places Autocomplete Data API 的查詢邏輯。
 * 使用的是新版 API（AutocompleteSuggestion），相容 2025 年 3 月後建立的 Google Cloud 帳號。
 *
 * 使用方式：
 *   const { suggestions, isLoading, resetSession } = useAutocompleteSuggestions(inputValue)
 *
 * @param inputString   - 使用者在輸入框打的內容，每次變動都會觸發新的查詢
 * @param requestOptions - 可選的查詢參數，例如限制地點類型或地區
 *                         型別：Partial<google.maps.places.AutocompleteRequest>
 *                         常用欄位：
 *                           includedPrimaryTypes: ['gym', 'stadium'] （限定地點類型）
 *                           includedRegionCodes: ['tw']              （限定台灣地區）
 */
export function useAutocompleteSuggestions(
  inputString: string,
  requestOptions: Partial<google.maps.places.AutocompleteRequest> = {}
): UseAutocompleteSuggestionsReturn {

  // useMapsLibrary 是 @vis.gl/react-google-maps 提供的 hook，
  // 作用是「等待指定的 Google Maps 子函式庫載入完成後，回傳該函式庫的參考」。
  // 在 APIProvider 載入 Google Maps 腳本之前，placesLib 會是 null。
  const placesLib = useMapsLibrary('places');

  // ── Session Token ──────────────────────────────────────────────────────────
  // Session Token 是 Google 的計費優化機制：
  //   使用者「開始打字到選定地點」這整段流程，共用同一個 token，
  //   Google 只會把這段流程算成「一次」API 呼叫費用，
  //   而不是每按一個字就計費一次。
  //
  // 為什麼用 useRef 而不是 useState？
  //   因為 token 只是「幕後管理用的識別碼」，改變它不需要觸發重新渲染，
  //   useRef 儲存的值在 re-render 之間保持不變，且修改不會觸發渲染，很適合這種情況。
  const sessionTokenRef =
    useRef<google.maps.places.AutocompleteSessionToken>(null);

  // 搜尋結果的建議陣列，初始為空陣列
  const [suggestions, setSuggestions] = useState<
    google.maps.places.AutocompleteSuggestion[]
  >([]);

  // ── 核心查詢邏輯 ───────────────────────────────────────────────────────────
  // 每當 placesLib 載入完成，或是 inputString 改變時，就重新執行這段 effect。
  useEffect(() => {
    // 還沒載入完成就先跳出，等下次 effect 觸發
    if (!placesLib) return;

    // 從 placesLib 解構出我們要用的兩個 class
    const { AutocompleteSessionToken, AutocompleteSuggestion } = placesLib;

    // 如果目前沒有 session token，就建立一個新的。
    // token 會一直保留到 resetSession() 被呼叫為止。
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new AutocompleteSessionToken();
    }

    // 輸入框清空時，直接結束這次 effect，不發出 API 請求。
    // ⚠️ 不在這裡呼叫 setSuggestions([])！
    //    React Compiler 禁止在 useEffect 裡「同步」呼叫 setState，
    //    因為這樣是「用 effect 來同步 props → state」的反模式。
    //    「input 為空時顯示空陣列」這件事，應該在 return 時直接計算，
    //    而不是透過 effect 修改 state 來達成（見下方 return 說明）。
    if (inputString === '') return;

    // 組合查詢請求物件，將外部傳入的 requestOptions 展開合併
    const request: google.maps.places.AutocompleteRequest = {
      ...requestOptions,
      input: inputString,
      sessionToken: sessionTokenRef.current
    };

    // 發出查詢，等 API 回應後更新 suggestions。
    // setState 在 .then() callback 裡執行，屬於非同步呼叫，不會被 React Compiler 警告。
    AutocompleteSuggestion.fetchAutocompleteSuggestions(request).then(res => {
      setSuggestions(res.suggestions);
    });

  // 依賴項：placesLib 載入完成時，或 inputString 改變時重跑
  }, [placesLib, inputString]); // eslint-disable-line react-hooks/exhaustive-deps
  // 說明：requestOptions 刻意不放進依賴項，
  // 因為它通常是物件字面量，每次 render 都是新的參考，會導致無限迴圈。
  // 如果需要動態改變 requestOptions，請在外部用 useMemo 包裝後再傳入。

  return {
    // input 為空時，直接回傳空陣列（在 render 期間計算，不靠 effect 改 state）
    // input 有內容時，回傳 API 查詢結果
    suggestions: inputString === '' ? [] : suggestions,
    // resetSession：在使用者選好地點、呼叫完 fetchFields() 之後呼叫，
    // 讓 token 歸零，下一次搜尋會開啟全新的計費 session。
    // （這裡的 setSuggestions 在 event handler 裡呼叫，不在 effect 裡，所以沒問題）
    resetSession: () => {
      sessionTokenRef.current = null;
      setSuggestions([]);
    }
  };
}