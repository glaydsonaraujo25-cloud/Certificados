import React, { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
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

const normalizeDocument = (value: string) => value.replace(/\D/g, '');

const isValidCpf = (value: string) => {
  const cpf = normalizeDocument(value);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  const calcDigit = (length: number) => {
    let sum = 0;
    for (let i = 0; i < length; i += 1) sum += Number(cpf[i]) * (length + 1 - i);
    const digit = (sum * 10) % 11;
    return digit === 10 ? 0 : digit;
  };
  return calcDigit(9) === Number(cpf[9]) && calcDigit(10) === Number(cpf[10]);
};

const findCell = (row: Record<string, unknown>, aliases: string[]) => {
  const entries = Object.entries(row);
  const found = entries.find(([key]) => aliases.includes(key.trim().toLowerCase()));
  return found ? String(found[1] ?? '').trim() : '';
};

export const BatchEmissionView: React.FC = () => {
  const { institution, issueCertificate, courses, students, certificates, addStudent, setCurrentView, setValidationSearchCode } = useApp();
  const course = courses[0];
  const [rows, setRows] = useState<BatchRow[]>([]);
  const [processing, setProcessing] = useState(false);
  const [issued, setIssued] = useState<Certificate[]>([]);
  const [selected, setSelected] = useState<Certificate | null>(null);
  const [fileName, setFileName] = useState('');

  const validateRows = (inputRows: BatchRow[]) => {
    const emailCounts = new Map<string, number>();
    const documentCounts = new Map<string, number>();

    inputRows.forEach((row) => {
      const email = row.studentEmail.trim().toLowerCase();
      const document = normalizeDocument(row.studentDocument);
      if (email) emailCounts.set(email, (emailCounts.get(email) || 0) + 1);
      if (document) documentCounts.set(document, (documentCounts.get(document) || 0) + 1);
    });

    return inputRows.map((row) => {
      const name = row.studentName.trim();
      const email = row.studentEmail.trim().toLowerCase();
      const document = normalizeDocument(row.studentDocument);

      let errorMsg = '';
      if (!name) errorMsg = 'Nome obrigatório.';
      else if (!email || !/^\S+@\S+\.\S+$/.test(email)) errorMsg = 'E-mail inválido.';
      else if (!document) errorMsg = 'CPF obrigatório.';
      else if (!isValidCpf(document)) errorMsg = 'CPF inválido.';
      else if ((emailCounts.get(email) || 0) > 1) errorMsg = 'E-mail repetido na planilha.';
      else if ((documentCounts.get(document) || 0) > 1) errorMsg = 'CPF repetido na planilha.';
      else if (course && certificates.some((cert) => cert.status === 'active' && cert.courseId === course.id && normalizeDocument(cert.studentDocument || '') === document)) errorMsg = 'Já existe certificado ativo para este CPF neste curso.';

      return { ...row, status: errorMsg ? 'invalid' as const : 'valid' as const, errorMsg: errorMsg || undefined };
    });
  };

  const updateRow = (id: string, updates: Partial<BatchRow>) => {
    setRows((prev) => validateRows(prev.map((row) => row.id === id ? { ...row, ...updates } : row)));
  };

  const addRow = () => {
    setRows((prev) => validateRows([...prev, { id: `row-${Date.now()}`, studentName: '', studentEmail: '', studentDocument: '', status: 'invalid', errorMsg: 'Preencha os dados.' }]));
  };

  const removeRow = (id: string) => setRows((prev) => validateRows(prev.filter((row) => row.id !== id)));

  const downloadExcelModel = () => {
    const worksheet = XLSX.utils.json_to_sheet([
      { nome_aluno: 'NOME COMPLETO DO ALUNO', email: 'aluno@exemplo.com', cpf: '12345678909' },
    ]);
    worksheet['!cols'] = [{ wch: 36 }, { wch: 30 }, { wch: 18 }];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Alunos');
    XLSX.writeFile(workbook, 'modelo_certificados_operador_computador_ia.xlsx');
  };

  const importExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      if (!firstSheet) throw new Error('Planilha sem abas.');

      const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: '' });
      const parsed: BatchRow[] = data.map((item, index) => ({
        id: `excel-${Date.now()}-${index}`,
        studentName: findCell(item, ['nome_aluno', 'nome', 'aluno', 'nome completo', 'nome_completo']),
        studentEmail: findCell(item, ['email', 'e-mail', 'e_mail']),
        studentDocument: findCell(item, ['cpf', 'cpf_documento', 'documento', 'cpf/documento']),
        status: 'invalid',
      }));

      setRows(validateRows(parsed));
      setIssued([]);
      setFileName(file.name);
    } catch (error) {
      console.error(error);
      alert('Não foi possível ler a planilha. Use um arquivo .xlsx ou .xls com as colunas nome_aluno, email e cpf.');
    } finally {
      event.target.value = '';
    }
  };

  const validCount = useMemo(() => rows.filter((row) => row.status === 'valid').length, [rows]);
  const invalidCount = rows.length - validCount;

  const processBatch = async () => {
    if (!course) { alert('Cadastre o curso Operador de Computador com IA antes da emissão.'); return; }
    if (!rows.length) { alert('Importe uma planilha Excel ou adicione alunos manualmente.'); return; }
    if (invalidCount > 0) { alert('Existem registros com erro. Corrija todos antes de gerar os certificados.'); return; }

    setProcessing(true);
    try {
      const results = rows.map((row) => {
        const normalizedDocument = normalizeDocument(row.studentDocument);
        const normalizedEmail = row.studentEmail.trim().toLowerCase();
        let student = students.find((item) => normalizeDocument(item.documentNumber || '') === normalizedDocument || item.email.trim().toLowerCase() === normalizedEmail);

        if (!student) {
          student = addStudent({
            fullName: row.studentName.trim().toUpperCase(),
            email: normalizedEmail,
            documentNumber: normalizedDocument,
            courseId: course.id,
            completionDate: course.endDate,
            notes: 'Aluno importado por planilha Excel para emissão de certificado.',
          });
        }

        return issueCertificate({
          studentId: student.id,
          studentName: row.studentName.trim().toUpperCase(),
          studentEmail: normalizedEmail,
          studentDocument: normalizedDocument,
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
        });
      });
      setIssued(results);
    } catch (error) {
      console.error(error);
      alert('Ocorreu um erro durante a geração dos certificados.');
    } finally {
      setProcessing(false);
    }
  };

  return <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
    <div><div className="flex items-center gap-2"><Layers className="w-6 h-6 text-indigo-600" /><h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Gerar por Planilha Excel</h1></div><p className="text-sm text-slate-500 mt-1">Importe uma planilha .xlsx ou .xls e gere os certificados do curso <strong>Operador de Computador com IA</strong> automaticamente.</p></div>

    <div className="grid sm:grid-cols-4 gap-4">
      <div className="sm:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5"><div className="font-bold">Curso da emissão</div><div className="text-lg font-extrabold text-indigo-700 dark:text-indigo-300 mt-1">{course?.name || 'Operador de Computador com IA'}</div><div className="text-sm text-slate-500 mt-1">{course?.workloadHours || 230} horas • {course?.modality || 'presencial'}</div></div>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5"><div className="text-xs text-slate-500">Registros válidos</div><div className="text-3xl font-black mt-1 text-emerald-600">{validCount}</div></div>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5"><div className="text-xs text-slate-500">Com erro</div><div className="text-3xl font-black mt-1 text-rose-600">{invalidCount}</div></div>
    </div>

    <div className="flex flex-wrap gap-2">
      <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold cursor-pointer"><Upload className="w-4 h-4" />Importar Excel<input type="file" accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" onChange={importExcel} className="hidden" /></label>
      <button onClick={downloadExcelModel} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold"><Download className="w-4 h-4" />Baixar modelo Excel</button>
      <button onClick={addRow} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-bold"><Plus className="w-4 h-4" />Adicionar aluno</button>
      {fileName && <span className="flex items-center px-3 text-xs text-slate-500">Arquivo: {fileName}</span>}
    </div>

    <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-xs text-indigo-800 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200">A primeira linha da planilha deve conter os cabeçalhos <strong>nome_aluno</strong>, <strong>email</strong> e <strong>cpf</strong>. Cada linha abaixo representa um certificado a ser gerado.</div>

    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-xs"><thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px]"><tr><th className="px-4 py-3 text-left">Aluno</th><th className="px-4 py-3 text-left">E-mail</th><th className="px-4 py-3 text-left">CPF</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3"></th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{rows.length === 0 ? <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-400">Nenhum aluno carregado. Importe uma planilha Excel para começar.</td></tr> : rows.map((row) => <tr key={row.id} className={row.status === 'invalid' ? 'bg-rose-50/40 dark:bg-rose-950/10' : ''}><td className="px-4 py-3"><input value={row.studentName} onChange={(e) => updateRow(row.id, { studentName: e.target.value })} className="w-full min-w-52 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" /></td><td className="px-4 py-3"><input value={row.studentEmail} onChange={(e) => updateRow(row.id, { studentEmail: e.target.value })} className="w-full min-w-48 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" /></td><td className="px-4 py-3"><input value={row.studentDocument} onChange={(e) => updateRow(row.id, { studentDocument: e.target.value })} className="w-full min-w-40 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" /></td><td className="px-4 py-3"><div>{row.status === 'valid' ? <span className="inline-flex items-center gap-1 text-emerald-600 font-bold"><CheckCircle2 className="w-4 h-4" />Pronto</span> : <span className="inline-flex items-center gap-1 text-rose-600 font-bold"><AlertTriangle className="w-4 h-4" />Corrigir</span>}</div>{row.errorMsg && <div className="mt-1 max-w-48 text-[10px] text-rose-600">{row.errorMsg}</div>}</td><td className="px-4 py-3"><button onClick={() => removeRow(row.id)} className="text-rose-600"><Trash2 className="w-4 h-4" /></button></td></tr>)}</tbody></table></div></div>

    <div className="flex justify-end"><button onClick={processBatch} disabled={processing || !rows.length || invalidCount > 0} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed">{processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}Gerar {validCount} certificado(s)</button></div>

    {issued.length > 0 && <section className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-900 p-5"><h2 className="font-bold text-emerald-700">Geração concluída: {issued.length} certificado(s)</h2><div className="mt-3 space-y-2">{issued.map((cert) => <div key={cert.id} className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800 p-3"><div><div className="font-bold text-sm">{cert.studentName}</div><div className="font-mono text-xs text-slate-500">{cert.code}</div></div><button onClick={() => setSelected(cert)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold"><Eye className="w-3.5 h-3.5" />Visualizar</button></div>)}</div></section>}

    {selected && <CertificateModal certificate={selected} isOpen={true} onClose={() => setSelected(null)} setCurrentView={setCurrentView} setValidationSearchCode={setValidationSearchCode} />}
  </div>;
};
