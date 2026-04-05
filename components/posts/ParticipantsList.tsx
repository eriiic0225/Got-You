'use client'

import { supabase } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import LoadingSpinner from "../shared/LoadingSpinner"

type ParticipantUser = {
  id: string
  nickname: string
  avatar_url: string | null
}

interface Props {
  postId: string
}


function ParticipantsList({ postId }: Props){

  const [isLoading, setIsLoading] = useState(true)
  const [users, setUsers] = useState<ParticipantUser[]>([])
  const [error, setError] = useState("")

  useEffect(()=>{
    async function getParticipantsList(){
      const { data, error } = await supabase
        .from('post_participants')
        .select('users!inner(id, nickname, avatar_url)') // query 加 !inner 提示 Supabase 這是單一物件(不然 TS 後面會一直煩)
        .eq('post_id', postId)

      if (error){
        setError("糟糕！載入參加者列表出錯了")
        setIsLoading(false)
        return
      }

      if (!data || data.length < 1){
        setError("目前還沒有人參加，快來當第一個吧")
        setIsLoading(false)
        return
      }

      console.log(data)
      setUsers(data.map(p => {
        const user = p.users as unknown as ParticipantUser
        return {
          id: user.id,
          nickname: user.nickname,
          avatar_url: user.avatar_url ?? null,
        }
      }))
      setIsLoading(false)
    }
    getParticipantsList()

  }, [postId])

  if (error){
    return (
      <div className="flex justify-center items-center min-h-20 p-2">
        <p>{error}</p>
      </div>
    )
  }

  if (isLoading){
    return (
      <div className="flex justify-center items-center min-h-20 p-2">
        <LoadingSpinner/>
      </div>
    )
  }

  return (
    <div className="py-2 px-3 overflow-auto border border-border bg-bg-secondary rounded-lg">
      <p className="text-sm text-text-tertiary mb-2">參加用戶</p>
      <div 
        className="space-y-1.5"
      >
        {users.map(u => (
          <div 
            key={u.id}
            className="flex gap-2 items-center pb-1.5 border-b border-border last:border-b-0 last:pb-0"
          >
            {/* 頭貼 */}
            {u.avatar_url 
              ? <img src={u.avatar_url} className="size-8 rounded-full object-cover border border-border" /> 
              : (
                <div className="size-10 rounded-full flex items-center justify-center border border-border bg-bg-secondary text-text-secondary">
                  <span>{u.nickname[0]}</span>
                </div>
              )
            }
            {/* 暱稱 */}
            <p>{u.nickname}</p>
          </div>
        ))}
      </div>
    </div>
  )

}

export default ParticipantsList