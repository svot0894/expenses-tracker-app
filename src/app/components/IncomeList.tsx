import { Trash2 } from 'lucide-react';
import type { Income } from './IncomeForm';

interface IncomeListProps {
  incomes: Income[];
  onDeleteIncome: (id: string) => void;
}

export function IncomeList({ incomes, onDeleteIncome }: IncomeListProps) {
  if (incomes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        No income sources recorded yet. Add your first income source above.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="divide-y divide-gray-200">
        {incomes.map((income) => (
          <div key={income.id} className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-medium text-gray-900">{income.source}</h4>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                    {income.frequency}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{new Date(income.date).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-lg font-semibold text-green-600">${income.amount.toLocaleString()}</p>
                <button
                  onClick={() => onDeleteIncome(income.id)}
                  className="text-red-600 hover:text-red-700 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
