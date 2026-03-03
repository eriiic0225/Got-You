import { SportType } from "@/app/onboarding/Step2Sports"

interface SportProps {
  sport: SportType
  isSelected: boolean
  onToggle: (sportId:string)=>void
}

function Sport({sport, isSelected, onToggle}:SportProps){

  return (
    <button
    type="button"
    onClick={() => onToggle(sport.id)}
    className={`flex items-center justify-between w-full px-4 py-3 rounded-xl border bg-bg-secondary transition
      ${isSelected
        ? 'border-primary text-primary'
        : 'border-bg-secondary text-text-primary'
      }`}
    >
      <div className="space-x-2">
        <span>{sport.icon}</span>
        <span>{sport.name}</span>
      </div>

      {/* 自訂圓形 checkmark */}
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition
        ${isSelected ? 'bg-primary border-primary' : 'border-border'}`}
      >
        {isSelected && (
          <svg className="w-3 h-3 text-bg-primary" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )}
      </div>
  </button>
  )
}

export default Sport