import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { Expenses } from '../../../lib/supabase';

interface ExpenseChartProps {
  expenses: Expenses[];
  categories: { id: string; name: string }[];
}

const COLORS = [
  '#f97316', // orange
  '#3b82f6', // blue
  '#a855f7', // purple
  '#ec4899', // pink
  '#eab308', // yellow
  '#22c55e', // green
  '#6b7280'  // gray
];

export function ExpenseChart({ expenses, categories }: ExpenseChartProps) {
  const categoryTotals = expenses.reduce((acc, expense) => {
    const category = categories.find(c => c.id === expense.category_id)?.name || 'Unknown';
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value
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
            cx="50%"
            cy="50%"
            labelLine={false}
            label={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => `₣ ${value.toFixed(2)}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
