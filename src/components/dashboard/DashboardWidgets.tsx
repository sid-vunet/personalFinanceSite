import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  CreditCard,
  AlertTriangle,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

function StatCard({ title, value, subtitle, icon, trend }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <div
                className={`flex items-center gap-1 text-xs ${
                  trend.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.isPositive ? (
                  <TrendingDown className="h-3 w-3" />
                ) : (
                  <TrendingUp className="h-3 w-3" />
                )}
                <span>
                  {trend.value}% vs last month
                </span>
              </div>
            )}
          </div>
          <div className="rounded-full bg-primary/10 p-3 text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface BudgetAlertProps {
  category: string;
  spent: number;
  budget: number;
  currency?: string;
}

function BudgetAlert({
  category,
  spent,
  budget,
  currency = "INR",
}: BudgetAlertProps) {
  const percentage = Math.min((spent / budget) * 100, 100);
  const isOverBudget = spent > budget;
  const isNearLimit = percentage >= 80 && !isOverBudget;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{category}</span>
        <span
          className={`${
            isOverBudget
              ? "text-red-600"
              : isNearLimit
                ? "text-yellow-600"
                : "text-muted-foreground"
          }`}
        >
          {formatCurrency(spent, currency)} / {formatCurrency(budget, currency)}
        </span>
      </div>
      <Progress
        value={percentage}
        className={`h-2 ${
          isOverBudget
            ? "[&>div]:bg-red-500"
            : isNearLimit
              ? "[&>div]:bg-yellow-500"
              : ""
        }`}
      />
      {isOverBudget && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Over budget by {formatCurrency(spent - budget, currency)}
        </p>
      )}
    </div>
  );
}

interface GoalProgressProps {
  name: string;
  current: number;
  target: number;
  targetDate?: string;
  currency?: string;
}

function GoalProgress({
  name,
  current,
  target,
  targetDate,
  currency = "INR",
}: GoalProgressProps) {
  const percentage = Math.min((current / target) * 100, 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm">{name}</span>
        <span className="text-xs text-muted-foreground">{percentage.toFixed(0)}%</span>
      </div>
      <Progress value={percentage} className="h-2" />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatCurrency(current, currency)}</span>
        <span>Target: {formatCurrency(target, currency)}</span>
      </div>
      {targetDate && (
        <p className="text-xs text-muted-foreground">Due: {targetDate}</p>
      )}
    </div>
  );
}

interface DashboardStatsProps {
  totalSpent: number;
  monthlyBudget: number;
  transactionCount: number;
  netWorth?: number;
  currency?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface DashboardWidgetsProps {
  stats: DashboardStatsProps;
  budgets: BudgetAlertProps[];
  goals: GoalProgressProps[];
}

export function DashboardWidgets({
  stats,
  budgets,
  goals,
}: DashboardWidgetsProps) {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Spent This Month"
          value={formatCurrency(stats.totalSpent, stats.currency)}
          subtitle={`of ${formatCurrency(stats.monthlyBudget, stats.currency)} budget`}
          icon={<Wallet className="h-5 w-5" />}
          trend={stats.trend}
        />
        <StatCard
          title="Transactions"
          value={stats.transactionCount}
          subtitle="This month"
          icon={<CreditCard className="h-5 w-5" />}
        />
        <StatCard
          title="Remaining Budget"
          value={formatCurrency(
            Math.max(stats.monthlyBudget - stats.totalSpent, 0),
            stats.currency
          )}
          subtitle={`${Math.max(
            ((stats.monthlyBudget - stats.totalSpent) / stats.monthlyBudget) *
              100,
            0
          ).toFixed(0)}% left`}
          icon={<Target className="h-5 w-5" />}
        />
        {stats.netWorth !== undefined && (
          <StatCard
            title="Net Worth"
            value={formatCurrency(stats.netWorth, stats.currency)}
            subtitle="Assets - Liabilities"
            icon={<TrendingUp className="h-5 w-5" />}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Budget Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgets.length > 0 ? (
              budgets.map((budget, index) => (
                <BudgetAlert key={index} {...budget} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No budgets set up yet.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Goals Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Savings Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {goals.length > 0 ? (
              goals.map((goal, index) => (
                <GoalProgress key={index} {...goal} />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No goals set up yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export { StatCard, BudgetAlert, GoalProgress };
