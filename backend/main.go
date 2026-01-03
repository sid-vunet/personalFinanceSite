package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
	bolt "go.etcd.io/bbolt"
)

// Expense represents a financial expense
type Expense struct {
	ID             string   `json:"id"`
	Amount         float64  `json:"amount"`
	Currency       string   `json:"currency"`
	Description    string   `json:"description"`
	Category       string   `json:"category"`
	CategoryColor  string   `json:"categoryColor,omitempty"`
	Merchant       string   `json:"merchant"`
	Date           string   `json:"date"`
	User           string   `json:"user"`
	IsShared       bool     `json:"isShared"`
	HasAttachments bool     `json:"hasAttachments"`
	CommentCount   int      `json:"commentCount"`
	Notes          string   `json:"notes,omitempty"`
	Attachments    []string `json:"attachments,omitempty"`
	CreatedAt      string   `json:"createdAt"`
	UpdatedAt      string   `json:"updatedAt"`
}

// Budget represents a budget category
type Budget struct {
	ID       string  `json:"id"`
	Category string  `json:"category"`
	Limit    float64 `json:"limit"`
	Spent    float64 `json:"spent"`
	Color    string  `json:"color"`
}

// Goal represents a financial goal
type Goal struct {
	ID       string  `json:"id"`
	Name     string  `json:"name"`
	Target   float64 `json:"target"`
	Current  float64 `json:"current"`
	Deadline string  `json:"deadline"`
	Color    string  `json:"color"`
}

// Investment represents an investment
type Investment struct {
	ID             string  `json:"id"`
	Name           string  `json:"name"`
	Type           string  `json:"type"`
	Value          float64 `json:"value"`
	InvestedValue  float64 `json:"investedValue"`
	Returns        float64 `json:"returns"`
	ReturnsPercent float64 `json:"returnsPercent"`
}

// BillReminder represents a bill reminder
type BillReminder struct {
	ID       string  `json:"id"`
	Name     string  `json:"name"`
	Amount   float64 `json:"amount"`
	DueDate  string  `json:"dueDate"`
	Status   string  `json:"status"`
	Category string  `json:"category"`
}

// Income represents an income entry
type Income struct {
	ID          string  `json:"id"`
	Amount      float64 `json:"amount"`
	Currency    string  `json:"currency"`
	Source      string  `json:"source"`
	Description string  `json:"description"`
	Date        string  `json:"date"`
	IsRecurring bool    `json:"isRecurring"`
	User        string  `json:"user"`
	CreatedAt   string  `json:"createdAt"`
	UpdatedAt   string  `json:"updatedAt"`
}

var db *bolt.DB

const (
	expensesBucket    = "expenses"
	budgetsBucket     = "budgets"
	goalsBucket       = "goals"
	investmentsBucket = "investments"
	billsBucket       = "bills"
	incomeBucket      = "income"
)

func main() {
	var err error
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "./family_finance.db"
	}

	db, err = bolt.Open(dbPath, 0600, &bolt.Options{Timeout: 1 * time.Second})
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	err = db.Update(func(tx *bolt.Tx) error {
		buckets := []string{expensesBucket, budgetsBucket, goalsBucket, investmentsBucket, billsBucket, incomeBucket}
		for _, bucket := range buckets {
			_, err := tx.CreateBucketIfNotExists([]byte(bucket))
			if err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		log.Fatal(err)
	}

	r := mux.NewRouter()
	r.Use(corsMiddleware)

	api := r.PathPrefix("/api").Subrouter()

	// Expenses
	api.HandleFunc("/expenses", getExpenses).Methods("GET", "OPTIONS")
	api.HandleFunc("/expenses", createExpense).Methods("POST", "OPTIONS")
	api.HandleFunc("/expenses/{id}", getExpense).Methods("GET", "OPTIONS")
	api.HandleFunc("/expenses/{id}", updateExpense).Methods("PUT", "OPTIONS")
	api.HandleFunc("/expenses/{id}", deleteExpense).Methods("DELETE", "OPTIONS")

	// Budgets
	api.HandleFunc("/budgets", getBudgets).Methods("GET", "OPTIONS")
	api.HandleFunc("/budgets", createBudget).Methods("POST", "OPTIONS")
	api.HandleFunc("/budgets/{id}", updateBudget).Methods("PUT", "OPTIONS")
	api.HandleFunc("/budgets/{id}", deleteBudget).Methods("DELETE", "OPTIONS")

	// Goals
	api.HandleFunc("/goals", getGoals).Methods("GET", "OPTIONS")
	api.HandleFunc("/goals", createGoal).Methods("POST", "OPTIONS")
	api.HandleFunc("/goals/{id}", updateGoal).Methods("PUT", "OPTIONS")
	api.HandleFunc("/goals/{id}", deleteGoal).Methods("DELETE", "OPTIONS")

	// Investments
	api.HandleFunc("/investments", getInvestments).Methods("GET", "OPTIONS")
	api.HandleFunc("/investments", createInvestment).Methods("POST", "OPTIONS")
	api.HandleFunc("/investments/{id}", updateInvestment).Methods("PUT", "OPTIONS")
	api.HandleFunc("/investments/{id}", deleteInvestment).Methods("DELETE", "OPTIONS")

	// Bills
	api.HandleFunc("/bills", getBills).Methods("GET", "OPTIONS")
	api.HandleFunc("/bills", createBill).Methods("POST", "OPTIONS")
	api.HandleFunc("/bills/{id}", updateBill).Methods("PUT", "OPTIONS")
	api.HandleFunc("/bills/{id}", deleteBill).Methods("DELETE", "OPTIONS")

	// Income
	api.HandleFunc("/income", getIncomes).Methods("GET", "OPTIONS")
	api.HandleFunc("/income", createIncome).Methods("POST", "OPTIONS")
	api.HandleFunc("/income/{id}", updateIncome).Methods("PUT", "OPTIONS")
	api.HandleFunc("/income/{id}", deleteIncome).Methods("DELETE", "OPTIONS")

	// File Upload
	api.HandleFunc("/upload", uploadFile).Methods("POST", "OPTIONS")

	// Serve uploaded files
	r.PathPrefix("/uploads/").Handler(http.StripPrefix("/uploads/", http.FileServer(http.Dir("./uploads"))))

	// Stats & Dashboard
	api.HandleFunc("/stats", getStats).Methods("GET", "OPTIONS")
	api.HandleFunc("/dashboard", getDashboardData).Methods("GET", "OPTIONS")

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("🚀 Family Finance API running on http://localhost:%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func respondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func respondError(w http.ResponseWriter, status int, message string) {
	respondJSON(w, status, map[string]string{"error": message})
}

// EXPENSES

func getExpenses(w http.ResponseWriter, r *http.Request) {
	var expenses []Expense
	err := db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(expensesBucket))
		return b.ForEach(func(k, v []byte) error {
			var expense Expense
			if err := json.Unmarshal(v, &expense); err != nil {
				return err
			}
			expenses = append(expenses, expense)
			return nil
		})
	})
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if expenses == nil {
		expenses = []Expense{}
	}
	respondJSON(w, http.StatusOK, expenses)
}

func getExpense(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	var expense Expense
	err := db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(expensesBucket))
		v := b.Get([]byte(id))
		if v == nil {
			return fmt.Errorf("expense not found")
		}
		return json.Unmarshal(v, &expense)
	})
	if err != nil {
		respondError(w, http.StatusNotFound, err.Error())
		return
	}
	respondJSON(w, http.StatusOK, expense)
}

func createExpense(w http.ResponseWriter, r *http.Request) {
	var expense Expense
	if err := json.NewDecoder(r.Body).Decode(&expense); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}
	now := time.Now().Format(time.RFC3339)
	if expense.ID == "" {
		expense.ID = fmt.Sprintf("%d", time.Now().UnixNano())
	}
	// Default currency to INR if not set
	if expense.Currency == "" {
		expense.Currency = "INR"
	}
	expense.CreatedAt = now
	expense.UpdatedAt = now
	err := db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(expensesBucket))
		data, err := json.Marshal(expense)
		if err != nil {
			return err
		}
		return b.Put([]byte(expense.ID), data)
	})
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondJSON(w, http.StatusCreated, expense)
}

func updateExpense(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	var expense Expense
	if err := json.NewDecoder(r.Body).Decode(&expense); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}
	expense.ID = id
	expense.UpdatedAt = time.Now().Format(time.RFC3339)
	// Default currency to INR if not set
	if expense.Currency == "" {
		expense.Currency = "INR"
	}
	err := db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(expensesBucket))
		existing := b.Get([]byte(id))
		if existing != nil {
			var old Expense
			json.Unmarshal(existing, &old)
			expense.CreatedAt = old.CreatedAt
		}
		data, err := json.Marshal(expense)
		if err != nil {
			return err
		}
		return b.Put([]byte(id), data)
	})
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondJSON(w, http.StatusOK, expense)
}

func deleteExpense(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	err := db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(expensesBucket))
		return b.Delete([]byte(id))
	})
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{"message": "Expense deleted"})
}

// BUDGETS

func getBudgets(w http.ResponseWriter, r *http.Request) {
	var budgets []Budget
	err := db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(budgetsBucket))
		return b.ForEach(func(k, v []byte) error {
			var budget Budget
			if err := json.Unmarshal(v, &budget); err != nil {
				return err
			}
			budgets = append(budgets, budget)
			return nil
		})
	})
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if budgets == nil {
		budgets = []Budget{}
	}
	respondJSON(w, http.StatusOK, budgets)
}

func createBudget(w http.ResponseWriter, r *http.Request) {
	var budget Budget
	if err := json.NewDecoder(r.Body).Decode(&budget); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}
	if budget.ID == "" {
		budget.ID = fmt.Sprintf("%d", time.Now().UnixNano())
	}
	err := db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(budgetsBucket))
		data, err := json.Marshal(budget)
		if err != nil {
			return err
		}
		return b.Put([]byte(budget.ID), data)
	})
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondJSON(w, http.StatusCreated, budget)
}

func updateBudget(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	var budget Budget
	if err := json.NewDecoder(r.Body).Decode(&budget); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}
	budget.ID = id
	err := db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(budgetsBucket))
		data, err := json.Marshal(budget)
		if err != nil {
			return err
		}
		return b.Put([]byte(id), data)
	})
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondJSON(w, http.StatusOK, budget)
}

func deleteBudget(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	err := db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(budgetsBucket))
		return b.Delete([]byte(id))
	})
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{"message": "Budget deleted"})
}

// GOALS

func getGoals(w http.ResponseWriter, r *http.Request) {
	var goals []Goal
	err := db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(goalsBucket))
		return b.ForEach(func(k, v []byte) error {
			var goal Goal
			if err := json.Unmarshal(v, &goal); err != nil {
				return err
			}
			goals = append(goals, goal)
			return nil
		})
	})
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if goals == nil {
		goals = []Goal{}
	}
	respondJSON(w, http.StatusOK, goals)
}

func createGoal(w http.ResponseWriter, r *http.Request) {
	var goal Goal
	if err := json.NewDecoder(r.Body).Decode(&goal); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}
	if goal.ID == "" {
		goal.ID = fmt.Sprintf("%d", time.Now().UnixNano())
	}
	err := db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(goalsBucket))
		data, err := json.Marshal(goal)
		if err != nil {
			return err
		}
		return b.Put([]byte(goal.ID), data)
	})
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondJSON(w, http.StatusCreated, goal)
}

func updateGoal(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	var goal Goal
	if err := json.NewDecoder(r.Body).Decode(&goal); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}
	goal.ID = id
	err := db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(goalsBucket))
		data, err := json.Marshal(goal)
		if err != nil {
			return err
		}
		return b.Put([]byte(id), data)
	})
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondJSON(w, http.StatusOK, goal)
}

func deleteGoal(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	err := db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(goalsBucket))
		return b.Delete([]byte(id))
	})
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{"message": "Goal deleted"})
}

// INVESTMENTS

func getInvestments(w http.ResponseWriter, r *http.Request) {
	var investments []Investment
	err := db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(investmentsBucket))
		return b.ForEach(func(k, v []byte) error {
			var investment Investment
			if err := json.Unmarshal(v, &investment); err != nil {
				return err
			}
			investments = append(investments, investment)
			return nil
		})
	})
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if investments == nil {
		investments = []Investment{}
	}
	respondJSON(w, http.StatusOK, investments)
}

func createInvestment(w http.ResponseWriter, r *http.Request) {
	var investment Investment
	if err := json.NewDecoder(r.Body).Decode(&investment); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}
	if investment.ID == "" {
		investment.ID = fmt.Sprintf("%d", time.Now().UnixNano())
	}
	err := db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(investmentsBucket))
		data, err := json.Marshal(investment)
		if err != nil {
			return err
		}
		return b.Put([]byte(investment.ID), data)
	})
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondJSON(w, http.StatusCreated, investment)
}

func updateInvestment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	var investment Investment
	if err := json.NewDecoder(r.Body).Decode(&investment); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}
	investment.ID = id
	err := db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(investmentsBucket))
		data, err := json.Marshal(investment)
		if err != nil {
			return err
		}
		return b.Put([]byte(id), data)
	})
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondJSON(w, http.StatusOK, investment)
}

func deleteInvestment(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	err := db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(investmentsBucket))
		return b.Delete([]byte(id))
	})
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{"message": "Investment deleted"})
}

// BILLS

func getBills(w http.ResponseWriter, r *http.Request) {
	var bills []BillReminder
	err := db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(billsBucket))
		return b.ForEach(func(k, v []byte) error {
			var bill BillReminder
			if err := json.Unmarshal(v, &bill); err != nil {
				return err
			}
			bills = append(bills, bill)
			return nil
		})
	})
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if bills == nil {
		bills = []BillReminder{}
	}
	respondJSON(w, http.StatusOK, bills)
}

func createBill(w http.ResponseWriter, r *http.Request) {
	var bill BillReminder
	if err := json.NewDecoder(r.Body).Decode(&bill); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}
	if bill.ID == "" {
		bill.ID = fmt.Sprintf("%d", time.Now().UnixNano())
	}
	err := db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(billsBucket))
		data, err := json.Marshal(bill)
		if err != nil {
			return err
		}
		return b.Put([]byte(bill.ID), data)
	})
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondJSON(w, http.StatusCreated, bill)
}

func updateBill(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	var bill BillReminder
	if err := json.NewDecoder(r.Body).Decode(&bill); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}
	bill.ID = id
	err := db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(billsBucket))
		data, err := json.Marshal(bill)
		if err != nil {
			return err
		}
		return b.Put([]byte(id), data)
	})
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondJSON(w, http.StatusOK, bill)
}

func deleteBill(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	err := db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(billsBucket))
		return b.Delete([]byte(id))
	})
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{"message": "Bill deleted"})
}

// STATS

func getStats(w http.ResponseWriter, r *http.Request) {
	stats := map[string]interface{}{
		"totalSpent":       0.0,
		"monthlyBudget":    0.0,
		"transactionCount": 0,
		"savingsRate":      0.0,
	}

	var totalSpent float64
	var transactionCount int

	db.View(func(tx *bolt.Tx) error {
		expBucket := tx.Bucket([]byte(expensesBucket))
		expBucket.ForEach(func(k, v []byte) error {
			var expense Expense
			json.Unmarshal(v, &expense)
			totalSpent += expense.Amount
			transactionCount++
			return nil
		})

		var totalBudget float64
		budBucket := tx.Bucket([]byte(budgetsBucket))
		budBucket.ForEach(func(k, v []byte) error {
			var budget Budget
			json.Unmarshal(v, &budget)
			totalBudget += budget.Limit
			return nil
		})

		stats["totalSpent"] = totalSpent
		stats["monthlyBudget"] = totalBudget
		stats["transactionCount"] = transactionCount
		if totalBudget > 0 {
			stats["savingsRate"] = ((totalBudget - totalSpent) / totalBudget) * 100
		}

		return nil
	})

	respondJSON(w, http.StatusOK, stats)
}

// INCOME

func getIncomes(w http.ResponseWriter, r *http.Request) {
	var incomes []Income
	err := db.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(incomeBucket))
		return b.ForEach(func(k, v []byte) error {
			var income Income
			if err := json.Unmarshal(v, &income); err != nil {
				return err
			}
			incomes = append(incomes, income)
			return nil
		})
	})
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if incomes == nil {
		incomes = []Income{}
	}
	respondJSON(w, http.StatusOK, incomes)
}

func createIncome(w http.ResponseWriter, r *http.Request) {
	var income Income
	if err := json.NewDecoder(r.Body).Decode(&income); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}
	now := time.Now().Format(time.RFC3339)
	if income.ID == "" {
		income.ID = fmt.Sprintf("%d", time.Now().UnixNano())
	}
	income.CreatedAt = now
	income.UpdatedAt = now
	err := db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(incomeBucket))
		data, err := json.Marshal(income)
		if err != nil {
			return err
		}
		return b.Put([]byte(income.ID), data)
	})
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondJSON(w, http.StatusCreated, income)
}

func updateIncome(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	var income Income
	if err := json.NewDecoder(r.Body).Decode(&income); err != nil {
		respondError(w, http.StatusBadRequest, err.Error())
		return
	}
	income.ID = id
	income.UpdatedAt = time.Now().Format(time.RFC3339)
	err := db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(incomeBucket))
		existing := b.Get([]byte(id))
		if existing != nil {
			var old Income
			json.Unmarshal(existing, &old)
			income.CreatedAt = old.CreatedAt
		}
		data, err := json.Marshal(income)
		if err != nil {
			return err
		}
		return b.Put([]byte(id), data)
	})
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondJSON(w, http.StatusOK, income)
}

func deleteIncome(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	err := db.Update(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(incomeBucket))
		return b.Delete([]byte(id))
	})
	if err != nil {
		respondError(w, http.StatusInternalServerError, err.Error())
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{"message": "Income deleted"})
}

// FILE UPLOAD

func uploadFile(w http.ResponseWriter, r *http.Request) {
	// Max 10MB file
	r.ParseMultipartForm(10 << 20)

	file, handler, err := r.FormFile("file")
	if err != nil {
		respondError(w, http.StatusBadRequest, "Error retrieving file")
		return
	}
	defer file.Close()

	// Create uploads directory if it doesn't exist
	if err := os.MkdirAll("./uploads", os.ModePerm); err != nil {
		respondError(w, http.StatusInternalServerError, "Error creating uploads directory")
		return
	}

	// Generate unique filename
	ext := ""
	if idx := len(handler.Filename) - 1; idx >= 0 {
		for i := len(handler.Filename) - 1; i >= 0; i-- {
			if handler.Filename[i] == '.' {
				ext = handler.Filename[i:]
				break
			}
		}
	}
	filename := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	filepath := fmt.Sprintf("./uploads/%s", filename)

	// Create the file
	dst, err := os.Create(filepath)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Error creating file")
		return
	}
	defer dst.Close()

	// Copy the uploaded file to the destination
	_, err = dst.ReadFrom(file)
	if err != nil {
		respondError(w, http.StatusInternalServerError, "Error saving file")
		return
	}

	// Return the URL
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	fileURL := fmt.Sprintf("http://localhost:%s/uploads/%s", port, filename)

	respondJSON(w, http.StatusOK, map[string]string{
		"url":      fileURL,
		"filename": filename,
	})
}

// DASHBOARD

func getDashboardData(w http.ResponseWriter, r *http.Request) {
	dashboard := map[string]interface{}{}

	var expenses []Expense
	var budgets []Budget
	var goals []Goal
	var bills []BillReminder
	var incomes []Income

	var totalSpent float64
	var totalIncome float64
	var totalBudget float64
	categorySpending := make(map[string]float64)
	categoryColors := make(map[string]string)

	db.View(func(tx *bolt.Tx) error {
		// Get expenses
		expBucket := tx.Bucket([]byte(expensesBucket))
		expBucket.ForEach(func(k, v []byte) error {
			var expense Expense
			json.Unmarshal(v, &expense)
			expenses = append(expenses, expense)
			totalSpent += expense.Amount
			categorySpending[expense.Category] += expense.Amount
			if expense.CategoryColor != "" {
				categoryColors[expense.Category] = expense.CategoryColor
			}
			return nil
		})

		// Get budgets
		budBucket := tx.Bucket([]byte(budgetsBucket))
		budBucket.ForEach(func(k, v []byte) error {
			var budget Budget
			json.Unmarshal(v, &budget)
			budgets = append(budgets, budget)
			totalBudget += budget.Limit
			return nil
		})

		// Get goals
		goalBucket := tx.Bucket([]byte(goalsBucket))
		goalBucket.ForEach(func(k, v []byte) error {
			var goal Goal
			json.Unmarshal(v, &goal)
			goals = append(goals, goal)
			return nil
		})

		// Get bills
		billBucket := tx.Bucket([]byte(billsBucket))
		billBucket.ForEach(func(k, v []byte) error {
			var bill BillReminder
			json.Unmarshal(v, &bill)
			bills = append(bills, bill)
			return nil
		})

		// Get income
		incBucket := tx.Bucket([]byte(incomeBucket))
		incBucket.ForEach(func(k, v []byte) error {
			var income Income
			json.Unmarshal(v, &income)
			incomes = append(incomes, income)
			totalIncome += income.Amount
			return nil
		})

		return nil
	})

	// Build category data for pie chart
	var categoryData []map[string]interface{}
	defaultColors := []string{"#22c55e", "#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#6366f1"}
	colorIdx := 0
	for cat, amount := range categorySpending {
		color := categoryColors[cat]
		if color == "" {
			color = defaultColors[colorIdx%len(defaultColors)]
			colorIdx++
		}
		categoryData = append(categoryData, map[string]interface{}{
			"name":  cat,
			"value": amount,
			"color": color,
		})
	}

	// Get recent transactions (last 5)
	recentExpenses := expenses
	if len(recentExpenses) > 5 {
		recentExpenses = recentExpenses[:5]
	}

	// Calculate savings rate
	savingsRate := 0.0
	if totalIncome > 0 {
		savingsRate = ((totalIncome - totalSpent) / totalIncome) * 100
	}

	dashboard["stats"] = map[string]interface{}{
		"totalSpent":       totalSpent,
		"totalIncome":      totalIncome,
		"monthlyBudget":    totalBudget,
		"transactionCount": len(expenses),
		"savingsRate":      savingsRate,
		"netBalance":       totalIncome - totalSpent,
	}
	dashboard["expenses"] = expenses
	dashboard["recentTransactions"] = recentExpenses
	dashboard["budgets"] = budgets
	dashboard["goals"] = goals
	dashboard["bills"] = bills
	dashboard["incomes"] = incomes
	dashboard["categoryData"] = categoryData

	respondJSON(w, http.StatusOK, dashboard)
}
