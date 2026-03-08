import { IoClose } from "react-icons/io5"

interface LocationChipProps{
  onDelete: (id: string) => void
  place: google.maps.places.Place
}

function LocationChip({onDelete, place}: LocationChipProps){
  return (
    <li className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg-tertiary border border-border text-sm text-text-primary">
      <span className="max-w-[140px] truncate">{place.displayName}</span>
      {/* 點擊 × 時，把這個地點的 id 傳給父層的 deletLocation */}
      <button
        type="button"
        onClick={() => onDelete(place.id)}
        className="text-text-secondary hover:text-text-primary transition shrink-0">
        <IoClose size={16} className="cursor-pointer"/>
      </button>
    </li>
  )
}

export default LocationChip
