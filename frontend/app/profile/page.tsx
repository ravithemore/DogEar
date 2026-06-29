'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ProfileRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const username = localStorage.getItem('username');
      if (username) {
        router.replace(`/profile/${username}`);
      } else {
        router.replace('/login');
      }
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FCF9F3] flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-emerald-800 animate-spin" />
    </div>
  );
}
