import React from 'react';
import { ChurnAnalysisData } from '../types';
import { cn } from '../utils/cn';
import { useLanguage } from '../LanguageContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, TrendingDown, Activity } from 'lucide-react';

interface ChurnAnalysisProps {
  data: ChurnAnalysisData | null;
}

const RISK_COLORS = {
  high: { bar: '#ef4444', bg: 'bg-red-50', text: 'text-red-700', label: 'Alto riesgo', ring: 'ring-red-200' },
  medium: { bar: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-700', label: 'Riesgo medio', ring: 'ring-amber-200' },
  low: { bar: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Bajo riesgo', ring: 'ring-emerald-200' },
};

const getRisk = (rate: number) => {
  if (rate >= 25) return 'high';
  if (rate >= 12) return 'medium';
  return 'low';
};

const CustomBar = (props: any) => {
  const { x, y, width, height, value } = props;
  const risk = getRisk(value);
  const color = RISK_COLORS[risk].bar;
  return <rect x={x} y={y} width={width} height={height} fill={color} rx={4} ry={4} />;
};

export const ChurnAnalysis = ({ data }: ChurnAnalysisProps) => {
  const { t } = useLanguage();

  if (!data) {
    return <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-pulse h-64" />;
  }

  return (
    <div className="space-y-6">
      {/* Row 1: Por plan + Por industria */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Churn por plan */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center">
              <TrendingDown size={14} className="text-red-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-widest">
                {t('churnByPlan')}
              </h3>
            </div>
          </div>
          <div className="p-5 space-y-4">
            {data.churnByPlan.map(row => {
              const risk = getRisk(row.churn_rate);
              const cfg = RISK_COLORS[risk];
              return (
                <div key={row.plan}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-700">{row.plan}</span>
                      <span className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full ring-1', cfg.bg, cfg.text, cfg.ring)}>
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{row.churned} de {row.total}</span>
                      <span className={cn('font-bold text-sm', cfg.text)}>
                        {row.churn_rate}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(row.churn_rate, 100)}%`, backgroundColor: cfg.bar }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Churn por industria */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center">
              <AlertTriangle size={14} className="text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-widest">
                {t('churnByIndustry')}
              </h3>
            </div>
          </div>

          <div className="px-4 py-4 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.churnByIndustry}
                layout="vertical"
                margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
              >
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis
                  type="category"
                  dataKey="industry"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#475569' }}
                  width={80}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
                  formatter={(v: number, _name: string, props: any) => [
                    `${v}% (${props.payload.churned}/${props.payload.total})`,
                    'Tasa de churn'
                  ]}
                />
                <Bar dataKey="churn_rate" shape={<CustomBar />} maxBarSize={16}>
                  {data.churnByIndustry.map((_entry, index) => (
                    <Cell key={index} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Tendencia de churn 6 meses */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center">
              <Activity size={14} className="text-slate-500" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-widest">
                {t('churnTrend')}
              </h3>
            </div>
          </div>
          {data.churnTrend.length > 0 && (
            <div className="text-right">
              <p className="text-2xl font-bold font-mono text-red-600">
                {data.churnTrend.reduce((sum, d) => sum + d.churned_count, 0)}
              </p>
              <p className="text-xs text-slate-400">cancelaciones últimos 6 meses</p>
            </div>
          )}
        </div>

        {data.churnTrend.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No hay datos de churn en los últimos 6 meses
          </div>
        ) : (
          <div className="px-4 py-4 h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.churnTrend} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  dy={6}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
                  formatter={(v: number) => [v, 'Cancelaciones']}
                />
                <Bar dataKey="churned_count" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
