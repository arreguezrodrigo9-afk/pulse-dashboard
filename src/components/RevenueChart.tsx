import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { RevenueData } from '../types';
import { useLanguage } from '../LanguageContext';
import { formatCurrency, PLAN_COLORS } from '../utils/cn';
import { BarChart2, TrendingUp } from 'lucide-react';

interface RevenueChartProps {
  data: RevenueData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((sum: number, p: any) => sum + (p.value || 0), 0);
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl p-3 shadow-2xl">
      <p className="text-slate-400 text-xs font-semibold mb-2 uppercase tracking-wide">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 text-xs mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-slate-300 capitalize">{p.dataKey}</span>
          </div>
          <span className="text-white font-bold font-mono">{formatCurrency(p.value)}</span>
        </div>
      ))}
      <div className="border-t border-slate-700 mt-2 pt-2 flex justify-between text-xs">
        <span className="text-slate-400">Total MRR</span>
        <span className="text-white font-bold font-mono">{formatCurrency(total)}</span>
      </div>
    </div>
  );
};

export const RevenueChart = ({ data }: RevenueChartProps) => {
  const { t } = useLanguage();
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [range, setRange] = useState<6 | 12>(12);

  const displayData = data.slice(-range).map(d => ({
    ...d,
    month: d.month.slice(0, 7), // YYYY-MM
  }));

  const latestTotal = displayData[displayData.length - 1]?.total || 0;
  const prevTotal = displayData[displayData.length - 2]?.total || 0;
  const growth = prevTotal > 0 ? (((latestTotal - prevTotal) / prevTotal) * 100).toFixed(1) : '0';
  const isGrowing = parseFloat(growth) >= 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-widest">
              {t('revenueGrowth')}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{t('revenueByPlan')}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Range selector */}
            <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5">
              <button
                onClick={() => setRange(6)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition-all ${range === 6 ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                6M
              </button>
              <button
                onClick={() => setRange(12)}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition-all ${range === 12 ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                12M
              </button>
            </div>
            {/* Chart type selector */}
            <div className="flex bg-slate-100 rounded-lg p-0.5 gap-0.5">
              <button
                onClick={() => setChartType('area')}
                className={`p-1.5 rounded-md transition-all ${chartType === 'area' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <TrendingUp size={12} />
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`p-1.5 rounded-md transition-all ${chartType === 'bar' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <BarChart2 size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-6 mt-4">
          <div>
            <p className="text-2xl font-bold font-mono text-slate-900">{formatCurrency(latestTotal)}</p>
            <p className="text-xs text-slate-400">Este mes</p>
          </div>
          <div className={`flex items-center gap-1 text-sm font-bold ${isGrowing ? 'text-emerald-600' : 'text-red-500'}`}>
            <TrendingUp size={14} className={!isGrowing ? 'rotate-180' : ''} />
            {growth}% vs mes anterior
          </div>
          {/* Plan legend */}
          <div className="flex items-center gap-3 ml-auto">
            {(['Basic', 'Pro', 'Enterprise'] as const).map(plan => (
              <div key={plan} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${PLAN_COLORS[plan].dot}`} />
                <span className="text-xs text-slate-500 font-medium">{plan}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="px-4 py-4 h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={displayData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <defs>
                {(['Basic', 'Pro', 'Enterprise'] as const).map(plan => (
                  <linearGradient key={plan} id={`grad${plan}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PLAN_COLORS[plan].hex} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={PLAN_COLORS[plan].hex} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              {(['basic', 'pro', 'enterprise'] as const).map((key, i) => {
                const plan = key.charAt(0).toUpperCase() + key.slice(1) as keyof typeof PLAN_COLORS;
                return (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stackId="1"
                    stroke={PLAN_COLORS[plan].hex}
                    strokeWidth={1.5}
                    fill={`url(#grad${plan})`}
                    fillOpacity={1}
                  />
                );
              })}
            </AreaChart>
          ) : (
            <BarChart data={displayData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              {(['basic', 'pro', 'enterprise'] as const).map((key) => {
                const plan = key.charAt(0).toUpperCase() + key.slice(1) as keyof typeof PLAN_COLORS;
                return (
                  <Bar key={key} dataKey={key} stackId="a" fill={PLAN_COLORS[plan].hex} radius={key === 'enterprise' ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
                );
              })}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
