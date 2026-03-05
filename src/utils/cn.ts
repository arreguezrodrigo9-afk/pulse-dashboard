import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, compact = false): string {
  if (compact && value >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, showSign = false): string {
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

export const PLAN_COLORS = {
  Basic: { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-400', hex: '#94a3b8' },
  Pro: { bg: 'bg-violet-100', text: 'text-violet-700', dot: 'bg-violet-500', hex: '#8b5cf6' },
  Enterprise: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500', hex: '#10b981' },
} as const;
