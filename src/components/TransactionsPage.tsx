import React, { useState, useEffect } from "react";
import { ExpenseTable, type Expense } from "@/components/tables/ExpenseTable";
import { ExpenseForm } from "@/components/forms/ExpenseForm";
import { Button } from "@/components/ui/button";
import { Plus, X, RefreshCw, Calendar, Tag, Store, User, FileText, Image, Edit, Trash2 } from "lucide-react";
import { expensesApi, budgetsApi, type Budget } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  color?: string;
}

interface TransactionsPageProps {
  initialExpenses?: Expense[];
  categories?: Category[];
}

const defaultCategories: Category[] = [
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

export function TransactionsPage({ 
  initialExpenses = [], 
  categories = defaultCategories 
}: TransactionsPageProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch expenses from API on mount
  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await expensesApi.getAll();
      setExpenses(data);
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setError("Failed to load expenses. Make sure the API server is running.");
      // Fallback to initial expenses if API fails
      setExpenses(initialExpenses);
    } finally {
      setIsLoading(false);
      setIsHydrated(true);
    }
  };

  const fetchBudgets = async () => {
    try {
      const data = await budgetsApi.getAll();
      setBudgets(data);
    } catch (err) {
      console.error("Error fetching budgets:", err);
      setBudgets([]);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchBudgets();
    
    // Check if we should open the add modal (from navigation)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('add') === 'true') {
      setIsModalOpen(true);
      // Clean up the URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleAddExpense = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleDeleteExpense = async (expense: Expense) => {
    if (confirm(`Are you sure you want to delete "${expense.description}"?`)) {
      try {
        await expensesApi.delete(expense.id);
        setExpenses(prev => prev.filter(e => e.id !== expense.id));
      } catch (err) {
        console.error("Error deleting expense:", err);
        setError("Failed to delete expense");
      }
    }
  };

  const handleSubmit = async (data: {
    amount: string;
    description: string;
    category: string;
    merchant: string;
    date: string;
    notes: string;
    isShared: boolean;
    attachments: string[];
    budgetIds: string[];
  }) => {
    setIsLoading(true);
    setError(null);
    
    // Find the category to get its color
    const category = categories.find(c => c.id === data.category);
    const hasAttachments = data.attachments && data.attachments.length > 0;
    
    try {
      if (editingExpense) {
        // Update existing expense via API
        const updatedExpense = await expensesApi.update(editingExpense.id, {
          amount: parseFloat(data.amount),
          description: data.description,
          category: category?.name || data.category,
          categoryColor: category?.color,
          merchant: data.merchant,
          date: data.date,
          notes: data.notes,
          isShared: data.isShared,
          hasAttachments: hasAttachments,
          attachments: data.attachments,
          budgetIds: data.budgetIds,
        });
        setExpenses(prev => prev.map(e => 
          e.id === editingExpense.id ? updatedExpense : e
        ));
      } else {
        // Create new expense via API
        const newExpense = await expensesApi.create({
          amount: parseFloat(data.amount),
          currency: "INR",
          description: data.description,
          category: category?.name || data.category,
          categoryColor: category?.color,
          merchant: data.merchant,
          date: data.date,
          notes: data.notes,
          user: "You",
          isShared: data.isShared,
          hasAttachments: hasAttachments,
          attachments: data.attachments,
          budgetIds: data.budgetIds,
          commentCount: 0,
        });
        setExpenses(prev => [newExpense, ...prev]);
      }
      
      setIsModalOpen(false);
      setEditingExpense(null);
    } catch (err) {
      console.error("Error saving expense:", err);
      setError("Failed to save expense. Make sure the API server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  // Show loading state while fetching from API
  if (!isHydrated) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">Loading transactions...</p>
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
            {expenses.length === 0 
              ? "No transactions yet. Add your first expense!"
              : `${expenses.length} transaction${expenses.length === 1 ? "" : "s"}`
            }
          </p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchExpenses}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <Button onClick={handleAddExpense} disabled={isLoading}>
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Expense Table or Empty State */}
      <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          {expenses.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No transactions yet</h3>
              <p className="text-muted-foreground mb-4">
                Start tracking your expenses by adding your first transaction.
              </p>
              <Button onClick={handleAddExpense}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Expense
              </Button>
            </div>
          ) : (
            <ExpenseTable 
              data={expenses}
              categories={categories}
              onEdit={handleEditExpense}
              onDelete={handleDeleteExpense}
              onRowClick={(expense) => setViewingExpense(expense)}
            />
          )}
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50"
            onClick={handleCancel}
          />
          
          {/* Modal Content */}
          <div className="relative z-50 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="absolute top-4 right-4 z-10">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleCancel}
                className="h-8 w-8 rounded-full bg-background"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ExpenseForm
              categories={categories}
              budgets={budgets}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              initialData={editingExpense ? {
                amount: editingExpense.amount.toString(),
                description: editingExpense.description,
                category: categories.find(c => c.name === editingExpense.category)?.id || "",
                merchant: editingExpense.merchant || "",
                date: editingExpense.date,
                notes: editingExpense.notes || "",
                isShared: editingExpense.isShared,
                attachments: editingExpense.attachments || [],
                budgetIds: editingExpense.budgetIds || [],
              } : undefined}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}

      {/* Expense Detail View Modal */}
      {viewingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50"
            onClick={() => setViewingExpense(null)}
          />
          
          {/* Modal Content */}
          <div className="relative z-50 w-full max-w-lg mx-4 bg-card rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold">Expense Details</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setViewingExpense(null)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Amount */}
            <div className="p-6 text-center bg-muted/30">
              <p className="text-3xl font-bold text-red-600">
                -{formatCurrency(viewingExpense.amount, viewingExpense.currency || "INR")}
              </p>
              <p className="text-muted-foreground mt-1">{viewingExpense.description}</p>
            </div>

            {/* Details */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="font-medium">{formatDate(viewingExpense.date)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <Tag className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Category</p>
                    <span
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: viewingExpense.categoryColor
                          ? `${viewingExpense.categoryColor}20`
                          : "#e2e8f0",
                        color: viewingExpense.categoryColor || "#64748b",
                      }}
                    >
                      {viewingExpense.category}
                    </span>
                  </div>
                </div>

                {viewingExpense.merchant && (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Store className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Merchant</p>
                      <p className="font-medium">{viewingExpense.merchant}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Spent By</p>
                    <p className="font-medium">{viewingExpense.user || "You"}</p>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {viewingExpense.notes && (
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Notes</span>
                  </div>
                  <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                    {viewingExpense.notes}
                  </p>
                </div>
              )}

              {/* Attachments */}
              {viewingExpense.attachments && viewingExpense.attachments.length > 0 && (
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <Image className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Attachments ({viewingExpense.attachments.length})</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {viewingExpense.attachments.map((attachment, index) => (
                      <button
                        key={index}
                        onClick={() => setLightboxImage(attachment)}
                        className="aspect-square rounded-lg bg-muted overflow-hidden hover:opacity-80 transition-opacity cursor-pointer"
                      >
                        <img 
                          src={attachment} 
                          alt={`Attachment ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-2 p-6 border-t border-border bg-muted/30">
              <Button
                variant="outline"
                onClick={() => {
                  setViewingExpense(null);
                  handleEditExpense(viewingExpense);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  handleDeleteExpense(viewingExpense);
                  setViewingExpense(null);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
          onClick={() => setLightboxImage(null)}
        >
          {/* Close Button */}
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 z-[101] h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>
          
          {/* Image */}
          <img 
            src={lightboxImage} 
            alt="Attachment preview"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
