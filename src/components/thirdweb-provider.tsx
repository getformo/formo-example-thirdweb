'use client';

import { ThirdwebProvider } from '@thirdweb-dev/react';
import { Ethereum, Polygon } from '@thirdweb-dev/chains';

interface ThirdwebProviderWrapperProps {
  children: React.ReactNode;
}

export function ThirdwebProviderWrapper({ children }: ThirdwebProviderWrapperProps) {
  const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;

  if (!clientId) {
    console.warn('NEXT_PUBLIC_THIRDWEB_CLIENT_ID is not set');
  }

  return (
    <ThirdwebProvider
      clientId={clientId}
      activeChain={Ethereum}
      supportedChains={[Ethereum, Polygon]}
    >
      {children}
    </ThirdwebProvider>
  );
}
