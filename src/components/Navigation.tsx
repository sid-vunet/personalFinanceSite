import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Home,
  CreditCard,
  PieChart,
  Target,
  TrendingUp,
  Settings,
  Menu,
  X,
  LogOut,
  Bell,
  Plus,
  Wallet,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/", icon: <Home className="h-5 w-5" /> },
  { name: "Transactions", href: "/transactions", icon: <CreditCard className="h-5 w-5" /> },
  { name: "Income", href: "/income", icon: <Wallet className="h-5 w-5" /> },
  { name: "Budgets", href: "/budgets", icon: <PieChart className="h-5 w-5" /> },
  { name: "Goals", href: "/goals", icon: <Target className="h-5 w-5" /> },
  { name: "Investments", href: "/investments", icon: <TrendingUp className="h-5 w-5" /> },
  { name: "Settings", href: "/settings", icon: <Settings className="h-5 w-5" /> },
];

interface NavigationProps {
  currentPath: string;
  user?: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  notificationCount?: number;
}

export function Navigation({
  currentPath,
  user,
  notificationCount = 0,
}: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAddExpense = () => {
    window.location.href = '/transactions?add=true';
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-border lg:bg-card">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">₹</span>
          </div>
          <span className="font-semibold text-lg">FinanceApp</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                currentPath === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {item.icon}
              {item.name}
            </a>
          ))}
        </nav>

        {/* Add Expense Button */}
        <div className="px-4 py-4 border-t border-border">
          <Button className="w-full" onClick={handleAddExpense}>
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>

        {/* User Section */}
        {user && (
          <div className="px-4 py-4 border-t border-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback>
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">₹</span>
            </div>
            <span className="font-semibold">FinanceApp</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="px-4 py-4 space-y-1 bg-card border-t border-border">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  currentPath === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.icon}
                {item.name}
              </a>
            ))}
            <Button className="w-full mt-4" onClick={handleAddExpense}>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </nav>
        )}
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 5).map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs ${
                currentPath === item.href
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </a>
          ))}
        </div>
      </nav>

      {/* Floating Add Button (Mobile) */}
      <Button
        className="lg:hidden fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-lg"
        onClick={handleAddExpense}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </>
  );
}
