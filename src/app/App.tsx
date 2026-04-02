import { Auth } from '@supabase/auth-ui-react';
import { useState, useEffect, useMemo } from 'react';
import { Wallet, Upload, LogOutIcon } from 'lucide-react';

import { Dashboard } from './components/tabs/overview/Dashboard';
import { ExpenseList } from './components/tabs/expenses/ExpenseList';
import { InvestmentForm } from './components/tabs/investments/InvestmentForm';
import { InvestmentList } from './components/tabs/investments/InvestmentList';
import { ExpenseChart } from './components/tabs/expenses/ExpenseChart';
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
import { type FamilyMembers } from '../lib/supabase';

function App() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [user, setUser] = useState<any>(null);

  const [activeTab, setActiveTab] =
    useState<'overview' | 'expenses' | 'investments' | 'income' | 'settings'>('overview');

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expenses | undefined>(undefined);

  const [categories, setCategories] = useState<Categories[]>([]);
  const [expenses, setExpenses] = useState<Expenses[]>([]);
  const [investments, setInvestments] = useState<Investments[]>([]);
  const [incomes, setIncomes] = useState<Incomes[]>([]);
  const [liquidCash, setLiquidCash] = useState(80000);
  const [familyId, setFamilyId] = useState<string | null>(null);

  // -----------------------
  // Auth session handling
  // -----------------------
  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
        return;
      }
      setUser(data.session?.user ?? null);
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // -----------------------
  // Fetch data (month-sensitive for expenses only)
  // -----------------------
  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      const thisMonthUTC = new Date(Date.UTC(
        selectedMonth.getFullYear(),
        selectedMonth.getMonth(),
        1
      ));

      const nextMonthUTC = new Date(Date.UTC(
        selectedMonth.getFullYear(),
        selectedMonth.getMonth() + 1,
        1
      ));

      // fetch family ID for current user (if any)
      const { data: familyData } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id)
        .single();

      const currentFamilyId = familyData?.family_id ?? null;
      setFamilyId(currentFamilyId);

      if (!currentFamilyId) return;

      const [
        { data: categoriesData, error: categoriesError },
        { data: expensesData, error: expensesError },
        { data: investmentsData, error: investmentsError },
        { data: incomesData, error: incomesError },
      ] = await Promise.all([
        supabase.from('categories').select('*').eq('family_id', currentFamilyId),
        supabase
          .from('expenses')
          .select('*')
          .gte('date', thisMonthUTC.toISOString())
          .lt('date', nextMonthUTC.toISOString())
          .eq('family_id', currentFamilyId)
          .order('date', { ascending: false }),
        supabase
          .from('investments')
          .select('*')
          .eq('family_id', currentFamilyId)
          .order('purchasedate', { ascending: false }),
        // incomes are recurring sources -> do NOT filter by selectedMonth
        supabase
          .from('incomes')
          .select('*')
          .gte('date', thisMonthUTC.toISOString())
          .lt('date', nextMonthUTC.toISOString())
          .eq('family_id', currentFamilyId)
          .order('date', { ascending: false }),
      ]);

      if (!categoriesError && categoriesData) setCategories(categoriesData);
      if (!expensesError && expensesData) setExpenses(expensesData);
      if (!investmentsError && investmentsData) setInvestments(investmentsData);
      if (!incomesError && incomesData) setIncomes(incomesData);

      if (categoriesError) console.error('Error fetching categories:', categoriesError);
      if (expensesError) console.error('Error fetching expenses:', expensesError);
      if (investmentsError) console.error('Error fetching investments:', investmentsError);
      if (incomesError) console.error('Error fetching incomes:', incomesError);
    };

    fetchData();
  }, [selectedMonth, user?.id]);

  // -----------------------
  // Expense modal handlers
  // -----------------------
  const handleCloseExpenseModal = () => {
    setIsExpenseModalOpen(false);
    setEditingExpense(undefined);
  };

  const handleImportExpenses = async (importedExpenses: Omit<Expenses, 'id'>[]) => {
    if (!user?.id) return;

    const normalize = (s: string) => (s || '').trim().toLowerCase();

    const rows: ExpenseInsert[] = importedExpenses.map((exp) => {
      const csvCategoryName = normalize((exp as any).category ?? '');
      const categoryId = categories.find((c) => normalize(c.name) === csvCategoryName)?.id ?? '';

      return {
        created_by: user.id,
        family_id: familyId!,
        description: exp.description,
        amount: Number(exp.amount) || 0,
        category_id: categoryId,
        date: exp.date,
      };
    });

    const { data, error } = await supabase.from('expenses').insert(rows).select();

    if (error) {
      console.error('Error importing expenses:', error);
      return;
    }

    if (data?.length) {
      setExpenses((prev) => [...data, ...prev]);
    }
  };

  const handleAddExpense = async (expense: Omit<Expenses, 'id'>) => {
    if (!user?.id) return;

    const insertData: ExpenseInsert = {
      ...expense,
      amount: Number(expense.amount) || 0,
      created_by: user.id,
      family_id: familyId!,
    };

    const { data, error } = await supabase.from('expenses').insert(insertData).select().single();

    if (error) {
      console.error('Error adding expense:', error);
      return;
    }

    setExpenses((prev) => [data, ...prev]);
  };

  const handleUpdateExpense = async (expense: Omit<Expenses, 'id'>) => {
    if (!user?.id) return;

    if (editingExpense) {
      const updateData: ExpenseUpdate = {
        ...expense,
        amount: Number(expense.amount) || 0,
        created_by: user.id,
        family_id: familyId!,
      };

      const { data, error } = await supabase
        .from('expenses')
        .update(updateData)
        .eq('id', editingExpense.id)
        .eq('family_id', familyId!)
        .select()
        .single();

      if (error) {
        console.error('Error updating expense:', error);
        return;
      }

      setExpenses((prev) => prev.map((e) => (e.id === editingExpense.id ? { ...data } : e)));
      setEditingExpense(undefined);
    } else {
      await handleAddExpense(expense);
    }
  };

  const handleEditExpense = (expense: Expenses) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  const handleDeleteExpense = async (id: string) => {
    if (!user?.id) return;

    const { error } = await supabase.from('expenses').delete().eq('id', id).eq('family_id', familyId!);

    if (error) {
      console.error('Error deleting expense:', error);
      return;
    }

    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // -----------------------
  // Investment handlers
  // -----------------------
  const handleAddInvestment = async (investment: Omit<Investments, 'id'>) => {
    if (!user?.id) return;

    const insertData: InvestmentInsert = {
      ...investment,
      amount: Number(investment.amount) || 0,
      currentvalue: Number((investment as any).currentvalue) || 0,
      created_by: user.id,
      family_id: familyId!,
    };

    const { data, error } = await supabase.from('investments').insert(insertData).select().single();

    if (error) {
      console.error('Error adding investment:', error);
      return;
    }

    setInvestments((prev) => [data, ...prev]);
  };

  const handleDeleteInvestment = async (id: string) => {
    if (!user?.id) return;

    const { error } = await supabase.from('investments').delete().eq('id', id).eq('family_id', familyId!);

    if (error) {
      console.error('Error deleting investment:', error);
      return;
    }

    setInvestments((prev) => prev.filter((i) => i.id !== id));
  };

  // -----------------------
  // Income handlers (recurring sources)
  // -----------------------
  const handleAddIncome = async (income: Omit<Incomes, 'id'>) => {
    if (!user?.id) return;

    const insertData: IncomeInsert = {
      ...income,
      amount: Number(income.amount) || 0,
      created_by: user.id,
      family_id: familyId!,
    };

    const { data, error } = await supabase.from('incomes').insert(insertData).select().single();

    if (error) {
      console.error('Error adding income:', error);
      return;
    }

    setIncomes((prev) => [data, ...prev]);
  };

  const handleDeleteIncome = async (id: string) => {
    if (!user?.id) return;

    const { error } = await supabase.from('incomes').delete().eq('id', id).eq('family_id', familyId!);

    if (error) {
      console.error('Error deleting incomes:', error);
      return;
    }

    setIncomes((prev) => prev.filter((i) => i.id !== id));
  };

  // -----------------------
  // Category handlers
  // -----------------------
  const handleAddCategory = async (category: string) => {
    if (!user?.id) return;

    if (category && !categories.some((c) => c.name === category)) {
      const { data, error } = await supabase
        .from('categories')
        .insert({ name: category, created_by: user.id, family_id: familyId! })
        .select()
        .single();

      if (!error && data) {
        setCategories((prev) => [...prev, data]);
      } else {
        console.error('Error adding category:', error);
      }
    }
  };

  const handleDeleteCategory = async (category: string) => {
    if (!user?.id) return;

    const categoryToDelete = categories.find((c) => c.name === category);
    if (!categoryToDelete) return;

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryToDelete.id)
      .eq('family_id', familyId!);

    if (!error) {
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryToDelete.id));
    } else {
      console.error('Error deleting category:', error);
    }
  };

  // -----------------------
  // ✅ FIXED CALCULATIONS
  // -----------------------
  const metrics = useMemo(() => {
    // Monthly expenses: already filtered by selectedMonth in query
    const monthlyExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    // Monthly income: already filtered by selectedMonth in query
    const monthlyIncome = incomes.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

    const monthlySavings = monthlyIncome - monthlyExpenses;

    const savingsRatePct = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

    // Investments (lifetime)
    const investmentValue = investments.reduce(
      (sum, inv) => sum + (Number((inv as any).currentvalue) || 0),
      0
    );

    const investmentCost = investments.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);

    const investmentGain = investmentValue - investmentCost;

    const investmentReturnPct = investmentCost > 0 ? (investmentGain / investmentCost) * 100 : 0;

    // Net worth (no debt tracked yet)
    const netWorth = (Number(liquidCash) || 0) + investmentValue;

    const annualExpenses = monthlyExpenses * 12;

    return {
      monthlyIncome,
      monthlyExpenses,
      monthlySavings,
      savingsRatePct,
      investmentValue,
      investmentCost,
      investmentGain,
      investmentReturnPct,
      netWorth,
      annualExpenses,
    };
  }, [expenses, incomes, investments, liquidCash]);

  // IMPORTANT: Keep Dashboard props as-is, but map correct values into them.
  // Your current Dashboard seems to label:
  //  - totalBalance -> "Monthly Income"
  //  - totalExpenses -> "Monthly Expenses"
  //  - totalInvestments -> "Total Investments"
  //  - monthlyChange -> "Monthly Savings Rate"
  const dashboardTotalBalance = metrics.monthlyIncome;
  const dashboardTotalExpenses = metrics.monthlyExpenses;
  const dashboardTotalInvestments = metrics.investmentValue;
  const dashboardMonthlyChange = metrics.savingsRatePct;

  return user ? (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            {/* Left Side */}
            <div className="flex items-center gap-3">
              <Wallet className="text-blue-600" size={32} />
              <h1 className="text-3xl font-bold text-gray-900">Finance Tracker</h1>
            </div>

            {/* Right Side Month Controls */}
            <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-3 py-2 shadow-sm">
              <button
                onClick={() =>
                  setSelectedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
                }
                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-white shadow hover:bg-gray-50 transition"
              >
                ←
              </button>

              <span className="min-w-[140px] text-center font-semibold text-gray-700">
                {selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </span>

              <button
                onClick={() =>
                  setSelectedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
                }
                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-white shadow hover:bg-gray-50 transition"
              >
                →
              </button>
            </div>

            {user && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Hi, {user.email}</span>
                <button
                  aria-label="Sign out"
                  className="p-2 rounded hover:bg-gray-100"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setUser(null);
                  }}
                >
                  <LogOutIcon
                    className="text-red-500 hover:text-red-700 transition-colors"
                    size={16}
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard */}
        <Dashboard
          totalBalance={dashboardTotalBalance}
          totalExpenses={dashboardTotalExpenses}
          totalInvestments={dashboardTotalInvestments}
          monthlyChange={dashboardMonthlyChange}
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
              netWorth={metrics.netWorth}
              annualExpenses={metrics.annualExpenses}
              monthlyIncome={metrics.monthlyIncome}
              monthlySavings={metrics.monthlySavings}
              investmentValue={metrics.investmentValue}
              liquidCash={liquidCash}
              investmentGain={metrics.investmentGain}
              investmentCost={metrics.investmentCost}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ExpenseChart expenses={expenses} categories={categories} />
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
                <ExpenseChart expenses={expenses} categories={categories} />
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
        <p className="text-sm text-gray-600 mb-6">
          Sign in or create an account to start tracking your finances.
        </p>

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: 'default',
            variables: {
              default: {
                colors: {
                  brand: '#3b82f6',
                  brandAccent: '#2563eb',
                  brandButtonText: '#ffffff',
                },
              },
            },
          }}
          providers={[]}
          redirectTo="http://localhost:5173"
        />
      </div>
    </div>
  );
}

export default App;
