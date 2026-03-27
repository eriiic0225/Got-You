import { useEffect, useRef, useState } from "react"

export default function useDraggable(){

  const [isDragging, setIsDragging] = useState(false)
  // 元素在畫面上的位置
  const [pos, setPos] = useState({ x: 16, y: 40 })

  // 記錄「點下去那一刻」的起始值（不需要觸發重新渲染，用 ref）
  const dragStart = useRef({ mouseX: 0, mouseY: 0, elemX: 0, elemY: 0 })
  const hasMoved = useRef(false)

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStart.current = {
      mouseX: e.clientX,  // 這邊會隨時記錄滑鼠現在的位置
      mouseY: e.clientY,
      elemX: pos.x, // 鈴鐺的原始位置
      elemY: pos.y,
    }
    hasMoved.current = false
    setIsDragging(true)
    // setPointerCapture：讓滑鼠移出元素範圍時也能繼續追蹤
    e.currentTarget.setPointerCapture(e.pointerId) // 以防萬一使用者把滑鼠移出視窗(監聽)範圍
  }

  // 移動時：即時更新位置
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!e.buttons) return // 沒按著就不動

    const dx = e.clientX - dragStart.current.mouseX // 位移量 = 現在位置 - 起始位置
    const dy = e.clientY - dragStart.current.mouseY

    if (Math.abs(dx) > 5 || Math.abs(dy) > 5){ // 判斷點擊後元素是否有被位移一定距離
      hasMoved.current = true // 更新ref標記為本次點擊為「拖曳」
    }

    setPos({ 
        x: dragStart.current.elemX + dx, // 新位置 = 起始位置 + 位移量
        y: dragStart.current.elemY + dy,
      })
  }

  // 放開時：判斷吸附到左邊還是右邊
  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false)

    const bellSize = 40
    const Xpadding = 16
    const Ypadding = 40

    const screenWidth  = document.documentElement.clientWidth
    const screenHeight = document.documentElement.clientHeight

    // 以鈴鐺中心點判斷在左半邊還是右半邊
    const bellCenterX = e.clientX
    const snapX = bellCenterX > screenWidth / 2
      ? Xpadding // 吸附到左邊
      : - (screenWidth - bellSize - Xpadding)   // 吸附到右邊緣

    // y 軸限制在螢幕範圍內，不讓鈴鐺跑出畫面
    const clampedY = Math.max(0, Math.min(pos.y, screenHeight - bellSize*3 - Ypadding))

    setPos({ x: snapX, y: clampedY })

  }

  return { isDragging, pos, hasMoved,
    handlePointerDown, handlePointerMove, handlePointerUp }
}