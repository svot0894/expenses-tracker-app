import { Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import type { Investments } from '../../../../lib/supabase';

interface InvestmentListProps {
  investments: Investments[];
  onDeleteInvestment: (id: string) => void;
}

const typeColors: Record<string, string> = {
  'Stocks': 'bg-blue-100 text-blue-800',
  'Bonds': 'bg-green-100 text-green-800',
  'Mutual Funds': 'bg-purple-100 text-purple-800',
  'ETFs': 'bg-indigo-100 text-indigo-800',
  'Real Estate': 'bg-yellow-100 text-yellow-800',
  'Cryptocurrency': 'bg-orange-100 text-orange-800',
  'Other': 'bg-gray-100 text-gray-800'
};

export function InvestmentList({ investments, onDeleteInvestment }: InvestmentListProps) {
  if (investments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        No investments recorded yet. Add your first investment above.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="divide-y divide-gray-200">
        {investments.map((investment) => {
          const gain = investment.currentvalue - investment.amount;
          const gainPercent = (gain / investment.amount) * 100;
          const isPositive = gain >= 0;

          return (
            <div key={investment.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-medium text-gray-900">{investment.description}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${typeColors[investment.type]}`}>
                      {investment.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Purchased: {new Date(investment.purchasedate).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-600">
                      Initial: ${investment.amount.toFixed(2)}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className="text-sm text-gray-600">
                      Current: ${investment.currentvalue.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                      <span className="font-semibold">
                        {isPositive ? '+' : ''}{gainPercent.toFixed(2)}%
                      </span>
                    </div>
                    <p className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositive ? '+' : ''}{gain.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => onDeleteInvestment(investment.id)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
