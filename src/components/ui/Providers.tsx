"use client";
import { NetworkProvider } from "@/hooks/useNetwork";
import { WalletProvider } from "@/hooks/useWallet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {

      const [queryClient] = useState(
        () =>
          new QueryClient({
            defaultOptions: {
              queries: {
                staleTime: 2000,
                refetchOnWindowFocus: false,
              },
            },
          })
      );


    return (
        <QueryClientProvider client={queryClient}>
            <NetworkProvider>
                <WalletProvider>
                    {children}
                </WalletProvider>
            </NetworkProvider>
        </QueryClientProvider>
    );
}