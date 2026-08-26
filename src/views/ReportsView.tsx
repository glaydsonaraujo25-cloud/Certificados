import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart3, Download, Award, Users, BookOpen, Ban, CheckCircle2, Search } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { certificates, students, courses, auditLogs } = useApp();
  const [search, setSearch] = useState('');

  const activeCertificates = certificates.filter((c) => c.status === 'active');
  const cancelledCertificates = certificates.filter((c) => c.status === 'cancelled');

  const courseRows = useMemo(() => {
    return courses
      .map((course) => {
        const certs = certificates.filter((c) => c.courseId === course.id);
        const enrolled = students.filter((s) => s.courseId === course.id);
        return {
          id: course.id,
          name: course.name,
          students: enrolled.length,
          certificates: certs.length,
          active: certs.filter((c) => c.status === 'active').length,
          cancelled: certs.filter((c) => c.status === 'cancelled').length,
        };
      })
      .filter((row) => row.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.certificates - a.certificates);
  }, [courses, certificates, students, search]);

  const monthlyRows = useMemo(() => {
    const map = new Map<string, number>();
    certificates.forEach((cert) => {
      const date = cert.createdAt || cert.issueDate;
      if (!date) return;
      const d = new Date(date);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b)).slice(-12);
  }, [certificates]);

  const exportCsv = () => {
    const header = ['Código','Aluno','CPF','Curso','Carga Horária','Emissão','Status'];
    const rows = certificates.map((cert) => [
      cert.code,
      cert.studentName,
      cert.studentDocument || '',
      cert.courseName,
      String(cert.workloadHours),
      cert.issueDate || '',
      cert.status,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
      .join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-certificados-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const maxMonthly = Math.max(1, ...monthlyRows.map(([, value]) => value));

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Relatórios</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Visão consolidada da emissão de certificados, alunos, cursos e cancelamentos.</p>
        </div>
        <button onClick={exportCsv} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-colors">
          <Download className="w-4 h-4" /> Exportar certificados CSV
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Metric icon={Award} label="Emitidos" value={certificates.length} />
        <Metric icon={CheckCircle2} label="Ativos" value={activeCertificates.length} />
        <Metric icon={Ban} label="Cancelados" value={cancelledCertificates.length} />
        <Metric icon={Users} label="Alunos" value={students.length} />
        <Metric icon={BookOpen} label="Cursos" value={courses.length} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white">Emissões nos últimos meses</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Quantidade de certificados registrada por mês.</p>
            </div>
          </div>

          {monthlyRows.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-slate-400">Ainda não há dados suficientes para o gráfico.</div>
          ) : (
            <div className="h-56 flex items-end gap-3 border-b border-slate-200 dark:border-slate-700 px-2 pb-1">
              {monthlyRows.map(([month, value]) => (
                <div key={month} className="flex-1 min-w-0 flex flex-col items-center justify-end h-full gap-2 group">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{value}</span>
                  <div className="w-full max-w-12 rounded-t-lg bg-indigo-500/85 group-hover:bg-indigo-600 transition-colors" style={{ height: `${Math.max(10, (value / maxMonthly) * 150)}px` }} />
                  <span className="text-[10px] text-slate-500 whitespace-nowrap">{month.slice(5)}/{month.slice(2,4)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <h2 className="font-bold text-slate-900 dark:text-white">Resumo operacional</h2>
          <div className="mt-4 space-y-3 text-sm">
            <Summary label="Taxa de certificados ativos" value={certificates.length ? `${Math.round((activeCertificates.length / certificates.length) * 100)}%` : '0%'} />
            <Summary label="Média de certificados por aluno" value={students.length ? (certificates.length / students.length).toFixed(1) : '0'} />
            <Summary label="Eventos de auditoria" value={auditLogs.length.toString()} />
            <Summary label="Cursos com certificados" value={courseRows.filter((r) => r.certificates > 0).length.toString()} />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">Desempenho por curso</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Alunos vinculados e certificados emitidos por curso.</p>
          </div>
          <div className="relative sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar curso..." className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 uppercase tracking-wider text-[10px]">
              <tr><th className="px-5 py-3">Curso</th><th className="px-5 py-3">Alunos</th><th className="px-5 py-3">Emitidos</th><th className="px-5 py-3">Ativos</th><th className="px-5 py-3">Cancelados</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {courseRows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">{row.name}</td>
                  <td className="px-5 py-3.5">{row.students}</td>
                  <td className="px-5 py-3.5 font-bold">{row.certificates}</td>
                  <td className="px-5 py-3.5 text-emerald-600 dark:text-emerald-400 font-bold">{row.active}</td>
                  <td className="px-5 py-3.5 text-rose-600 dark:text-rose-400 font-bold">{row.cancelled}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Metric = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) => (
  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
    <div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span><Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /></div>
    <div className="text-3xl font-black text-slate-900 dark:text-white mt-3">{value}</div>
  </div>
);

const Summary = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
    <span className="text-slate-600 dark:text-slate-300">{label}</span><strong className="text-slate-900 dark:text-white">{value}</strong>
  </div>
);
