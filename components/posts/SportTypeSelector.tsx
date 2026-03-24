'use client'
import { useRef, useEffect } from 'react'
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu'
import type { Sport } from './PostForm'
import { cn } from '@/lib/utils'

interface Props {
  sportTypes: Sport[]
  toggleSport: (sport: Sport) => void
  selectedSport: Sport | null
}

export default function SportTypeSelector({ sportTypes, toggleSport, selectedSport }: Props){
  
  const containerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    containerRef.current?.scrollBy({
      left: direction === 'right' ? 200 : -200,
      behavior: 'smooth'
    })
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()                    // 攔截垂直捲動
      container.scrollLeft += e.deltaY      // 轉成水平捲動
    }

    // { passive: false } 是關鍵 → 告訴瀏覽器這個 listener 會呼叫 preventDefault
    // 少了這個，preventDefault() 在現代瀏覽器會無效
    container.addEventListener('wheel', handleWheel, { passive: false })

    // cleanup：元件 unmount 時移除 listener，避免 memory leak
    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, []) // 只在 mount 時執行一次

  return (
    <div className="relative flex items-center gap-2">
      {/* 左箭頭：手機隱藏（md:flex） */}
      <button
          type="button"
          onClick={() => scroll('left')}
          className={cn(
            "group md:flex md:justify-center md:items-center", 
            "cursor-pointer hidden p-1 rounded-full shrink-0 border border-border",
            "hover:border-primary-hover"
          )}
        >
        <LuChevronLeft className='group-hover:text-primary'/>
      </button>

        {/* ref 掛在這個 div 上，就能用 containerRef.current 操作它 */}
        <div
          ref={containerRef}
          className={cn(
            "flex gap-1 overflow-x-auto whitespace-nowrap",
            "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          )}
        >
          {/* chips */}
          {sportTypes.map((s) => {
            const isSelected = selectedSport === s
            return (
              <button
                type="button" 
                key={s.id}
                onClick={()=>{toggleSport(s)}}
                className={cn(
                  "text-xs px-2.5 py-1 rounded-full cursor-pointer transition-colors",
                  "bg-bg-primary text-text-secondary border border-border",
                  "hover:border-primary hover:text-text-primary",
                  "whitespace-nowrap shrink-0",
                  isSelected ? "border-primary text-primary hover:text-primary" : ""
                )}
              >
                {s.icon} {s.name}
              </button>
            )
          })}
        </div>

        {/* 右箭頭：手機隱藏 */}
        <button
          type="button"
          onClick={() => scroll('right')}
          className={cn(
            "group md:flex md:justify-center md:items-center", 
            "cursor-pointer hidden p-1 rounded-full shrink-0 border border-border",
            "hover:border-primary-hover"
          )}
        >
          <LuChevronRight className='group-hover:text-primary'/>
        </button>
    </div>
  )
}