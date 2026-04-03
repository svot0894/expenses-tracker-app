import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import type { Expenses } from '../../../lib/supabase';

interface ExpenseChartProps {
  expenses: Expenses[];
  categories: { id: string; name: string; color?: string | null }[];
}

export function ExpenseChart({ expenses, categories }: ExpenseChartProps) {
  const categoryTotals = expenses.reduce((acc, expense) => {
    const category = categories.find(c => c.id === expense.category_id);

    const name = category?.name || 'Unknown';
    const color = category?.color || '#9ca3af'; // fallback gray

    if (!acc[name]) {
      acc[name] = { value: 0, color };
    }

    acc[name].value += expense.amount;

    return acc;
  }, {} as Record<string, { value: number; color: string }>);

  const data = Object.entries(categoryTotals).map(([name, obj]) => ({
    name,
    value: obj.value,
    color: obj.color,
  }));

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Expenses by Category</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No expense data to display
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Expenses by Category</h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            outerRadius={100}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>

          <Tooltip
            formatter={(value: number) => `₣ ${value.toFixed(2)}`}
          />

          <Legend
            formatter={(value: string) => (
              <span className="text-sm text-gray-700">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}