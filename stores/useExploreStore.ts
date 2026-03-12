// stores/useExploreStore.ts
// 探索頁的全域狀態：目前的 Tab + 篩選條件
// 篩選條件一旦變更，explore page 會重新撈資料（即時更新，不需要按「套用」）

import { create } from 'zustand'

// 性別選項型別（與 users 表一致）
export type Gender = 'male' | 'female' | 'nonBinary'

// 目前顯示的 Tab
export type ExploreTab = 'common' | 'nearby'

// 篩選條件型別
export interface ExploreFilters {
  sportTypeIds: string[]
  genders: Gender[]
  ageRange: [number, number]
  maxDistance: number
}

interface ExploreState {
  activeTab: ExploreTab
  filters: ExploreFilters

  setActiveTab: (tab: ExploreTab) => void
  setSportTypeIds: (ids: string[]) => void
  setGenders: (genders: Gender[]) => void
  setAgeRange: (range: [number, number]) => void
  setMaxDistance: (km: number) => void
  resetFilters: () => void
}

// 預設篩選條件（清除時回到這個狀態）
const DEFAULT_FILTERS: ExploreFilters = {
  sportTypeIds: [],
  genders: [],
  ageRange: [18, 60],
  maxDistance: 10,
}

export const useExploreStore = create<ExploreState>((set)=>({
  activeTab: 'common',
  filters: {...DEFAULT_FILTERS},

  setActiveTab: (tab:ExploreTab) => set({activeTab: tab}),

  // 用 spread 保留其他篩選條件，只更新當下的欄位
  setSportTypeIds: (ids:string[]) => {
    set((state) => ({ filters: { ...state.filters, sportTypeIds: ids} }))
  },

  setGenders: (genders:Gender[]) => {
    set((state) => ({ filters: {...state.filters, genders: genders} }))
  },

  setAgeRange: (range: [number, number]) => {
    set((state) => ({ filters: {...state.filters, ageRange: range}}))
  },

  setMaxDistance: (km) => {
    set((state) => ({ filters: { ...state.filters, maxDistance: km } }))
  },

  // 清除全部篩選條件，回到預設值
  resetFilters: () => {
    set({ filters: {...DEFAULT_FILTERS} })
  }
}))