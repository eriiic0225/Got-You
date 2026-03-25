import { cn } from "@/lib/utils"


const SPORT_TAGS = [
  { name: "重量訓練", icon: "💪" },
  { name: "健力", icon: "🏋️‍♂️" },
  { name: "徒手/街頭健身", icon: "🤸" },
  { name: "HYROX", icon: "⚡" },
  { name: "CrossFit", icon: "⛓️" },
  { name: "瑜珈/皮拉提斯", icon: "🧘‍♀️" },
  { name: "功能性訓練", icon: "🧬" },
  { name: "團體課程/有氧", icon: "🔥" },
  { name: "羽球", icon: "🏸" },
  { name: "排球", icon: "🏐" },
  { name: "網球", icon: "🎾" },
  { name: "匹克球", icon: "🥒" },
  { name: "桌球", icon: "🏓" },
  { name: "籃球", icon: "🏀" },
  { name: "跑步/路跑", icon: "🏃" },
  { name: "游泳", icon: "🏊" },
  { name: "自行車", icon: "🚲" },
  { name: "登山/健行", icon: "⛰️" },
  { name: "攀岩/抱石", icon: "🧗‍♀️" },
  { name: "潛水", icon: "🤿" },
  { name: "衝浪", icon: "🏄" },
  { name: "滑板", icon: "🛹"}
]

export default function SportCarousel(){

  return (
    <div className="mt-16 md:mt-20 pt-8">
      <p className="text-text-tertiary text-sm mb-5 text-center tracking-wide">
        支援各種運動類型
      </p>
      {/* 運動類型自動輪播效果 */}
      <div className="overflow-hidden"> {/* 外層容器 */}
        <div className={cn( // 這邊是內層負責滾動
          "flex w-max animate-scroll space-x-1"
        )}>
          {/* 第一份輪播卡牌 */}
          {SPORT_TAGS.map((sport) => (
            <span
              key={`a-${sport.name}`}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 bg-bg-secondary border border-border rounded-full text-sm",
                "text-text-secondary hover:border-primary/40 hover:text-text-primary transition-all duration-200 cursor-default select-none"
              )}
            >
              <span aria-hidden>{sport.icon}</span>
              <span>{sport.name}</span>
            </span>
          ))}
          {/* 第二份輪播卡牌 */}
          {SPORT_TAGS.map((sport) => (
            <span
              key={`b-${sport.name}`}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 bg-bg-secondary border border-border rounded-full text-sm",
                "text-text-secondary hover:border-primary/40 hover:text-text-primary transition-all duration-200 cursor-default select-none"
              )}
            >
              <span aria-hidden>{sport.icon}</span>
              <span>{sport.name}</span>
            </span>
          ))}
        </div>

      </div>
    </div>
  )
}