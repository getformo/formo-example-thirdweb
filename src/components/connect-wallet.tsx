'use client';

import { useAddress, useConnect, useDisconnect, useConnectionStatus } from '@thirdweb-dev/react';
import { MetaMaskWallet, CoinbaseWallet, WalletConnect } from '@thirdweb-dev/wallets';
import { useEffect, useState } from 'react';
import { useFormo } from '@formo/analytics';

const wallets = [
  new MetaMaskWallet({}),
  new CoinbaseWallet({}),
  new WalletConnect({}),
];

export function ConnectWallet() {
  const address = useAddress();
  const connect = useConnect();
  const disconnect = useDisconnect();
  const connectionStatus = useConnectionStatus();
  const [isConnecting, setIsConnecting] = useState(false);
  const formo = useFormo();

  // Track wallet connection events
  useEffect(() => {
    if (address && formo) {
      formo.identify({
        address: address,
        userId: address,
      });
      
      formo.track('Wallet Connected', {
        wallet_address: address,
        connection_status: connectionStatus,
        timestamp: new Date().toISOString(),
      });
    }
  }, [address, connectionStatus, formo]);

  const handleConnect = async (wallet: any) => {
    try {
      setIsConnecting(true);
      await connect(wallet);
      
      if (formo) {
        formo.track('Wallet Connection Attempted', {
          wallet_type: wallet.constructor.name,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      if (formo) {
        formo.track('Wallet Connection Failed', {
          wallet_type: wallet.constructor.name,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        });
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      if (formo && address) {
        formo.track('Wallet Disconnected', {
          wallet_address: address,
          timestamp: new Date().toISOString(),
        });
      }
      await disconnect();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  if (address) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Wallet Connected</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Address:</span>
            <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Status:</span>
            <span className="text-green-600 font-medium">{connectionStatus}</span>
          </div>
          <button
            onClick={handleDisconnect}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Disconnect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Connect Your Wallet</h2>
      <div className="space-y-3">
        {wallets.map((wallet, index) => (
          <button
            key={index}
            onClick={() => handleConnect(wallet)}
            disabled={isConnecting || connectionStatus === 'connecting'}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            {isConnecting ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Connecting...
              </div>
            ) : (
              `Connect ${wallet.constructor.name.replace('Wallet', '')}`
            )}
          </button>
        ))}
        <div className="text-sm text-gray-500 text-center mt-4">
          Status: {connectionStatus}
        </div>
      </div>
    </div>
  );
}
