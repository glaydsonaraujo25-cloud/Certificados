import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { DatabaseBackup, Download, Upload, RotateCcw, Trash2, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';

const APP_KEYS = [
  'certifyai_institution',
  'certifyai_courses',
  'certifyai_classes',
  'certifyai_students',
  'certifyai_certificates',
  'certifyai_audit_logs',
  'certifyai_theme',
  'certifyai_data_version',
];

export const BackupView: React.FC = () => {
  const { resetToDemoData, clearAllData } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const exportBackup = () => {
    const data: Record<string, unknown> = {};
    APP_KEYS.forEach((key) => { const raw = localStorage.getItem(key); if (raw === null) return; try { data[key] = JSON.parse(raw); } catch { data[key] = raw; } });
    const payload = { format: 'certifyai-backup', version: 2, exportedAt: new Date().toISOString(), data };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `backup-certificados-${new Date().toISOString().slice(0, 10)}.json`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    setMessage({ type: 'success', text: 'Backup gerado com sucesso, incluindo turmas.' });
  };

  const importBackup = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text());
      if (parsed?.format !== 'certifyai-backup' || !parsed?.data || typeof parsed.data !== 'object') throw new Error('Arquivo de backup incompatível.');
      APP_KEYS.forEach((key) => localStorage.removeItem(key));
      for (const [key, value] of Object.entries(parsed.data)) { if (!APP_KEYS.includes(key)) continue; localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value)); }
      setMessage({ type: 'success', text: 'Backup restaurado. O sistema será recarregado.' });
      setTimeout(() => window.location.reload(), 900);
    } catch (error) { setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Não foi possível restaurar o backup.' }); }
  };

  const handleReset = () => { if (!window.confirm('Restaurar a configuração padrão? Os dados atuais serão substituídos.')) return; resetToDemoData(); setMessage({ type: 'success', text: 'Configuração padrão restaurada.' }); };
  const handleClear = () => { if (!window.confirm('Apagar cursos, turmas, alunos, certificados e auditoria deste navegador?')) return; if (!window.confirm('Confirma a exclusão definitiva dos dados locais?')) return; clearAllData(); setMessage({ type: 'success', text: 'Dados locais removidos.' }); };

  return <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto w-full">
    <div><div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1"><ShieldCheck className="w-4 h-4" />Proteção dos dados</div><h1 className="text-2xl sm:text-3xl font-extrabold">Backup & Restauração</h1><p className="text-sm text-slate-500 mt-1">Faça uma cópia dos dados locais antes de alterações importantes.</p></div>
    {message && <div className={`rounded-xl border px-4 py-3 text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>{message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}{message.text}</div>}
    <div className="grid md:grid-cols-2 gap-5"><Card icon={<Download className="w-5 h-5" />} title="Exportar backup" text="Baixa instituição, cursos, turmas, alunos, certificados, configurações e auditoria em JSON."><button onClick={exportBackup} className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold flex items-center justify-center gap-2"><DatabaseBackup className="w-4 h-4" />Baixar backup</button></Card><Card icon={<Upload className="w-5 h-5" />} title="Restaurar backup" text="Selecione um arquivo exportado anteriormente pelo sistema."><input ref={inputRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) importBackup(file); e.currentTarget.value = ''; }} /><button onClick={() => inputRef.current?.click()} className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold flex items-center justify-center gap-2"><Upload className="w-4 h-4" />Selecionar backup</button></Card></div>
    <div className="bg-white dark:bg-slate-900 rounded-2xl border p-6"><h2 className="font-extrabold text-lg mb-1">Manutenção local</h2><p className="text-xs text-slate-500 mb-5">Estas ações alteram somente os dados armazenados neste navegador.</p><div className="flex flex-col sm:flex-row gap-3"><button onClick={handleReset} className="flex-1 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-bold flex items-center justify-center gap-2"><RotateCcw className="w-4 h-4" />Restaurar configuração padrão</button><button onClick={handleClear} className="flex-1 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-bold flex items-center justify-center gap-2"><Trash2 className="w-4 h-4" />Limpar dados locais</button></div></div>
  </div>;
};

const Card: React.FC<{ icon: React.ReactNode; title: string; text: string; children: React.ReactNode }> = ({ icon, title, text, children }) => <div className="bg-white dark:bg-slate-900 rounded-2xl border p-6 space-y-4"><div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">{icon}</div><div><h2 className="font-extrabold text-lg">{title}</h2><p className="text-xs text-slate-500 mt-1">{text}</p></div>{children}</div>;
