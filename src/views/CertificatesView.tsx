import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Certificate, CertificateStatus } from '../types';
import { CertificateModal } from '../components/CertificateModal';
import { Award, Search, PlusCircle, Copy, Check, Ban, X, AlertTriangle } from 'lucide-react';

export const CertificatesView: React.FC = () => {
  const { certificates, courses, setCurrentView, setValidationSearchCode, duplicateCertificate, cancelCertificate } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | CertificateStatus>('all');
  const [activeModalCert, setActiveModalCert] = useState<Certificate | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Certificate | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const filteredCertificates = useMemo(() => certificates.filter((cert) => {
    const search = searchTerm.toLowerCase();
    const matchSearch = cert.studentName.toLowerCase().includes(search) || cert.courseName.toLowerCase().includes(search) || cert.code.toLowerCase().includes(search) || Boolean(cert.studentDocument?.includes(searchTerm));
    const matchCourse = selectedCourseFilter === 'all' || cert.courseId === selectedCourseFilter;
    const matchStatus = selectedStatusFilter === 'all' || cert.status === selectedStatusFilter;
    return matchSearch && matchCourse && matchStatus;
  }), [certificates, searchTerm, selectedCourseFilter, selectedStatusFilter]);

  const handleCopyCode = async (code: string, id: string) => {
    try { await navigator.clipboard.writeText(code); }
    catch {
      const textarea = document.createElement('textarea'); textarea.value = code; document.body.appendChild(textarea); textarea.select(); document.execCommand('copy'); textarea.remove();
    }
    setCopiedId(id); window.setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDuplicate = (id: string) => { const duplicated = duplicateCertificate(id); if (duplicated) setActiveModalCert(duplicated); };

  const confirmCancellation = () => {
    if (!cancelTarget || !cancelReason.trim()) return;
    cancelCertificate(cancelTarget.id, cancelReason.trim());
    setActiveModalCert(null);
    setCancelTarget(null);
    setCancelReason('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Gerenciador de Certificados</h1><p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Consulte, filtre, visualize, duplique ou cancele certificados emitidos.</p></div>
        <button onClick={() => setCurrentView('create-certificate')} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl"><PlusCircle className="w-4 h-4" />Emitir Novo Certificado</button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full"><Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" /><input type="text" placeholder="Buscar por aluno, CPF, curso ou código..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" /></div>
        <select value={selectedCourseFilter} onChange={(e) => setSelectedCourseFilter(e.target.value)} className="w-full md:w-56 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"><option value="all">Todos os Cursos</option>{courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <select value={selectedStatusFilter} onChange={(e) => setSelectedStatusFilter(e.target.value as 'all' | CertificateStatus)} className="w-full md:w-44 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"><option value="all">Todos os Status</option><option value="active">Ativos</option><option value="expired">Expirados</option><option value="cancelled">Cancelados</option></select>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {filteredCertificates.length === 0 ? <div className="p-12 text-center space-y-3"><Award className="w-10 h-10 text-slate-400 mx-auto" /><p className="text-sm font-semibold">Nenhum certificado encontrado.</p></div> : <div className="overflow-x-auto"><table className="w-full text-left text-xs border-collapse">
          <thead><tr className="border-b bg-slate-50 dark:bg-slate-800/40 text-slate-500 uppercase"><th className="px-5 py-3.5">Código</th><th className="px-5 py-3.5">Aluno</th><th className="px-5 py-3.5">Curso</th><th className="px-5 py-3.5">Emissão</th><th className="px-5 py-3.5">Status</th><th className="px-5 py-3.5 text-right">Ações</th></tr></thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">{filteredCertificates.map((cert) => <tr key={cert.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
            <td className="px-5 py-4"><div className="flex items-center gap-2"><span className="font-mono font-bold text-indigo-600">{cert.code}</span><button onClick={() => handleCopyCode(cert.code, cert.id)}>{copiedId === cert.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}</button></div></td>
            <td className="px-5 py-4"><div className="font-bold">{cert.studentName}</div>{cert.studentDocument && <div className="text-[11px] text-slate-400">CPF: {cert.studentDocument}</div>}</td>
            <td className="px-5 py-4"><div>{cert.courseName}</div><div className="text-[11px] text-slate-500">{cert.workloadHours} horas • {cert.modality}</div></td>
            <td className="px-5 py-4">{cert.issueDate ? new Date(cert.issueDate + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}</td>
            <td className="px-5 py-4"><span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${cert.status === 'active' ? 'bg-emerald-100 text-emerald-700' : cert.status === 'expired' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>{cert.status === 'active' ? 'Ativo' : cert.status === 'expired' ? 'Expirado' : 'Cancelado'}</span></td>
            <td className="px-5 py-4"><div className="flex justify-end gap-2"><button onClick={() => setActiveModalCert(cert)} className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-semibold">Ver / Baixar</button><button onClick={() => handleDuplicate(cert.id)} className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">Duplicar</button>{cert.status === 'active' && <button onClick={() => { setCancelTarget(cert); setCancelReason(''); }} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-700 font-semibold"><Ban className="w-3.5 h-3.5" />Cancelar</button>}</div></td>
          </tr>)}</tbody>
        </table></div>}
      </div>

      {activeModalCert && <CertificateModal certificate={activeModalCert} isOpen={true} onClose={() => setActiveModalCert(null)} setCurrentView={setCurrentView} setValidationSearchCode={setValidationSearchCode} />}

      {cancelTarget && <div className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setCancelTarget(null)}><div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3"><div className="flex gap-3"><div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center"><AlertTriangle className="w-5 h-5" /></div><div><h3 className="font-extrabold text-lg">Cancelar certificado</h3><p className="text-sm text-slate-500 mt-1">Código <strong>{cancelTarget.code}</strong> • {cancelTarget.studentName}</p></div></div><button onClick={() => setCancelTarget(null)} className="p-1"><X className="w-5 h-5" /></button></div>
        <div className="mt-5"><label className="text-sm font-semibold">Motivo do cancelamento <span className="text-rose-600">*</span></label><textarea autoFocus value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={4} placeholder="Ex.: dados incorretos, certificado emitido em duplicidade..." className="mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm" /></div>
        <p className="mt-3 text-xs text-slate-500">O certificado continuará no histórico, mas ficará marcado como cancelado e inválido para validação.</p>
        <div className="mt-5 flex justify-end gap-2"><button onClick={() => setCancelTarget(null)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-semibold">Voltar</button><button disabled={!cancelReason.trim()} onClick={confirmCancellation} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"><Ban className="w-4 h-4" />Confirmar cancelamento</button></div>
      </div></div>}
    </div>
  );
};
