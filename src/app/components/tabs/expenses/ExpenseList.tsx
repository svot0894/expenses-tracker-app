import { Trash2, Edit2 } from 'lucide-react';
import type { Expenses } from '../../../../lib/supabase';

interface ExpenseListProps {
  expenses: Expenses[];
  onDeleteExpense: (id: string) => void;
  onEditExpense: (expense: Expenses) => void;
  categories: { id: string; name: string; color?: string | null }[];
}

export function ExpenseList({
  expenses,
  onDeleteExpense,
  onEditExpense,
  categories
}: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
        No expenses recorded yet. Add your first expense above.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="divide-y divide-gray-200 max-h-[60vh] overflow-y-auto">
        {expenses.map((expense) => {
          const categoryObj = categories.find(c => c.id === expense.category_id);

          const category = categoryObj?.name || 'Unknown';
          const color = categoryObj?.color || '#9ca3af';

          return (
            <div key={expense.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-medium text-gray-900">
                      {expense.description}
                    </h4>

                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: `${color}20`,
                        color: color,
                      }}
                    >
                      {category}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500">
                    {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <p className="text-lg font-semibold text-gray-900">
                    ₣ {expense.amount.toFixed(2)}
                  </p>

                  <button
                    onClick={() => onEditExpense(expense)}
                    className="text-blue-600"
                  >
                    <Edit2 size={18} />
                  </button>

                  <button
                    onClick={() => onDeleteExpense(expense.id)}
                    className="text-red-600"
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