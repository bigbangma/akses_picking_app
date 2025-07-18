'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const userIsLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(userIsLoggedIn);

    if (!userIsLoggedIn && pathname !== '/login') {
      router.push('/login');
    }
  }, [pathname, router]);

  if (!isLoggedIn && pathname !== '/login') {
    return null; // Or a loading spinner
  }

  return <>{children}</>;
}
