'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import Papa from 'papaparse';
import { toast } from 'sonner';
import type { ImportResult } from '@/types';

// Extended result from the import API (includes duplicates)
interface ImportResultExtended extends ImportResult {
  duplicates?: string[];
}

export function StudentImport({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResultExtended | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setResult(null);
    Papa.parse<string[]>(f, {
      preview: 5,
      complete: (res) => setPreview(res.data),
      error: () => toast.error('Could not read CSV file.'),
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f?.type === 'text/csv' || f?.name.endsWith('.csv')) {
      handleFile(f);
    } else {
      toast.error('Please drop a CSV file.');
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);

    Papa.parse<{ digital_id: string; name: string; batch: string; degree: string; dept: string; email?: string }>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (res) => {
        try {
          const response = await fetch('/api/admin/students/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rows: res.data }),
          });
          const json = await response.json();
          if (!response.ok) {
            toast.error(json.error ?? 'Import failed.');
            // Still show result if duplicates were detected
            if (json.data) setResult(json.data);
            return;
          }
          setResult(json.data);
          toast.success(`Imported ${json.data.imported} students.`);
        } catch {
          toast.error('Network error during import.');
        } finally {
          setImporting(false);
        }
      },
      error: () => {
        toast.error('Failed to parse CSV.');
        setImporting(false);
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative glass border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-semibold text-lg">Import Students (CSV)</h2>
          <button onClick={onClose} className="text-[#848C9B] hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Format hint — matches student_registry columns */}
        <div className="mb-4 p-3 rounded-lg bg-[#91A9C9]/5 border border-[#91A9C9]/20">
          <p className="text-[#91A9C9] text-xs font-mono whitespace-pre-wrap">
            {`digital_id,name,batch,degree,dept,email\n3122245001127,Ruusheka Akilavarshini,2023,B.E.,CSE,r@ssn.edu.in`}
          </p>
        </div>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-white/10 hover:border-[#91A9C9]/40 rounded-xl p-8 text-center cursor-pointer transition-colors mb-4"
        >
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          <Upload size={24} className="text-[#848C9B] mx-auto mb-2" />
          {file ? (
            <div>
              <div className="flex items-center justify-center gap-2 text-[#91A9C9]">
                <FileText size={16} />
                <span className="font-medium text-sm">{file.name}</span>
              </div>
              <p className="text-[#848C9B] text-xs mt-1">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
          ) : (
            <>
              <p className="text-[#848C9B] text-sm">Drop CSV file here or click to browse</p>
            </>
          )}
        </div>

        {/* Preview */}
        {preview.length > 0 && !result && (
          <div className="mb-4 overflow-hidden rounded-lg border border-white/10">
            <div className="bg-white/5 px-3 py-2 text-[#848C9B] text-xs font-medium">
              Preview (first {preview.length} rows)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className="border-t border-white/5">
                      {row.map((cell, j) => (
                        <td key={j} className="px-3 py-2 text-[#B2B4AB] font-mono">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className={`mb-4 p-4 rounded-xl border space-y-2 ${
            (result.duplicates?.length ?? 0) > 0
              ? 'border-red-500/30 bg-red-500/5'
              : 'border-green-500/20 bg-green-500/5'
          }`}>
            <div className={`flex items-center gap-2 font-medium text-sm ${
              (result.duplicates?.length ?? 0) > 0 ? 'text-red-400' : 'text-green-400'
            }`}>
              {(result.duplicates?.length ?? 0) > 0 ? (
                <><AlertCircle size={16} />Import Stopped — Duplicate Digital IDs Detected</>
              ) : (
                <><CheckCircle2 size={16} />Import Complete</>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2 text-sm">
              <div className="text-center">
                <div className="text-white font-bold text-xl">{result.imported}</div>
                <div className="text-[#848C9B] text-xs">Imported</div>
              </div>
              <div className="text-center">
                <div className="text-amber-400 font-bold text-xl">{result.skipped}</div>
                <div className="text-[#848C9B] text-xs">Skipped</div>
              </div>
              <div className="text-center">
                <div className="text-red-400 font-bold text-xl">{result.errors.length}</div>
                <div className="text-[#848C9B] text-xs">Errors</div>
              </div>
              <div className="text-center">
                <div className="text-orange-400 font-bold text-xl">{result.duplicates?.length ?? 0}</div>
                <div className="text-[#848C9B] text-xs">Duplicates</div>
              </div>
            </div>
            {(result.duplicates?.length ?? 0) > 0 && (
              <div className="mt-2 p-3 rounded-lg bg-red-900/20 border border-red-500/30">
                <p className="text-red-300 text-xs font-semibold mb-1">
                  ⚠ Resolve these duplicate Digital IDs in the CSV before re-importing:
                </p>
                <div className="max-h-24 overflow-y-auto space-y-1">
                  {result.duplicates?.map((d, i) => (
                    <p key={i} className="text-red-400 text-xs font-mono">{d}</p>
                  ))}
                </div>
              </div>
            )}
            {result.errors.length > 0 && (result.duplicates?.length ?? 0) === 0 && (
              <div className="mt-2 max-h-24 overflow-y-auto space-y-1">
                {result.errors.map((e, i) => (
                  <p key={i} className="text-red-400 text-xs">{e}</p>
                ))}
              </div>
            )}
          </div>
        )}


        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/10 text-[#848C9B] hover:text-white text-sm font-medium transition-all"
          >
            {result ? 'Done' : 'Cancel'}
          </button>
          {!result && (
            <button
              onClick={handleImport}
              disabled={!file || importing}
              className="flex-1 py-3 rounded-xl bg-[#91A9C9] text-[#040411] font-semibold text-sm disabled:opacity-40 transition-all flex items-center justify-center gap-2"
            >
              {importing ? (
                <><Loader2 size={14} className="animate-spin" />Importing...</>
              ) : (
                'Import Students'
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
