import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { StatCard } from './components/StatCard';
import { RevenueChart } from './components/RevenueChart';
import { CustomerTable } from './components/CustomerTable';
import { AIInsights } from './components/AIInsights';
import { PlanBreakdown } from './components/PlanBreakdown';
import { ChurnAnalysis } from './components/ChurnAnalysis';
import {
  SummaryStats, RevenueData, Customer, Insight,
  PlanBreakdownData, ChurnAnalysisData
} from './types';
import { formatCurrency } from './utils/cn';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from './LanguageContext';
import { Users, DollarSign, TrendingDown, Zap } from 'lucide-react';
import { LoginScreen } from './components/LoginScreen';

const FADE = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.2 },
};

export default function App() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('pulse_token'));
  const [summary, setSummary] = useState<SummaryStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [planData, setPlanData] = useState<PlanBreakdownData | null>(null);
  const [churnData, setChurnData] = useState<ChurnAnalysisData | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(true);

  const handleLogin = (newToken: string) => {
    localStorage.setItem('pulse_token', newToken);
    setToken(newToken);
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST', headers: { 'x-session-token': token || '' } });
    localStorage.removeItem('pulse_token');
    setToken(null);
  };

  if (!token) return <LoginScreen onLogin={handleLogin} />;

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    await Promise.all([
      fetchSummary(),
      fetchRevenue(),
      fetchCustomers(),
      fetchPlanBreakdown(),
      fetchChurnAnalysis(),
    ]);
  };

  const fetchSummary = async () => {
    setLoadingSummary(true);
    try {
      const res = await fetch('/api/summary', { headers: { 'x-session-token': token || '' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSummary(await res.json());
    } catch (e) {
      console.error('summary fetch error:', e);
    } finally {
      setLoadingSummary(false);
    }
  };

  const fetchRevenue = async () => {
    try {
      const res = await fetch('/api/revenue-chart', { headers: { 'x-session-token': token || '' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setRevenueData(await res.json());
    } catch (e) {
      console.error('revenue fetch error:', e);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers?limit=100', { headers: { 'x-session-token': token || '' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setCustomers(await res.json());
    } catch (e) {
      console.error('customers fetch error:', e);
    }
  };

  const fetchPlanBreakdown = async () => {
    try {
      const res = await fetch('/api/plan-breakdown', { headers: { 'x-session-token': token || '' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setPlanData(await res.json());
    } catch (e) {
      console.error('plan-breakdown fetch error:', e);
    }
  };

  const fetchChurnAnalysis = async () => {
    try {
      const res = await fetch('/api/churn-analysis', { headers: { 'x-session-token': token || '' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setChurnData(await res.json());
    } catch (e) {
      console.error('churn-analysis fetch error:', e);
    }
  };

  const fetchInsights = async () => {
    setLoadingInsights(true);
    try {
      const res = await fetch('/api/ai-insights', { method: 'POST', headers: { 'x-session-token': token || '' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setInsights(data.insights || []);
    } catch (e) {
      console.error('insights fetch error:', e);
    } finally {
      setLoadingInsights(false);
    }
  };

  const statCards = summary ? [
    {
      title: t('mrr'),
      value: formatCurrency(summary.mrr),
      change: summary.mrrGrowth,
      icon: <DollarSign size={14} />,
    },
    {
      title: t('activeCustomers'),
      value: summary.activeCustomers,
      change: summary.customerGrowth,
      icon: <Users size={14} />,
    },
    {
      title: t('churnRate'),
      value: summary.churnRate,
      suffix: '%',
      change: 0, // No tenemos dato del mes anterior de churn rate aún
      icon: <TrendingDown size={14} />,
      inverted: true,
    },
    {
      title: t('arpu'),
      value: formatCurrency(summary.arpu),
      change: summary.mrrGrowth > 0 && summary.customerGrowth >= 0
        ? parseFloat((summary.mrrGrowth - summary.customerGrowth).toFixed(1))
        : 0,
      icon: <Zap size={14} />,
    },
  ] : [];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between sticky top-0 z-20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xs font-bold text-slate-900 uppercase tracking-widest">
              {t(activeTab as any)}
            </h1>
            <span className="h-4 w-px bg-slate-200" />
            <p className="text-xs text-slate-400 font-medium">CloudScale Solutions</p>
          </div>

          <div className="flex items-center gap-4">
            {loadingSummary && (
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <div className="w-3 h-3 border border-slate-300 border-t-violet-500 rounded-full animate-spin" />
                Cargando datos...
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">
                {t('operational')}
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-screen-xl mx-auto">
            <AnimatePresence mode="wait">

              {/* ── OVERVIEW ── */}
              {activeTab === 'overview' && (
                <motion.div key="overview" {...FADE} className="space-y-6">
                  {/* KPIs */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {loadingSummary
                      ? Array(4).fill(0).map((_, i) => (
                          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 animate-pulse h-32" />
                        ))
                      : statCards.map((card, i) => (
                          <StatCard key={i} {...card} />
                        ))
                    }
                  </div>

                  {/* AI Insights */}
                  <AIInsights
                    insights={insights}
                    loading={loadingInsights}
                    onRefresh={fetchInsights}
                  />

                  {/* Revenue + Plan breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <RevenueChart data={revenueData} />
                    </div>
                    <div>
                      <PlanBreakdown data={planData} />
                    </div>
                  </div>

                  {/* Recent customers */}
                  <CustomerTable customers={customers} compact />
                </motion.div>
              )}

              {/* ── CUSTOMERS ── */}
              {activeTab === 'customers' && (
                <motion.div key="customers" {...FADE}>
                  <CustomerTable customers={customers} />
                </motion.div>
              )}

              {/* ── REVENUE ── */}
              {activeTab === 'revenue' && (
                <motion.div key="revenue" {...FADE} className="space-y-6">
                  {/* KPI cards solo de revenue */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {summary && (
                      <>
                        <StatCard
                          title={t('mrr')}
                          value={formatCurrency(summary.mrr)}
                          change={summary.mrrGrowth}
                          icon={<DollarSign size={14} />}
                        />
                        <StatCard
                          title={t('arpu')}
                          value={formatCurrency(summary.arpu)}
                          icon={<Zap size={14} />}
                        />
                        <StatCard
                          title={t('newThisMonth')}
                          value={summary.newThisMonth}
                          change={summary.customerGrowth}
                          icon={<Users size={14} />}
                        />
                        <StatCard
                          title="MRR Mes Anterior"
                          value={formatCurrency(summary.mrrPrev)}
                          icon={<DollarSign size={14} />}
                        />
                      </>
                    )}
                  </div>
                  <RevenueChart data={revenueData} />
                  <PlanBreakdown data={planData} />
                </motion.div>
              )}

              {/* ── CHURN ANALYSIS ── */}
              {activeTab === 'churnAnalysis' && (
                <motion.div key="churnAnalysis" {...FADE} className="space-y-6">
                  {summary && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <StatCard
                        title={t('churnRate')}
                        value={summary.churnRate}
                        suffix="%"
                        inverted
                        icon={<TrendingDown size={14} />}
                      />
                      <StatCard
                        title="Total cancelaciones"
                        value={summary.totalCustomers - summary.activeCustomers}
                        icon={<Users size={14} />}
                      />
                      <StatCard
                        title={t('activeCustomers')}
                        value={summary.activeCustomers}
                        change={summary.customerGrowth}
                        icon={<Users size={14} />}
                      />
                      <StatCard
                        title="Total clientes histórico"
                        value={summary.totalCustomers}
                        icon={<Users size={14} />}
                      />
                    </div>
                  )}
                  <ChurnAnalysis data={churnData} />
                </motion.div>
              )}

              {/* ── AI INSIGHTS ── */}
              {activeTab === 'insights' && (
                <motion.div key="insights" {...FADE}>
                  <AIInsights
                    insights={insights}
                    loading={loadingInsights}
                    onRefresh={fetchInsights}
                  />
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
