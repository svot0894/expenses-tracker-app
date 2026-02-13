import { Auth } from '@supabase/auth-ui-react';
import { useState, useEffect } from 'react';
import { Wallet, Upload, LogOutIcon } from 'lucide-react';
import { Dashboard } from './components/tabs/overview/Dashboard';
import { ExpenseList } from './components/tabs/expenses/ExpenseList';
import { InvestmentForm } from './components/tabs/investments/InvestmentForm';
import { InvestmentList } from './components/tabs/investments/InvestmentList';
import { ExpenseChart } from './components/tabs/expenses/ExpenseChart';
//import { InvestmentChart } from './components/InvestmentChart';
import { IncomeForm } from './components/tabs/incomes/IncomeForm';
import { IncomeList } from './components/tabs/incomes/IncomeList';
import { FinancialKPIs } from './components/tabs/overview/FinancialKPIs';
import { CSVModal } from './components/tabs/expenses/CSVModal';
import { ExpenseTrendChart } from './components/tabs/expenses/ExpenseTrendChart';
import { ExpenseModal } from './components/tabs/expenses/ExpenseModal';
import { InvestmentPerformance } from './components/tabs/investments/InvestmentPerformance';
import { Settings } from './components/tabs/settings/Settings';
import { IncomeCashManager } from './components/tabs/incomes/IncomeCashManager';

import { supabase, type Expenses, type ExpenseInsert, type ExpenseUpdate } from '../lib/supabase';
import { type Categories } from '../lib/supabase';
import { type Investments, type InvestmentInsert } from '../lib/supabase';
import { type Incomes, type IncomeInsert } from '../lib/supabase';

function App() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'investments' | 'income' | 'settings'>('overview');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expenses | undefined>(undefined);

  // State for categories and expenses
  const [categories, setCategories] = useState<Categories[]>([]);
  const [expenses, setExpenses] = useState<Expenses[]>([]);
  const [investments, setInvestments] = useState<Investments[]>([]);
  const [incomes, setIncomes] = useState<Incomes[]>([]);
  const [liquidCash, setLiquidCash] = useState(80000); // Emergency fund

  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
        return;
      }
      if (data.session) {
        setUser(data.session.user);
      }
    };

    fetchSession();

    const { data: { subscription }, } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch data from Supabase on mount
  useEffect(() => {
    const fetchData = async () => {
      const thisMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
      const nextMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1);

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        ;

      if (!categoriesError && categoriesData) {
        setCategories(categoriesData);
      };

      // Fetch expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .gte('date', thisMonth.toISOString())
        .lt('date', nextMonth.toISOString())
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (!expensesError && expensesData) {
        setExpenses(expensesData);
      };

      // Fetch investments
      const { data: investmentsData, error: investmentsError } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id)
        .order('purchasedate', { ascending: false });

      if (!investmentsError && investmentsData) {
        setInvestments(investmentsData);
      };

      // Fetch incomes
      const { data: incomesData, error: incomesError } = await supabase
        .from('incomes')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (!incomesError && incomesData) {
        setIncomes(incomesData);
      }
    };

    fetchData();
  }, [selectedMonth]);

  // Handlers for expenses
  const handleCloseExpenseModal = () => {
    setIsExpenseModalOpen(false);
    setEditingExpense(undefined);
  };

  const handleImportExpenses = async (importedExpenses: Omit<Expenses, 'id'>[]) => {
    const newExpenses = importedExpenses.map(exp => ({
      user_id: user.id,
      description: exp.description,
      amount: exp.amount,
      category_id: categories.find(c => c.name === exp.category)?.id || "",
      date: exp.date
    }));

    // Wait for all inserts to complete
    const insertedExpenses = await Promise.all(
      newExpenses.map(async (expense) => {
        const insertData: ExpenseInsert = { ...expense, user_id: user.id };
        const { data, error } = await supabase
          .from('expenses')
          .insert(insertData)
          .select()
          .single();

        if (error) {
          console.error('Error adding expense:', error);
          return null;
        }
        return data;
      })
    );

    // Filter out any failed inserts and update state once
    const validExpenses = insertedExpenses.filter((e): e is Expenses => e !== null);

    // Update state with all new expenses at once
    setExpenses(prev => [...validExpenses, ...prev]);
  };

  const handleAddExpense = async (expense: Omit<Expenses, 'id'>) => {
    const insertData: ExpenseInsert = {
      ...expense,
      user_id: user.id,
    };
    const { data, error } = await supabase
      .from('expenses')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error adding expense:', error);
      return;
    }
    setExpenses([data, ...expenses]);
  };

  const handleUpdateExpense = async (expense: Omit<Expenses, 'id'>) => {
    if (editingExpense) {
      const updateData: ExpenseUpdate = {
        ...expense,
        user_id: user.id,
      };
      const { data, error } = await supabase
        .from('expenses')
        .update(updateData)
        .eq('id', editingExpense.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating expense:', error);
        return;
      }
      setExpenses(expenses.map(e =>
        e.id === editingExpense.id
          ? { ...data }
          : e
      ));
      setEditingExpense(undefined);
    } else {
      handleAddExpense(expense);
    }
  };

  const handleEditExpense = (expense: Expenses) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  const handleDeleteExpense = async (id: string) => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
      ;

    if (error) {
      console.error('Error deleting expense:', error);
      return;
    }
    setExpenses(expenses.filter(e => e.id !== id));
  };

  // Handlers for investments
  const handleAddInvestment = async (investment: Omit<Investments, 'id'>) => {
    const insertData: InvestmentInsert = {
      ...investment,
      user_id: user.id,
    };
    const { data, error } = await supabase
      .from('investments')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error adding investment:', error);
      return;
    }
    setInvestments([data, ...investments]);
  };

  const handleDeleteInvestment = async (id: string) => {
    const { error } = await supabase
      .from('investments')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
      ;

    if (error) {
      console.error('Error deleting investment:', error);
      return;
    }
    setInvestments(investments.filter(i => i.id !== id));
  };

  // Handlers for income
  const handleAddIncome = async (income: Omit<Incomes, 'id'>) => {
    const insertData: IncomeInsert = {
      ...income,
      user_id: user.id,
    };
    const { data, error } = await supabase
      .from('incomes')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error adding income:', error);
      return;
    }
    setIncomes([data, ...incomes]);
  };

  const handleDeleteIncome = async (id: string) => {
    const { error } = await supabase
      .from('incomes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
      ;

    if (error) {
      console.error('Error deleting incomes:', error);
      return;
    }
    setIncomes(incomes.filter(i => i.id !== id));
  };

  // Handlers for categories
  const handleAddCategory = async (category: string) => {
    if (category && !categories.some(c => c.name === category)) {
      const { data, error } = await supabase
        .from('categories')
        .insert({ name: category, user_id: user.id, })
        .select()
        .single();

      if (!error && data) {
        setCategories([...categories, data]);
      } else {
        console.error('Error adding category:', error);
      }
    }
  };

  const handleDeleteCategory = async (category: string) => {
    const categoryToDelete = categories.find(c => c.name === category);
    if (categoryToDelete) {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryToDelete.id)
        .eq('user_id', user.id)
        ;

      if (!error) {
        setCategories(categories.filter(cat => cat.id !== categoryToDelete.id));
      } else {
        console.error('Error deleting category:', error);
      }
    }
  };

  // Calculate financial metrics
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalInvestments = investments.reduce((sum, i) => sum + i.currentvalue, 0);
  const totalInvestmentCost = investments.reduce((sum, i) => sum + i.amount, 0);
  const investmentGain = totalInvestments - totalInvestmentCost;
  const totalBalance = totalInvestments - totalExpenses;
  const monthlyChange = totalInvestmentCost > 0 ? (investmentGain / totalInvestmentCost) * 100 : 0;

  // Calculate KPI metrics
  const monthlyIncome = incomes.reduce((sum, i) => {
    return sum + (i.frequency === 'monthly' ? i.amount : i.amount / 12);
  }, 0);
  const annualExpenses = totalExpenses * 12;
  const monthlySavings = monthlyIncome - totalExpenses;
  const netWorth = totalInvestments + liquidCash - 0; // Assuming no debt for now

  return user ? (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">

            {/* Left Side */}
            <div className="flex items-center gap-3">
              <Wallet className="text-blue-600" size={32} />
              <h1 className="text-3xl font-bold text-gray-900">
                Finance Tracker
              </h1>
            </div>

            {/* Right Side Month Controls */}
            <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-3 py-2 shadow-sm">

              <button
                onClick={() =>
                  setSelectedMonth(prev =>
                    new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                  )
                }
                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-white shadow hover:bg-gray-50 transition"
              >
                ←
              </button>

              <span className="min-w-[140px] text-center font-semibold text-gray-700">
                {selectedMonth.toLocaleString('default', {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>

              <button
                onClick={() =>
                  setSelectedMonth(prev =>
                    new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                  )
                }
                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-white shadow hover:bg-gray-50 transition"
              >
                →
              </button>

            </div>

            {user && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Hi, {user.email}</span>
                <LogOutIcon className="text-red-500 hover:text-red-700 transition-colors" size={16} onClick={async () => {
                  await supabase.auth.signOut();
                  setUser(null);
                }} />
              </div>
            )}
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
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('expenses')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'expenses'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Expenses
              </button>
              <button
                onClick={() => setActiveTab('investments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'investments'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Investments
              </button>
              <button
                onClick={() => setActiveTab('income')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'income'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Income
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'settings'
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
              <ExpenseChart
                expenses={expenses}
                categories={categories}
              />
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
                  <button
                    onClick={() => setIsCSVModalOpen(true)}
                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Upload size={20} />
                    Import CSV
                  </button>
                </div>
                <ExpenseTrendChart expenses={expenses} />
                <ExpenseList
                  expenses={expenses}
                  onDeleteExpense={handleDeleteExpense}
                  onEditExpense={handleEditExpense}
                  categories={categories}
                />
              </div>
              <div>
                <ExpenseChart
                  expenses={expenses}
                  categories={categories}
                />
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
            categories={categories}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}

        {/* Expense Modal */}
        <ExpenseModal
          isOpen={isExpenseModalOpen}
          onClose={handleCloseExpenseModal}
          onSave={handleUpdateExpense}
          categories={categories}
          expense={editingExpense}
        />

        {/* CSV Import Modal */}
        <CSVModal
          isOpen={isCSVModalOpen}
          onClose={() => setIsCSVModalOpen(false)}
          onImportExpenses={handleImportExpenses}
        />
      </main>
    </div>
  ) : (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Welcome to Finance Tracker</h2>
        <p className="text-sm text-gray-600 mb-6">Sign in or create an account to start tracking your finances.</p>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: 'default',
            variables: {
              default: {
                colors: {
                  brand: '#3b82f6', // blue
                  brandAccent: '#2563eb',
                  brandButtonText: '#ffffff',
                },
              },
            },
          }}
          providers={[]} // No social providers for now
          redirectTo="http://localhost:5173" // Your dev server
        />
      </div>
    </div>
  );
}

export default App;