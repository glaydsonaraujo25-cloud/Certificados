import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { AuditLog } from '../types';
import { Activity, Download, Search, ShieldCheck, Filter, Clock, User, FileText } from 'lucide-react';

const ACTION_LABELS: Record<AuditLog['action'], string> = {
  issued: 'Emissão',
  cancelled: 'Cancelamento',
  duplicated: 'Duplicação',
  updated: 'Atualização',
  exported: 'Exportação',
  integrity_verified: 'Integridade verificada',
  tamper_detected: 'Alteração detectada',
};

export const AuditView: React.FC = () => {
  const { auditLogs } = useApp();
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<'all' | AuditLog['action']>('all');

  const filteredLogs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return auditLogs.filter((log) => {
      const matchesAction = actionFilter === 'all' || log.action === actionFilter;
      const matchesSearch = !q ||
        log.details.toLowerCase().includes(q) ||
        log.userName.toLowerCase().includes(q) ||
        (log.certificateCode || '').toLowerCase().includes(q);
      return matchesAction && matchesSearch;
    });
  }, [auditLogs, actionFilter, search]);

  const exportCsv = () => {
    const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows = [
      ['Data/Hora', 'Ação', 'Usuário', 'Código', 'Detalhes'],
      ...filteredLogs.map((log) => [
        new Date(log.timestamp).toLocaleString('pt-BR'),
        ACTION_LABELS[log.action],
        log.userName,
        log.certificateCode || '',
        log.details,
      ]),
    ];
    const csv = '\uFEFF' + rows.map((row) => row.map(escape).join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria-certificados-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const issued = auditLogs.filter((l) => l.action === 'issued').length;
  const cancelled = auditLogs.filter((l) => l.action === 'cancelled').length;
  const verified = auditLogs.filter((l) => l.action === 'integrity_verified').length;
  const alerts = auditLogs.filter((l) => l.action === 'tamper_detected').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            Rastreabilidade do sistema
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Auditoria</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Consulte o histórico de emissões, alterações, cancelamentos e verificações.</p>
        </div>
        <button onClick={exportCsv} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-sm">
          <Download className="w-4 h-4" /> Exportar CSV
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ['Emissões', issued],
          ['Cancelamentos', cancelled],
          ['Verificações', verified],
          ['Alertas', alerts],
        ].map(([label, value]) => (
          <div key={String(label)} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs">
            <p className="text-[11px] uppercase tracking-wider font-bold text-slate-500">{label}</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por usuário, código ou descrição..." className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" />
        </div>
        <div className="relative md:w-64">
          <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value as 'all' | AuditLog['action'])} className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <option value="all">Todas as ações</option>
            {Object.entries(ACTION_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Activity className="w-10 h-10 mx-auto mb-3" />
            <p className="font-semibold">Nenhum registro encontrado.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 sm:p-5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                  <div className="space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold uppercase">{ACTION_LABELS[log.action]}</span>
                      {log.certificateCode && <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">{log.certificateCode}</span>}
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed"><FileText className="w-3.5 h-3.5 inline mr-1.5 text-slate-400" />{log.details}</p>
                  </div>
                  <div className="text-[11px] text-slate-500 shrink-0 space-y-1 lg:text-right">
                    <div className="flex lg:justify-end items-center gap-1.5"><User className="w-3.5 h-3.5" />{log.userName}</div>
                    <div className="flex lg:justify-end items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{new Date(log.timestamp).toLocaleString('pt-BR')}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
