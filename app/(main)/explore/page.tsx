'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js'
import { useAuthStore } from '@/stores/useAuthStore';

export default function ExplorePage() {
  const [user, setUser] = useState<User|null>(null);
  const logout = useAuthStore((state)=>state.logout)

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getUser();
  }, []);

  return (
    <div className="min-h-screen grid place-items-center bg-bg-primary px-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-text-primary">
          🎉 登入成功！
        </h1>

        {user && (<>
          <div className="bg-bg-secondary p-6 rounded-lg space-y-2">
            <p className="text-text-primary">歡迎，{user.email}</p>
            <p className="text-text-secondary text-sm">User ID: {user.id}</p>
          </div>
          <button onClick={logout} className='bg-primary px-3 py-2 rounded-lg text-text-primary cursor-pointer'>登出</button>
        </>
        )}

        <p className="text-text-secondary">
          這是探索頁面（之後會開發完整功能）
        </p>
      </div>
    </div>
  );
}
