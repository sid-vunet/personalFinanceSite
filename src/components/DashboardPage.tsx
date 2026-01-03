import React, { useState, useEffect } from "react";
import { dashboardApi, type DashboardData } from "@/lib/api";
import { DashboardWidgets } from "@/components/dashboard/DashboardWidgets";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { BillReminders } from "@/components/dashboard/BillReminders";
import { CategoryPieChart } from "@/components/charts/CategoryPieChart";
import { SpendingTrendChart } from "@/components/charts/SpendingTrendChart";
import { Button } from "@/components/ui/button";
import { RefreshCw, Plus, TrendingUp, TrendingDown } from "lucide-react";

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const dashboardData = await dashboardApi.get();
      setData(dashboardData);
    } catch (err) {
      console.error("Error fetching dashboard:", err);
      setError("Failed to load dashboard. Make sure the API server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-muted rounded-xl"></div>
            <div className="h-96 bg-muted rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-800 mb-4">{error}</p>
        <Button onClick={fetchDashboard}>Retry</Button>
      </div>
    );
  }

  if (!data) return null;

  const { stats, categoryData, recentTransactions, bills, budgets, goals } = data;

  // Format stats for DashboardWidgets
  const formattedStats = {
    totalSpent: stats.totalSpent,
    monthlyBudget: stats.monthlyBudget,
    transactionCount: stats.transactionCount,
    netWorth: stats.netBalance,
    currency: "INR",
    trend: {
      value: stats.savingsRate,
      isPositive: stats.savingsRate >= 0,
    },
  };

  const formattedBudgets = (budgets || []).map(b => ({
    category: b.category,
    spent: b.spent,
    budget: b.limit,
    currency: "INR",
  }));

  const formattedGoals = (goals || []).map(g => ({
    name: g.name,
    current: g.current,
    target: g.target,
    targetDate: g.deadline,
    currency: "INR",
  }));

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Your financial summary at a glance
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchDashboard}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Income/Expense Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Income</span>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">
            ₹{stats.totalIncome.toLocaleString('en-IN')}
          </p>
        </div>
        
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Spent</span>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-600">
            ₹{stats.totalSpent.toLocaleString('en-IN')}
          </p>
        </div>
        
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Net Balance</span>
            {stats.netBalance >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </div>
          <p className={`text-2xl font-bold ${stats.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₹{Math.abs(stats.netBalance).toLocaleString('en-IN')}
          </p>
        </div>
        
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Savings Rate</span>
          </div>
          <p className={`text-2xl font-bold ${stats.savingsRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.savingsRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Budget & Goals */}
      <DashboardWidgets 
        stats={formattedStats}
        budgets={formattedBudgets}
        goals={formattedGoals}
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            {categoryData && categoryData.length > 0 ? (
              <CategoryPieChart 
                data={categoryData}
                title="Spending by Category"
                height="350px"
              />
            ) : (
              <div className="h-[350px] flex flex-col items-center justify-center text-center">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="font-medium mb-1">No spending data yet</h3>
                <p className="text-sm text-muted-foreground">Add expenses to see your spending breakdown</p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <div className="h-[350px] flex flex-col items-center justify-center text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="font-medium mb-1">Monthly Trend</h3>
              <p className="text-sm text-muted-foreground">
                {stats.transactionCount} transactions totaling ₹{stats.totalSpent.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions and Bill Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-lg font-semibold leading-none tracking-tight">Recent Transactions</h3>
          </div>
          <div className="p-6 pt-0">
            {recentTransactions && recentTransactions.length > 0 ? (
              <RecentTransactions 
                transactions={recentTransactions.map(t => ({
                  id: t.id,
                  description: t.description,
                  amount: t.amount,
                  category: t.category,
                  date: t.date,
                  currency: t.currency || "INR",
                }))}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No recent transactions</p>
                <a href="/transactions" className="text-primary hover:underline text-sm">
                  Add your first expense →
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="text-lg font-semibold leading-none tracking-tight">Upcoming Bills</h3>
          </div>
          <div className="p-6 pt-0">
            <BillReminders 
              reminders={(bills || []).map(b => ({
                id: b.id,
                name: b.name,
                amount: b.amount,
                dueDate: b.dueDate,
                status: b.status as "upcoming" | "due" | "overdue" | "paid",
                currency: "INR",
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
