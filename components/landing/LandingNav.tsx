'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { FaArrowRightToBracket } from "react-icons/fa6";
import { useAuthStore } from '@/stores/useAuthStore'

export default function LandingNav(){
  // scrolled：記錄使用者是否已向下滾動
  const [scrolled, setScrolled] = useState(false)
  const user = useAuthStore(state => state.user)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={cn(
      // 固定在頂部，永遠在最上層
      'fixed top-0 left-0 right-0 z-50',
      'flex items-center justify-between px-6 md:px-12 border-b',
      // transition-all 讓所有變化都有動畫
      'transition-all duration-300',
      scrolled
        ? 'py-3 bg-bg-primary/90 backdrop-blur-md border-border/50' // 滾動後：縮小 + 加背景
        : 'py-6 bg-transparent border-transparent' // 初始：放大 + 無背景
    )}>
      <div className={cn(
        "flex items-center gap-2.5",
        scrolled ? "" : "scale-130 translate-x-4"  
      )}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/Logo-removebg.png"
          alt="Got You 咖揪 Logo"
          className="w-9 h-9 rounded-lg object-contain"
        />
        <span className="font-audiowide text-base tracking-tight">Got You 咖揪</span>
      </div>

      {/* 右側登入按鈕 */}
      { !user ? (
        <Link
          href="/login"
          className="px-5 py-2 border border-border text-text-secondary hover:text-text-primary hover:border-primary/50 rounded-lg text-sm font-medium transition-all duration-200"
        >
          登入
        </Link>
      ) : (
        <Link
          href="/explore"
          className="flex items-center gap-1.5 px-5 py-2 border border-border text-text-secondary hover:text-text-primary hover:border-primary/50 rounded-lg text-sm font-medium transition-all duration-200"
        >
          <span>繼續探索</span>
          <FaArrowRightToBracket />
        </Link>
      ) }
    </nav>
  )
}
