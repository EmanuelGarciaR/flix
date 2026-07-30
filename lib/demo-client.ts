'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useDemoMode() {
  const router = useRouter();
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    // Check if this is a hard navigation/reload.
    // If it is, we reset the demo mode to false to satisfy the requirement
    // "Reloading the page should reset it back to Region-Restricted by default".
    const navEntries = performance.getEntriesByType('navigation');
    const isReload = navEntries.length > 0 && (navEntries[0] as PerformanceNavigationTiming).type === 'reload';

    if (isReload) {
      document.cookie = 'demo_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      setIsDemo(false);
    } else {
      const match = document.cookie.match(new RegExp('(^| )demo_mode=([^;]+)'));
      setIsDemo(match ? match[2] === 'true' : false);
    }
  }, []);

  const toggle = (val: boolean) => {
    if (val) {
      document.cookie = 'demo_mode=true; path=/';
    } else {
      document.cookie = 'demo_mode=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    }
    setIsDemo(val);
    router.refresh(); // Refresh the Server Components with the new cookie
  };

  return { isDemo, toggle };
}
