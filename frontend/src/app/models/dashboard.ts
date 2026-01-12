export interface DashboardStats {
  totalAssets: number;
  estimatedZakat: number;
  percentageChange: number;
  daysUntilDue: number;
  dueDate: string;
}

export interface CalculationStep {
  id: string;
  label: string;
  completed: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  initials: string;
}

export const CALCULATION_STEPS: CalculationStep[] = [
  { id: 'cash', label: 'Cash', completed: true },
  { id: 'gold', label: 'Gold', completed: true },
  { id: 'investments', label: 'Investments', completed: true },
  { id: 'business', label: 'Business', completed: false },
  { id: 'review', label: 'Review', completed: false }
];

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  totalAssets: 45320,
  estimatedZakat: 1133,
  percentageChange: 12,
  daysUntilDue: 42,
  dueDate: 'Ramadan 1446'
};
