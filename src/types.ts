export interface Customer {
  id: number;
  email: string;
  company: string;
  contact_name: string;
  plan: 'Basic' | 'Pro' | 'Enterprise';
  status: 'active' | 'churned' | 'trial';
  industry: string;
  team_size: number;
  created_at: string;
  churned_at?: string;
  last_login?: string;
}

export interface SummaryStats {
  activeCustomers: number;
  mrr: number;
  mrrPrev: number;
  mrrGrowth: number;
  churnRate: number;
  arpu: number;
  newThisMonth: number;
  newLastMonth: number;
  customerGrowth: number;
  totalCustomers: number;
}

export interface RevenueData {
  month: string;
  basic: number;
  pro: number;
  enterprise: number;
  total: number;
}

export interface Insight {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

export interface PlanBreakdownRow {
  plan: string;
  status: string;
  count: number;
  avg_team_size: number;
}

export interface ChurnByPlan {
  plan: string;
  total: number;
  churned: number;
  churn_rate: number;
}

export interface ChurnByIndustry {
  industry: string;
  total: number;
  churned: number;
  churn_rate: number;
}

export interface ChurnTrend {
  month: string;
  churned_count: number;
}

export interface PlanBreakdownData {
  breakdown: PlanBreakdownRow[];
  mrrByPlan: Record<string, number>;
}

export interface ChurnAnalysisData {
  churnByPlan: ChurnByPlan[];
  churnByIndustry: ChurnByIndustry[];
  churnTrend: ChurnTrend[];
}
