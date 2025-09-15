'use client';

import { useState } from 'react';
import { useAddress, useSigner } from '@thirdweb-dev/react';
import { useFormo } from '@formo/analytics';

export function EventTester() {
  const address = useAddress();
  const signer = useSigner();
  const formo = useFormo();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('Hello from Formo Analytics!');
  const [customEventName, setCustomEventName] = useState('Custom Test Event');
  const [customEventData, setCustomEventData] = useState('{"key": "value", "timestamp": "' + new Date().toISOString() + '"}');
  const [lastEvent, setLastEvent] = useState<string | null>(null);

  const handleSignMessage = async () => {
    if (!signer || !address) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setIsLoading(true);
      const signature = await signer.signMessage(message);
      
      if (formo) {
        const eventData = {
          wallet_address: address,
          message: message,
          signature: signature,
          timestamp: new Date().toISOString(),
        };
        
        formo.track('Message Signed', eventData);
        setLastEvent(`Message Signed: ${JSON.stringify(eventData, null, 2)}`);
      }
      
      alert('Message signed successfully!');
    } catch (error) {
      console.error('Failed to sign message:', error);
      if (formo) {
        formo.track('Signature Failed', {
          wallet_address: address,
          message: message,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        });
      }
      alert('Failed to sign message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTransaction = async () => {
    if (!signer || !address) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setIsLoading(true);
      
      // Create a simple transaction (sending 0 ETH to self)
      const tx = await signer.sendTransaction({
        to: address,
        value: '0',
        data: '0x',
      });

      if (formo) {
        const eventData = {
          wallet_address: address,
          transaction_hash: tx.hash,
          to: address,
          value: '0',
          timestamp: new Date().toISOString(),
        };
        
        formo.track('Transaction Sent', eventData);
        setLastEvent(`Transaction Sent: ${JSON.stringify(eventData, null, 2)}`);
      }

      alert(`Transaction sent! Hash: ${tx.hash}`);
    } catch (error) {
      console.error('Failed to send transaction:', error);
      if (formo) {
        formo.track('Transaction Failed', {
          wallet_address: address,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        });
      }
      alert('Failed to send transaction');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomEvent = () => {
    if (!formo) {
      alert('Analytics not initialized');
      return;
    }

    try {
      const parsedData = JSON.parse(customEventData);
      const eventData = {
        ...parsedData,
        wallet_address: address,
        triggered_manually: true,
        timestamp: new Date().toISOString(),
      };
      
      formo.track(customEventName, eventData);
      setLastEvent(`${customEventName}: ${JSON.stringify(eventData, null, 2)}`);
      alert('Custom event sent!');
    } catch (error) {
      alert('Invalid JSON in custom event data');
    }
  };

  const handlePageEvent = () => {
    if (!formo) {
      alert('Analytics not initialized');
      return;
    }

    const eventData = {
      page: window.location.pathname,
      url: window.location.href,
      title: document.title,
      referrer: document.referrer,
      user_agent: navigator.userAgent,
      wallet_address: address,
      timestamp: new Date().toISOString(),
    };

    formo.track('Page Event Triggered', eventData);
    setLastEvent(`Page Event: ${JSON.stringify(eventData, null, 2)}`);
    alert('Page event sent!');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">SDK Event Testing</h2>
      
      <div className="space-y-6">
        {/* Signature Testing */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Signature Testing</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message to sign"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSignMessage}
              disabled={!address || isLoading}
              className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {isLoading ? 'Signing...' : 'Sign Message'}
            </button>
          </div>
        </div>

        {/* Transaction Testing */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Transaction Testing</h3>
          <button
            onClick={handleSendTransaction}
            disabled={!address || isLoading}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isLoading ? 'Sending...' : 'Send Test Transaction (0 ETH to self)'}
          </button>
        </div>

        {/* Custom Events */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Custom Events</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={customEventName}
              onChange={(e) => setCustomEventName(e.target.value)}
              placeholder="Event name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              value={customEventData}
              onChange={(e) => setCustomEventData(e.target.value)}
              placeholder="Event data (JSON)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleCustomEvent}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Send Custom Event
            </button>
          </div>
        </div>

        {/* Page Events */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Page Events</h3>
          <button
            onClick={handlePageEvent}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Trigger Page Event
          </button>
        </div>

        {/* Last Event Display */}
        {lastEvent && (
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Last Event Sent</h3>
            <pre className="bg-gray-100 p-3 rounded-lg text-xs overflow-x-auto">
              {lastEvent}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
