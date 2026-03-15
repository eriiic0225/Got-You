'use client'

import { useEffect, useMemo, useState } from "react"
import { useUserStore, type UserProfile } from '@/stores/useUserStore'
import { supabase } from "@/lib/supabase/client"
import { MdClose } from 'react-icons/md'
import { FaClipboardCheck } from "react-icons/fa6";
import { FiChevronDown } from 'react-icons/fi'
import { FaSquarePlus } from "react-icons/fa6";
import * as Accordion from "@radix-ui/react-accordion"
import { cn } from "@/lib/utils"

const MAX_SPORT_TYPES = 5  // 最多 5 項偏好運動

interface EditSportTypesSectionProps {
  profile: UserProfile
}

type SportCategory = 'gym' | 'ball' | 'cardio' | 'outdoor'

// sport_types 資料表的一筆資料
interface SportType {
  id: string
  name: string
  category:  SportCategory
}

const CATEGORY_ORDER: SportCategory[] = ['gym', 'ball', 'cardio', 'outdoor']

// category 英文 key → 中文顯示名稱
const CATEGORY_LABELS: Record<SportCategory, string> = {
  gym: '🏋️ 健身',
  ball: '🏀 球類',
  cardio: '🏃 有氧',
  outdoor: '🏔️ 戶外',
}

export default function EditSportTypesSection({ profile }: EditSportTypesSectionProps){

  const fetchUser = useUserStore(state => state.fetchUser)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [sportTypes, setSportTypes] = useState<SportType[]>([])
  const [selectedSports, setSelectedSports] = useState<{id: string, name: string}[]>(
    profile.sport_preferences!.map((s)=>({id: s.id, name: s.name}))
  )

  useEffect(()=>{
    async function fetchSports() {
      setIsLoading(true)
      const { data, error: fetchError } = await supabase
        .from('sport_types')
        .select('id, name, category')
        .order('category') // 按分類排序，之後分組顯示
      if (fetchError) setError("載入失敗，請重新整理頁面")
      if (data) setSportTypes(data)
      setIsLoading(false)
    }
    fetchSports()
  },[])


  const grouped = useMemo(() => {
      return sportTypes.reduce<Record<SportCategory, SportType[]>>((acc, sport) => {
        if (!acc[sport.category]){
          acc[sport.category] = []
        }
        acc[sport.category].push(sport)
    
        return acc // 記得return 累加值給下一輪用
      },{} as Record<SportCategory, SportType[]> )
    }, [sportTypes])

    const handleRemove = async (sportId:string) => {
      const { error } = await supabase
        .from('user_sport_preferences')
        .delete()
        .eq('user_id', profile.id)
        .eq('sport_type_id', sportId)

      if (!error) {
        setSelectedSports(prev => prev.filter(s => s.id !== sportId))
        fetchUser() // 更新 UserStore 存的運動種類
      }
    }

    const handleAdd = async (sport:{id:string, name: string}) => {
      const { error } = await supabase
        .from('user_sport_preferences')
        .insert({user_id: profile.id, sport_type_id: sport.id})

      if (!error) {
        setSelectedSports(prev => [...prev, sport])
        fetchUser() // 更新 UserStore 存的運動種類
      }
    }

    const handleSportsToggle = (sport:{id:string, name: string}) => {
      const isSelected = selectedSports.some(s => s.id === sport.id)
      if (isSelected) {
        handleRemove(sport.id)
      }else{
        if (selectedSports.length >= MAX_SPORT_TYPES){
          setError(`最多只能選擇 ${MAX_SPORT_TYPES} 項偏好運動！`)
          setTimeout(()=>{
            setError("")
          }, 5000)
          return
        }
        handleAdd(sport)
      }
    }

  return (
    <div className="bg-bg-secondary rounded-2xl p-6 shadow">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold">編輯運動偏好</h3>
        {/* 已選數量提示：接近上限時提醒使用者 */}
        <span 
          className={cn("text-xs text-text-secondary",
            selectedSports.length >= MAX_SPORT_TYPES && "text-primary"
        )}>
          {selectedSports.length} / {MAX_SPORT_TYPES}
        </span>
      </div>
      {/* 這邊顯示所有已選中的種類 */}
      <div className="mb-2 text-sm text-text-secondary flex items-center gap-1.5">
        <FaClipboardCheck className="text-primary"/>
        <p>已選擇的運動</p>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4 px-2">
        {selectedSports.map(s=>(
          <span
            onClick={() => handleSportsToggle(s)}
            key={s.id}
            className="group text-xs px-2.5 py-1 rounded-full bg-bg-tertiary text-text-secondary border border-border relative hover:border-primary-hover"
          >
            {s.name}
            <button
              onClick={() => handleSportsToggle(s)}
              className="absolute -top-1.5 -right-1 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition cursor-pointer"
            >
              <MdClose size={12} className="text-white" />
            </button>
          </span>
        ))}
      </div>
      { error && <p className="text-red-400 text-xs -mt-2 mb-2">{error}</p>}

      {/* 手風琴選取區域：以類別分組，展開後可選取未選的運動 */}
      <div>
        <div className="mb-2 text-sm text-text-secondary flex items-center gap-1.5">
          <FaSquarePlus className="text-primary"/>
          <p>選擇更多運動</p>
        </div>
        <Accordion.Root type="multiple" className="space-y-1">
          {CATEGORY_ORDER.map((category) => (
            <Accordion.Item
              key={category}
              value={category}
              className="border border-border rounded-xl overflow-hidden"
            >
              {/* Trigger：加 group 讓子元素可以用 group-data-[state=open] 拿到開關狀態
                  data-[state=open] 是 Radix 自動加在 Trigger 上的屬性，開啟時套用 */}
              <Accordion.Trigger className={cn(
                "group flex w-full justify-between items-center",
                "px-3 py-2.5 text-text-secondary text-sm",
                "hover:text-text-primary hover:bg-bg-tertiary transition-colors",
                "data-[state=open]:text-text-primary data-[state=open]:bg-bg-tertiary"
              )}>
                <span>{CATEGORY_LABELS[category]}</span>
                {/* 箭頭：開啟時旋轉 180 度。group-data-[state=open] 指「父層 Trigger 開啟時」 */}
                <FiChevronDown className="transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </Accordion.Trigger>

              {/* Content：overflow-hidden 配合 keyframe 才能做高度動畫
                  data-[state=open] / data-[state=closed] 切換在 globals.css 定義的 animation */}
              <Accordion.Content className={cn(
                "overflow-hidden",
                "data-[state=open]:animate-accordion-down",
                "data-[state=closed]:animate-accordion-up"
              )}>
                <div className="flex flex-wrap gap-1.5 px-3 py-2">
                  {grouped[category]?.map((sport) => {
                    const isSelected = selectedSports.some(s => s.id === sport.id)
                    // 已選的運動不在下拉區顯示（已出現在上方已選列表）
                    if (isSelected) return null
                    return (
                      <button
                        key={sport.id}
                        onClick={() => handleSportsToggle(sport)}
                        className={cn(
                          "text-xs px-2.5 py-1 rounded-full cursor-pointer transition-colors",
                          "bg-bg-primary text-text-secondary border border-border",
                          "hover:border-primary hover:text-text-primary"
                        )}
                      >
                        {sport.name}
                      </button>
                    )
                  })}
                </div>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </div>
  )
}