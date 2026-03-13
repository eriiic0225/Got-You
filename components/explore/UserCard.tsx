import Link from 'next/link'
import { RxAvatar } from 'react-icons/rx';
import { calculateAge } from '@/lib/utils';

export interface UserCardProfile {
  id: string
  avatar_url: string | null
  nickname: string
  birthday: string
  gender: 'male' | 'female' | 'nonBinary' | null
  bio: string
  latitude: number | null
  longitude: number | null
  sport_types: string[]
  locations: string[]
  distance_km?: number | null
}

interface UserCardProps {
  profile: UserCardProfile
}

// 用來把對應的gender轉換為文字
const genderLabel = { male: '男', female: '女', nonBinary: '非二元' }

function UserCard({ profile }: UserCardProps){
  return(
    <Link href={`/explore/${profile.id}`} className="block bg-bg-secondary rounded-2xl overflow-hidden drop-shadow-xl transition hover:-translate-y-1">
      {/* 頭貼 */}
      <div className="relative h-36 md:h-48 w-full bg-bg-tertiary">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt="頭貼"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <RxAvatar size={80} className="text-text-secondary" />
          </div>
        )}
      </div>

      {/* 資料區 */}
      <div className="px-3 py-2 md:py-3 space-y-2">
        {/* 名稱 + 年齡 + 性別 */}
        <div className="flex items-baseline gap-2">
          <h2 className="text-text-primary font-bold text-base">{profile.nickname}</h2>
          {profile.birthday && (
            <span className="text-text-secondary text-xs">{calculateAge(profile.birthday)} 歲</span>
          )}
          {profile.gender && (
            <span className="text-text-secondary text-xs">{genderLabel[profile.gender]}</span>
          )}
        </div>

        {/* 運動偏好 */}
        {profile.sport_types.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {profile.sport_types.map(sport => (
              <span
                key={sport}
                className="text-xs px-2 py-0.5 rounded-full bg-bg-tertiary text-text-secondary border border-border"
              >
                {sport}
              </span>
            ))}
          </div>
        )}

        {/* 常去地點 */}
        {profile.locations.length > 0 && (
          <div className="space-y-0.5">
            {profile.locations.map(loc => (
              <p key={loc} title={loc} className="text-text-secondary text-xs truncate">📍 {loc}</p>
            ))}
          </div>
        )}

        {/* 距離（只有 nearby tab 才有值） */}
        {profile.distance_km != null && (
          <p className="text-text-secondary text-xs">
            🧭  距離 {profile.distance_km < 1
              ? `${Math.round(profile.distance_km * 1000)} 公尺`
              : `${profile.distance_km.toFixed(1)} 公里`}
          </p>
        )}

        {/* 自我介紹（桌機版才顯示） */}
        {profile.bio && (
          <p className="hidden md:block text-text-secondary text-xs leading-relaxed line-clamp-2">{profile.bio}</p>
        )}
      </div>
    </Link>
  )
}


export default UserCard