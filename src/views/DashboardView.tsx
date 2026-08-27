import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { CertificateModal } from '../components/CertificateModal';
import { Certificate } from '../types';
import { ArrowRight, Award, CheckCircle, FileSpreadsheet, PlusCircle, ShieldCheck, Users } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { certificates, students, setCurrentView, setValidationSearchCode } = useApp();
  const [activeModalCert, setActiveModalCert] = useState<Certificate | null>(null);
  const [quickSearchCode, setQuickSearchCode] = useState('');

  const activeCertificates = certificates.filter((cert) => cert.status === 'active');
  const cancelledCertificates = certificates.filter((cert) => cert.status === 'cancelled');
  const recentCertificates = useMemo(() => [...certificates].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6), [certificates]);

  const handleQuickValidate = (event: React.FormEvent) => {
    event.preventDefault();
    const code = quickSearchCode.trim().toUpperCase();
    if (!code) return;
    setValidationSearchCode(code);
    setCurrentView('validate');
  };

  return <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
    <section className="rounded-2xl bg-gradient-to-r from-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="max-w-2xl"><div className="inline-flex rounded-full border border-indigo-400/30 bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-100">Curso CVTE</div><h1 className="mt-3 text-2xl sm:text-3xl font-extrabold">Certificados de Condutores de Veículos de Emergência</h1><p className="mt-2 text-sm text-indigo-100/80">Cadastre o condutor, emita o certificado e consulte tudo em poucos passos.</p></div>
        <div className="flex flex-wrap gap-3"><button onClick={() => setCurrentView('create-certificate')} className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-indigo-950"><PlusCircle className="w-4 h-4" />Emitir Certificado</button><button onClick={() => setCurrentView('batch-emission')} className="flex items-center gap-2 rounded-xl border border-indigo-400/40 bg-indigo-700/50 px-4 py-2.5 text-sm font-semibold"><FileSpreadsheet className="w-4 h-4" />Emitir por Excel</button></div>
      </div>
    </section>

    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Metric title="Condutores" value={students.length} icon={<Users className="w-5 h-5" />} />
      <Metric title="Certificados" value={certificates.length} icon={<Award className="w-5 h-5" />} />
      <Metric title="Ativos" value={activeCertificates.length} icon={<CheckCircle className="w-5 h-5" />} />
      <Metric title="Cancelados" value={cancelledCertificates.length} icon={<Award className="w-5 h-5" />} />
    </section>

    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-5 dark:border-slate-800"><div><h2 className="font-bold">Certificados recentes</h2><p className="text-xs text-slate-500">Últimas emissões registradas.</p></div><button onClick={() => setCurrentView('certificates')} className="flex items-center gap-1 text-xs font-semibold text-indigo-600">Ver todos <ArrowRight className="w-3.5 h-3.5" /></button></div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">{recentCertificates.length === 0 ? <div className="p-10 text-center"><Award className="w-9 h-9 mx-auto text-slate-300" /><p className="mt-2 text-sm text-slate-400">Nenhum certificado emitido ainda.</p><button onClick={() => setCurrentView('create-certificate')} className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">Emitir primeiro certificado</button></div> : recentCertificates.map((cert) => <div key={cert.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4"><div><div className="flex items-center gap-2"><span className="font-bold text-sm">{cert.studentName}</span><span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${cert.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{cert.status === 'active' ? 'Ativo' : 'Cancelado'}</span></div><div className="mt-1 text-xs text-slate-500"><span className="font-mono font-semibold text-indigo-600">{cert.code}</span> • CPF {cert.studentDocument || '-'}</div></div><button onClick={() => setActiveModalCert(cert)} className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">Visualizar</button></div>)}</div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-indigo-600" /><h3 className="font-bold text-sm">Validar certificado</h3></div><p className="mt-2 text-xs text-slate-500">Digite o código impresso no certificado.</p><form onSubmit={handleQuickValidate} className="mt-3 space-y-2"><input value={quickSearchCode} onChange={(e) => setQuickSearchCode(e.target.value)} placeholder="Ex.: 001/CVTE/2026" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-mono uppercase dark:border-slate-700 dark:bg-slate-800" /><button type="submit" className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white">Validar</button></form></div>
        <button onClick={() => setCurrentView('students')} className="w-full rounded-2xl border border-slate-200 bg-white p-5 text-left dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between"><div><div className="font-bold text-sm">Condutores</div><p className="mt-1 text-xs text-slate-500">Cadastrar, editar ou emitir para um condutor.</p></div><ArrowRight className="w-5 h-5 text-indigo-600" /></div></button>
      </div>
    </section>

    {activeModalCert && <CertificateModal certificate={activeModalCert} isOpen={true} onClose={() => setActiveModalCert(null)} setCurrentView={setCurrentView} setValidationSearchCode={setValidationSearchCode} />}
  </div>;
};

const Metric: React.FC<{ title: string; value: number; icon: React.ReactNode }> = ({ title, value, icon }) => <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{title}</span><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">{icon}</div></div><div className="mt-3 text-3xl font-black">{value}</div></div>;
