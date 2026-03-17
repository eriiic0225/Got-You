'use client'

import ChatWindow from "@/components/chat/ChatWindow"
import { usePathname } from "next/navigation"



export default function ChatRoomPage(){

  const path = usePathname()
  const partnerId = path.split('/chats/')[1]

  return (
    <ChatWindow partnerId={partnerId}/>
  )
}