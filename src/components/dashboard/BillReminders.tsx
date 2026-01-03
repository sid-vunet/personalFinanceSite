import React from "react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, AlertCircle } from "lucide-react";

interface BillReminder {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  isOverdue: boolean;
  currency?: string;
}

interface BillRemindersProps {
  reminders: BillReminder[];
  onMarkPaid?: (id: string) => void;
}

export function BillReminders({ reminders, onMarkPaid }: BillRemindersProps) {
  const sortedReminders = [...reminders].sort((a, b) => {
    // Overdue first, then by date
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Upcoming Bills
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedReminders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No upcoming bills
          </p>
        ) : (
          <div className="space-y-3">
            {sortedReminders.map((reminder) => (
              <div
                key={reminder.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  reminder.isOverdue
                    ? "border-red-200 bg-red-50"
                    : "border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  {reminder.isOverdue ? (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  ) : (
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium text-sm">{reminder.name}</p>
                    <p
                      className={`text-xs ${
                        reminder.isOverdue
                          ? "text-red-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {reminder.isOverdue ? "Overdue: " : "Due: "}
                      {formatDate(reminder.dueDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">
                    {formatCurrency(reminder.amount, reminder.currency)}
                  </span>
                  {onMarkPaid && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onMarkPaid(reminder.id)}
                    >
                      Mark Paid
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
