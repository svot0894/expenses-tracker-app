import { useState } from 'react';
import { DollarSign, Edit2, Check, X } from 'lucide-react';

interface IncomeCashManagerProps {
  liquidCash: number;
  onUpdateCash: (amount: number) => void;
}

export function IncomeCashManager({ liquidCash, onUpdateCash }: IncomeCashManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editAmount, setEditAmount] = useState(liquidCash.toString());

  const handleSave = () => {
    const amount = parseFloat(editAmount);
    if (!isNaN(amount) && amount >= 0) {
      onUpdateCash(amount);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditAmount(liquidCash.toString());
    setIsEditing(false);
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-3 rounded-full">
            <DollarSign className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Emergency Fund / Liquid Cash</h3>
            <p className="text-sm text-gray-600">Total cash available for emergencies</p>
          </div>
        </div>
        {!isEditing ? (
          <div className="flex items-center gap-4">
            <p className="text-3xl font-bold text-gray-900">${liquidCash.toLocaleString()}</p>
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-700 transition-colors p-2 hover:bg-blue-100 rounded-lg"
            >
              <Edit2 size={20} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gray-700 mr-2">$</span>
              <input
                type="number"
                step="0.01"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-semibold"
                autoFocus
              />
            </div>
            <button
              onClick={handleSave}
              className="text-green-600 hover:text-green-700 transition-colors p-2 hover:bg-green-100 rounded-lg"
            >
              <Check size={20} />
            </button>
            <button
              onClick={handleCancel}
              className="text-red-600 hover:text-red-700 transition-colors p-2 hover:bg-red-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
