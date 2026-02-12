import { TrendingUp, TrendingDown } from 'lucide-react';
import type { Investments } from '../../../../lib/supabase';

interface InvestmentPerformanceProps {
  investments: Investments[];
}

export function InvestmentPerformance({ investments }: InvestmentPerformanceProps) {
  if (investments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Investment Performance</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No investment data to display
        </div>
      </div>
    );
  }

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalCurrent = investments.reduce((sum, inv) => sum + inv.currentvalue, 0);
  const totalGain = totalCurrent - totalInvested;
  const totalGainPercent = (totalGain / totalInvested) * 100;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Investment Performance</h3>
      
      {/* Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Invested</p>
            <p className="text-xl font-bold text-gray-900">₣ {totalInvested.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Current Value</p>
            <p className="text-xl font-bold text-gray-900">₣ {totalCurrent.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Gain/Loss</p>
            <p className={`text-xl font-bold ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalGain >= 0 ? '+' : ''}{totalGainPercent.toFixed(2)}%
            </p>
            <p className={`text-sm ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalGain >= 0 ? '+' : ''}₣ {totalGain.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Individual Investments */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-700">Individual Holdings</h4>
        {investments.map((inv) => {
          const gain = inv.currentvalue - inv.amount;
          const gainPercent = (gain / inv.amount) * 100;
          const isPositive = gain >= 0;
          const allocationPercent = (inv.currentvalue / totalCurrent) * 100;

          return (
            <div key={inv.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900">{inv.description}</h5>
                  <p className="text-sm text-gray-500">{inv.type}</p>
                </div>
                <div className="text-right">
                  <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    <span className="font-semibold">
                      {isPositive ? '+' : ''}{gainPercent.toFixed(2)}%
                    </span>
                  </div>
                  <p className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? '+' : ''}₣ {gain.toFixed(2)}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                <div>
                  <p className="text-gray-500">Invested</p>
                  <p className="font-medium">₣ {inv.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Current</p>
                  <p className="font-medium">₣ {inv.currentvalue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Allocation</p>
                  <p className="font-medium">{allocationPercent.toFixed(1)}%</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(Math.abs(gainPercent), 100)}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
