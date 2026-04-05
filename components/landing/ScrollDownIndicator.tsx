'use client'

// Landing Page 底部的「向下滑動」提示元件

import { FaChevronDown } from "react-icons/fa6"
import { motion } from "framer-motion"

// 每個箭頭的起始延遲（秒），製造 stagger 效果
const DELAYS = [0, 0.1, 0.3]

export default function ScrollDownIndicator({ className }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center ${className ?? ''}`}>
      {DELAYS.map((delay, i) => (
        <motion.div
          key={i}
          // 直接在 animate prop 用 keyframe 陣列：0 → 8px → 0，同時 opacity 淡入淡出
          animate={{ y: [0, 8, 0], opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay, // 錯開每個箭頭的起始時間
          }}
          className="text-white/60 -mt-1"
        >
          <FaChevronDown size={14} />
        </motion.div>
      ))}
    </div>
  )
}
