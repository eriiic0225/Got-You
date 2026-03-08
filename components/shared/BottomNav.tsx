'use client'
// 手機版底部導航列，桌機版隱藏（md:hidden）
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaCompass } from 'react-icons/fa'
import { BiSolidMegaphone } from 'react-icons/bi'
import { IoChatboxEllipses } from 'react-icons/io5'
import { BsFillPersonFill } from 'react-icons/bs'
import type { IconType } from 'react-icons'

type NavItem = {
  href: string
  label: string
  Icon: IconType
  unreadCount?: number  // 未讀數，之後聊天功能開發後串接，目前先預留
}

const navItems: NavItem[] = [
  { href: '/explore',    label: '探索', Icon: FaCompass },
  { href: '/posts',      label: '揪團', Icon: BiSolidMegaphone },
  { href: '/chats',      label: '聊天', Icon: IoChatboxEllipses, unreadCount: 0 },
  { href: '/profile/me', label: '個人', Icon: BsFillPersonFill },
]

function BottomNav() {
  // usePathname 取得目前路徑，用來判斷哪個 tab 是 active
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-bg-secondary border-t border-border z-50">
      <ul className="flex">
        {navItems.map(({ href, label, Icon, unreadCount }) => {
          // startsWith 讓子路徑也能正確 highlight，例如 /posts/123 時揪團仍是 active
          const isActive = pathname.startsWith(href)
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center gap-1 py-2.5 transition-colors ${
                  isActive ? 'text-primary' : 'text-text-secondary'
                }`}
              >
                {/* icon + 未讀 badge */}
                <div className="relative">
                  <Icon size={22} /> {/* 利用變數帶入 React Icon */}
                  {/* 只有 unreadCount > 0 才顯示 badge */}
                  {unreadCount != null && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className="text-xs">{label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default BottomNav
