'use client';

import { useState, useEffect } from 'react';
import { useAddress } from '@thirdweb-dev/react';
import { useFormo } from '@formo/analytics';
import { useTracking } from './analytics-provider';

export function FormoAnalytics() {
  const address = useAddress();
  const formo = useFormo();
  const { isTrackingEnabled, setTrackingEnabled, trackEvent } = useTracking();
  const [events, setEvents] = useState<Array<{id: string, name: string, data: any, timestamp: string}>>([]);

  // Mock event listener for demonstration
  useEffect(() => {
    if (formo && isTrackingEnabled) {
      // In a real implementation, you'd listen to actual analytics events
      // For now, we'll just show the status
    }
  }, [formo, isTrackingEnabled]);

  const clearEvents = () => {
    setEvents([]);
  };

  const toggleTracking = () => {
    const newTrackingState = !isTrackingEnabled;
    setTrackingEnabled(newTrackingState);
    
    // Show user feedback
    if (newTrackingState) {
      alert('Analytics tracking has been enabled. Events will now be tracked.');
    } else {
      alert('Analytics tracking has been disabled. No events will be tracked until you re-enable it.');
    }
  };

  const testConnection = () => {
    if (!formo) {
      alert('Formo Analytics not initialized. Check your NEXT_PUBLIC_FORMO_WRITE_KEY.');
      return;
    }

    if (!isTrackingEnabled) {
      alert('Tracking is currently disabled. Enable tracking first to send test events.');
      return;
    }

    trackEvent('Connection Test', {
      test_timestamp: new Date().toISOString(),
      wallet_address: address,
      user_agent: navigator.userAgent,
      page_url: window.location.href,
    });
    alert('Test event sent to Formo Analytics!');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Analytics Controls</h2>
      
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex space-x-3">
          <button
            onClick={testConnection}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Test Connection
          </button>
          <button
            onClick={toggleTracking}
            className={`flex-1 font-medium py-2 px-4 rounded-lg transition-colors ${
              isTrackingEnabled 
                ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isTrackingEnabled ? 'Disable' : 'Enable'} Tracking
          </button>
        </div>
      </div>
    </div>
  );
}
