import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface DashboardProps {
  totalBalance: number;
  totalExpenses: number;
  totalInvestments: number;
  monthlyChange: number;
}

export function Dashboard({ totalBalance, totalExpenses, totalInvestments, monthlyChange }: DashboardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm mb-1">Total Balance</p>
            <p className="text-2xl font-semibold">${totalBalance.toLocaleString()}</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <Wallet className="text-blue-600" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm mb-1">Monthly Expenses</p>
            <p className="text-2xl font-semibold">${totalExpenses.toLocaleString()}</p>
          </div>
          <div className="bg-red-100 p-3 rounded-full">
            <TrendingDown className="text-red-600" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm mb-1">Total Investments</p>
            <p className="text-2xl font-semibold">${totalInvestments.toLocaleString()}</p>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <TrendingUp className="text-green-600" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm mb-1">Monthly Change</p>
            <p className={`text-2xl font-semibold ${monthlyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {monthlyChange >= 0 ? '+' : ''}{monthlyChange.toFixed(1)}%
            </p>
          </div>
          <div className={`${monthlyChange >= 0 ? 'bg-green-100' : 'bg-red-100'} p-3 rounded-full`}>
            <DollarSign className={monthlyChange >= 0 ? 'text-green-600' : 'text-red-600'} size={24} />
          </div>
        </div>
      </div>
    </div>
  );
}
