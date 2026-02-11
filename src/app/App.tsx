import { useState, useEffect } from 'react';
import { Wallet } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { ExpenseList } from './components/ExpenseList';
import { InvestmentForm } from './components/InvestmentForm';
import { InvestmentList } from './components/InvestmentList';
import { ExpenseChart } from './components/ExpenseChart';
//import { InvestmentChart } from './components/InvestmentChart';
import { IncomeForm, type Income } from './components/IncomeForm';
import { IncomeList } from './components/IncomeList';
import { FinancialKPIs } from './components/FinancialKPIs';
import { CSVUploader } from './components/CSVUploader';
import { ExpenseTrendChart } from './components/ExpenseTrendChart';
import { ExpenseModal } from './components/ExpenseModal';
import { InvestmentPerformance } from './components/InvestmentPerformance';
import { Settings } from './components/Settings';
import { IncomeCashManager } from './components/IncomeCashManager';

import { supabase, type Expenses, type ExpenseInsert, type ExpenseUpdate } from '../lib/supabase';
import { type Categories } from '../lib/supabase';
import { type Investments, type InvestmentInsert } from '../lib/supabase';

function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'investments' | 'income' | 'settings'>('overview');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expenses | undefined>(undefined);
  
  // State for categories and expenses
  const [categories, setCategories] = useState<Categories[]>([]);
  const [expenses, setExpenses] = useState<Expenses[]>([]);
  const [investments, setInvestments] = useState<Investments[]>([]);

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

  const [liquidCash, setLiquidCash] = useState(80000); // Emergency fund

  // Fetch data from Supabase on mount
  useEffect(() => {
    const fetchData = async () => {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*');

      if (!categoriesError && categoriesData) {
        setCategories(categoriesData);
      };

      // Fetch expenses
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (!expensesError && expensesData) {
        setExpenses(expensesData);
      };

      // Fetch investments
      const { data: investmentsData, error: investmentsError } = await supabase
        .from('investments')
        .select('*')
        .order('purchasedate', { ascending: false });

      if (!investmentsError && investmentsData) {
        setInvestments(investmentsData);
      }
    };

    fetchData();
  }, []);

  // Handlers for expenses
  const handleCloseExpenseModal = () => {
    setIsExpenseModalOpen(false);
    setEditingExpense(undefined);
  };

  const handleImportExpenses = (importedExpenses: Omit<Expenses, 'id'>[]) => {
    const newExpenses = importedExpenses.map(exp => ({
      ...exp,
      id: Date.now().toString() + Math.random().toString()
    }));
    setExpenses([...newExpenses, ...expenses]);
  };

  const handleAddExpense = async (expense: Omit<Expenses, 'id'>) => {
    const insertData : ExpenseInsert = {
      ...expense
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
      const updateData : ExpenseUpdate = {
        ...expense
      };
      const { data, error } = await supabase
        .from('expenses')
        .update(updateData)
        .eq('id', editingExpense.id)
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
      .eq('id', id);

    if (error) {
      console.error('Error deleting expense:', error);
      return;
    }
    setExpenses(expenses.filter(e => e.id !== id));
  };

  // Handlers for investments
  const handleAddInvestment = async(investment: Omit<Investments, 'id'>) => {
    const insertData : InvestmentInsert = {
      ...investment
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
      .eq('id', id);

    if (error) {
      console.error('Error deleting investment:', error);
      return;
    }
    setInvestments(investments.filter(i => i.id !== id));
  };

  // Handlers for income
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

  // Handlers for categories
  const handleAddCategory = async (category: string) => {
    if (category && !categories.some(c => c.name === category)) {
      const { data, error } = await supabase
        .from('categories')
        .insert({ name: category })
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
        .eq('id', categoryToDelete.id);

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
  const annualIncome = monthlyIncome * 12;
  const annualExpenses = totalExpenses * 12;
  const monthlySavings = monthlyIncome - totalExpenses;
  const netWorth = totalInvestments + liquidCash - 0; // Assuming no debt for now

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
                  <CSVUploader onImportExpenses={handleImportExpenses} />
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
      </main>
    </div>
  );
}

export default App;