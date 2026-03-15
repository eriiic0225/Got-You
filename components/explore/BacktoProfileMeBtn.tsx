
import { AiOutlineRollback } from "react-icons/ai";
import Link from 'next/link';
import { cn } from "@/lib/utils";


export default function BacktoProfileMeBtn({screenSize}:{screenSize: "small" | "big"}){
  return(
    <div 
      className={cn('justify-center mt-4',
        screenSize === "big" ? "hidden md:flex" : "md:hidden flex"
    )}>
      <Link 
        href="/profile/me"
        className='flex items-center justify-center gap-1 text-center w-[270px] py-2 rounded-lg bg-primary text-bg-primary font-semibold text-sm hover:bg-primary-hover transition disabled:opacity-50'
        >
        回到個人頁面
        <AiOutlineRollback strokeWidth={10}/>
      </Link>
    </div>
  )
}