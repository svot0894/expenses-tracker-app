import { useState } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';

/**
 * Imported expense shape from CSV (NOT your DB Expenses type).
 * We keep category as a name here, so App.tsx can map it to category_id.
 */
export type ImportedExpense = {
  description: string;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
};

interface CSVUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onImportExpenses: (expenses: ImportedExpense[]) => void;
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
    date: '',
  });
  const [error, setError] = useState('');

  // -----------------------
  // Helpers
  // -----------------------
  const cleanCell = (value: string) =>
    (value ?? '')
      .trim()
      .replace(/(^"|"$)/g, '')      // strip wrapping quotes
      .replace(/[₣€$]/g, '')        // strip common currency symbols
      .trim();

  const detectDelimiter = (headerLine: string) => {
    const candidates = ['|', ';', ','] as const;
    const counts = candidates.map((d) => ({
      d,
      c: headerLine.split(d).length,
    }));
    counts.sort((a, b) => b.c - a.c);
    return counts[0].c > 1 ? counts[0].d : '|';
  };

  // Basic CSV line split that respects quotes.
  const splitLine = (line: string, delimiter: string) => {
    const out: string[] = [];
    let cur = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];

      if (ch === '"') {
        // toggle quotes, allow escaped quotes ("")
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (ch === delimiter && !inQuotes) {
        out.push(cur);
        cur = '';
        continue;
      }

      cur += ch;
    }
    out.push(cur);
    return out;
  };

  const parseAmount = (raw: string): number => {
    const s0 = cleanCell(raw);

    // remove spaces
    let s = s0.replace(/\s/g, '');

    // handle Swiss thousand separators: 1'234.50
    s = s.replace(/'/g, '');

    // If format looks like EU: 1.234,56 -> remove thousands dots and swap comma -> dot
    const hasComma = s.includes(',');
    const hasDot = s.includes('.');
    if (hasComma && hasDot) {
      // assume dots are thousands and comma is decimal
      s = s.replace(/\./g, '').replace(',', '.');
    } else if (hasComma && !hasDot) {
      // assume comma is decimal
      s = s.replace(',', '.');
    }

    // strip any remaining non-numeric except minus and dot
    s = s.replace(/[^0-9.-]/g, '');

    const n = Number.parseFloat(s);
    return Number.isFinite(n) ? n : NaN;
  };

  const pad2 = (n: number) => String(n).padStart(2, '0');

  const toISODate = (raw: string): string | null => {
    const s = cleanCell(raw);

    // 1) ISO already: YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

    // 2) DD.MM.YYYY or DD/MM/YYYY
    const dmy = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
    if (dmy) {
      const dd = Number(dmy[1]);
      const mm = Number(dmy[2]);
      const yyyy = Number(dmy[3]);
      if (dd >= 1 && dd <= 31 && mm >= 1 && mm <= 12) {
        return `${yyyy}-${pad2(mm)}-${pad2(dd)}`;
      }
    }

    // 3) Fallback: try Date parsing (works for many ISO-ish strings)
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }

    return null;
  };

  const parseCSV = (text: string): { headers: string[]; rows: CSVRow[] } => {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) return { headers: [], rows: [] };

    const delimiter = detectDelimiter(lines[0]);

    const rawHeaders = splitLine(lines[0], delimiter).map(cleanCell);
    const finalHeaders = rawHeaders.map((h) => h.replace(/\uFEFF/g, '').trim()); // remove BOM if present

    const rows = lines.slice(1).map((line) => {
      const values = splitLine(line, delimiter).map(cleanCell);
      const row: CSVRow = {};
      finalHeaders.forEach((header, index) => {
        row[header] = values[index] ?? '';
      });
      return row;
    });

    return { headers: finalHeaders, rows };
  };

  const autoDetectColumns = (hdrs: string[]) => {
    const h = hdrs.map((x) => x.toLowerCase());

    const find = (pred: (s: string) => boolean) => {
      const idx = h.findIndex(pred);
      return idx >= 0 ? hdrs[idx] : '';
    };

    return {
      description: find((s) => s.includes('description') || s.includes('name') || s.includes('title') || s.includes('text')),
      amount: find((s) => s.includes('amount') || s.includes('price') || s.includes('cost') || s.includes('value') || s.includes('debit')),
      category: find((s) => s.includes('category') || s.includes('type') || s.includes('merchant category')),
      date: find((s) => s.includes('date') || s.includes('booking') || s.includes('transaction')),
    };
  };

  // -----------------------
  // Handlers
  // -----------------------
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = String(event.target?.result ?? '');
        const { headers, rows } = parseCSV(text);

        if (headers.length === 0 || rows.length === 0) {
          setError('Invalid CSV file or empty file');
          return;
        }

        setHeaders(headers);
        setCSVData(rows);
        setError('');

        setColumnMapping(autoDetectColumns(headers));
      } catch {
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
      const imported: ImportedExpense[] = csvData
        .map((row) => {
          const amount = parseAmount(row[columnMapping.amount]);
          const isoDate = toISODate(row[columnMapping.date]);

          return {
            description: cleanCell(row[columnMapping.description]) || 'Untitled',
            amount: Number.isFinite(amount) ? amount : 0,
            category: cleanCell(row[columnMapping.category]) || 'Other',
            date: isoDate ?? new Date().toISOString().split('T')[0],
          };
        })
        .filter((exp) => exp.amount > 0);

      if (imported.length === 0) {
        setError('No valid expense rows found (amount must be > 0).');
        return;
      }

      onImportExpenses(imported);

      // reset & close
      onClose();
      setCSVData([]);
      setHeaders([]);
      setColumnMapping({ description: '', amount: '', category: '', date: '' });
      setError('');
    } catch {
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload CSV File</label>
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
                    {headers.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                  <select
                    value={columnMapping.amount}
                    onChange={(e) => setColumnMapping({ ...columnMapping, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select column...</option>
                    {headers.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={columnMapping.category}
                    onChange={(e) => setColumnMapping({ ...columnMapping, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select column...</option>
                    {headers.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <select
                    value={columnMapping.date}
                    onChange={(e) => setColumnMapping({ ...columnMapping, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select column...</option>
                    {headers.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Preview */}
          {csvData.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">Preview ({csvData.length} rows)</h4>
              <div className="overflow-x-auto max-h-48 overflow-y-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {headers.map((header) => (
                        <th
                          key={header}
                          className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {csvData.slice(0, 5).map((row, idx) => (
                      <tr key={idx}>
                        {headers.map((header) => (
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