import React, { useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import * as XLSX from 'xlsx';
import { useApp } from '../context/AppContext';
import { Certificate } from '../types';
import { CertificateModal } from '../components/CertificateModal';
import { CertificateBackPage, CertificateFrontPage } from '../components/CertificateDocument';
import { getCertificatePdfFilename, renderTwoPageCertificatePdfBlob } from '../utils/pdfGenerator';
import { createZipBlob, downloadBlob } from '../utils/zipGenerator';
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Download, Eye, FileArchive, FileSpreadsheet, Layers, Loader2, Plus, RotateCcw, Trash2, Upload, X } from 'lucide-react';

interface BatchRow {
  id: string;
  studentName: string;
  studentEmail: string;
  studentDocument: string;
  registrationNumber: string;
  cnhCategory: string;
  status: 'valid' | 'invalid';
  errorMsg?: string;
}

const digits = (value: string) => value.replace(/\D/g, '').slice(0, 11);
const isValidCpf = (value: string) => {
  const cpf = digits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const calc = (length: number) => { let sum = 0; for (let i = 0; i < length; i += 1) sum += Number(cpf[i]) * (length + 1 - i); const digit = (sum * 10) % 11; return digit === 10 ? 0 : digit; };
  return calc(9) === Number(cpf[9]) && calc(10) === Number(cpf[10]);
};
const findCell = (row: Record<string, unknown>, aliases: string[]) => { const found = Object.entries(row).find(([key]) => aliases.includes(key.trim().toLowerCase())); return found ? String(found[1] ?? '').trim() : ''; };
const waitForPaint = () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

export const BatchEmissionView: React.FC = () => {
  const { institution, issueCertificate, courses, classes, students, certificates, addStudent, updateStudent, setCurrentView, setValidationSearchCode } = useApp();
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');
  const course = courses.find((item) => item.id === selectedCourseId) || courses[0];
  const availableClasses = classes.filter((item) => item.courseId === course?.id);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [rows, setRows] = useState<BatchRow[]>([]);
  const [processing, setProcessing] = useState(false);
  const [issued, setIssued] = useState<Certificate[]>([]);
  const [selected, setSelected] = useState<Certificate | null>(null);
  const [fileName, setFileName] = useState('');
  const [reviewOpen, setReviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [zipProcessing, setZipProcessing] = useState(false);
  const [zipStatus, setZipStatus] = useState('');
  const [exportingCertificate, setExportingCertificate] = useState<Certificate | null>(null);

  useEffect(() => { if (!selectedCourseId && courses[0]) setSelectedCourseId(courses[0].id); }, [courses, selectedCourseId]);

  const validateRows = (inputRows: BatchRow[], targetCourse = course) => {
    const emailCounts = new Map<string, number>();
    const cpfCounts = new Map<string, number>();
    const registrationCounts = new Map<string, number>();
    inputRows.forEach((row) => {
      const email = row.studentEmail.trim().toLowerCase(); const cpf = digits(row.studentDocument); const registration = digits(row.registrationNumber);
      if (email) emailCounts.set(email, (emailCounts.get(email) || 0) + 1);
      if (cpf) cpfCounts.set(cpf, (cpfCounts.get(cpf) || 0) + 1);
      if (registration) registrationCounts.set(registration, (registrationCounts.get(registration) || 0) + 1);
    });
    return inputRows.map((row) => {
      const name = row.studentName.trim(); const email = row.studentEmail.trim().toLowerCase(); const cpf = digits(row.studentDocument); const registration = digits(row.registrationNumber); const category = row.cnhCategory.trim().toUpperCase();
      let errorMsg = '';
      if (!name) errorMsg = 'Nome obrigatório.';
      else if (!email || !/^\S+@\S+\.\S+$/.test(email)) errorMsg = 'E-mail inválido.';
      else if (cpf.length !== 11) errorMsg = 'CPF deve ter 11 dígitos.';
      else if (!isValidCpf(cpf)) errorMsg = 'CPF inválido.';
      else if (registration.length !== 11) errorMsg = 'Nº registro deve ter 11 dígitos.';
      else if (!category) errorMsg = 'Categoria CNH obrigatória.';
      else if ((emailCounts.get(email) || 0) > 1) errorMsg = 'E-mail repetido na planilha.';
      else if ((cpfCounts.get(cpf) || 0) > 1) errorMsg = 'CPF repetido na planilha.';
      else if ((registrationCounts.get(registration) || 0) > 1) errorMsg = 'Nº registro repetido na planilha.';
      else if (targetCourse && certificates.some((cert) => cert.status === 'active' && cert.courseId === targetCourse.id && digits(cert.studentDocument || '') === cpf)) errorMsg = 'Já existe certificado ativo para este CPF neste curso.';
      return { ...row, studentDocument: cpf, registrationNumber: registration, cnhCategory: category, status: errorMsg ? 'invalid' as const : 'valid' as const, errorMsg: errorMsg || undefined };
    });
  };

  useEffect(() => { setRows((prev) => validateRows(prev, course)); setIssued([]); if (!availableClasses.some((item) => item.id === selectedClassId)) setSelectedClassId(''); }, [selectedCourseId]);
  const updateRow = (id: string, updates: Partial<BatchRow>) => setRows((prev) => validateRows(prev.map((row) => row.id === id ? { ...row, ...updates } : row)));
  const addRow = () => setRows((prev) => validateRows([...prev, { id: `row-${Date.now()}`, studentName: '', studentEmail: '', studentDocument: '', registrationNumber: '', cnhCategory: 'AD', status: 'invalid', errorMsg: 'Preencha os dados.' }]));
  const removeRow = (id: string) => setRows((prev) => validateRows(prev.filter((row) => row.id !== id)));
  const clearBatch = () => { setRows([]); setIssued([]); setFileName(''); setSelected(null); setReviewOpen(false); setPreviewIndex(0); };

  const downloadExcelModel = () => {
    const worksheet = XLSX.utils.json_to_sheet([{ nome_aluno: 'NOME COMPLETO DO CONDUTOR', email: 'condutor@exemplo.com', cpf: '00000000000', numero_registro: '00000000000', categoria_cnh: 'AD' }]);
    worksheet['!cols'] = [{ wch: 38 }, { wch: 30 }, { wch: 16 }, { wch: 18 }, { wch: 16 }];
    const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, worksheet, 'Condutores'); XLSX.writeFile(workbook, 'modelo_emissao_certificados_cvte.xlsx');
  };

  const exportIssuedReport = () => {
    if (!issued.length) return;
    const data = issued.map((cert) => ({ codigo: cert.code, aluno: cert.studentName, cpf: cert.studentDocument || '', numero_registro: cert.registrationNumber || '', categoria_cnh: cert.cnhCategory || '', email: cert.studentEmail || '', curso: cert.courseName, carga_horaria: cert.workloadHours, data_emissao: cert.issueDate, status: cert.status === 'active' ? 'Ativo' : cert.status }));
    const worksheet = XLSX.utils.json_to_sheet(data); worksheet['!cols'] = [{ wch: 18 }, { wch: 36 }, { wch: 16 }, { wch: 18 }, { wch: 14 }, { wch: 30 }, { wch: 48 }, { wch: 16 }, { wch: 16 }, { wch: 12 }];
    const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, worksheet, 'Certificados CVTE'); XLSX.writeFile(workbook, `relatorio_cvte_${issueDate}.xlsx`);
  };

  const importExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; if (!file) return;
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' }); const sheet = workbook.Sheets[workbook.SheetNames[0]]; if (!sheet) throw new Error('Planilha sem abas.');
      const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
      const parsed: BatchRow[] = data.map((item, index) => ({
        id: `excel-${Date.now()}-${index}`,
        studentName: findCell(item, ['nome_aluno', 'nome', 'aluno', 'nome completo', 'nome_completo', 'nome do aluno']),
        studentEmail: findCell(item, ['email', 'e-mail', 'e_mail', 'email do aluno']),
        studentDocument: findCell(item, ['cpf', 'cpf_documento', 'documento', 'cpf/documento', 'cpf do aluno']),
        registrationNumber: findCell(item, ['numero_registro', 'n_registro', 'registro', 'nº registro', 'numero do condutor', 'n condutor']),
        cnhCategory: findCell(item, ['categoria', 'categoria_cnh', 'cnh', 'categoria da cnh']),
        status: 'invalid',
      }));
      if (!parsed.length) throw new Error('Planilha sem registros.'); setRows(validateRows(parsed)); setIssued([]); setFileName(file.name); setPreviewIndex(0);
    } catch (error) { console.error(error); alert('Não foi possível ler a planilha CVTE. Use o modelo disponibilizado pelo sistema.'); }
    finally { event.target.value = ''; }
  };

  const validCount = useMemo(() => rows.filter((row) => row.status === 'valid').length, [rows]);
  const invalidCount = rows.length - validCount;
  const ensureReady = () => { if (!course) return alert('Cadastre o curso CVTE antes da emissão.'), false; if (!issueDate) return alert('Informe a data de emissão.'), false; if (!rows.length) return alert('Importe uma planilha Excel ou adicione condutores.'), false; if (invalidCount > 0) return alert('Corrija todos os registros com erro antes de continuar.'), false; return true; };

  const previewCertificate = useMemo(() => {
    const row = rows[Math.min(previewIndex, Math.max(0, rows.length - 1))]; if (!row || !course) return null;
    return { studentName: row.studentName.trim().toUpperCase(), studentDocument: digits(row.studentDocument), registrationNumber: digits(row.registrationNumber), cnhCategory: row.cnhCategory.trim().toUpperCase(), studentEmail: row.studentEmail.trim().toLowerCase(), courseName: course.name, courseSubhead: course.courseSubhead || 'Condutores de Veículos de Transporte de Emergência', workloadHours: course.workloadHours, modality: course.modality, instructorName: course.instructorName, institutionName: institution.name, institutionCnpj: institution.institutionCnpj, legalInstruction: institution.legalInstruction, contranResolution: institution.contranResolution, validityText: institution.validityText, syllabus: course.syllabus, issueDate, startDate: course.startDate, endDate: course.endDate, location: `${institution.city || 'Brasília'}-${institution.state || 'DF'}`, signatoryName: institution.signatoryName || 'Diretor Geral', signatoryRole: institution.signatoryRole || 'Diretor Geral', signatoryCpf: institution.signatoryCpf, signatureImageUrl: institution.signatureImageUrl, code: '006/CVTE/2026' };
  }, [rows, previewIndex, course, institution, issueDate]);

  const openReview = () => { if (!ensureReady()) return; setPreviewIndex(0); setReviewOpen(true); };
  const processBatch = async () => {
    if (!ensureReady() || !course) return;
    setReviewOpen(false); setProcessing(true);
    try {
      const results = rows.map((row) => {
        const cpf = digits(row.studentDocument); const registration = digits(row.registrationNumber); const email = row.studentEmail.trim().toLowerCase(); const category = row.cnhCategory.trim().toUpperCase();
        let student = students.find((item) => digits(item.documentNumber || '') === cpf || item.email.trim().toLowerCase() === email);
        if (!student) student = addStudent({ fullName: row.studentName.trim().toUpperCase(), email, documentNumber: cpf, registrationNumber: registration, cnhCategory: category, courseId: course.id, classId: selectedClassId || undefined, completionDate: course.endDate, notes: `Condutor importado por planilha para emissão CVTE em ${issueDate}.` });
        else updateStudent(student.id, { courseId: course.id, classId: selectedClassId || student.classId, registrationNumber: registration, cnhCategory: category });
        return issueCertificate({ studentId: student.id, studentName: row.studentName.trim().toUpperCase(), studentEmail: email, studentDocument: cpf, registrationNumber: registration, cnhCategory: category, courseId: course.id, courseName: course.name, courseSubhead: course.courseSubhead || 'Condutores de Veículos de Transporte de Emergência', workloadHours: course.workloadHours, modality: course.modality, instructorName: course.instructorName || 'Instrutor Responsável', institutionName: institution.name, institutionCnpj: institution.institutionCnpj, legalInstruction: institution.legalInstruction, contranResolution: institution.contranResolution, validityText: institution.validityText, syllabus: course.syllabus, issueDate, startDate: course.startDate, endDate: course.endDate, location: `${institution.city || 'Brasília'}-${institution.state || 'DF'}`, signatoryName: institution.signatoryName || 'Diretor Geral', signatoryRole: institution.signatoryRole || 'Diretor Geral', signatoryCpf: institution.signatoryCpf, signatureImageUrl: institution.signatureImageUrl, templateId: 'official' });
      });
      setIssued(results);
    } catch (error) { console.error(error); alert('Ocorreu um erro durante a geração dos certificados CVTE.'); }
    finally { setProcessing(false); }
  };

  const downloadAllZip = async () => {
    if (!issued.length || zipProcessing) return; setZipProcessing(true);
    try {
      const files: { name: string; data: Blob }[] = [];
      for (let index = 0; index < issued.length; index += 1) {
        const cert = issued[index]; setZipStatus(`Gerando PDF ${index + 1} de ${issued.length}: ${cert.studentName}`); flushSync(() => setExportingCertificate(cert)); await waitForPaint();
        const blob = await renderTwoPageCertificatePdfBlob({ frontElementId: 'batch-zip-front', backElementId: 'batch-zip-back' }); files.push({ name: getCertificatePdfFilename(cert.studentName, cert.code), data: blob });
      }
      setZipStatus('Compactando arquivos...'); const zip = await createZipBlob(files); downloadBlob(zip, `certificados_cvte_${issueDate}_${issued.length}.zip`);
    } catch (error) { console.error(error); alert('Não foi possível gerar o arquivo ZIP.'); }
    finally { setExportingCertificate(null); setZipProcessing(false); setZipStatus(''); }
  };

  return <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
    <div><div className="flex items-center gap-2"><Layers className="w-6 h-6 text-indigo-600" /><h1 className="text-2xl sm:text-3xl font-extrabold">Emissão CVTE por Planilha Excel</h1></div><p className="text-sm text-slate-500 mt-1">Importe condutores, revise CPF, Nº de registro e categoria da CNH e gere os certificados em lote.</p></div>
    <div className="grid lg:grid-cols-4 gap-4"><div className="lg:col-span-2 bg-white dark:bg-slate-900 border rounded-2xl p-5 space-y-3"><div className="font-bold">Configuração da emissão</div><label className="block text-xs font-semibold">Curso<select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border">{courses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="block text-xs font-semibold">Turma (opcional)<select value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"><option value="">Não vincular a uma turma</option>{availableClasses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="block text-xs font-semibold">Data de emissão<input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border" /></label></div><Metric label="Prontos" value={validCount} tone="text-emerald-600" /><Metric label="Com erro" value={invalidCount} tone="text-rose-600" /></div>
    <div className="flex flex-wrap gap-2"><label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold cursor-pointer"><Upload className="w-4 h-4" />Importar Excel<input type="file" accept=".xlsx,.xls" onChange={importExcel} className="hidden" /></label><button onClick={downloadExcelModel} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border text-sm font-bold"><Download className="w-4 h-4" />Baixar modelo CVTE</button><button onClick={addRow} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-bold"><Plus className="w-4 h-4" />Adicionar condutor</button>{(rows.length > 0 || fileName) && <button onClick={clearBatch} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50 text-rose-700 text-sm font-bold"><RotateCcw className="w-4 h-4" />Limpar lote</button>}{fileName && <span className="flex items-center px-3 text-xs text-slate-500">Arquivo: {fileName}</span>}</div>
    <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-xs text-indigo-800 dark:bg-indigo-950/40">Colunas obrigatórias: <strong>nome_aluno</strong>, <strong>email</strong>, <strong>cpf</strong>, <strong>numero_registro</strong> e <strong>categoria_cnh</strong>. CPF e Nº registro devem conter 11 dígitos.</div>
    <div className="bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-xs"><thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px]"><tr><th className="px-3 py-3 text-left">Condutor</th><th className="px-3 py-3 text-left">CPF</th><th className="px-3 py-3 text-left">Nº Registro</th><th className="px-3 py-3 text-left">CNH</th><th className="px-3 py-3 text-left">E-mail</th><th className="px-3 py-3 text-left">Status</th><th></th></tr></thead><tbody className="divide-y">{rows.length === 0 ? <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">Nenhum condutor carregado.</td></tr> : rows.map((row) => <tr key={row.id} className={row.status === 'invalid' ? 'bg-rose-50/40 dark:bg-rose-950/10' : ''}><td className="px-3 py-3"><input value={row.studentName} onChange={(e) => updateRow(row.id, { studentName: e.target.value })} className="w-full min-w-52 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border" /></td><td className="px-3 py-3"><input value={row.studentDocument} onChange={(e) => updateRow(row.id, { studentDocument: digits(e.target.value) })} inputMode="numeric" maxLength={11} className="w-32 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border" /></td><td className="px-3 py-3"><input value={row.registrationNumber} onChange={(e) => updateRow(row.id, { registrationNumber: digits(e.target.value) })} inputMode="numeric" maxLength={11} className="w-32 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border" /></td><td className="px-3 py-3"><input value={row.cnhCategory} onChange={(e) => updateRow(row.id, { cnhCategory: e.target.value.toUpperCase().replace(/[^A-E]/g, '').slice(0, 2) })} maxLength={2} className="w-20 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border" /></td><td className="px-3 py-3"><input value={row.studentEmail} onChange={(e) => updateRow(row.id, { studentEmail: e.target.value })} className="w-full min-w-48 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border" /></td><td className="px-3 py-3">{row.status === 'valid' ? <span className="inline-flex items-center gap-1 text-emerald-600 font-bold"><CheckCircle2 className="w-4 h-4" />Pronto</span> : <div><span className="inline-flex items-center gap-1 text-rose-600 font-bold"><AlertTriangle className="w-4 h-4" />Corrigir</span><div className="mt-1 text-[10px] text-rose-600 max-w-44">{row.errorMsg}</div></div>}</td><td className="px-3 py-3"><button onClick={() => removeRow(row.id)} className="text-rose-600"><Trash2 className="w-4 h-4" /></button></td></tr>)}</tbody></table></div></div>
    <div className="flex justify-end"><button onClick={openReview} disabled={processing || !rows.length || invalidCount > 0 || !issueDate || !course} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold disabled:opacity-50"><Eye className="w-4 h-4" />Revisar e gerar {validCount} certificado(s)</button></div>

    {issued.length > 0 && <section className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold text-emerald-700">Geração concluída: {issued.length} certificado(s)</h2><p className="text-xs text-slate-500 mt-1">Os documentos foram registrados com CPF, Nº registro e categoria da CNH.</p></div><div className="flex flex-wrap gap-2"><button onClick={exportIssuedReport} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-bold"><FileSpreadsheet className="w-4 h-4" />Relatório Excel</button><button onClick={downloadAllZip} disabled={zipProcessing} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold disabled:opacity-50">{zipProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileArchive className="w-4 h-4" />}{zipProcessing ? 'Gerando ZIP...' : 'Baixar todos em ZIP'}</button></div></div>{zipStatus && <div className="mt-3 rounded-xl bg-indigo-50 px-3 py-2 text-xs text-indigo-700">{zipStatus}</div>}<div className="mt-3 space-y-2">{issued.map((cert) => <div key={cert.id} className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800 p-3"><div><div className="font-bold text-sm">{cert.studentName}</div><div className="font-mono text-xs text-slate-500">{cert.code} • Registro {cert.registrationNumber}</div></div><button onClick={() => setSelected(cert)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold"><Eye className="w-3.5 h-3.5" />Visualizar</button></div>)}</div></section>}

    {reviewOpen && previewCertificate && <div className="fixed inset-0 z-[90] bg-slate-950/80 flex items-center justify-center p-3"><div className="w-full max-w-6xl max-h-[96vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl"><div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 p-4 border-b bg-white dark:bg-slate-900"><div><h3 className="font-extrabold text-lg">Revisão CVTE antes da emissão</h3><p className="text-xs text-slate-500">{rows.length} certificados • emissão {new Date(`${issueDate}T00:00:00`).toLocaleDateString('pt-BR')}</p></div><div className="flex items-center gap-2"><button disabled={previewIndex <= 0} onClick={() => setPreviewIndex((value) => Math.max(0, value - 1))} className="p-2 rounded-lg bg-slate-100 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button><span className="text-xs font-bold">{previewIndex + 1}/{rows.length}</span><button disabled={previewIndex >= rows.length - 1} onClick={() => setPreviewIndex((value) => Math.min(rows.length - 1, value + 1))} className="p-2 rounded-lg bg-slate-100 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button><button onClick={() => setReviewOpen(false)} className="p-2"><X className="w-5 h-5" /></button></div></div><div className="p-5 bg-slate-200 dark:bg-slate-950 overflow-x-auto"><div className="origin-top scale-[0.72] sm:scale-[0.85] lg:scale-95"><CertificateFrontPage certificate={previewCertificate} elementId="batch-review-preview" /></div></div><div className="p-4 flex flex-wrap items-center justify-between gap-3 border-t"><div className="text-sm"><strong>{rows[previewIndex]?.studentName}</strong><div className="text-xs text-slate-500">CPF {rows[previewIndex]?.studentDocument} • Registro {rows[previewIndex]?.registrationNumber} • CNH {rows[previewIndex]?.cnhCategory}</div></div><div className="flex gap-2"><button onClick={() => setReviewOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-sm font-semibold">Voltar e editar</button><button onClick={processBatch} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold"><CheckCircle2 className="w-4 h-4" />Confirmar emissão de {rows.length}</button></div></div></div></div>}

    {selected && <CertificateModal certificate={selected} isOpen={true} onClose={() => setSelected(null)} setCurrentView={setCurrentView} setValidationSearchCode={setValidationSearchCode} />}
    {exportingCertificate && <div className="fixed -left-[20000px] top-0 pointer-events-none"><CertificateFrontPage certificate={exportingCertificate} elementId="batch-zip-front" /><CertificateBackPage certificate={exportingCertificate} elementId="batch-zip-back" /></div>}
  </div>;
};

const Metric: React.FC<{ label: string; value: number; tone: string }> = ({ label, value, tone }) => <div className="bg-white dark:bg-slate-900 border rounded-2xl p-5"><div className="text-xs text-slate-500">{label}</div><div className={`text-3xl font-black mt-1 ${tone}`}>{value}</div></div>;
