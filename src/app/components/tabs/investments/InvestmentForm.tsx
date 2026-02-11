import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { Investments } from '../../../../lib/supabase';

interface InvestmentFormProps {
  onAddInvestment: (investment: Omit<Investments, 'id'>) => void;
}

const investmentTypes = [
  'Stocks',
  'Bonds',
  'Mutual Funds',
  'ETFs',
  'Real Estate',
  'Cryptocurrency',
  'Other'
];

export function InvestmentForm({ onAddInvestment }: InvestmentFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [type, setType] = useState(investmentTypes[0]);
  const [amount, setAmount] = useState('');
  const [currentvalue, setCurrentValue] = useState('');
  const [purchasedate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !currentvalue) return;

    onAddInvestment({
      description,
      type,
      amount: parseFloat(amount),
      currentvalue: parseFloat(currentvalue),
      purchasedate
    });

    setDescription('');
    setType(investmentTypes[0]);
    setAmount('');
    setCurrentValue('');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
      >
        <Plus size={20} />
        Add Investment
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Add New Investment</h3>
        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
          <X size={20} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Investment Name</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="e.g., Apple Stock"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {investmentTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Initial Amount ($)</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="0.00"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Value ($)</label>
          <input
            type="number"
            step="0.01"
            value={currentvalue}
            onChange={(e) => setCurrentValue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="0.00"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
          <input
            type="date"
            value={purchasedate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Add Investment
        </button>
      </form>
    </div>
  );
}
