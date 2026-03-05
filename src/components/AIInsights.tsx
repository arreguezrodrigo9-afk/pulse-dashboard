import React from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Zap, RefreshCw, ArrowRight } from 'lucide-react';
import { Insight } from '../types';
import { cn } from '../utils/cn';
import { useLanguage } from '../LanguageContext';

interface AIInsightsProps {
  insights: Insight[];
  loading: boolean;
  onRefresh: () => void;
}

const IMPACT_CONFIG = {
  high: {
    icon: TrendingUp,
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
    badge: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30',
    bar: 'bg-emerald-500',
  },
  medium: {
    icon: Zap,
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
    badge: 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30',
    bar: 'bg-amber-500',
  },
  low: {
    icon: AlertTriangle,
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/20',
    badge: 'bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/30',
    bar: 'bg-blue-500',
  },
};

export const AIInsights = ({ insights, loading, onRefresh }: AIInsightsProps) => {
  const { t } = useLanguage();

  return (
    <div className="relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-800">
      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Glow top-left */}
      <div className="absolute -top-24 -left-24 w-64 h-64 bg-violet-600/20 blur-3xl rounded-full pointer-events-none" />
      {/* Glow bottom-right */}
      <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-emerald-600/15 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-violet-600/20 border border-violet-500/30 rounded-lg flex items-center justify-center">
              <Sparkles size={14} className="text-violet-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">
                {t('aiGrowthInsights')}
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">{t('poweredBy')}</p>
            </div>
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border",
              loading
                ? "bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed"
                : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 hover:border-slate-500 hover:text-white"
            )}
          >
            <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
            {loading ? t('analyzing') : t('refreshAnalysis')}
          </button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-800">
          {loading
            ? Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-slate-950 p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-slate-800 rounded-lg" />
                      <div className="h-4 w-20 bg-slate-800 rounded" />
                    </div>
                    <div className="h-5 bg-slate-800 rounded w-4/5" />
                    <div className="space-y-1.5">
                      <div className="h-3 bg-slate-800 rounded w-full" />
                      <div className="h-3 bg-slate-800 rounded w-5/6" />
                      <div className="h-3 bg-slate-800 rounded w-4/6" />
                    </div>
                  </div>
                </div>
              ))
            : insights.length === 0
            ? (
              <div className="col-span-3 bg-slate-950 py-14 text-center">
                <Sparkles size={24} className="mx-auto text-slate-700 mb-3" />
                <p className="text-slate-500 text-sm">
                  Hacé clic en "Actualizar Análisis" para generar insights con IA
                </p>
              </div>
            )
            : insights.map((insight, i) => {
              const config = IMPACT_CONFIG[insight.impact];
              const Icon = config.icon;

              return (
                <div
                  key={i}
                  className="group bg-slate-950 hover:bg-slate-900/80 p-6 transition-colors duration-200"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', config.bg, `border ${config.border}`)}>
                      <Icon size={16} className={config.text} />
                    </div>
                    <span className={cn('text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full', config.badge)}>
                      {insight.impact === 'high' ? t('highImpact') : insight.impact === 'medium' ? t('mediumImpact') : t('lowImpact')}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="text-sm font-bold text-white mb-2 leading-snug group-hover:text-slate-100 transition-colors">
                    {insight.title}
                  </h4>

                  {/* Description */}
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {insight.description}
                  </p>

                  {/* Impact indicator bottom */}
                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full', config.bar)}
                          style={{ width: insight.impact === 'high' ? '90%' : insight.impact === 'medium' ? '60%' : '30%' }}
                        />
                      </div>
                      <ArrowRight size={12} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
                    </div>
                  </div>
                </div>
              );
            })
          }
        </div>
      </div>
    </div>
  );
};
