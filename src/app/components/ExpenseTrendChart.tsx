import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Expenses } from '../../lib/supabase';

interface ExpenseTrendChartProps {
  expenses: Expenses[];
}

export function ExpenseTrendChart({ expenses }: ExpenseTrendChartProps) {
  if (expenses.length === 0) {
    return null;
  }

  // Group expenses by month
  const monthlyData = expenses.reduce((acc, expense) => {
    const month = expense.date.substring(0, 7);
    if (!acc[month]) {
      acc[month] = 0;
    }
    acc[month] += expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(monthlyData)
    .map(([month, amount]) => ({
      month: month, // Keep ISO for sorting
      displayMonth: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      amount
    }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()) // ✅ Sort chronologically
    .map(({ month, displayMonth, amount }) => ({
      month: displayMonth, // Use formatted month for chart
      amount
    }));

  if (data.length < 2) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Monthly Expense Trends</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
          <Legend />
          <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} name="Total Expenses" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
