import { createContext, useContext } from 'react';

export const TIERS = ['low', 'medium', 'high'];

export const QualityContext = createContext({ tier: 'high' });

export function useQualityTier() {
  return useContext(QualityContext).tier;
}

// Starting tier from device signals; missing APIs count as high
export function detectStartTier() {
  if (typeof navigator === 'undefined') return 'high';
  const { deviceMemory, hardwareConcurrency, connection } = navigator;
  if (
    (typeof deviceMemory === 'number' && deviceMemory <= 2) ||
    (typeof hardwareConcurrency === 'number' && hardwareConcurrency <= 2)
  ) {
    return 'low';
  }
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  if (connection?.saveData === true || reduced) return 'medium';
  return 'high';
}
