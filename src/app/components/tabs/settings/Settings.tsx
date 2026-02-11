import { type Categories } from '../../../../lib/supabase';
import { CategoryManager } from './CategoryManager';

interface SettingsProps {
  categories: Categories[];
  onAddCategory: (category: string) => void;
  onDeleteCategory: (category: string) => void;
}

export function Settings({ categories, onAddCategory, onDeleteCategory }: SettingsProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Settings</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Expense Categories</h3>
            <CategoryManager
              categories={categories}
              onAddCategory={onAddCategory}
              onDeleteCategory={onDeleteCategory}
            />
          </div>

          {/* Future settings sections can go here */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">About</h3>
            <p className="text-sm text-gray-600">Finance Tracker v1.0</p>
            <p className="text-sm text-gray-600 mt-1">Track expenses, investments, and financial goals</p>
          </div>
        </div>
      </div>
    </div>
  );
}
