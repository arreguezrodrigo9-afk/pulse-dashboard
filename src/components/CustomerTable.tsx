import React, { useState, useMemo } from 'react';
import { Customer } from '../types';
import { format } from 'date-fns';
import { cn, PLAN_COLORS } from '../utils/cn';
import { useLanguage } from '../LanguageContext';
import { Search, Users, ChevronUp, ChevronDown } from 'lucide-react';

interface CustomerTableProps {
  customers: Customer[];
  compact?: boolean;
}

type SortField = 'company' | 'plan' | 'status' | 'created_at' | 'team_size';
type SortDir = 'asc' | 'desc';

export const CustomerTable = ({ customers, compact = false }: CustomerTableProps) => {
  const { t } = useLanguage();
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const STATUS_COLORS: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    churned: 'bg-red-50 text-red-700 ring-1 ring-red-200',
    trial: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  };

  const STATUS_LABELS: Record<string, string> = {
    active: t('active'),
    churned: t('churned'),
    trial: t('trial'),
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filtered = useMemo(() => {
    let result = [...customers];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.company.toLowerCase().includes(q) ||
        c.contact_name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.industry || '').toLowerCase().includes(q)
      );
    }

    if (planFilter !== 'all') {
      result = result.filter(c => c.plan === planFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter(c => c.status === statusFilter);
    }

    result.sort((a, b) => {
      let aVal: string | number = a[sortField] ?? '';
      let bVal: string | number = b[sortField] ?? '';
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return compact ? result.slice(0, 6) : result;
  }, [customers, search, planFilter, statusFilter, sortField, sortDir, compact]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp size={10} className="text-slate-300" />;
    return sortDir === 'asc'
      ? <ChevronUp size={10} className="text-violet-500" />
      : <ChevronDown size={10} className="text-violet-500" />;
  };

  const ThButton = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:text-slate-700 transition-colors group"
    >
      {label}
      <SortIcon field={field} />
    </button>
  );

  // Iniciales de empresa
  const getInitials = (company: string) =>
    company.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  // Color de avatar por nombre (consistente)
  const avatarColors = [
    'bg-violet-100 text-violet-700',
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
    'bg-cyan-100 text-cyan-700',
  ];
  const getAvatarColor = (company: string) =>
    avatarColors[company.charCodeAt(0) % avatarColors.length];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-widest">
              {t('recentCustomers')}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {filtered.length} {t('customers').toLowerCase()}
            </p>
          </div>
        </div>

        {!compact && (
          <div className="flex gap-2">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-300"
              />
            </div>
            {/* Plan filter */}
            <select
              value={planFilter}
              onChange={e => setPlanFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg bg-slate-50 px-2.5 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-300"
            >
              <option value="all">{t('allPlans')}</option>
              <option value="Basic">Basic</option>
              <option value="Pro">Pro</option>
              <option value="Enterprise">Enterprise</option>
            </select>
            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg bg-slate-50 px-2.5 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-300"
            >
              <option value="all">{t('allStatuses')}</option>
              <option value="active">{t('active')}</option>
              <option value="churned">{t('churned')}</option>
            </select>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <ThButton field="company" label={t('company')} />
              </th>
              <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <ThButton field="plan" label={t('plan')} />
              </th>
              <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <ThButton field="status" label={t('status')} />
              </th>
              {!compact && (
                <>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden lg:table-cell">
                    {t('industry')}
                  </th>
                  <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden xl:table-cell">
                    <ThButton field="team_size" label={t('teamSize')} />
                  </th>
                </>
              )}
              <th className="px-5 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <ThButton field="created_at" label={t('joined')} />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Users size={24} className="opacity-40" />
                    <p className="text-sm">{t('noData')}</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((customer) => (
                <tr
                  key={customer.id}
                  className={cn(
                    'hover:bg-slate-50/70 transition-colors',
                    customer.status === 'churned' && 'opacity-60'
                  )}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0',
                        getAvatarColor(customer.company)
                      )}>
                        {getInitials(customer.company)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate max-w-[160px]">
                          {customer.company}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">{customer.contact_name}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-3.5">
                    <span className={cn(
                      'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold',
                      PLAN_COLORS[customer.plan as keyof typeof PLAN_COLORS]?.bg,
                      PLAN_COLORS[customer.plan as keyof typeof PLAN_COLORS]?.text
                    )}>
                      <span className={cn('w-1.5 h-1.5 rounded-full', PLAN_COLORS[customer.plan as keyof typeof PLAN_COLORS]?.dot)} />
                      {customer.plan}
                    </span>
                  </td>

                  <td className="px-5 py-3.5">
                    <span className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold',
                      STATUS_COLORS[customer.status] || 'bg-slate-100 text-slate-600'
                    )}>
                      {STATUS_LABELS[customer.status] || customer.status}
                    </span>
                  </td>

                  {!compact && (
                    <>
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        <span className="text-xs text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md font-medium">
                          {customer.industry || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 hidden xl:table-cell">
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Users size={11} className="text-slate-400" />
                          {customer.team_size?.toLocaleString() || '—'}
                        </div>
                      </td>
                    </>
                  )}

                  <td className="px-5 py-3.5 text-xs text-slate-400 font-mono whitespace-nowrap">
                    {format(new Date(customer.created_at), 'dd MMM yyyy')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
