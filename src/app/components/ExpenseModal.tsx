import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Expense } from './ExpenseForm';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id'>) => void;
  categories: string[];
  expense?: Expense;
}

export function ExpenseModal({ isOpen, onClose, onSave, categories, expense }: ExpenseModalProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0] || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (expense) {
      setTitle(expense.title);
      setAmount(expense.amount.toString());
      setCategory(expense.category);
      setDate(expense.date);
    } else {
      setTitle('');
      setAmount('');
      setCategory(categories[0] || '');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [expense, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    onSave({
      title,
      amount: parseFloat(amount),
      category,
      date
    });

    setTitle('');
    setAmount('');
    setCategory(categories[0] || '');
    setDate(new Date().toISOString().split('T')[0]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{expense ? 'Edit Expense' : 'Add New Expense'}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Grocery shopping"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {expense ? 'Update Expense' : 'Add Expense'}
          </button>
        </form>
      </div>
    </div>
  );
}
