import { useState } from 'react';
import { Wallet } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import type { Expense } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { InvestmentForm, type Investment } from './components/InvestmentForm';
import { InvestmentList } from './components/InvestmentList';
import { ExpenseChart } from './components/ExpenseChart';
import { InvestmentChart } from './components/InvestmentChart';
import { IncomeForm, type Income } from './components/IncomeForm';
import { IncomeList } from './components/IncomeList';
import { FinancialKPIs } from './components/FinancialKPIs';
import { CashManager } from './components/CashManager';
import { CSVUploader } from './components/CSVUploader';
import { ViewModeSelector } from './components/ViewModeSelector';
import { CategoryManager } from './components/CategoryManager';
import { ExpenseTrendChart } from './components/ExpenseTrendChart';
import { ExpenseModal } from './components/ExpenseModal';
import { InvestmentPerformance } from './components/InvestmentPerformance';
import { Settings } from './components/Settings';
import { IncomeCashManager } from './components/IncomeCashManager';

function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'investments' | 'income' | 'settings'>('overview');
  const [viewMode, setViewMode] = useState<'all_time' | 'monthly'>('all_time');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().substring(0, 7));
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);
  const [customCategories, setCustomCategories] = useState<string[]>([
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Healthcare',
    'Other'
  ]);
  
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: '1',
      title: 'Grocery Shopping',
      amount: 125.50,
      category: 'Food & Dining',
      date: '2026-02-01'
    },
    {
      id: '2',
      title: 'Gas Station',
      amount: 45.00,
      category: 'Transportation',
      date: '2026-02-02'
    },
    {
      id: '3',
      title: 'Netflix Subscription',
      amount: 15.99,
      category: 'Entertainment',
      date: '2026-02-03'
    }
  ]);

  const [investments, setInvestments] = useState<Investment[]>([
    {
      id: '1',
      name: 'Apple Inc.',
      type: 'Stocks',
      amount: 5000,
      currentValue: 5850,
      purchaseDate: '2025-06-15'
    },
    {
      id: '2',
      name: 'S&P 500 ETF',
      type: 'ETFs',
      amount: 10000,
      currentValue: 11200,
      purchaseDate: '2025-01-10'
    }
  ]);

  const [incomes, setIncomes] = useState<Income[]>([
    {
      id: '1',
      source: 'Salary',
      amount: 5000,
      frequency: 'monthly',
      date: '2026-02-01'
    },
    {
      id: '2',
      source: 'Freelance',
      amount: 1500,
      frequency: 'monthly',
      date: '2026-02-01'
    }
  ]);

  const [liquidCash, setLiquidCash] = useState(15000); // Emergency fund

  const handleAddExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = {
      ...expense,
      id: Date.now().toString()
    };
    setExpenses([newExpense, ...expenses]);
  };

  const handleUpdateExpense = (expense: Omit<Expense, 'id'>) => {
    if (editingExpense) {
      setExpenses(expenses.map(e => 
        e.id === editingExpense.id 
          ? { ...expense, id: editingExpense.id }
          : e
      ));
      setEditingExpense(undefined);
    } else {
      handleAddExpense(expense);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  const handleCloseExpenseModal = () => {
    setIsExpenseModalOpen(false);
    setEditingExpense(undefined);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const handleAddInvestment = (investment: Omit<Investment, 'id'>) => {
    const newInvestment = {
      ...investment,
      id: Date.now().toString()
    };
    setInvestments([newInvestment, ...investments]);
  };

  const handleDeleteInvestment = (id: string) => {
    setInvestments(investments.filter(i => i.id !== id));
  };

  const handleAddIncome = (income: Omit<Income, 'id'>) => {
    const newIncome = {
      ...income,
      id: Date.now().toString()
    };
    setIncomes([newIncome, ...incomes]);
  };

  const handleDeleteIncome = (id: string) => {
    setIncomes(incomes.filter(i => i.id !== id));
  };

  const handleImportExpenses = (importedExpenses: Omit<Expense, 'id'>[]) => {
    const newExpenses = importedExpenses.map(exp => ({
      ...exp,
      id: Date.now().toString() + Math.random().toString()
    }));
    setExpenses([...newExpenses, ...expenses]);
  };

  const handleAddCategory = (category: string) => {
    if (category && !customCategories.includes(category)) {
      setCustomCategories([...customCategories, category]);
    }
  };

  const handleDeleteCategory = (category: string) => {
    setCustomCategories(customCategories.filter(cat => cat !== category));
  };

  // Filter data based on view mode
  const getFilteredExpenses = () => {
    if (viewMode === 'monthly') {
      return expenses.filter(e => e.date.startsWith(selectedMonth));
    }
    return expenses;
  };

  const getFilteredIncomes = () => {
    if (viewMode === 'monthly') {
      return incomes.filter(i => i.date.startsWith(selectedMonth));
    }
    return incomes;
  };

  // Get available months from data
  const getAvailableMonths = () => {
    const allDates = [
      ...expenses.map(e => e.date),
      ...incomes.map(i => i.date)
    ];
    const months = Array.from(new Set(allDates.map(d => d.substring(0, 7)))).sort().reverse();
    return months;
  };

  // Calculate dashboard metrics
  const filteredExpenses = getFilteredExpenses();
  const filteredIncomes = getFilteredIncomes();
  
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalInvestments = investments.reduce((sum, i) => sum + i.currentValue, 0);
  const totalInvestmentCost = investments.reduce((sum, i) => sum + i.amount, 0);
  const investmentGain = totalInvestments - totalInvestmentCost;
  const totalBalance = totalInvestments - totalExpenses;
  const monthlyChange = totalInvestmentCost > 0 ? (investmentGain / totalInvestmentCost) * 100 : 0;

  // Calculate KPI metrics
  const monthlyIncome = incomes.reduce((sum, i) => {
    return sum + (i.frequency === 'monthly' ? i.amount : i.amount / 12);
  }, 0);
  const annualIncome = monthlyIncome * 12;
  const annualExpenses = totalExpenses * 12;
  const monthlySavings = monthlyIncome - totalExpenses;
  const netWorth = totalInvestments + liquidCash - 0; // Assuming no debt for now

  const availableMonths = getAvailableMonths();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <Wallet className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">Finance Tracker</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard */}
        <Dashboard
          totalBalance={totalBalance}
          totalExpenses={totalExpenses}
          totalInvestments={totalInvestments}
          monthlyChange={monthlyChange}
        />

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('expenses')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'expenses'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Expenses
              </button>
              <button
                onClick={() => setActiveTab('investments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'investments'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Investments
              </button>
              <button
                onClick={() => setActiveTab('income')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'income'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Income
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'settings'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Settings
              </button>
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <FinancialKPIs
              netWorth={netWorth}
              annualExpenses={annualExpenses}
              monthlyIncome={monthlyIncome}
              monthlySavings={monthlySavings}
              investmentValue={totalInvestments}
              liquidCash={liquidCash}
              investmentGain={investmentGain}
              investmentCost={totalInvestmentCost}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ExpenseChart expenses={expenses} />
              <InvestmentPerformance investments={investments} />
            </div>
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsExpenseModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    + Add Expense
                  </button>
                  <CSVUploader onImportExpenses={handleImportExpenses} />
                </div>
                <ExpenseTrendChart expenses={expenses} />
                <ExpenseList 
                  expenses={expenses} 
                  onDeleteExpense={handleDeleteExpense}
                  onEditExpense={handleEditExpense}
                />
              </div>
              <div>
                <ExpenseChart expenses={expenses} />
              </div>
            </div>
          </div>
        )}

        {/* Investments Tab */}
        {activeTab === 'investments' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <InvestmentForm onAddInvestment={handleAddInvestment} />
                <InvestmentList investments={investments} onDeleteInvestment={handleDeleteInvestment} />
              </div>
              <div>
                <InvestmentPerformance investments={investments} />
              </div>
            </div>
          </div>
        )}

        {/* Income Tab */}
        {activeTab === 'income' && (
          <div className="space-y-6">
            <CashManager liquidCash={liquidCash} onUpdateCash={setLiquidCash} />
            <IncomeCashManager liquidCash={liquidCash} onUpdateCash={setLiquidCash} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <IncomeForm onAddIncome={handleAddIncome} />
                <IncomeList incomes={incomes} onDeleteIncome={handleDeleteIncome} />
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <Settings
            categories={customCategories}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}

        {/* Expense Modal */}
        <ExpenseModal
          isOpen={isExpenseModalOpen}
          onClose={handleCloseExpenseModal}
          onSave={handleUpdateExpense}
          categories={customCategories}
          expense={editingExpense}
        />
      </main>
    </div>
  );
}

export default App;