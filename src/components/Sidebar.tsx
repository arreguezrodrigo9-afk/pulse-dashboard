import React from 'react';
import {
  LayoutDashboard, Users, CreditCard, Sparkles,
  Settings, LogOut, TrendingDown, Activity
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useLanguage } from '../LanguageContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout?: () => void;
}

export const Sidebar = ({ activeTab, setActiveTab, onLogout }: SidebarProps) => {
  const { t, language, setLanguage } = useLanguage();

  const navItems = [
    { id: 'overview', label: t('overview'), icon: LayoutDashboard },
    { id: 'customers', label: t('customers'), icon: Users },
    { id: 'revenue', label: t('revenue'), icon: CreditCard },
    { id: 'churnAnalysis', label: t('churnAnalysis'), icon: TrendingDown },
    { id: 'insights', label: t('insights'), icon: Sparkles },
  ];

  return (
    <div className="w-60 h-screen bg-slate-950 border-r border-slate-800 flex flex-col sticky top-0 flex-shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-900/50">
            <Activity size={14} className="text-white" />
          </div>
          <div>
            <span className="font-black text-white text-base tracking-tight">Pulse</span>
            <span className="text-[10px] text-slate-500 font-semibold ml-1.5 uppercase tracking-widest">Analytics</span>
          </div>
        </div>
        <p className="text-[10px] text-slate-600 mt-1.5 font-medium">CloudScale Solutions</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest px-3 mb-2">
          Dashboard
        </p>
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150',
                isActive
                  ? 'bg-violet-600/15 text-violet-300 border border-violet-500/20'
                  : 'text-slate-500 hover:bg-slate-800/60 hover:text-slate-300 border border-transparent'
              )}
            >
              <item.icon
                size={14}
                className={isActive ? 'text-violet-400' : 'text-slate-600'}
              />
              {item.label}
              {isActive && (
                <span className="ml-auto w-1 h-1 bg-violet-400 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-slate-800 space-y-3">
        {/* Language toggle */}
        <div className="px-1">
          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-2 px-2">
            {t('language')}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setLanguage('en')}
              className={cn(
                'flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all',
                language === 'en'
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-800 text-slate-500 hover:text-slate-300'
              )}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('es')}
              className={cn(
                'flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all',
                language === 'es'
                  ? 'bg-violet-600 text-white'
                  : 'bg-slate-800 text-slate-500 hover:text-slate-300'
              )}
            >
              ES
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="space-y-0.5">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-800/60 hover:text-slate-300 transition-all border border-transparent">
            <Settings size={13} />
            {t('settings')}
          </button>
          <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-red-500/70 hover:bg-red-900/20 hover:text-red-400 transition-all border border-transparent">
            <LogOut size={13} />
            {t('logout')}
          </button>
        </div>
      </div>
    </div>
  );
};
