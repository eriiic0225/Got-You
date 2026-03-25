'use client'

import { useEffect, useRef } from "react"

interface Props {
    children: React.ReactNode
    delay?: number // 延遲幾毫秒後播放，用來做逐一淡入的錯開效果
  }

export default function FadeInOnScroll({ children, delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { // 如過元素進入視窗
          el.classList.remove('opacity-0', 'translate-y-6')
          el.classList.add('opacity-100', 'translate-y-0')
          // 進場一次就夠了，不再繼續觀察
          observer.unobserve(el)
        }
      }, { threshold: 0.15 })

      observer.observe(el) // 掛到 ref元素上

      return () => { observer.disconnect() }
  }, [])

  return (
    <div
      ref={ref}
      // 初始狀態：透明 + 向下偏移
      // transition-all 讓 class 切換時有動畫
      className="opacity-0 translate-y-6 transition-all duration-700"
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}