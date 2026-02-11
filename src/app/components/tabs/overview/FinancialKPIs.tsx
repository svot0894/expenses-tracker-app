import { Target, TrendingUp, Shield, Calendar, PiggyBank, Zap } from 'lucide-react';

interface FinancialKPIsProps {
  netWorth: number;
  annualExpenses: number;
  monthlyIncome: number;
  monthlySavings: number;
  investmentValue: number;
  liquidCash: number;
  investmentGain: number;
  investmentCost: number;
}

export function FinancialKPIs({
  netWorth,
  annualExpenses,
  monthlyIncome,
  monthlySavings,
  investmentValue,
  liquidCash,
  investmentGain,
  investmentCost
}: FinancialKPIsProps) {
  // Financial Independence Ratio (FI Ratio)
  // Net Worth / (Annual Expenses * 25) or Net Worth / Annual Expenses in years
  const fiRatio = annualExpenses > 0 ? (netWorth / annualExpenses) : 0;
  const fiPercentage = annualExpenses > 0 ? (netWorth / (annualExpenses * 25)) * 100 : 0;

  // Savings Rate
  const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

  // Emergency Fund (in months)
  const monthlyExpenses = annualExpenses / 12;
  const emergencyFundMonths = monthlyExpenses > 0 ? liquidCash / monthlyExpenses : 0;

  // Investment Rate
  const investmentRate = monthlyIncome > 0 ? (investmentValue / (monthlyIncome * 12)) * 100 : 0;

  // Years to FI (assuming 4% withdrawal rate, 25x expenses rule)
  const targetFI = annualExpenses * 25;
  const yearsToFI = monthlySavings > 0 && targetFI > netWorth 
    ? ((targetFI - netWorth) / (monthlySavings * 12)) 
    : 0;

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Financial KPIs</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Net Worth */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <PiggyBank className="text-blue-600" size={20} />
            </div>
            <h3 className="font-medium text-gray-700">Net Worth</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">${netWorth.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Total assets - liabilities</p>
        </div>

        {/* Financial Independence Ratio */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-100 p-2 rounded-lg">
              <Target className="text-purple-600" size={20} />
            </div>
            <h3 className="font-medium text-gray-700">FI Ratio</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{fiRatio.toFixed(1)} years</p>
          <p className="text-xs text-gray-500 mt-1">
            {fiPercentage.toFixed(1)}% to FI (25x expenses)
          </p>
        </div>

        {/* Savings Rate */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-100 p-2 rounded-lg">
              <TrendingUp className="text-green-600" size={20} />
            </div>
            <h3 className="font-medium text-gray-700">Savings Rate</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{savingsRate.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-1">
            ${monthlySavings.toLocaleString()}/mo saved
          </p>
        </div>

        {/* Emergency Fund */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Shield className="text-orange-600" size={20} />
            </div>
            <h3 className="font-medium text-gray-700">Emergency Fund</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{emergencyFundMonths.toFixed(1)} months</p>
          <p className="text-xs text-gray-500 mt-1">
            ${liquidCash.toLocaleString()} in cash
          </p>
        </div>

        {/* Years to FI */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Calendar className="text-indigo-600" size={20} />
            </div>
            <h3 className="font-medium text-gray-700">Years to FI</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {yearsToFI > 0 && yearsToFI < 100 ? yearsToFI.toFixed(1) : '—'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            At current savings rate
          </p>
        </div>

        {/* Investment Ratio */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-teal-100 p-2 rounded-lg">
              <Zap className="text-teal-600" size={20} />
            </div>
            <h3 className="font-medium text-gray-700">Investment Ratio</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{investmentRate.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 mt-1">
            Investments vs annual income
          </p>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="font-medium text-gray-700 mb-3">Financial Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 mb-1">Debt-to-Income Ratio</p>
            <p className="text-xl font-bold text-blue-700">0%</p>
            <p className="text-xs text-blue-600 mt-1">No debt tracked</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm font-medium text-purple-900 mb-1">Expense-to-Income Ratio</p>
            <p className="text-xl font-bold text-purple-700">
              {monthlyIncome > 0 ? ((monthlyExpenses / monthlyIncome) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-xs text-purple-600 mt-1">
              {monthlyIncome > 0 && (monthlyExpenses / monthlyIncome) > 0.8 ? '⚠️ High' : '✅ Good'}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm font-medium text-green-900 mb-1">Investment Growth</p>
            <p className="text-xl font-bold text-green-700">
              {investmentCost > 0 ? ((investmentGain / investmentCost) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-xs text-green-600 mt-1">Overall portfolio performance</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-sm font-medium text-orange-900 mb-1">Average Daily Spending</p>
            <p className="text-xl font-bold text-orange-700">${(monthlyExpenses / 30).toFixed(2)}</p>
            <p className="text-xs text-orange-600 mt-1">Based on monthly average</p>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
          <p className="text-sm font-medium text-indigo-900 mb-1">💰 Financial Runway</p>
          <p className="text-2xl font-bold text-indigo-700">
            {monthlyExpenses > 0 ? ((liquidCash + investmentValue) / monthlyExpenses).toFixed(1) : '∞'} months
          </p>
          <p className="text-xs text-indigo-600 mt-1">
            Total assets can cover this many months of expenses
          </p>
        </div>
      </div>
    </div>
  );
}