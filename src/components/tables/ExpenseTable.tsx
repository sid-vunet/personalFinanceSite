import React, { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Edit,
  Trash2,
  MessageCircle,
  Paperclip,
  Calendar,
  Filter,
  X,
  Check,
} from "lucide-react";

export interface Expense {
  id: string;
  amount: number;
  currency: string;
  description: string;
  category: string;
  categoryColor?: string;
  merchant?: string;
  date: string;
  user: string;
  userAvatar?: string;
  isShared: boolean;
  hasAttachments: boolean;
  commentCount: number;
  notes?: string;
  attachments?: string[];
  budgetIds?: string[];
}

interface ExpenseTableProps {
  data: Expense[];
  categories: { id: string; name: string; color?: string }[];
  onEdit?: (expense: Expense) => void;
  onDelete?: (expense: Expense) => void;
  onViewComments?: (expense: Expense) => void;
  onRowClick?: (expense: Expense) => void;
}

export function ExpenseTable({
  data,
  categories,
  onEdit,
  onDelete,
  onViewComments,
  onRowClick,
}: ExpenseTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "date", desc: true },
  ]);
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Filter data based on all criteria
  const filteredData = useMemo(() => {
    return data.filter((expense) => {
      // Search filter
      const searchMatch = searchFilter === "" || 
        expense.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (expense.merchant && expense.merchant.toLowerCase().includes(searchFilter.toLowerCase())) ||
        (expense.notes && expense.notes.toLowerCase().includes(searchFilter.toLowerCase()));

      // Category filter
      const categoryMatch = selectedCategories.length === 0 || 
        selectedCategories.includes(expense.category);

      // Date range filter
      const expenseDate = new Date(expense.date);
      const fromMatch = dateFrom === "" || expenseDate >= new Date(dateFrom);
      const toMatch = dateTo === "" || expenseDate <= new Date(dateTo);

      return searchMatch && categoryMatch && fromMatch && toMatch;
    });
  }, [data, searchFilter, selectedCategories, dateFrom, dateTo]);

  // Calculate total of filtered expenses
  const totalAmount = useMemo(() => {
    return filteredData.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredData]);

  // Get unique categories from data
  const uniqueCategories = useMemo(() => {
    const cats = new Map<string, { name: string; color?: string }>();
    data.forEach(expense => {
      if (!cats.has(expense.category)) {
        cats.set(expense.category, { 
          name: expense.category, 
          color: expense.categoryColor 
        });
      }
    });
    categories.forEach(cat => {
      if (!cats.has(cat.name)) {
        cats.set(cat.name, { name: cat.name, color: cat.color });
      }
    });
    return Array.from(cats.values());
  }, [data, categories]);

  const toggleCategory = (categoryName: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const clearFilters = () => {
    setSearchFilter("");
    setSelectedCategories([]);
    setDateFrom("");
    setDateTo("");
  };

  const hasActiveFilters = searchFilter || selectedCategories.length > 0 || dateFrom || dateTo;

  const columns: ColumnDef<Expense>[] = [
    {
      accessorKey: "date",
      header: ({ column }) => (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 hover:bg-transparent"
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground text-center block">
          {formatDate(row.original.date)}
        </span>
      ),
    },
    {
      accessorKey: "description",
      header: () => <div className="text-center">Description</div>,
      cell: ({ row }) => (
        <div className="flex flex-col text-center">
          <span className="font-medium">{row.original.description}</span>
          {row.original.merchant && (
            <span className="text-xs text-muted-foreground">
              {row.original.merchant}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: () => <div className="text-center">Category</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: row.original.categoryColor
                ? `${row.original.categoryColor}20`
                : "#e2e8f0",
              color: row.original.categoryColor || "#64748b",
            }}
          >
            {row.original.category}
          </span>
        </div>
      ),
      filterFn: "equals",
    },
    {
      accessorKey: "user",
      header: () => <div className="text-center">Spent By</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-2">
          <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
            {(row.original.user || "Y").charAt(0).toUpperCase()}
          </div>
          <span className="text-sm">{row.original.user || "You"}</span>
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 hover:bg-transparent"
          >
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => (
        <span className="font-semibold text-center block">
          {formatCurrency(row.original.amount, row.original.currency)}
        </span>
      ),
    },
    {
      id: "indicators",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1">
          {row.original.hasAttachments && (
            <Paperclip className="h-4 w-4 text-muted-foreground" />
          )}
          {row.original.commentCount > 0 && (
            <button
              onClick={() => onViewComments?.(row.original)}
              className="flex items-center gap-0.5 text-muted-foreground hover:text-foreground"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs">{row.original.commentCount}</span>
            </button>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit?.(row.original)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => onDelete?.(row.original)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className={selectedCategories.length > 0 ? "border-primary" : ""}
          >
            <Filter className="h-4 w-4 mr-2" />
            Categories
            {selectedCategories.length > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                {selectedCategories.length}
              </span>
            )}
          </Button>
          
          {showCategoryDropdown && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowCategoryDropdown(false)}
              />
              <div className="absolute top-full left-0 mt-1 z-50 bg-card border border-border rounded-lg shadow-lg p-2 min-w-[200px] max-h-[300px] overflow-y-auto">
                {uniqueCategories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => toggleCategory(cat.name)}
                    className="flex items-center justify-between w-full px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color || "#6b7280" }}
                      />
                      <span>{cat.name}</span>
                    </div>
                    {selectedCategories.includes(cat.name) && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </button>
                ))}
                {selectedCategories.length > 0 && (
                  <button
                    onClick={() => setSelectedCategories([])}
                    className="w-full mt-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground border-t border-border"
                  >
                    Clear selection
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            placeholder="From"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-[140px] h-9"
          />
          <span className="text-muted-foreground">to</span>
          <Input
            type="date"
            placeholder="To"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-[140px] h-9"
          />
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedCategories.map((cat) => {
            const catInfo = uniqueCategories.find(c => c.name === cat);
            return (
              <span
                key={cat}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: catInfo?.color ? `${catInfo.color}20` : "#e2e8f0",
                  color: catInfo?.color || "#64748b",
                }}
              >
                {cat}
                <button onClick={() => toggleCategory(cat)} className="hover:opacity-70">
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Summary */}
      <div className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-3">
        <span className="text-sm text-muted-foreground">
          Showing {filteredData.length} of {data.length} transaction{data.length !== 1 ? "s" : ""}
        </span>
        <div className="text-right">
          <span className="text-sm text-muted-foreground">Total: </span>
          <span className="text-lg font-bold text-red-600">
            {formatCurrency(totalAmount, "INR")}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-center text-sm font-medium text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border">
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest('button')) return;
                    onRowClick?.(row.original);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-center">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No expenses found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount() || 1}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
