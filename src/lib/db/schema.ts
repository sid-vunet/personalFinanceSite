import { pgTable, text, timestamp, integer, decimal, boolean, uuid, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum("user_role", ["admin", "member", "viewer"]);
export const expenseStatusEnum = pgEnum("expense_status", ["pending", "approved", "rejected"]);
export const recurringFrequencyEnum = pgEnum("recurring_frequency", ["daily", "weekly", "monthly", "yearly"]);
export const goalStatusEnum = pgEnum("goal_status", ["active", "completed", "cancelled"]);
export const investmentTypeEnum = pgEnum("investment_type", ["stock", "mutual_fund", "fixed_deposit", "insurance", "other"]);

// Family table
export const families = pgTable("families", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique(),
  phone: text("phone").unique(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  familyId: uuid("family_id").references(() => families.id),
  role: userRoleEnum("role").default("member").notNull(),
  isApproved: boolean("is_approved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Sessions table for authentication
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  token: text("token").unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Categories table
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  familyId: uuid("family_id").references(() => families.id).notNull(),
  name: text("name").notNull(),
  icon: text("icon"),
  color: text("color"),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Payment methods table
export const paymentMethods = pgTable("payment_methods", {
  id: uuid("id").primaryKey().defaultRandom(),
  familyId: uuid("family_id").references(() => families.id).notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // cash, card, upi, bank_transfer
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Expenses table
export const expenses = pgTable("expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  familyId: uuid("family_id").references(() => families.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  categoryId: uuid("category_id").references(() => categories.id).notNull(),
  paymentMethodId: uuid("payment_method_id").references(() => paymentMethods.id),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").default("INR").notNull(),
  description: text("description").notNull(),
  merchant: text("merchant"),
  date: timestamp("date").notNull(),
  isShared: boolean("is_shared").default(true).notNull(),
  status: expenseStatusEnum("status").default("approved").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Expense attachments table
export const expenseAttachments = pgTable("expense_attachments", {
  id: uuid("id").primaryKey().defaultRandom(),
  expenseId: uuid("expense_id").references(() => expenses.id).notNull(),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Expense comments table
export const expenseComments = pgTable("expense_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  expenseId: uuid("expense_id").references(() => expenses.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tags table
export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  familyId: uuid("family_id").references(() => families.id).notNull(),
  name: text("name").notNull(),
  color: text("color"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Expense tags junction table
export const expenseTags = pgTable("expense_tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  expenseId: uuid("expense_id").references(() => expenses.id).notNull(),
  tagId: uuid("tag_id").references(() => tags.id).notNull(),
});

// Budgets table
export const budgets = pgTable("budgets", {
  id: uuid("id").primaryKey().defaultRandom(),
  familyId: uuid("family_id").references(() => families.id).notNull(),
  categoryId: uuid("category_id").references(() => categories.id),
  name: text("name").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  month: integer("month").notNull(), // 1-12
  year: integer("year").notNull(),
  alertThreshold: integer("alert_threshold").default(80), // percentage
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Recurring expenses table
export const recurringExpenses = pgTable("recurring_expenses", {
  id: uuid("id").primaryKey().defaultRandom(),
  familyId: uuid("family_id").references(() => families.id).notNull(),
  categoryId: uuid("category_id").references(() => categories.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").default("INR").notNull(),
  frequency: recurringFrequencyEnum("frequency").notNull(),
  dayOfMonth: integer("day_of_month"), // for monthly
  dayOfWeek: integer("day_of_week"), // for weekly (0-6)
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  nextDueDate: timestamp("next_due_date").notNull(),
  reminderDays: integer("reminder_days").default(3),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Financial goals table
export const financialGoals = pgTable("financial_goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  familyId: uuid("family_id").references(() => families.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  targetAmount: decimal("target_amount", { precision: 12, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 12, scale: 2 }).default("0").notNull(),
  currency: text("currency").default("INR").notNull(),
  targetDate: timestamp("target_date"),
  status: goalStatusEnum("status").default("active").notNull(),
  icon: text("icon"),
  color: text("color"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Goal contributions table
export const goalContributions = pgTable("goal_contributions", {
  id: uuid("id").primaryKey().defaultRandom(),
  goalId: uuid("goal_id").references(() => financialGoals.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  notes: text("notes"),
  date: timestamp("date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Investments table
export const investments = pgTable("investments", {
  id: uuid("id").primaryKey().defaultRandom(),
  familyId: uuid("family_id").references(() => families.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  type: investmentTypeEnum("type").notNull(),
  symbol: text("symbol"), // for stocks
  units: decimal("units", { precision: 12, scale: 4 }),
  purchasePrice: decimal("purchase_price", { precision: 12, scale: 2 }).notNull(),
  currentValue: decimal("current_value", { precision: 12, scale: 2 }).notNull(),
  currency: text("currency").default("INR").notNull(),
  purchaseDate: timestamp("purchase_date").notNull(),
  maturityDate: timestamp("maturity_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// CSV import mappings table
export const csvMappings = pgTable("csv_mappings", {
  id: uuid("id").primaryKey().defaultRandom(),
  familyId: uuid("family_id").references(() => families.id).notNull(),
  name: text("name").notNull(), // e.g., "HDFC Bank Statement"
  mapping: text("mapping").notNull(), // JSON string of column mappings
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // budget_alert, bill_reminder, goal_milestone, etc.
  isRead: boolean("is_read").default(false).notNull(),
  data: text("data"), // JSON string for additional data
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const familiesRelations = relations(families, ({ many }) => ({
  users: many(users),
  categories: many(categories),
  expenses: many(expenses),
  budgets: many(budgets),
  goals: many(financialGoals),
  investments: many(investments),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  family: one(families, {
    fields: [users.familyId],
    references: [families.id],
  }),
  expenses: many(expenses),
  comments: many(expenseComments),
  notifications: many(notifications),
}));

export const expensesRelations = relations(expenses, ({ one, many }) => ({
  family: one(families, {
    fields: [expenses.familyId],
    references: [families.id],
  }),
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [expenses.categoryId],
    references: [categories.id],
  }),
  paymentMethod: one(paymentMethods, {
    fields: [expenses.paymentMethodId],
    references: [paymentMethods.id],
  }),
  attachments: many(expenseAttachments),
  comments: many(expenseComments),
  tags: many(expenseTags),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  family: one(families, {
    fields: [categories.familyId],
    references: [families.id],
  }),
  expenses: many(expenses),
  budgets: many(budgets),
}));
