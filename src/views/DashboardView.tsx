import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { CertificateModal } from '../components/CertificateModal';
import { Certificate } from '../types';
import { ArrowRight, Award, BookOpen, CheckCircle, Clock3, PlusCircle, ShieldCheck, Sparkles, Users } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { certificates, courses, students, auditLogs, setCurrentView, setValidationSearchCode } = useApp();
  const [activeModalCert, setActiveModalCert] = useState<Certificate | null>(null);
  const [quickSearchCode, setQuickSearchCode] = useState('');

  const activeCertificates = certificates.filter((cert) => cert.status === 'active');
  const cancelledCertificates = certificates.filter((cert) => cert.status === 'cancelled');
  const now = new Date();
  const issuedThisMonth = certificates.filter((cert) => {
    const date = new Date(cert.createdAt);
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  }).length;

  const certifiedStudentIds = new Set(activeCertificates.map((cert) => cert.studentId));
  const studentsWithoutCertificate = students.filter((student) => !certifiedStudentIds.has(student.id)).length;
  const coverage = students.length ? Math.round((certifiedStudentIds.size / students.length) * 100) : 0;

  const recentCertificates = useMemo(() => [...certificates].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6), [certificates]);
  const recentAudit = auditLogs.slice(0, 5);

  const handleQuickValidate = (event: React.FormEvent) => {
    event.preventDefault();
    const code = quickSearchCode.trim().toUpperCase();
    if (!code) return;
    setValidationSearchCode(code);
    setCurrentView('validate');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-100"><Sparkles className="w-3.5 h-3.5 text-amber-300" />Operador de Computador com IA</div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Painel de Certificação</h1>
            <p className="text-sm leading-relaxed text-indigo-100/80">Acompanhe alunos, emissão de certificados, validações e atividades administrativas do curso em um só lugar.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setCurrentView('create-certificate')} className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-indigo-950 shadow-md hover:bg-indigo-50"><PlusCircle className="w-4 h-4 text-indigo-600" />Emitir Certificado</button>
            <button onClick={() => setCurrentView('students')} className="flex items-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-700/50 px-4 py-2.5 text-sm font-semibold hover:bg-indigo-700"><Users className="w-4 h-4" />Gerenciar Alunos</button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <Metric title="Certificados" value={certificates.length} detail={`${activeCertificates.length} ativos • ${cancelledCertificates.length} cancelados`} icon={<Award className="w-5 h-5" />} />
        <Metric title="Emitidos no mês" value={issuedThisMonth} detail="Emissões no mês atual" icon={<Clock3 className="w-5 h-5" />} />
        <Metric title="Alunos" value={students.length} detail={`${studentsWithoutCertificate} ainda sem certificado ativo`} icon={<Users className="w-5 h-5" />} />
        <Metric title="Cursos" value={courses.length} detail="Programas cadastrados" icon={<BookOpen className="w-5 h-5" />} />
        <Metric title="Cobertura" value={`${coverage}%`} detail="Alunos com certificado ativo" icon={<CheckCircle className="w-5 h-5" />} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-5 dark:border-slate-800">
            <div><h2 className="font-bold text-slate-900 dark:text-white">Certificados recentes</h2><p className="text-xs text-slate-500">Últimas emissões registradas no sistema.</p></div>
            <button onClick={() => setCurrentView('certificates')} className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">Ver todos <ArrowRight className="w-3.5 h-3.5" /></button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentCertificates.length === 0 ? <div className="p-10 text-center text-sm text-slate-400">Nenhum certificado emitido.</div> : recentCertificates.map((cert) => (
              <div key={cert.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                <div><div className="flex items-center gap-2"><span className="font-bold text-sm text-slate-900 dark:text-white">{cert.studentName}</span><span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${cert.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'}`}>{cert.status === 'active' ? 'Ativo' : 'Cancelado'}</span></div><div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500"><span>{cert.courseName}</span><span>•</span><span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{cert.code}</span><span>•</span><span>{cert.workloadHours}h</span></div></div>
                <button onClick={() => setActiveModalCert(cert)} className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300">Visualizar</button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-indigo-600" /><h3 className="font-bold text-sm">Validação rápida</h3></div>
            <p className="mt-2 text-xs text-slate-500">Consulte um certificado pelo código de autenticidade.</p>
            <form onSubmit={handleQuickValidate} className="mt-3 space-y-2"><input value={quickSearchCode} onChange={(e) => setQuickSearchCode(e.target.value)} placeholder="Ex: CERT-2026-000001" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono uppercase dark:border-slate-700 dark:bg-slate-800" /><button type="submit" className="w-full rounded-xl bg-slate-900 py-2 text-xs font-bold text-white dark:bg-indigo-600">Verificar autenticidade</button></form>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between"><h3 className="font-bold text-sm">Atividades recentes</h3><button onClick={() => setCurrentView('audit')} className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">Auditoria</button></div>
            <div className="mt-3 space-y-2.5">{recentAudit.length === 0 ? <p className="text-xs text-slate-400">Nenhuma atividade registrada.</p> : recentAudit.map((log) => <div key={log.id} className="rounded-xl bg-slate-50 p-2.5 text-xs dark:bg-slate-800/50"><div className="flex items-center justify-between gap-2"><span className="font-bold uppercase text-[9px] text-indigo-600 dark:text-indigo-400">{log.action.replace('_', ' ')}</span><span className="text-[9px] text-slate-400">{new Date(log.timestamp).toLocaleDateString('pt-BR')}</span></div><p className="mt-1 line-clamp-2 text-slate-600 dark:text-slate-300">{log.details}</p></div>)}</div>
          </div>
        </div>
      </section>

      {activeModalCert && <CertificateModal certificate={activeModalCert} isOpen={true} onClose={() => setActiveModalCert(null)} setCurrentView={setCurrentView} setValidationSearchCode={setValidationSearchCode} />}
    </div>
  );
};

const Metric: React.FC<{ title: string; value: number | string; detail: string; icon: React.ReactNode }> = ({ title, value, detail, icon }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
    <div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{title}</span><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">{icon}</div></div>
    <div className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{value}</div>
    <p className="mt-1 text-[11px] text-slate-500">{detail}</p>
  </div>
);