import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Certificate } from '../types';
import { CertificateModal } from '../components/CertificateModal';
import { AlertTriangle, CheckCircle2, Download, Eye, FileSpreadsheet, Layers, Loader2, Plus, Trash2, Upload } from 'lucide-react';

interface BatchRow {
  id: string;
  studentName: string;
  studentEmail: string;
  studentDocument: string;
  status: 'valid' | 'invalid';
  errorMsg?: string;
}

export const BatchEmissionView: React.FC = () => {
  const { institution, issueCertificate, courses, setCurrentView, setValidationSearchCode } = useApp();
  const course = courses[0];
  const [rows, setRows] = useState<BatchRow[]>([
    { id: 'row-1', studentName: 'ALUNO EXEMPLO 1', studentEmail: 'aluno1@exemplo.com', studentDocument: '000.000.000-00', status: 'valid' },
    { id: 'row-2', studentName: 'ALUNO EXEMPLO 2', studentEmail: 'aluno2@exemplo.com', studentDocument: '111.111.111-11', status: 'valid' },
  ]);
  const [processing, setProcessing] = useState(false);
  const [issued, setIssued] = useState<Certificate[]>([]);
  const [selected, setSelected] = useState<Certificate | null>(null);

  const validate = (row: BatchRow) => {
    if (!row.studentName.trim()) return { ...row, status: 'invalid' as const, errorMsg: 'Nome obrigatório' };
    if (!row.studentDocument.trim()) return { ...row, status: 'invalid' as const, errorMsg: 'CPF/documento obrigatório' };
    return { ...row, status: 'valid' as const, errorMsg: undefined };
  };

  const updateRow = (id: string, updates: Partial<BatchRow>) => setRows((prev) => prev.map((row) => row.id === id ? validate({ ...row, ...updates }) : row));
  const addRow = () => setRows((prev) => [...prev, { id: `row-${Date.now()}`, studentName: '', studentEmail: '', studentDocument: '', status: 'invalid', errorMsg: 'Preencha os dados' }]);

  const downloadModel = () => {
    const csv = 'nome_aluno,email,cpf_documento\nALUNO EXEMPLO,aluno@exemplo.com,000.000.000-00\n';
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a'); link.href = url; link.download = 'modelo_operador_computador_ia.csv'; link.click(); URL.revokeObjectURL(url);
  };

  const uploadCsv = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      const lines = text.split(/\r?\n/).filter(Boolean);
      const parsed = lines.slice(1).map((line, index) => {
        const [studentName = '', studentEmail = '', studentDocument = ''] = line.split(/[,;]/).map((value) => value.replace(/^['"]|['"]$/g, '').trim());
        return validate({ id: `csv-${Date.now()}-${index}`, studentName, studentEmail, studentDocument, status: 'valid' });
      });
      if (parsed.length) { setRows(parsed); setIssued([]); }
    };
    reader.readAsText(file);
  };

  const processBatch = async () => {
    const validRows = rows.filter((row) => row.status === 'valid');
    if (!course) { alert('Cadastre o curso Operador de Computador com IA antes da emissão.'); return; }
    if (!validRows.length) { alert('Nenhum registro válido para emissão.'); return; }
    setProcessing(true);
    try {
      const results = validRows.map((row) => issueCertificate({
        studentId: `batch-${row.id}`,
        studentName: row.studentName.trim().toUpperCase(),
        studentEmail: row.studentEmail.trim() || undefined,
        studentDocument: row.studentDocument.trim(),
        courseId: course.id,
        courseName: course.name,
        courseSubhead: course.courseSubhead || 'Operador de Computador com Inteligência Artificial',
        workloadHours: course.workloadHours,
        modality: course.modality,
        instructorName: course.instructorName || 'Instrutor Responsável',
        institutionName: institution.name,
        institutionCnpj: institution.institutionCnpj,
        syllabus: course.syllabus,
        issueDate: new Date().toISOString().split('T')[0],
        startDate: course.startDate,
        endDate: course.endDate,
        location: `${institution.city || 'Brasília'}-${institution.state || 'DF'}`,
        signatoryName: institution.signatoryName || 'Diretor Geral',
        signatoryRole: institution.signatoryRole || 'Diretor Geral',
        signatoryCpf: institution.signatoryCpf,
        signatureImageUrl: institution.signatureImageUrl,
        templateId: 'official',
      }));
      setIssued(results);
    } catch { alert('Ocorreu um erro durante a emissão em lote.'); }
    finally { setProcessing(false); }
  };

  return <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
    <div><div className="flex items-center gap-2"><Layers className="w-6 h-6 text-indigo-600" /><h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Emissão em Lote</h1></div><p className="text-sm text-slate-500 mt-1">Emita vários certificados do curso <strong>Operador de Computador com IA</strong> de uma só vez.</p></div>

    <div className="grid sm:grid-cols-3 gap-4">
      <div className="sm:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5"><div className="font-bold">Curso da emissão</div><div className="text-lg font-extrabold text-indigo-700 dark:text-indigo-300 mt-1">{course?.name || 'Operador de Computador com IA'}</div><div className="text-sm text-slate-500 mt-1">{course?.workloadHours || 230} horas • {course?.modality || 'presencial'}</div></div>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5"><div className="text-xs text-slate-500">Registros válidos</div><div className="text-3xl font-black mt-1">{rows.filter((row) => row.status === 'valid').length}</div></div>
    </div>

    <div className="flex flex-wrap gap-2"><label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold cursor-pointer"><Upload className="w-4 h-4" />Importar CSV<input type="file" accept=".csv,text/csv" onChange={uploadCsv} className="hidden" /></label><button onClick={downloadModel} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold"><Download className="w-4 h-4" />Baixar modelo CSV</button><button onClick={addRow} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-bold"><Plus className="w-4 h-4" />Adicionar aluno</button></div>

    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-xs"><thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px]"><tr><th className="px-4 py-3 text-left">Aluno</th><th className="px-4 py-3 text-left">E-mail</th><th className="px-4 py-3 text-left">CPF / Documento</th><th className="px-4 py-3">Status</th><th className="px-4 py-3"></th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{rows.map((row) => <tr key={row.id}><td className="px-4 py-3"><input value={row.studentName} onChange={(e) => updateRow(row.id, { studentName: e.target.value })} className="w-full min-w-52 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" /></td><td className="px-4 py-3"><input value={row.studentEmail} onChange={(e) => updateRow(row.id, { studentEmail: e.target.value })} className="w-full min-w-48 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" /></td><td className="px-4 py-3"><input value={row.studentDocument} onChange={(e) => updateRow(row.id, { studentDocument: e.target.value })} className="w-full min-w-40 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" /></td><td className="px-4 py-3 text-center">{row.status === 'valid' ? <span className="inline-flex items-center gap-1 text-emerald-600 font-bold"><CheckCircle2 className="w-4 h-4" />Válido</span> : <span title={row.errorMsg} className="inline-flex items-center gap-1 text-rose-600 font-bold"><AlertTriangle className="w-4 h-4" />Corrigir</span>}</td><td className="px-4 py-3"><button onClick={() => setRows((prev) => prev.filter((item) => item.id !== row.id))} className="text-rose-600"><Trash2 className="w-4 h-4" /></button></td></tr>)}</tbody></table></div></div>

    <div className="flex justify-end"><button onClick={processBatch} disabled={processing} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold disabled:opacity-50">{processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}Emitir {rows.filter((row) => row.status === 'valid').length} certificados</button></div>

    {issued.length > 0 && <section className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-900 p-5"><h2 className="font-bold text-emerald-700">Emissão concluída: {issued.length} certificado(s)</h2><div className="mt-3 space-y-2">{issued.map((cert) => <div key={cert.id} className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800 p-3"><div><div className="font-bold text-sm">{cert.studentName}</div><div className="font-mono text-xs text-slate-500">{cert.code}</div></div><button onClick={() => setSelected(cert)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold"><Eye className="w-3.5 h-3.5" />Visualizar</button></div>)}</div></section>}

    {selected && <CertificateModal certificate={selected} isOpen={true} onClose={() => setSelected(null)} setCurrentView={setCurrentView} setValidationSearchCode={setValidationSearchCode} />}
  </div>;
};
