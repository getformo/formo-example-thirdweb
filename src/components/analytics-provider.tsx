'use client';

import { useEffect } from 'react';
import { FormoAnalyticsProvider, useFormo } from '@formo/analytics';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

const formoWriteKey = process.env.NEXT_PUBLIC_FORMO_WRITE_KEY;

function AnalyticsWrapper({ children }: AnalyticsProviderProps) {
  const formo = useFormo();

  useEffect(() => {
    if (formo) {
      // Track page view on mount
      formo.track('Page View', {
        page: window.location.pathname,
        url: window.location.href,
        title: document.title,
        timestamp: new Date().toISOString(),
      });
    }
  }, [formo]);

  return <>{children}</>;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  if (!formoWriteKey) {
    console.warn('NEXT_PUBLIC_FORMO_WRITE_KEY is not set');
    return <>{children}</>;
  }

  return (
    <FormoAnalyticsProvider
      writeKey={formoWriteKey}
      options={{
        tracking: true,
        flushInterval: 5000, // 5 seconds
        logger: {
          enabled: true,
          levels: ['error', 'warn', 'info'],
        },
      }}
    >
      <AnalyticsWrapper>{children}</AnalyticsWrapper>
    </FormoAnalyticsProvider>
  );
}
