'use client';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './store';
import { ReactNode } from 'react';

interface ProviderProps {
  children: ReactNode;
}

export function Provider({ children }: ProviderProps) {
  return <ReduxProvider store={store}>{children}</ReduxProvider>;
}