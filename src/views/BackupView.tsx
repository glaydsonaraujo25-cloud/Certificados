import { useApp } from '../context/AppContext';
import { hasRecoverySnapshot, restoreBackup, restoreRecoverySnapshot, validateBackup } from '../utils/persistence';
import React, { useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Download, RotateCcw, ShieldCheck, Upload } from 'lucide-react';

type Message = { type: 'success' | 'error'; text: string };
const count = (value: unknown) => Array.isArray(value) ? value.length : 0;
const appendRestoreLog = (details: string) => {
  try {
    const key = 'certifyai_audit_logs';
    const current = JSON.parse(localStorage.getItem(key) || '[]');
    const logs = Array.isArray(current) ? current : [];
    logs.unshift({
      id: crypto.randomUUID?.() || `audit-${Date.now()}`,
      action: 'backup_restored',
      userId: 'local',
      userName: 'Operador local',
      timestamp: new Date().toISOString(),
      details,
    });
    localStorage.setItem(key, JSON.stringify(logs.slice(0, 2000)));
  } catch {
    // A restauração principal já foi concluída; o histórico não deve bloqueá-la.
  }
};

export const BackupView: React.FC = () => {
  const { institution, courses, classes, students, certificates, theme, auditLogs, addAuditLog } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<Message | null>(null);
  const recoveryAvailable = hasRecoverySnapshot(localStorage);

  const exportBackup = () => {
    const data = {
      certifyai_audit_logs: auditLogs,
      certifyai_classes: classes,
      certifyai_institution: institution,
      certifyai_courses: courses,
      certifyai_students: students,
      certifyai_certificates: certificates,
      certifyai_theme: theme,
      certifyai_data_version: 'cvte-final-local-v1',
    };
    const payload = { format: 'certificados-cvte-backup', version: 1, exportedAt: new Date().toISOString(), data };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-cvte-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    localStorage.setItem('certifyai_last_backup', new Date().toISOString());
    addAuditLog('backup_created', 'Backup completo baixado.');
    setMessage({ type: 'success', text: 'Backup local baixado com sucesso.' });
  };

  const importBackup = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text());
      const data = validateBackup(parsed) as Record<string, unknown>;
      const exportedAt = typeof parsed.exportedAt === 'string'
        ? new Date(parsed.exportedAt).toLocaleString('pt-BR')
        : 'data não informada';
      const summary = [
        `${count(data.certifyai_students)} condutor(es)`,
        `${count(data.certifyai_certificates)} certificado(s)`,
        `${count(data.certifyai_classes)} turma(s)`,
      ].join(', ');
      if (!window.confirm(`Backup de ${exportedAt}: ${summary}. Restaurar e substituir os dados atuais?`)) return;
      restoreBackup(localStorage, parsed);
      appendRestoreLog(`Backup restaurado: ${summary}.`);
      localStorage.setItem('certifyai_last_backup', new Date().toISOString());
      setMessage({ type: 'success', text: 'Backup restaurado. Recarregando o sistema...' });
      setTimeout(() => window.location.reload(), 800);
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Não foi possível restaurar o backup.' });
    }
  };

  const recoverPrevious = () => {
    try {
      if (!window.confirm('Voltar aos dados anteriores à última restauração? Uma cópia do estado atual será mantida para permitir desfazer novamente.')) return;
      restoreRecoverySnapshot(localStorage);
      appendRestoreLog('Dados anteriores à última restauração recuperados.');
      setMessage({ type: 'success', text: 'Dados anteriores recuperados. Recarregando o sistema...' });
      setTimeout(() => window.location.reload(), 800);
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Não foi possível recuperar os dados.' });
    }
  };

  return <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto w-full">
    <div>
      <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1"><ShieldCheck className="w-4 h-4"/>Proteção local</div>
      <h1 className="text-2xl sm:text-3xl font-extrabold">Backup dos dados</h1>
      <p className="text-sm text-slate-500 mt-1">Salve, confira e recupere os dados usados neste navegador.</p>
    </div>
    {message && <div role="status" className={`rounded-xl border px-4 py-3 text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>{message.type === 'success' ? <CheckCircle2 className="w-4 h-4"/> : <AlertTriangle className="w-4 h-4"/>}{message.text}</div>}
    <div className="grid md:grid-cols-3 gap-5">
      <Card icon={<Download className="w-5 h-5"/>} title="Baixar backup" text="Gera um JSON com todos os dados e o histórico."><button onClick={exportBackup} className="action bg-indigo-600"><Download className="w-4 h-4"/>Baixar backup</button></Card>
      <Card icon={<Upload className="w-5 h-5"/>} title="Restaurar arquivo" text="Valida e mostra um resumo antes de substituir os dados."><input ref={inputRef} type="file" accept="application/json,.json" className="hidden" onChange={e => { const file=e.target.files?.[0]; if(file) importBackup(file); e.currentTarget.value=''; }}/><button onClick={() => inputRef.current?.click()} className="action bg-emerald-600"><Upload className="w-4 h-4"/>Selecionar backup</button></Card>
      <Card icon={<RotateCcw className="w-5 h-5"/>} title="Desfazer restauração" text={recoveryAvailable ? 'Recupera a situação anterior à última importação.' : 'Disponível depois que um backup for restaurado.'}><button disabled={!recoveryAvailable} onClick={recoverPrevious} className="action bg-amber-600 disabled:opacity-40"><RotateCcw className="w-4 h-4"/>Recuperar dados anteriores</button></Card>
    </div>
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900"><strong>Importante:</strong> os dados ficam somente neste navegador. Faça um backup antes de limpar os dados, trocar de computador ou realizar alterações importantes.</div>
  </div>;
};

const Card: React.FC<{icon:React.ReactNode;title:string;text:string;children:React.ReactNode}> = ({icon,title,text,children}) => <div className="bg-white dark:bg-slate-900 rounded-2xl border p-6 space-y-4"><div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">{icon}</div><div><h2 className="font-extrabold text-lg">{title}</h2><p className="text-xs text-slate-500 mt-1">{text}</p></div>{children}<style>{`.action{width:100%;padding:.625rem;border-radius:.75rem;color:white;font-size:.875rem;font-weight:700;display:flex;align-items:center;justify-content:center;gap:.5rem}`}</style></div>;
