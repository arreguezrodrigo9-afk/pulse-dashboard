import React from 'react';
import { PlanBreakdownData } from '../types';
import { cn, formatCurrency, PLAN_COLORS } from '../utils/cn';
import { useLanguage } from '../LanguageContext';

interface PlanBreakdownProps {
  data: PlanBreakdownData | null;
}

export const PlanBreakdown = ({ data }: PlanBreakdownProps) => {
  const { t } = useLanguage();

  if (!data) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-pulse h-48" />
    );
  }

  const plans = ['Basic', 'Pro', 'Enterprise'] as const;

  // Totales por plan (solo activos)
  const planStats: Record<string, { active: number; churned: number; total: number }> = {
    Basic: { active: 0, churned: 0, total: 0 },
    Pro: { active: 0, churned: 0, total: 0 },
    Enterprise: { active: 0, churned: 0, total: 0 },
  };

  data.breakdown.forEach(row => {
    if (planStats[row.plan]) {
      planStats[row.plan].total += row.count;
      if (row.status === 'active') planStats[row.plan].active = row.count;
      if (row.status === 'churned') planStats[row.plan].churned = row.count;
    }
  });

  const totalMRR = Object.values(data.mrrByPlan).reduce((sum, v) => sum + v, 0);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-900 text-sm uppercase tracking-widest">
          {t('planBreakdown')}
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">{t('mrrContribution')}</p>
      </div>

      <div className="p-5 space-y-4">
        {plans.map(plan => {
          const stats = planStats[plan];
          const mrr = data.mrrByPlan[plan] || 0;
          const mrrPct = totalMRR > 0 ? (mrr / totalMRR) * 100 : 0;
          const churnRate = stats.total > 0 ? ((stats.churned / stats.total) * 100).toFixed(0) : '0';
          const colors = PLAN_COLORS[plan];

          return (
            <div key={plan}>
              {/* Plan header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={cn('w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-black', colors.bg, colors.text)}>
                    {plan[0]}
                  </span>
                  <span className="text-sm font-semibold text-slate-700">{plan}</span>
                  <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded', colors.bg, colors.text)}>
                    {stats.active} activos
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900 font-mono">{formatCurrency(mrr)}</p>
                  <p className="text-[10px] text-slate-400">{mrrPct.toFixed(1)}% del MRR</p>
                </div>
              </div>

              {/* MRR bar */}
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-1">
                <div
                  className={cn('h-full rounded-full transition-all duration-700', colors.dot)}
                  style={{ width: `${mrrPct}%` }}
                />
              </div>

              {/* Churn indicator */}
              <div className="flex items-center gap-1 justify-end">
                <div className={cn(
                  'text-[9px] font-bold px-1.5 py-0.5 rounded-full',
                  Number(churnRate) > 25 ? 'bg-red-50 text-red-600' :
                  Number(churnRate) > 15 ? 'bg-amber-50 text-amber-600' :
                  'bg-emerald-50 text-emerald-600'
                )}>
                  {churnRate}% churn
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
