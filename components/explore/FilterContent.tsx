// components/explore/FilterContent.tsx
// 篩選器的內容主體，同時被桌機 DesktopFilterSidebar 和手機 MobileFilterModal 使用
// 篩選條件變更時即時更新 Zustand store，不需要按「套用」

'use client'

import { useEffect, useMemo, useState } from 'react'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'
import { supabase } from '@/lib/supabase/client'
import { useExploreStore } from '@/stores/useExploreStore'
import type { ExploreTab, Gender } from '@/stores/useExploreStore'
import { cn } from '@/lib/utils'
import * as Slider from '@radix-ui/react-slider'

// ── 型別定義 ────────────────────────────────────────────────

type SportCategory = 'gym' | 'ball' | 'cardio' | 'outdoor'

// sport_types 資料表的一筆資料
interface SportType {
  id: string
  name: string
  category:  SportCategory
}

interface FilterContentProps {
  // 目前的 Tab，決定是否顯示「距離」篩選
  activeTab: ExploreTab
  // 手機版關閉 Modal 的 callback（桌機版不傳，不顯示關閉按鈕）
  onClose?: () => void
}

// ── 靜態對照表 ────────────────────────────────────────────────

// category 英文 key → 中文顯示名稱
const CATEGORY_LABELS: Record<SportCategory, string> = {
  gym: '🏋️ 健身',
  ball: '🏀 球類',
  cardio: '🏃 有氧',
  outdoor: '🏔️ 戶外',
}

// category 的排列順序（Object.keys 不保證順序，所以明確指定）
const CATEGORY_ORDER: SportCategory[] = ['gym', 'ball', 'cardio', 'outdoor']

// 性別選項
const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'male',      label: '男' },
  { value: 'female',    label: '女' },
  { value: 'nonBinary', label: '非二元' },
]


// ── 主元件：FilterContent ─────────────────────────────────────

export default function FilterContent({ activeTab, onClose }: FilterContentProps) {
  // 從 Zustand store 取得篩選狀態和 setter
  const {
    filters,
    setSportTypeIds,
    setGenders,
    setAgeRange,
    setMaxDistance,
    resetFilters,
  } = useExploreStore()

  // 從 Supabase 撈到的所有運動類型（渲染filter用的）
  const [sportTypes, setSportTypes] = useState<SportType[]>([])

  // 每個 category 的展開 / 收合狀態，預設全部收合
  const [expandedCategories, setExpandedCategories] = useState<Record<SportCategory, boolean>>({
    gym: false, ball: false, cardio: false, outdoor: false
  })

  // 獨立拉出 Range slider的state到子層，只有放手時才讓整個元件重新渲染
  const [localAge, setLocalAge] = useState(filters.ageRange)
  const [localDistance, setLocalDistance] = useState(filters.maxDistance)

  // ── 載入 sport_types ────────────────────────────────
  useEffect(() => {
    async function fetchSportTypes(){
      try {
        const { data, error } = await supabase
          .from('sport_types')
          .select('id, name, category')
          .order('category')

        if (error) throw error
        setSportTypes(data ?? [])
      } catch (err){
        console.error('載入運動類型失敗', err)
      }
    }
    fetchSportTypes()
  }, [])

  // ── 依 category 分組 ────────────────────────────────
  // 結果：{ gym: [SportType, ...], ball: [...], ... }
  const grouped = useMemo(() => {
    return sportTypes.reduce<Record<SportCategory, SportType[]>>((acc, sport) => {
      if (!acc[sport.category]){
        acc[sport.category] = []
      }
      acc[sport.category].push(sport)
  
      return acc // 記得return 累加值給下一輪用
    },{} as Record<SportCategory, SportType[]> )
  }, [sportTypes]) // 用 useMemo 將計算好的「值」包裹起來，才不會每次重新渲染都計算浪費效能
  
  // console.log(grouped)

  // ── 事件處理 ────────────────────────────────────────────────
  const toggleGender = (gender:Gender) => {
    const newGenders = filters.genders.includes(gender)
      ? filters.genders.filter(g => g !== gender)
      : [...filters.genders, gender]

    setGenders(newGenders)
  }

  const toggleSportType = (id:string) => {
    const newSportTypes = filters.sportTypeIds.includes(id)
      ? filters.sportTypeIds.filter(s => s !== id)
      : [...filters.sportTypeIds, id]

    setSportTypeIds(newSportTypes)
  }

  const toggleCategory = (cat:SportCategory) => {
    setExpandedCategories(prev => ({...prev, [cat]: !prev[cat] })) 
    // [cat]表示這個Keyname是個變數(動態的名稱)
    // 只寫 cat 的話，會變成多出一個叫 cat 的屬性，不會改到舊的
  }

  const handleReset = () => {
    resetFilters()
    setLocalAge([18, 60])
    setLocalDistance(10)
  }

  const hasActiveFilters = 
    filters.sportTypeIds.length > 0 ||
    filters.genders.length > 0 ||
    filters.ageRange[0] !== 18 || //跟預設值不同
    filters.ageRange[1] !== 60 || //跟預設值不同
    ( activeTab === "nearby" && filters.maxDistance !== 10)


  // ── JSX ────────────────────────────────────────────────────
  return (
    <div className='p-3 flex flex-col gap-5'>
      {/* 標題列 */}
      <div className="flex items-center justify-between">
        <h2 className="text-text-primary font-bold text-base">篩選條件</h2>
        <div className="flex items-center gap-3">
          {/* 清除全部：有篩選條件時顯示醒目色 */}
          <button
            onClick={handleReset}
            className={cn("text-sm transition mr-2",
              hasActiveFilters
                ? 'text-primary hover:text-primary-hover'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            清除全部
          </button>
          {/* 關閉按鈕（只在手機 Modal 顯示） */}
          {onClose && (
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary transition text-lg leading-none"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      {/* 運動類型選擇區 */}
      <section >
        <h3 className='text-text-secondary text-xs uppercase tracking-widest mb-3'>偏好運動</h3>
        <div className="flex flex-col gap-2">
          {CATEGORY_ORDER.map((cat)=>{
            const sports = grouped[cat] ?? []
            const isExpanded = expandedCategories[cat]
            const selectedCount = sports.filter(s => filters.sportTypeIds.includes(s.id)).length

            return (
              <div key={cat} className={cn("rounded-xl border border-border overflow-hidden")}>
                <button onClick={()=>toggleCategory(cat)}
                  className='w-full flex items-center justify-between px-3 py-2.5 bg-bg-tertiary text-left hover:bg-bg-tertiary/80 transition'
                  >
                  <span className='text-sm'>{CATEGORY_LABELS[cat]}</span>
                  {/* <FiChevronDown className={cn("transition-transform duration-300",
                    isExpanded ? "rotate-180" : "rotate-0")}/> */}
                  <div className='flex gap-2 items-center'>
                    { selectedCount > 0 && <span className='text-xs bg-primary text-bg-primary font-bold px-1.5 py-0.5 rounded-full'>{selectedCount}</span> }
                    {isExpanded 
                      ? <FiChevronUp color='#C4DC4A' className='font-semibold' strokeWidth={3}/>
                      : <FiChevronDown/>}
                  </div>
                </button>
                { isExpanded && (
                  <div className='p-2 space-x-0.5 space-y-0.5'>
                    {sports.map((s)=>{
                      const isSelected = filters.sportTypeIds.includes(s.id)
                      return (
                      <button key={s.id} onClick={()=>toggleSportType(s.id)}
                        className={cn("text-sm rounded-full border px-2 py-1 transition",
                          isSelected 
                            ? "bg-primary text-bg-primary border-primary font-semibold"
                            : "bg-transparent text-text-secondary border-border hover:border-primary hover:text-text-primary"
                        )}
                      >{s.name}</button>)
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* 性別選擇區 */}
      <section>
        <h3 className='text-text-secondary text-xs uppercase tracking-widest mb-3'>性別</h3>
        <div className='flex gap-2'>
          {GENDER_OPTIONS.map(({ value, label })=>{
            const isSelected = filters.genders.includes(value)
            return (
              <button 
                key={value} 
                onClick={()=> toggleGender(value)}
                className={cn(
                  // 永遠套用的基底樣式
                  'flex-1 py-2 rounded-xl border text-sm transition',
                  // 條件樣式：isSelected 決定套哪一組
                  isSelected 
                    ? 'bg-primary text-bg-primary border-primary font-semibold'
                    : 'bg-transparent text-text-secondary border-border hover:border-primary hover:text-text-primary'
                )}
              >
                {label}
              </button>
            )
          })}

        </div>
      </section>
      
      {/* 年齡選擇區 */}
      <section>
        <div className='flex items-center justify-between mb-4x'>
          <h3 className='text-text-secondary text-xs uppercase tracking-widest'>年齡</h3>
          <span className="text-text-primary text-sm">
            {localAge[0]} - {localAge[1]} 歲
          </span>
        </div>
        
        {/* 滑動選取器 */}
        <Slider.Root 
          defaultValue={filters.ageRange}
          min={13} max={80}
          step={1}
          minStepsBetweenThumbs={1}
          value={localAge}
          onValueChange={(values:[number, number])=>(setLocalAge(values))}
          onValueCommit={(v) => setAgeRange(v as [number, number])}
          className='relative flex items-center select-none touch-none w-full h-5'>
          <Slider.Track className='bg-text-tertiary relative grow rounded-full h-0.5'>
            <Slider.Range className='absolute bg-primary h-full'/>
          </Slider.Track>
          {/* 左側選取點 */}
          <Slider.Thumb 
            aria-label="Minimum Age"
            className='block size-3 rounded-full bg-white shadow-lg cursor-pointer hover:scale-110 transition'
          />
          {/* 右側選取點 */}
          <Slider.Thumb 
            aria-label='Maximun Age'
            className='block size-3 rounded-full bg-white shadow-lg cursor-pointer hover:scale-110 transition'
          />
        </Slider.Root>

      </section>

      {/* 距離選擇區 */}
      { activeTab === 'nearby' && ( 
        <section>
          <div className='flex items-center justify-between mb-4x'>
            <h3 className='text-text-secondary text-xs uppercase tracking-widest'>距離</h3>
            <span className="text-text-primary text-sm">
              {localDistance} km 內
            </span>
          </div>

          <Slider.Root 
          defaultValue={[filters.maxDistance]}
          max={400}
          step={1}
          value={[localDistance]}
          onValueChange={(values)=>(setLocalDistance(values[0]))}
          onValueCommit={(values)=>(setMaxDistance(values[0]))}
          className='relative flex items-center select-none touch-none w-full h-5'>
            <Slider.Track className='bg-text-tertiary relative grow rounded-full h-0.5'>
              <Slider.Range className='absolute bg-primary h-full'/>
            </Slider.Track>
            {/* 選取點 */}
            <Slider.Thumb 
              aria-label="Minimum Age"
              className='block size-3 rounded-full bg-white shadow-lg cursor-pointer hover:scale-110 transition'
          />
        </Slider.Root>
        </section>
      )}

    </div>
  )
}
