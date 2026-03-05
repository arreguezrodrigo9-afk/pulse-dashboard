import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../utils/cn';
import { useLanguage } from '../LanguageContext';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  suffix?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  inverted?: boolean; // Para churnRate, donde bajar es bueno
  subtitle?: string;
}

export const StatCard = ({
  title,
  value,
  change,
  suffix,
  icon,
  inverted = false,
  subtitle,
}: StatCardProps) => {
  const { t } = useLanguage();

  const hasChange = change !== undefined && change !== null && !isNaN(change);
  const isPositive = hasChange ? (inverted ? change < 0 : change > 0) : null;
  const isNeutral = hasChange && change === 0;

  return (
    <div className="group relative bg-white border border-slate-200 rounded-2xl p-6 overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      {/* Accent line top */}
      <div className={cn(
        "absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl transition-opacity duration-300",
        isPositive === true ? "bg-emerald-400 opacity-100" :
        isPositive === false ? "bg-red-400 opacity-100" :
        "bg-slate-200 opacity-0 group-hover:opacity-100"
      )} />

      <div className="flex items-start justify-between mb-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest leading-none">
          {title}
        </p>
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold tracking-tight text-slate-900 font-mono">
              {value}
            </span>
            {suffix && (
              <span className="text-lg font-semibold text-slate-400">{suffix}</span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>

        {hasChange && !isNeutral && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg",
            isPositive
              ? "text-emerald-700 bg-emerald-50"
              : "text-red-700 bg-red-50"
          )}>
            {isPositive
              ? <TrendingUp size={12} />
              : <TrendingDown size={12} />}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
        {hasChange && isNeutral && (
          <div className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg text-slate-500 bg-slate-50">
            <Minus size={12} />
            0%
          </div>
        )}
      </div>

      {hasChange && (
        <p className="text-[10px] text-slate-400 mt-2 font-medium">
          {t('vsLastMonth')}
        </p>
      )}
    </div>
  );
};
