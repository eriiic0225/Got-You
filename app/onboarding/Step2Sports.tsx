'use client'
import Sport from "@/components/onbaording/Sport";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { supabase } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { CgGym } from "react-icons/cg";
import { FaBasketball, FaHeartPulse } from "react-icons/fa6";
import { PiPersonSimpleHikeFill } from "react-icons/pi";

interface Step2SportsProps {
  toNextStep: () => void
  onComplete: (sports: string[]) => void
  initialSelectedSports: string[]  // 從父層傳入，用來在回上一步時恢復已選的運動
}

export interface SportType {
  id: string
  name: string
  category: string
  icon: string
  created_order: number
}



function Step2Sports({ toNextStep, onComplete, initialSelectedSports }:Step2SportsProps){

  const [isLoading, setIsLoading] = useState(true)
  const [sports, setSports] = useState<SportType[]>([])
  // 用父層傳來的 initialSelectedSports 當初始值，回上一步時恢復已選項目
  const [selectedSports, setSelectedSports] = useState<string[]>(initialSelectedSports)
  const [error, setError] = useState("")

  useEffect(()=>{
    async function fetchSports() {
      const { data, error: fetchError } = await supabase
        .from('sport_types')
        .select('*')
        .order('created_order') // 按分類排序，之後分組顯示
      if (fetchError) setError("載入失敗，請重新整理頁面")
      if (data) setSports(data)
      setIsLoading(false)
    }
    fetchSports()
  },[])

  const toggleSport = (id:string)=>{
    if (selectedSports.includes(id)){
      setSelectedSports(selectedSports.filter(sportId => sportId !== id))
    }else{
      if (selectedSports.length >= 5){// 限制最多只能選擇五個
        setError("最多只能選擇 5 項偏好運動")
        setTimeout(()=>{
          setError("")
        },5000)
        return
      } 
      setSelectedSports([...selectedSports, id])
    }
  }

  const handleClick = ()=>{
    if (selectedSports.length < 1){
      setError("至少需選擇 1 項偏好運動！")
      setTimeout(()=>{
        setError("")
      },5000)
      return
    }
    onComplete(selectedSports)
    toNextStep()
  }

  // 運動類別分組
  const ballSports = sports.filter((s)=>s.category === 'ball')
  const gymSports     = sports.filter(s => s.category === 'gym')
  const cardioSports  = sports.filter(s => s.category === 'cardio')
  const outdoorSports = sports.filter(s => s.category === 'outdoor')

  return(
    <>
      <div>
        <h2 className="text-text-primary font-semibold">選擇你的運動偏好</h2>
        <p className="text-text-secondary text-xs mt-1">選擇你感興趣的運動，我們將為你推薦適合的夥伴。</p>
        <p className="text-text-secondary text-xs"> - 至少需選擇 1 項，建議選擇 3 ～ 5 項</p>
      </div>
      {/* 運動選項區 */}
      <div className="space-y-3">
        { isLoading 
          ? <LoadingSpinner/> : 
          <>
            <div className="space-y-2">
              <div className="flex gap-2 items-center h-8">
                <CgGym size={28} color="gray" className=""/>
                <p className="font-semibold">健身房運動</p>
              </div>
              {gymSports.map((s)=>(<Sport key={s.id} sport={s} isSelected={selectedSports.includes(s.id)} onToggle={toggleSport} />))}
            </div>

            <div className="space-y-2">
              <div className="flex gap-2 items-center h-8">
                <FaBasketball size={20} color="gray" className=""/>
                <p className="font-semibold">球類運動</p>
              </div>
              {ballSports.map((s)=>(<Sport key={s.id} sport={s} isSelected={selectedSports.includes(s.id)} onToggle={toggleSport} />))}
            </div>

            <div className="space-y-2">
              <div className="flex gap-2 items-center h-8">
                <FaHeartPulse size={20} color="gray"/>
                <p className="font-semibold">有氧運動</p>
              </div>
              {cardioSports.map((s)=>(<Sport key={s.id} sport={s} isSelected={selectedSports.includes(s.id)} onToggle={toggleSport} />))}
            </div>

            <div className="space-y-2">
              <div className="flex gap-2 items-center h-8">
                <PiPersonSimpleHikeFill size={30} color="gray"/>
                <p className="font-semibold">戶外運動</p>
              </div>
              {outdoorSports.map((s)=>(<Sport key={s.id} sport={s} isSelected={selectedSports.includes(s.id)} onToggle={toggleSport} />))}
            </div>
          </>
        }

      </div>
      {error && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="bg-black/70 text-white text-sm px-4 py-2.5 rounded-lg">
            {error}
          </div>
        </div>
      )}
      {/* 下一步 */}
      <button
        onClick={handleClick}
        className="bg-primary text-bg-secondary font-semibold w-full px-3 py-2 rounded-md hover:bg-primary-hover transition"
        >
        下一步 →
      </button>
    </>
  )
}

export default Step2Sports