import { useState } from 'react';
import { Trash2, Pencil, Check, X } from 'lucide-react';
import type { Categories } from '../../../../lib/supabase';

interface CategoryManagerProps {
  categories: Categories[];
  onAddCategory: (category: string, color: string) => void;
  onUpdateCategory: (categoryId: string, newName: string, newColor: string) => void;
  onDeleteCategory: (category: string) => void;
}

export function CategoryManager({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory
}: CategoryManagerProps) {
  const [newCategory, setNewCategory] = useState('');
  const [newColor, setNewColor] = useState('#3b82f6');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('#3b82f6');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    onAddCategory(newCategory.trim(), newColor);
    setNewCategory('');
    setNewColor('#3b82f6');
  };

  const startEdit = (category: Categories) => {
    setEditingId(category.id);
    setEditName(category.name || '');
    setEditColor(category.color || '#3b82f6');
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = (id: string) => {
    if (!editName.trim()) return;

    onUpdateCategory(id, editName.trim(), editColor);
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      {/* Add Category */}
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <input
          type="color"
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
          className="w-10 h-10 border rounded cursor-pointer"
        />

        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New category name"
          className="flex-1 px-3 py-2 border rounded-lg"
          required
        />

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Add
        </button>
      </form>

      {/* Category List */}
      <div className="space-y-2">
        {categories.map((category) => {
          const isEditing = editingId === category.id;

          return (
            <div
              key={category.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              {isEditing ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="color"
                    value={editColor}
                    onChange={(e) => setEditColor(e.target.value)}
                    className="w-8 h-8"
                  />

                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-2 py-1 border rounded"
                  />

                  <button
                    onClick={() => saveEdit(category.id)}
                    className="text-green-600"
                  >
                    <Check size={16} />
                  </button>

                  <button
                    onClick={cancelEdit}
                    className="text-gray-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color || '#ccc' }}
                    />
                    <span className="text-sm font-medium text-gray-800">
                      {category.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(category)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => onDeleteCategory(category.name)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}