import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, Edit, Trash2, RefreshCw } from "lucide-react";
import { budgetsApi, expensesApi, type Budget, type Expense } from "@/lib/api";
import { BudgetComparisonChart } from "@/components/charts/BudgetComparisonChart";
import { DailySpendingByCategory } from "@/components/charts/DailySpendingByCategory";
import { CategoryPieChartForBudget } from "@/components/charts/CategoryPieChartForBudget";

interface BudgetFormData {
  name: string;
  category: string;
  month: string;
  limit: string;
  color: string;
  isRecurring: boolean;
}

const defaultCategories = [
  { id: "groceries", name: "Groceries", color: "#22c55e" },
  { id: "dining", name: "Dining", color: "#ef4444" },
  { id: "utilities", name: "Utilities", color: "#f59e0b" },
  { id: "transport", name: "Transport", color: "#3b82f6" },
  { id: "entertainment", name: "Entertainment", color: "#8b5cf6" },
  { id: "shopping", name: "Shopping", color: "#ec4899" },
  { id: "healthcare", name: "Healthcare", color: "#14b8a6" },
  { id: "education", name: "Education", color: "#6366f1" },
  { id: "insurance", name: "Insurance", color: "#8b5cf6" },
  { id: "other", name: "Other", color: "#6b7280" },
];

export function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentMonth = new Date().toISOString().slice(0, 7);

  const [formData, setFormData] = useState<BudgetFormData>({
    name: "",
    category: "",
    month: currentMonth,
    limit: "",
    color: defaultCategories[0].color,
    isRecurring: false,
  });

  const fetchBudgets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [budgetsData, expensesData] = await Promise.all([
        budgetsApi.getAll(),
        expensesApi.getAll(),
      ]);
      setBudgets(budgetsData);
      setExpenses(expensesData);
    } catch (err) {
      console.error("Error fetching budgets:", err);
      setError("Failed to load budgets. Make sure the API server is running.");
    } finally {
      setIsLoading(false);
      setIsHydrated(true);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleAddBudget = () => {
    setEditingBudget(null);
    setFormData({
      name: "",
      category: "",
      month: currentMonth,
      limit: "",
      color: defaultCategories[0].color,
      isRecurring: false,
    });
    setIsModalOpen(true);
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setFormData({
      name: budget.name,
      category: budget.category,
      month: budget.month,
      limit: budget.limit.toString(),
      color: budget.color,
      isRecurring: budget.isRecurring || false,
    });
    setIsModalOpen(true);
  };

  const handleDeleteBudget = async (budget: Budget) => {
    if (confirm(`Are you sure you want to delete budget "${budget.name}"?`)) {
      try {
        await budgetsApi.delete(budget.id);
        setBudgets((prev) => prev.filter((b) => b.id !== budget.id));
      } catch (err) {
        console.error("Error deleting budget:", err);
        setError("Failed to delete budget");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (editingBudget) {
        const updatedBudget = await budgetsApi.update(editingBudget.id, {
          name: formData.name,
          category: formData.category,
          month: formData.month,
          limit: Number.parseFloat(formData.limit),
          spent: editingBudget.spent,
          color: formData.color,
          isRecurring: formData.isRecurring,
        });
        setBudgets((prev) =>
          prev.map((b) => (b.id === editingBudget.id ? updatedBudget : b))
        );
      } else {
        const newBudget = await budgetsApi.create({
          name: formData.name,
          category: formData.category,
          month: formData.month,
          limit: Number.parseFloat(formData.limit),
          spent: 0,
          color: formData.color,
          isRecurring: formData.isRecurring,
        });
        setBudgets((prev) => [...prev, newBudget]);
      }

      setIsModalOpen(false);
      setEditingBudget(null);
    } catch (err) {
      console.error("Error saving budget:", err);
      setError("Failed to save budget. Make sure the API server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Auto-update color when category changes
    if (name === "category") {
      const category = defaultCategories.find((c) => c.id === value);
      if (category) {
        setFormData((prev) => ({ ...prev, color: category.color }));
      }
    }
  };

  const totalBudget = budgets.reduce((acc, b) => acc + b.limit, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);
  const overallPercentage =
    totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const chartData = budgets.map((b) => ({
    category: b.name,
    budget: b.limit,
    spent: b.spent,
  }));

  // Calculate daily spending by category for all budget expenses
  const budgetExpenseIds = new Set(
    expenses
      .filter((e) => e.budgetIds && e.budgetIds.length > 0)
      .map((e) => e.id)
  );
  
  const budgetExpenses = expenses.filter((e) =>
    e.budgetIds && e.budgetIds.length > 0
  );

  // Group by date and category
  const dailySpendingMap = new Map<string, { [category: string]: number }>();
  budgetExpenses.forEach((expense) => {
    const date = expense.date;
    if (!dailySpendingMap.has(date)) {
      dailySpendingMap.set(date, {});
    }
    const dayData = dailySpendingMap.get(date)!;
    const category = expense.category || "Other";
    dayData[category] = (dayData[category] || 0) + expense.amount;
  });

  const dailySpendingData = Array.from(dailySpendingMap.entries())
    .map(([date, categories]) => ({ date, categories }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Calculate category totals for pie chart
  const categoryTotals = new Map<string, number>();
  budgetExpenses.forEach((expense) => {
    const category = expense.category || "Other";
    categoryTotals.set(category, (categoryTotals.get(category) || 0) + expense.amount);
  });

  const categoryPieData = Array.from(categoryTotals.entries()).map(
    ([category, value]) => {
      const categoryInfo = defaultCategories.find((c) => c.id === category);
      return {
        category,
        value,
        color: categoryInfo?.color,
      };
    }
  );

  if (!isHydrated) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">Loading budgets...</p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
          <div className="p-6 text-center py-12">
            <div className="animate-pulse">
              <div className="h-16 w-16 rounded-full bg-muted mx-auto mb-4"></div>
              <div className="h-4 w-32 bg-muted mx-auto mb-2 rounded"></div>
              <div className="h-3 w-48 bg-muted mx-auto rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
          <div className="flex items-center justify-between">
            <p>{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 dark:text-red-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground">
            {budgets.length === 0
              ? "No budgets yet. Create your first budget!"
              : `${budgets.length} budget${budgets.length === 1 ? "" : "s"}`}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchBudgets}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
        <Button onClick={handleAddBudget} disabled={isLoading}>
          <Plus className="h-4 w-4 mr-2" />
          Add Budget
        </Button>
      </div>

      {budgets.length === 0 ? (
        /* Empty State */
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
          <div className="p-12 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💰</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              No budgets set up yet
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create budget limits for your expense categories to track your
              spending and stay on top of your finances.
            </p>
            <Button onClick={handleAddBudget}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Budget
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Overall Budget Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Budget</CardTitle>
              <p className="text-sm text-muted-foreground">
                ₹{totalSpent.toLocaleString("en-IN")} of ₹
                {totalBudget.toLocaleString("en-IN")} spent
              </p>
            </CardHeader>
            <CardContent>
              <div className="relative h-4 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${Math.min(overallPercentage, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {overallPercentage.toFixed(1)}% of monthly budget used • ₹
                {(totalBudget - totalSpent).toLocaleString("en-IN")} remaining
              </p>
            </CardContent>
          </Card>

          {/* Budget Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Budget
                    </p>
                    <h3 className="text-2xl font-bold mt-2">
                      ₹{totalBudget.toLocaleString("en-IN")}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Monthly limit set
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Spent
                    </p>
                    <h3 className="text-2xl font-bold mt-2">
                      ₹{totalSpent.toLocaleString("en-IN")}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {overallPercentage.toFixed(1)}% of budget used
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <span className="text-2xl">💸</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Remaining
                    </p>
                    <h3 className="text-2xl font-bold mt-2">
                      ₹{(totalBudget - totalSpent).toLocaleString("en-IN")}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(100 - overallPercentage).toFixed(1)}% available
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <span className="text-2xl">✨</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Budget Chart */}
          <Card>
            <CardContent className="pt-6">
              <BudgetComparisonChart
                data={chartData}
                title="Budget vs Actual Spending"
                height="400px"
              />
            </CardContent>
          </Card>

          {/* Daily Spending by Category */}
          {dailySpendingData.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <DailySpendingByCategory
                  data={dailySpendingData}
                  title="Daily Spending by Category (Budget Expenses)"
                  height="400px"
                />
              </CardContent>
            </Card>
          )}

          {/* Category Distribution Pie Chart */}
          {categoryPieData.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <CategoryPieChartForBudget
                  data={categoryPieData}
                  title="Total Spending by Category (Budget Expenses)"
                  height="400px"
                />
              </CardContent>
            </Card>
          )}

          {/* Category Budgets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map((budget) => {
              const percentage = (budget.spent / budget.limit) * 100;
              const isOverBudget = budget.spent > budget.limit;
              const isNearLimit = percentage >= 80 && !isOverBudget;

              return (
                <Card key={budget.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: budget.color }}
                        />
                        <span className="font-medium">{budget.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span
                          className={`text-sm font-medium ${
                            isOverBudget
                              ? "text-red-600"
                              : isNearLimit
                                ? "text-yellow-600"
                                : "text-muted-foreground"
                          }`}
                        >
                          {percentage.toFixed(0)}%
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleEditBudget(budget)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleDeleteBudget(budget)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className={`h-full transition-all ${
                          isOverBudget
                            ? "bg-red-500"
                            : isNearLimit
                              ? "bg-yellow-500"
                              : "bg-primary"
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                      <span>
                        ₹{budget.spent.toLocaleString("en-IN")} spent
                      </span>
                      <span>₹{budget.limit.toLocaleString("en-IN")} limit</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {budget.month} • {budget.category}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {/* Budget Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative z-50 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="absolute top-4 right-4 z-10">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 rounded-full bg-background"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingBudget ? "Edit Budget" : "Create Budget"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Budget Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="e.g., January Groceries"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category (Optional)</Label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="">No specific category</option>
                        {defaultCategories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-muted-foreground">
                        Leave blank for multi-category budgets
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="month">Month</Label>
                      <Input
                        id="month"
                        name="month"
                        type="month"
                        value={formData.month}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="limit">Budget Limit (₹)</Label>
                    <Input
                      id="limit"
                      name="limit"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.limit}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="color"
                        name="color"
                        type="color"
                        value={formData.color}
                        onChange={handleChange}
                        className="h-10 w-20"
                      />
                      <span className="text-sm text-muted-foreground">
                        {formData.color}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isRecurring"
                        name="isRecurring"
                        checked={formData.isRecurring}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            isRecurring: e.target.checked,
                          }))
                        }
                        className="h-4 w-4 rounded border-input"
                      />
                      <Label htmlFor="isRecurring" className="cursor-pointer">
                        Recurring Budget (auto-create for next months)
                      </Label>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">
                      If enabled, this budget will automatically be created for future months
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading
                        ? "Saving..."
                        : editingBudget
                          ? "Update Budget"
                          : "Create Budget"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
