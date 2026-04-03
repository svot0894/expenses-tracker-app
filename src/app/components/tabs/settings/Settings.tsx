import { useState } from 'react';
import { type Categories } from '../../../../lib/supabase';
import { CategoryManager } from './CategoryManager';

interface SettingsProps {
  categories: Categories[];
  onAddCategory: (category: string, color: string) => void;
  onUpdateCategory: (categoryId: string, newName: string, newColor: string) => void;
  onDeleteCategory: (category: string) => void;

  members: { user_id: string; name?: string; email?: string }[];
  onInviteMember: (email: string) => void;
  onRemoveMember: (userId: string) => void;
}

export function Settings({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  members,
  onInviteMember,
  onRemoveMember,
}: SettingsProps) {
  const [inviteEmail, setInviteEmail] = useState('');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Settings</h2>

        <div className="space-y-8">

          {/* ----------------------- */}
          {/* Categories */}
          {/* ----------------------- */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Expense Categories
            </h3>

            <CategoryManager
              categories={categories}
              onAddCategory={onAddCategory}
              onUpdateCategory={onUpdateCategory}
              onDeleteCategory={onDeleteCategory}
            />
          </div>

          {/* ----------------------- */}
          {/* Family Members */}
          {/* ----------------------- */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Family Members
            </h3>

            {/* Invite */}
            <div className="flex gap-3 mb-4">
              <input
                type="email"
                placeholder="Enter email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="border rounded px-3 py-2 text-sm w-full"
              />

              <button
                onClick={() => {
                  if (!inviteEmail.trim()) return;
                  onInviteMember(inviteEmail);
                  setInviteEmail('');
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                Invite
              </button>
            </div>

            {/* Members List */}
            <div className="space-y-2">
              {members.length === 0 && (
                <p className="text-sm text-gray-500">
                  No family members yet
                </p>
              )}

              {members.map((member) => (
                <div
                  key={member.user_id}
                  className="flex justify-between items-center border p-2 rounded"
                >
                  <span>
                    {member.email || member.name || member.user_id}
                  </span>

                  <button
                    onClick={() => onRemoveMember(member.user_id)}
                    className="text-red-500 text-sm hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ----------------------- */}
          {/* About */}
          {/* ----------------------- */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              About
            </h3>
            <p className="text-sm text-gray-600">
              Finance Tracker v1.0
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Track expenses, investments, and financial goals
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}