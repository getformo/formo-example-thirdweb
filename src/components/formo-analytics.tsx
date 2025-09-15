'use client';

import { useState, useEffect } from 'react';
import { useAddress } from '@thirdweb-dev/react';
import { useFormo } from '@formo/analytics';

export function FormoAnalytics() {
  const address = useAddress();
  const formo = useFormo();
  const [events, setEvents] = useState<Array<{id: string, name: string, data: any, timestamp: string}>>([]);
  const [isTracking, setIsTracking] = useState(true);

  // Mock event listener for demonstration
  useEffect(() => {
    if (formo && isTracking) {
      // In a real implementation, you'd listen to actual analytics events
      // For now, we'll just show the status
    }
  }, [formo, isTracking]);

  const clearEvents = () => {
    setEvents([]);
  };

  const toggleTracking = () => {
    setIsTracking(!isTracking);
    if (formo) {
      formo.track('Analytics Tracking Toggled', {
        enabled: !isTracking,
        wallet_address: address,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const testConnection = () => {
    if (formo) {
      formo.track('Connection Test', {
        test_timestamp: new Date().toISOString(),
        wallet_address: address,
        user_agent: navigator.userAgent,
        page_url: window.location.href,
      });
      alert('Test event sent to Formo Analytics!');
    } else {
      alert('Formo Analytics not initialized. Check your NEXT_PUBLIC_FORMO_WRITE_KEY.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Formo Analytics Status</h2>
      
      <div className="space-y-4">
        {/* Status Indicators */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">SDK Status</div>
            <div className={`font-medium ${formo ? 'text-green-600' : 'text-red-600'}`}>
              {formo ? 'Initialized' : 'Not Initialized'}
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Tracking</div>
            <div className={`font-medium ${isTracking ? 'text-green-600' : 'text-orange-600'}`}>
              {isTracking ? 'Enabled' : 'Disabled'}
            </div>
          </div>
        </div>

        {/* User Info */}
        {address && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">Identified User</div>
            <div className="font-mono text-sm text-blue-800">
              {address.slice(0, 10)}...{address.slice(-8)}
            </div>
          </div>
        )}

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
              isTracking 
                ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isTracking ? 'Disable' : 'Enable'} Tracking
          </button>
        </div>

        {/* Configuration Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>Write Key: {process.env.NEXT_PUBLIC_FORMO_WRITE_KEY ? '✓ Set' : '✗ Missing'}</div>
          <div>Environment: {process.env.NODE_ENV}</div>
          <div>Page: {typeof window !== 'undefined' ? window.location.pathname : 'N/A'}</div>
        </div>

        {/* Event Log */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-gray-700">Recent Events</h3>
            {events.length > 0 && (
              <button
                onClick={clearEvents}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Clear
              </button>
            )}
          </div>
          <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
            {events.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-4">
                No events tracked yet. Try connecting your wallet or using the event tester.
              </div>
            ) : (
              <div className="space-y-2">
                {events.slice(-5).map((event) => (
                  <div key={event.id} className="text-xs">
                    <div className="font-medium text-gray-700">{event.name}</div>
                    <div className="text-gray-500">{event.timestamp}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
