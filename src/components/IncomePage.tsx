import React, { useState, useEffect } from "react";
import { incomeApi, type Income } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, RefreshCw, Edit2, Trash2, Wallet } from "lucide-react";

const defaultSources = [
  { id: "salary", name: "Salary" },
  { id: "bonus", name: "Bonus" },
  { id: "freelance", name: "Freelance" },
  { id: "investment", name: "Investment Returns" },
  { id: "rental", name: "Rental Income" },
  { id: "dividend", name: "Dividends" },
  { id: "other", name: "Other" },
];

export function IncomePage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    amount: "",
    source: "salary",
    description: "",
    date: new Date().toISOString().split("T")[0],
    isRecurring: false,
  });

  const fetchIncomes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await incomeApi.getAll();
      setIncomes(data);
    } catch (err) {
      console.error("Error fetching incomes:", err);
      setError("Failed to load income data. Make sure the API server is running.");
    } finally {
      setIsLoading(false);
      setIsHydrated(true);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const handleAddIncome = () => {
    setEditingIncome(null);
    setFormData({
      amount: "",
      source: "salary",
      description: "",
      date: new Date().toISOString().split("T")[0],
      isRecurring: false,
    });
    setIsModalOpen(true);
  };

  const handleEditIncome = (income: Income) => {
    setEditingIncome(income);
    setFormData({
      amount: income.amount.toString(),
      source: income.source,
      description: income.description,
      date: income.date,
      isRecurring: income.isRecurring,
    });
    setIsModalOpen(true);
  };

  const handleDeleteIncome = async (income: Income) => {
    if (confirm(`Delete income "${income.description || income.source}"?`)) {
      try {
        await incomeApi.delete(income.id);
        setIncomes((prev) => prev.filter((i) => i.id !== income.id));
      } catch (err) {
        console.error("Error deleting income:", err);
        setError("Failed to delete income");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const incomeData = {
        amount: parseFloat(formData.amount),
        currency: "INR",
        source: formData.source,
        description: formData.description,
        date: formData.date,
        isRecurring: formData.isRecurring,
        user: "You",
      };

      if (editingIncome) {
        const updated = await incomeApi.update(editingIncome.id, incomeData);
        setIncomes((prev) =>
          prev.map((i) => (i.id === editingIncome.id ? updated : i))
        );
      } else {
        const created = await incomeApi.create(incomeData);
        setIncomes((prev) => [created, ...prev]);
      }

      setIsModalOpen(false);
      setEditingIncome(null);
    } catch (err) {
      console.error("Error saving income:", err);
      setError("Failed to save income");
    } finally {
      setIsLoading(false);
    }
  };

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

  if (!isHydrated) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-24 bg-muted rounded-xl"></div>
        <div className="h-64 bg-muted rounded-xl"></div>
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
            <button onClick={() => setError(null)}>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Summary Card */}
      <div className="rounded-xl border border-border bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Income</p>
            <p className="text-3xl font-bold text-green-600">
              ₹{totalIncome.toLocaleString("en-IN")}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {incomes.length} income {incomes.length === 1 ? "entry" : "entries"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchIncomes}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <Button onClick={handleAddIncome}>
              <Plus className="h-4 w-4 mr-2" />
              Add Income
            </Button>
          </div>
        </div>
      </div>

      {/* Income List */}
      <div className="rounded-xl border border-border bg-card">
        <div className="p-6">
          {incomes.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Wallet className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No income recorded yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding your salary or other income sources
              </p>
              <Button onClick={handleAddIncome}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Income
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {incomes.map((income) => (
                <div
                  key={income.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Wallet className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {income.description || income.source}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{income.source}</span>
                        <span>•</span>
                        <span>{new Date(income.date).toLocaleDateString()}</span>
                        {income.isRecurring && (
                          <>
                            <span>•</span>
                            <span className="text-green-600">Recurring</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-lg font-semibold text-green-600">
                      +₹{income.amount.toLocaleString("en-IN")}
                    </p>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditIncome(income)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteIncome(income)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-xl border border-border shadow-lg w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold">
                {editingIncome ? "Edit Income" : "Add Income"}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="50000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="source">Source</Label>
                <select
                  id="source"
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                  value={formData.source}
                  onChange={(e) =>
                    setFormData({ ...formData, source: e.target.value })
                  }
                >
                  {defaultSources.map((source) => (
                    <option key={source.id} value={source.id}>
                      {source.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="January Salary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onChange={(e) =>
                    setFormData({ ...formData, isRecurring: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="isRecurring">Recurring income (monthly)</Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Saving..." : editingIncome ? "Update" : "Add Income"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
