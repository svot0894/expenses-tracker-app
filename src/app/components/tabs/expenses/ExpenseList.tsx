import { Trash2, Edit2 } from 'lucide-react';
import type { Expenses } from '../../../../lib/supabase';

interface ExpenseListProps {
  expenses: Expenses[];
  onDeleteExpense: (id: string) => void;
  onEditExpense: (expense: Expenses) => void;
  categories: { id: string; name: string }[];
}

const categoryColors: Record<string, string> = {
  'Food & Dining': 'bg-orange-100 text-orange-800',
  'Transportation': 'bg-blue-100 text-blue-800',
  'Shopping': 'bg-purple-100 text-purple-800',
  'Entertainment': 'bg-pink-100 text-pink-800',
  'Bills & Utilities': 'bg-yellow-100 text-yellow-800',
  'Healthcare': 'bg-green-100 text-green-800',
  'Other': 'bg-gray-100 text-gray-800'
};

export function ExpenseList({ expenses, onDeleteExpense, onEditExpense, categories }: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        No expenses recorded yet. Add your first expense above.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="divide-y divide-gray-200">
        {expenses.map((expense) => {
          const category = categories.find(c => c.id === expense.category_id)?.name || 'Unknown';
          const categoryColor = categoryColors[category] || 'bg-gray-100 text-gray-800';

          return (
            <div key={expense.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-medium text-gray-900">{expense.description}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${categoryColor}`}>
                      {category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-lg font-semibold text-gray-900">${expense.amount.toFixed(2)}</p>
                  <button
                    onClick={() => onEditExpense(expense)}
                    className="text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => onDeleteExpense(expense.id)}
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