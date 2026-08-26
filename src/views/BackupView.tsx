import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { DatabaseBackup, Download, Upload, RotateCcw, Trash2, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';

const APP_KEYS = [
  'certifyai_institution',
  'certifyai_courses',
  'certifyai_students',
  'certifyai_certificates',
  'certifyai_audit_logs',
  'certifyai_theme',
];

export const BackupView: React.FC = () => {
  const { resetToDemoData, clearAllData } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const exportBackup = () => {
    const data: Record<string, unknown> = {};
    APP_KEYS.forEach((key) => {
      const raw = localStorage.getItem(key);
      if (raw === null) return;
      try { data[key] = JSON.parse(raw); } catch { data[key] = raw; }
    });

    const payload = {
      format: 'certifyai-backup',
      version: 1,
      exportedAt: new Date().toISOString(),
      data,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-certificados-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setMessage({ type: 'success', text: 'Backup gerado com sucesso.' });
  };

  const importBackup = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text());
      if (parsed?.format !== 'certifyai-backup' || !parsed?.data || typeof parsed.data !== 'object') {
        throw new Error('Arquivo de backup incompatível.');
      }

      APP_KEYS.forEach((key) => localStorage.removeItem(key));
      for (const [key, value] of Object.entries(parsed.data)) {
        if (!APP_KEYS.includes(key)) continue;
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      }
      setMessage({ type: 'success', text: 'Backup restaurado. O sistema será recarregado.' });
      setTimeout(() => window.location.reload(), 900);
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Não foi possível restaurar o backup.' });
    }
  };

  const handleReset = () => {
    if (!window.confirm('Restaurar os dados de demonstração? Os dados atuais do app serão substituídos.')) return;
    resetToDemoData();
    setMessage({ type: 'success', text: 'Dados de demonstração restaurados.' });
  };

  const handleClear = () => {
    if (!window.confirm('Apagar todos os alunos, cursos, certificados e logs locais? Esta ação não pode ser desfeita sem um backup.')) return;
    if (!window.confirm('Confirma a exclusão definitiva dos dados locais deste navegador?')) return;
    clearAllData();
    setMessage({ type: 'success', text: 'Dados locais removidos.' });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto w-full">
      <div>
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4" /> Proteção dos dados
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Backup & Restauração</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Faça uma cópia dos dados salvos neste navegador antes de alterações importantes.</p>
      </div>

      {message && (
        <div className={`rounded-xl border px-4 py-3 text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200' : 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center"><Download className="w-5 h-5" /></div>
          <div><h2 className="font-extrabold text-lg">Exportar backup</h2><p className="text-xs text-slate-500 mt-1">Baixa alunos, cursos, certificados, configurações e auditoria em um arquivo JSON.</p></div>
          <button onClick={exportBackup} className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold flex items-center justify-center gap-2"><DatabaseBackup className="w-4 h-4" /> Baixar backup</button>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"><Upload className="w-5 h-5" /></div>
          <div><h2 className="font-extrabold text-lg">Restaurar backup</h2><p className="text-xs text-slate-500 mt-1">Selecione um arquivo exportado anteriormente pelo próprio sistema.</p></div>
          <input ref={inputRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) importBackup(file); e.currentTarget.value = ''; }} />
          <button onClick={() => inputRef.current?.click()} className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center justify-center gap-2"><Upload className="w-4 h-4" /> Selecionar backup</button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <h2 className="font-extrabold text-lg mb-1">Manutenção local</h2>
        <p className="text-xs text-slate-500 mb-5">Estas ações alteram os dados armazenados somente neste navegador.</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={handleReset} className="flex-1 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 text-sm font-bold flex items-center justify-center gap-2"><RotateCcw className="w-4 h-4" /> Restaurar dados de demonstração</button>
          <button onClick={handleClear} className="flex-1 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-sm font-bold flex items-center justify-center gap-2"><Trash2 className="w-4 h-4" /> Limpar dados locais</button>
        </div>
      </div>
    </div>
  );
};
