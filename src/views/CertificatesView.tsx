import { certificateState, stateLabels } from '../utils/lifecycle';
import { RectifyModal } from '../components/RectifyModal';
import React, { useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import * as XLSX from 'xlsx';
import { useApp } from '../context/AppContext';
import { Certificate, CertificateStatus } from '../types';
import { CertificateModal } from '../components/CertificateModal';
import { CertificateBackPage, CertificateFrontPage } from '../components/CertificateDocument';
import { getCertificatePdfFilename, renderTwoPageCertificatePdfBlob } from '../utils/pdfGenerator';
import { createZipBlob, downloadBlob } from '../utils/zipGenerator';
import { AlertTriangle, Award, Ban, Check, Copy, Download, FileArchive, Loader2, PlusCircle, Search, X } from 'lucide-react';

const digits = (value: string) => value.replace(/\D/g, '');
const formatCpf = (value?: string) => {
  const d = digits(value || '').slice(0, 11);
  return d.length === 11 ? `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}` : (value || '-');
};
const waitForPaint = () => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

export const CertificatesView: React.FC = () => {
  const { classes, certificates, setCurrentView, setValidationSearchCode, cancelCertificate } = useApp();
  const [classFilter, setClassFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [rectify, setRectify] = useState<Certificate | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'soon' | 'unknown' | CertificateStatus>('all');
  const [activeModalCert, setActiveModalCert] = useState<Certificate | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Certificate | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('');
  const [exportingCertificate, setExportingCertificate] = useState<Certificate | null>(null);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const qDigits = digits(searchTerm);
    return certificates.filter(cert => {
      const matches = !q
        || cert.studentName.toLowerCase().includes(q)
        || cert.code.toLowerCase().includes(q)
        || (qDigits && digits(cert.studentDocument || '').includes(qDigits))
        || (qDigits && digits(cert.registrationNumber || '').includes(qDigits));
      const state = certificateState(cert);
      return matches
        && (!classFilter || cert.classId === classFilter)
        && (!yearFilter || cert.issueDate.startsWith(yearFilter))
        && (statusFilter === 'all' || state === statusFilter || (statusFilter === 'active' && (state === 'soon' || state === 'unknown')));
    });
  }, [certificates, searchTerm, statusFilter, classFilter, yearFilter]);

  const copyCode = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const t = document.createElement('textarea');
      t.value = code;
      document.body.appendChild(t);
      t.select();
      document.execCommand('copy');
      t.remove();
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const confirmCancellation = () => {
    if (!cancelTarget || !cancelReason.trim()) return;
    cancelCertificate(cancelTarget.id, cancelReason.trim());
    setActiveModalCert(null);
    setCancelTarget(null);
    setCancelReason('');
  };

  const exportExcel = () => {
    const data = filtered.map(cert => ({
      codigo: cert.code,
      nome: cert.studentName,
      cpf: formatCpf(cert.studentDocument),
      numero_registro: cert.registrationNumber || '',
      categoria_cnh: cert.cnhCategory || '',
      data_emissao: cert.issueDate,
      turma: cert.className || '',
      validade: cert.expiresAt || '',
      status: stateLabels[certificateState(cert)],
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [{ wch: 18 }, { wch: 38 }, { wch: 18 }, { wch: 18 }, { wch: 14 }, { wch: 16 }, { wch: 14 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Certificados');
    XLSX.writeFile(wb, `certificados_cvte_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const downloadMassPdf = async () => {
    if (!filtered.length || bulkProcessing) return;
    setBulkProcessing(true);
    try {
      const files: { name: string; data: Blob }[] = [];
      for (let i = 0; i < filtered.length; i += 1) {
        const cert = filtered[i];
        setBulkStatus(`Gerando PDF ${i + 1} de ${filtered.length}`);
        flushSync(() => setExportingCertificate(cert));
        await waitForPaint();
        const blob = await renderTwoPageCertificatePdfBlob({
          frontElementId: 'mass-pdf-front',
          backElementId: 'mass-pdf-back',
        });
        files.push({ name: getCertificatePdfFilename(cert.studentName, cert.code), data: blob });
      }
      setBulkStatus('Compactando certificados...');
      const zip = await createZipBlob(files);
      const suffix = classFilter
        ? (classes.find(item => item.id === classFilter)?.name || 'turma').replace(/[^a-zA-Z0-9_-]+/g, '_')
        : yearFilter || new Date().toISOString().slice(0, 10);
      downloadBlob(zip, `certificados_cvte_${suffix}.zip`);
      setBulkStatus('Download iniciado!');
    } catch (error) {
      console.error(error);
      alert('Não foi possível gerar todos os PDFs. Tente novamente.');
    } finally {
      setExportingCertificate(null);
      setBulkProcessing(false);
      setTimeout(() => setBulkStatus(''), 1200);
    }
  };

  return <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold">Certificados</h1>
        <p className="text-sm text-slate-500 mt-1">Visualize, baixe, pesquise e cancele certificados CVTE.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={downloadMassPdf} disabled={!filtered.length || bulkProcessing} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold disabled:opacity-40">
          {bulkProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileArchive className="w-4 h-4" />}
          {bulkProcessing ? bulkStatus || 'Gerando PDFs...' : `Baixar PDFs (${filtered.length})`}
        </button>
        <button onClick={exportExcel} disabled={!filtered.length} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-900 text-sm font-bold disabled:opacity-40">
          <Download className="w-4 h-4" />Exportar Excel
        </button>
        <button onClick={() => setCurrentView('create-certificate')} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl">
          <PlusCircle className="w-4 h-4" />Emitir Certificado
        </button>
      </div>
    </div>

    {bulkProcessing && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 font-semibold">{bulkStatus}</div>}

    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border flex flex-col md:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input placeholder="Buscar por nome, CPF, Nº registro ou código..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border" />
      </div>
      <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)} className="md:w-44 px-3 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border">
        <option value="all">Todos</option><option value="active">Ativos</option><option value="cancelled">Cancelados</option><option value="expired">Vencidos</option><option value="soon">Vence em 60 dias</option><option value="unknown">Validade não informada</option>
      </select>
    </div>

    <div className="flex flex-wrap gap-3">
      <label>Turma<select className="block border rounded-xl p-2 bg-white dark:bg-slate-800" value={classFilter} onChange={e => setClassFilter(e.target.value)}><option value="">Todas as turmas</option>{classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <label>Ano de emissão<select className="block border rounded-xl p-2 bg-white dark:bg-slate-800" value={yearFilter} onChange={e => setYearFilter(e.target.value)}><option value="">Todos os anos</option>{Array.from(new Set(certificates.map(c => c.issueDate.slice(0, 4)))).sort().reverse().map(y => <option key={y}>{y}</option>)}</select></label>
    </div>

    {rectify && <RectifyModal certificate={rectify} onClose={() => setRectify(null)} onDone={c => { setRectify(null); setActiveModalCert(c); }} />}

    <div className="bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden">
      {filtered.length === 0 ? <div className="p-12 text-center"><Award className="w-10 h-10 text-slate-400 mx-auto mb-3" /><p className="text-sm font-semibold">Nenhum certificado encontrado.</p></div> : <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px]"><tr><th className="px-4 py-3.5">Código</th><th className="px-4 py-3.5">Condutor</th><th className="px-4 py-3.5">Nº Registro / CNH</th><th className="px-4 py-3.5">Emissão</th><th className="px-4 py-3.5">Status</th><th className="px-4 py-3.5 text-right">Ações</th></tr></thead><tbody className="divide-y">{filtered.map(cert => <tr key={cert.id}><td className="px-4 py-4"><div className="flex items-center gap-2"><span className="font-mono font-bold text-indigo-600">{cert.code}</span><button onClick={() => copyCode(cert.code, cert.id)} title="Copiar código">{copiedId === cert.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}</button></div></td><td className="px-4 py-4"><div className="font-bold">{cert.studentName}</div><div className="text-[11px] text-slate-500">CPF: {formatCpf(cert.studentDocument)}</div></td><td className="px-4 py-4"><div className="font-mono">{cert.registrationNumber || '-'}</div><div className="text-[11px] font-bold">CNH {cert.cnhCategory || '-'}</div></td><td className="px-4 py-4">{cert.issueDate ? new Date(`${cert.issueDate}T00:00:00`).toLocaleDateString('pt-BR') : '-'}<div className="mt-1 text-slate-500">Validade: {cert.expiresAt?.split('-').reverse().join('/') || 'Não informada'}</div><div>{cert.className}</div></td><td className="px-4 py-4"><span className={`inline-flex px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${certificateState(cert) === 'active' ? 'bg-emerald-100 text-emerald-700' : cert.status === 'cancelled' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>{stateLabels[certificateState(cert)]}</span></td><td className="px-4 py-4"><div className="flex justify-end gap-2"><button onClick={() => setActiveModalCert(cert)} className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 font-semibold">Ver / Segunda via</button>{cert.status !== 'cancelled' && <button className="text-indigo-600 font-semibold" onClick={() => setRectify(cert)}>Retificar</button>}{cert.status === 'active' && <button onClick={() => { setCancelTarget(cert); setCancelReason(''); }} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 font-semibold"><Ban className="w-3.5 h-3.5" />Cancelar</button>}</div></td></tr>)}</tbody></table></div>}
    </div>

    {activeModalCert && <CertificateModal certificate={activeModalCert} isOpen onClose={() => setActiveModalCert(null)} setCurrentView={setCurrentView} setValidationSearchCode={setValidationSearchCode} />}

    {cancelTarget && <div className="fixed inset-0 z-[100] bg-slate-950/70 flex items-center justify-center p-4" onClick={() => setCancelTarget(null)}><div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6" onClick={e => e.stopPropagation()}><div className="flex items-start justify-between"><div className="flex gap-3"><div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center"><AlertTriangle className="w-5 h-5" /></div><div><h3 className="font-extrabold text-lg">Cancelar certificado</h3><p className="text-sm text-slate-500 mt-1">Revise os dados antes de confirmar.</p></div></div><button onClick={() => setCancelTarget(null)}><X className="w-5 h-5" /></button></div><div className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-800 p-4 text-sm space-y-1"><p><strong>{cancelTarget.studentName}</strong></p><p>CPF: {formatCpf(cancelTarget.studentDocument)}</p><p>Registro: {cancelTarget.registrationNumber || '-'} • CNH {cancelTarget.cnhCategory || '-'}</p><p>Código: <strong>{cancelTarget.code}</strong></p></div><label className="block mt-4 text-sm font-semibold">Motivo do cancelamento *<textarea autoFocus value={cancelReason} onChange={e => setCancelReason(e.target.value)} rows={4} placeholder="Informe o motivo..." className="mt-2 w-full rounded-xl border bg-slate-50 dark:bg-slate-800 p-3 text-sm" /></label><p className="mt-3 text-xs text-slate-500">O certificado permanecerá no histórico, marcado como cancelado.</p><div className="mt-5 flex justify-end gap-2"><button onClick={() => setCancelTarget(null)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-semibold">Voltar</button><button disabled={!cancelReason.trim()} onClick={confirmCancellation} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-bold disabled:opacity-40"><Ban className="w-4 h-4" />Confirmar cancelamento</button></div></div></div>}

    {exportingCertificate && <div className="fixed -left-[12000px] top-0 w-[1050px] pointer-events-none" aria-hidden="true"><CertificateFrontPage certificate={exportingCertificate} elementId="mass-pdf-front" isCancelled={exportingCertificate.status === 'cancelled'} /><CertificateBackPage certificate={exportingCertificate} elementId="mass-pdf-back" isCancelled={exportingCertificate.status === 'cancelled'} /></div>}
  </div>;
};
