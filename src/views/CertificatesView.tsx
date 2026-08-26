import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Certificate, CertificateStatus } from '../types';
import { CertificateModal } from '../components/CertificateModal';
import { Award, Search, PlusCircle, Copy, Check, Ban } from 'lucide-react';

export const CertificatesView: React.FC = () => {
  const {
    certificates,
    courses,
    setCurrentView,
    setValidationSearchCode,
    duplicateCertificate,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | CertificateStatus>('all');
  const [activeModalCert, setActiveModalCert] = useState<Certificate | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredCertificates = useMemo(() => {
    return certificates.filter((cert) => {
      const search = searchTerm.toLowerCase();
      const matchSearch =
        cert.studentName.toLowerCase().includes(search) ||
        cert.courseName.toLowerCase().includes(search) ||
        cert.code.toLowerCase().includes(search) ||
        Boolean(cert.studentDocument?.includes(searchTerm));
      const matchCourse = selectedCourseFilter === 'all' || cert.courseId === selectedCourseFilter;
      const matchStatus = selectedStatusFilter === 'all' || cert.status === selectedStatusFilter;
      return matchSearch && matchCourse && matchStatus;
    });
  }, [certificates, searchTerm, selectedCourseFilter, selectedStatusFilter]);

  const handleCopyCode = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDuplicate = (id: string) => {
    const duplicated = duplicateCertificate(id);
    if (duplicated) setActiveModalCert(duplicated);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Gerenciador de Certificados</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Consulte, filtre, visualize, duplique ou cancele certificados emitidos.</p>
        </div>
        <button onClick={() => setCurrentView('create-certificate')} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all hover:scale-[1.02]">
          <PlusCircle className="w-4 h-4" />
          <span>Emitir Novo Certificado</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input type="text" placeholder="Buscar por aluno, CPF, curso ou código..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div className="w-full md:w-56">
          <select value={selectedCourseFilter} onChange={(e) => setSelectedCourseFilter(e.target.value)} className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500">
            <option value="all">Todos os Cursos</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="w-full md:w-44">
          <select value={selectedStatusFilter} onChange={(e) => setSelectedStatusFilter(e.target.value as 'all' | CertificateStatus)} className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500">
            <option value="all">Todos os Status</option>
            <option value="active">Ativos</option>
            <option value="expired">Expirados</option>
            <option value="cancelled">Cancelados</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {filteredCertificates.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto"><Award className="w-6 h-6" /></div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nenhum certificado encontrado para os filtros selecionados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead><tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 font-bold uppercase tracking-wider"><th className="px-5 py-3.5">Código</th><th className="px-5 py-3.5">Aluno</th><th className="px-5 py-3.5">Curso</th><th className="px-5 py-3.5">Emissão</th><th className="px-5 py-3.5">Status</th><th className="px-5 py-3.5 text-right">Ações</th></tr></thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCertificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-4"><div className="flex items-center gap-2"><span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-1 rounded">{cert.code}</span><button onClick={() => handleCopyCode(cert.code, cert.id)} className="text-slate-400 hover:text-slate-600 p-1" title="Copiar código">{copiedId === cert.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}</button></div></td>
                    <td className="px-5 py-4"><div className="font-bold text-slate-900 dark:text-white">{cert.studentName}</div>{cert.studentDocument && <div className="text-[11px] text-slate-400 font-mono">CPF: {cert.studentDocument}</div>}</td>
                    <td className="px-5 py-4"><div className="font-medium text-slate-800 dark:text-slate-200">{cert.courseName}</div><div className="text-[11px] text-slate-500">{cert.workloadHours} horas • {cert.modality}</div></td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{cert.issueDate ? new Date(cert.issueDate + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}</td>
                    <td className="px-5 py-4"><span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${cert.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' : cert.status === 'expired' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'}`}>{cert.status === 'active' ? 'Ativo' : cert.status === 'expired' ? 'Expirado' : <><Ban className="w-3 h-3" />Cancelado</>}</span></td>
                    <td className="px-5 py-4 text-right space-x-2"><button onClick={() => setActiveModalCert(cert)} className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-semibold transition-colors">Ver / Baixar</button><button onClick={() => handleDuplicate(cert.id)} className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium transition-colors">Duplicar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {activeModalCert && (
        <CertificateModal
          certificate={activeModalCert}
          isOpen={true}
          onClose={() => setActiveModalCert(null)}
          setCurrentView={setCurrentView}
          setValidationSearchCode={setValidationSearchCode}
        />
      )}
    </div>
  );
};
