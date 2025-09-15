'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { FormoAnalyticsProvider, useFormo } from '@formo/analytics';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

interface TrackingContextType {
  isTrackingEnabled: boolean;
  setTrackingEnabled: (enabled: boolean) => void;
  trackEvent: (eventName: string, properties?: any) => void;
}

const TrackingContext = createContext<TrackingContextType | null>(null);

export const useTracking = () => {
  const context = useContext(TrackingContext);
  if (!context) {
    throw new Error('useTracking must be used within a TrackingProvider');
  }
  return context;
};

const formoWriteKey = process.env.NEXT_PUBLIC_FORMO_WRITE_KEY;

function TrackingProvider({ children }: AnalyticsProviderProps) {
  const formo = useFormo();
  const [isTrackingEnabled, setIsTrackingEnabled] = useState(() => {
    // Check localStorage for user's tracking preference
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('formo-tracking-enabled');
      return saved !== null ? JSON.parse(saved) : true; // Default to enabled
    }
    return true;
  });

  // Save tracking preference to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('formo-tracking-enabled', JSON.stringify(isTrackingEnabled));
    }
  }, [isTrackingEnabled]);

  const setTrackingEnabled = (enabled: boolean) => {
    setIsTrackingEnabled(enabled);
    if (formo) {
      if (enabled) {
        // Re-enable tracking and send a tracking resumed event
        formo.track('Analytics Tracking Resumed', {
          timestamp: new Date().toISOString(),
        });
      } else {
        // Send final event before disabling
        formo.track('Analytics Tracking Paused', {
          timestamp: new Date().toISOString(),
        });
      }
    }
  };

  const trackEvent = useCallback((eventName: string, properties?: any) => {
    if (formo && isTrackingEnabled) {
      formo.track(eventName, properties);
    }
  }, [formo, isTrackingEnabled]);

  // Note: Page views are automatically tracked by the Formo SDK
  // No need to manually emit page view events

  return (
    <TrackingContext.Provider value={{ isTrackingEnabled, setTrackingEnabled, trackEvent }}>
      {children}
    </TrackingContext.Provider>
  );
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
      <TrackingProvider>{children}</TrackingProvider>
    </FormoAnalyticsProvider>
  );
}
