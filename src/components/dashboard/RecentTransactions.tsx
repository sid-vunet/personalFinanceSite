import React from "react";
import { formatCurrency, formatRelativeDate } from "@/lib/utils";
import type { Expense } from "@/components/tables/ExpenseTable";

interface RecentTransactionsProps {
  transactions: Expense[];
  maxItems?: number;
}

export function RecentTransactions({
  transactions,
  maxItems = 5,
}: RecentTransactionsProps) {
  const recentItems = transactions.slice(0, maxItems);

  if (recentItems.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No recent transactions</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recentItems.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between py-3 border-b border-border last:border-0"
        >
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium"
              style={{
                backgroundColor: transaction.categoryColor
                  ? `${transaction.categoryColor}20`
                  : "#e2e8f0",
                color: transaction.categoryColor || "#64748b",
              }}
            >
              {transaction.category.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-sm">{transaction.description}</p>
              <p className="text-xs text-muted-foreground">
                {transaction.category} • {formatRelativeDate(transaction.date)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-sm">
              -{formatCurrency(transaction.amount, transaction.currency)}
            </p>
            <p className="text-xs text-muted-foreground">{transaction.user}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
