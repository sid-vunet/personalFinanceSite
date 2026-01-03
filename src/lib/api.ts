// API client for the Go backend with BoltDB

const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:3001/api';

// Types
export interface Expense {
  id: string;
  amount: number;
  currency: string;
  description: string;
  category: string;
  categoryColor?: string;
  merchant: string;
  date: string;
  user: string;
  isShared: boolean;
  hasAttachments: boolean;
  commentCount: number;
  notes?: string;
  attachments?: string[];
  budgetIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Budget {
  id: string;
  name: string;
  category: string;
  month: string; // Format: "2026-01"
  limit: number;
  spent: number;
  color: string;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
  color: string;
}

export interface Investment {
  id: string;
  name: string;
  type: string;
  value: number;
  investedValue: number;
  returns: number;
  returnsPercent: number;
}

export interface BillReminder {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  status: string;
  category: string;
}

export interface Stats {
  totalSpent: number;
  monthlyBudget: number;
  transactionCount: number;
  savingsRate: number;
}

// Helper function for API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  return response.json();
}

// ============ EXPENSES API ============

export const expensesApi = {
  getAll: () => apiCall<Expense[]>('/expenses'),
  
  getById: (id: string) => apiCall<Expense>(`/expenses/${id}`),
  
  create: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => 
    apiCall<Expense>('/expenses', {
      method: 'POST',
      body: JSON.stringify(expense),
    }),
  
  update: (id: string, expense: Partial<Expense>) => 
    apiCall<Expense>(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expense),
    }),
  
  delete: (id: string) => 
    apiCall<{ message: string }>(`/expenses/${id}`, {
      method: 'DELETE',
    }),
};

// ============ FILE UPLOAD API ============

export const uploadApi = {
  upload: async (file: File): Promise<{ url: string; filename: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload file');
    }
    
    return response.json();
  },
};

// ============ BUDGETS API ============

export const budgetsApi = {
  getAll: () => apiCall<Budget[]>('/budgets'),
  
  create: (budget: Omit<Budget, 'id'>) => 
    apiCall<Budget>('/budgets', {
      method: 'POST',
      body: JSON.stringify(budget),
    }),
  
  update: (id: string, budget: Partial<Budget>) => 
    apiCall<Budget>(`/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(budget),
    }),
  
  delete: (id: string) => 
    apiCall<{ message: string }>(`/budgets/${id}`, {
      method: 'DELETE',
    }),
};

// ============ GOALS API ============

export const goalsApi = {
  getAll: () => apiCall<Goal[]>('/goals'),
  
  create: (goal: Omit<Goal, 'id'>) => 
    apiCall<Goal>('/goals', {
      method: 'POST',
      body: JSON.stringify(goal),
    }),
  
  update: (id: string, goal: Partial<Goal>) => 
    apiCall<Goal>(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(goal),
    }),
  
  delete: (id: string) => 
    apiCall<{ message: string }>(`/goals/${id}`, {
      method: 'DELETE',
    }),
};

// ============ INVESTMENTS API ============

export const investmentsApi = {
  getAll: () => apiCall<Investment[]>('/investments'),
  
  create: (investment: Omit<Investment, 'id'>) => 
    apiCall<Investment>('/investments', {
      method: 'POST',
      body: JSON.stringify(investment),
    }),
  
  update: (id: string, investment: Partial<Investment>) => 
    apiCall<Investment>(`/investments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(investment),
    }),
  
  delete: (id: string) => 
    apiCall<{ message: string }>(`/investments/${id}`, {
      method: 'DELETE',
    }),
};

// ============ BILLS API ============

export const billsApi = {
  getAll: () => apiCall<BillReminder[]>('/bills'),
  
  create: (bill: Omit<BillReminder, 'id'>) => 
    apiCall<BillReminder>('/bills', {
      method: 'POST',
      body: JSON.stringify(bill),
    }),
  
  update: (id: string, bill: Partial<BillReminder>) => 
    apiCall<BillReminder>(`/bills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bill),
    }),
  
  delete: (id: string) => 
    apiCall<{ message: string }>(`/bills/${id}`, {
      method: 'DELETE',
    }),
};

// ============ STATS API ============

export const statsApi = {
  get: () => apiCall<Stats>('/stats'),
};
// ============ INCOME API ============

export interface Income {
  id: string;
  amount: number;
  currency: string;
  source: string;
  description: string;
  date: string;
  isRecurring: boolean;
  user: string;
  createdAt?: string;
  updatedAt?: string;
}

export const incomeApi = {
  getAll: () => apiCall<Income[]>('/income'),
  
  create: (income: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>) => 
    apiCall<Income>('/income', {
      method: 'POST',
      body: JSON.stringify(income),
    }),
  
  update: (id: string, income: Partial<Income>) => 
    apiCall<Income>(`/income/${id}`, {
      method: 'PUT',
      body: JSON.stringify(income),
    }),
  
  delete: (id: string) => 
    apiCall<{ message: string }>(`/income/${id}`, {
      method: 'DELETE',
    }),
};

// ============ DASHBOARD API ============

export interface DashboardData {
  stats: {
    totalSpent: number;
    totalIncome: number;
    monthlyBudget: number;
    transactionCount: number;
    savingsRate: number;
    netBalance: number;
  };
  expenses: Expense[];
  recentTransactions: Expense[];
  budgets: Budget[];
  goals: Goal[];
  bills: BillReminder[];
  incomes: Income[];
  categoryData: { name: string; value: number; color: string }[];
}

export const dashboardApi = {
  get: () => apiCall<DashboardData>('/dashboard'),
};