'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * Handles SPA fallback routing for static export deployments.
 * When the static host serves index.html for all routes (SPA fallback),
 * this component detects the URL mismatch and navigates to the correct page.
 */
export default function RouteHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    const browserPath = window.location.pathname;
    // If Next.js thinks we're on "/" but browser URL is different,
    // we got here via SPA fallback - navigate to the real route
    if (pathname === '/' && browserPath !== '/' && browserPath !== '') {
      handled.current = true;
      router.replace(browserPath);
    }
  }, [pathname, router]);

  return null;
}
