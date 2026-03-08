

interface Props {
  color : string | null
  gapColor: string | null
}

function ButtonLoadingSpinner({color, gapColor}:Props){
  return (
    <div className="flex justify-center">
      <div className={`w-5 h-5 my-0.5 border-2 
        ${color ? color : "border-bg-tertiary" }
        ${gapColor? gapColor : "border-t-transparent"}
        rounded-full animate-spin`} />
    </div>
  )
}

export default ButtonLoadingSpinner