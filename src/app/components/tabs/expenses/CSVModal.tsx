// CSVModal.tsx (updated to be a modal)

import { useState } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import type { Expenses } from '../../../../lib/supabase';

interface CSVUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onImportExpenses: (expenses: Omit<Expenses, 'id'>[]) => void;
}

interface CSVRow {
  [key: string]: string;
}

export function CSVModal({ isOpen, onClose, onImportExpenses }: CSVUploaderProps) {
  const [csvData, setCSVData] = useState<CSVRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState({
    description: '',
    amount: '',
    category: '',
    date: ''
  });
  const [error, setError] = useState('');

  const parseCSV = (text: string): { headers: string[], rows: CSVRow[] } => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return { headers: [], rows: [] };

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const row: CSVRow = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });

    return { headers, rows };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const { headers, rows } = parseCSV(text);

        if (headers.length === 0 || rows.length === 0) {
          setError('Invalid CSV file or empty file');
          return;
        }

        setHeaders(headers);
        setCSVData(rows);
        setError('');

        // Auto-detect columns
        const mapping = {
          description: headers.find(h => h.toLowerCase().includes('description') || h.toLowerCase().includes('description') || h.toLowerCase().includes('name')) || '',
          amount: headers.find(h => h.toLowerCase().includes('amount') || h.toLowerCase().includes('price') || h.toLowerCase().includes('cost')) || '',
          category: headers.find(h => h.toLowerCase().includes('category') || h.toLowerCase().includes('type')) || '',
          date: headers.find(h => h.toLowerCase().includes('date')) || ''
        };
        setColumnMapping(mapping);
      } catch (err) {
        setError('Error parsing CSV file');
      }
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!columnMapping.description || !columnMapping.amount || !columnMapping.category || !columnMapping.date) {
      setError('Please map all required columns');
      return;
    }

    try {
      const expenses: Omit<Expenses, 'id'>[] = csvData.map(row => {
        let amount = parseFloat(row[columnMapping.amount]);
        if (isNaN(amount)) {
          const cleanAmount = row[columnMapping.amount].replace(/[$,]/g, '');
          amount = parseFloat(cleanAmount);
        }

        let dateStr = row[columnMapping.date];
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          dateStr = new Date().toISOString().split('T')[0];
        } else {
          dateStr = date.toISOString().split('T')[0];
        }

        return {
          description: row[columnMapping.description] || 'Untitled',
          amount: isNaN(amount) ? 0 : amount,
          category: row[columnMapping.category] || 'Other',
          date: dateStr
        };
      }).filter(exp => exp.amount > 0);

      onImportExpenses(expenses);
      onClose(); // Close modal after import
      setCSVData([]);
      setHeaders([]);
      setColumnMapping({ description: '', amount: '', category: '', date: '' });
      setError('');
    } catch (err) {
      setError('Error importing expenses. Please check your data.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Import Expenses from CSV</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                cursor-pointer"
            />
            <p className="text-xs text-gray-500 mt-1">
              CSV should contain columns for description, amount, category, and date
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="text-red-600" size={20} />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Column Mapping */}
          {headers.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Map CSV Columns</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title/Description *
                  </label>
                  <select
                    value={columnMapping.description}
                    onChange={(e) => setColumnMapping({ ...columnMapping, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select column...</option>
                    {headers.map(header => (
                      <option key={header} value={header}>{header}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount *
                  </label>
                  <select
                    value={columnMapping.amount}
                    onChange={(e) => setColumnMapping({ ...columnMapping, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select column...</option>
                    {headers.map(header => (
                      <option key={header} value={header}>{header}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={columnMapping.category}
                    onChange={(e) => setColumnMapping({ ...columnMapping, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select column...</option>
                    {headers.map(header => (
                      <option key={header} value={header}>{header}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <select
                    value={columnMapping.date}
                    onChange={(e) => setColumnMapping({ ...columnMapping, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select column...</option>
                    {headers.map(header => (
                      <option key={header} value={header}>{header}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Preview */}
          {csvData.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">
                Preview ({csvData.length} rows)
              </h4>
              <div className="overflow-x-auto max-h-48 overflow-y-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {headers.map(header => (
                        <th key={header} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {csvData.slice(0, 5).map((row, idx) => (
                      <tr key={idx}>
                        {headers.map(header => (
                          <td key={header} className="px-3 py-2 text-gray-900">
                            {row[header]}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          {csvData.length > 0 && (
            <div className="flex gap-3">
              <button
                onClick={handleImport}
                disabled={!columnMapping.description || !columnMapping.amount || !columnMapping.category || !columnMapping.date}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check size={20} />
                Import {csvData.length} Expenses
              </button>
              <button
                onClick={() => {
                  setCSVData([]);
                  setHeaders([]);
                  setColumnMapping({ description: '', amount: '', category: '', date: '' });
                  setError('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}