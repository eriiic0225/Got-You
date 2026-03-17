'use client'
// 桌機版頂部導航列，手機版隱藏（hidden md:flex）
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaCompass } from 'react-icons/fa'
import { BiSolidMegaphone } from 'react-icons/bi'
import { IoChatboxEllipses } from 'react-icons/io5'
import { BsFillPersonFill } from 'react-icons/bs'
import type { IconType } from 'react-icons'
import { useChatStore } from '@/stores/useChatStore'

type NavItem = {
  href: string
  label: string
  Icon: IconType
  unreadCount?: number
}

const navItems: NavItem[] = [
  { href: '/explore',    label: '探索', Icon: FaCompass },
  { href: '/posts',      label: '揪團', Icon: BiSolidMegaphone },
  { href: '/chats',      label: '聊天', Icon: IoChatboxEllipses, unreadCount: 0 },
  { href: '/profile/me', label: '個人', Icon: BsFillPersonFill },
]

function TopNav() {
  const pathname = usePathname()
  const totalUnread = useChatStore(state => state.totalUnread)

  const items = navItems.map(item => 
    item.href === '/chats' ? {...item, unreadCount: totalUnread} : item
  )

  return (
    <nav className="hidden md:flex fixed top-0 left-0 right-0 bg-bg-secondary border-b border-border z-50 h-14">
      <div className="w-full max-w-[1200px] mx-auto px-6 flex items-center justify-between">
        {/* 左側 Logo */}
        <Link href="/" className="text-text-primary font-bold text-lg tracking-wide hover:text-primary transition-colors">
          Got You
        </Link>

        {/* 右側導航 tab */}
        <ul className="flex items-stretch h-14">
          {items.map(({ href, label, Icon, unreadCount }) => {
            const isActive = pathname.startsWith(href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-2 px-5 h-full text-sm transition-colors border-b-2 ${
                    isActive
                      ? 'text-primary border-primary'
                      : 'text-text-secondary border-transparent hover:text-text-primary'
                  }`}
                >
                  <div className="relative">
                    <Icon size={18} />
                    {unreadCount != null && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1.5 bg-[tomato] text-white text-[8px] font-bold rounded-full min-w-[12px] h-3 flex items-center justify-center px-0.5">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <span>{label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}

export default TopNav
