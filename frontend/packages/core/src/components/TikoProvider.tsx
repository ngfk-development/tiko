import { Toaster, TooltipProvider } from '@tiko/core';
import { type ReactNode } from 'react';

export interface TikoProviderProps {
  children: ReactNode;
}

export function TikoProvider(props: TikoProviderProps) {
  return (
    <TooltipProvider>
      {props.children}
      <Toaster />
    </TooltipProvider>
  );
}
