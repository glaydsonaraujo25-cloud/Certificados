import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Certificate } from '../types';
import { CertificateModal } from '../components/CertificateModal';
import { AlertTriangle, CheckCircle2, Download, Eye, FileSpreadsheet, Layers, Loader2, Plus, Trash2, Upload, XCircle } from 'lucide-react';

interface BatchRow {
  id: string;
  studentName: string;
  studentEmail: string;
  studentDocument: string;
  status: 'valid' | 'invalid';
  errorMsg?: string;
}

const onlyDigits = (value: string) => value.replace(/\D/g, '');
const normalizeEmail = (value: string) => value.trim().toLowerCase();

const isValidCpf = (value: string) => {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  const digit = (length: number) => {
    let sum = 0;
    for (let index = 0; index < length; index++) sum += Number(cpf[index]) * (length + 1 - index);
    const result = (sum * 10) % 11;
    return result === 10 ? 0 : result;
  };
  return digit(9) === Number(cpf[9]) && digit(10) === Number(cpf[10]);
};

const formatCpf = (value: string) => {
  const digits = onlyDigits(value).slice(0, 11);
  return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2}).*/, (_, a, b, c, d) => d ? `${a}.${b}.${c}-${d}` : `${a}.${b}.${c}`);
};

export const BatchEmissionView: React.FC = () => {
  const { institution, issueCertificate, courses, students, certificates, addStudent, setCurrentView, setValidationSearchCode } = useApp();
  const course = courses[0];
  const [rows, setRows] = useState<BatchRow[]>([]);
  const [processing, setProcessing] = useState(false);
  const [issued, setIssued] = useState<Certificate[]>([]);
  const [selected, setSelected] = useState<Certificate | null>(null);
  const [importMessage, setImportMessage] = useState('');

  const validateRows = (sourceRows: BatchRow[]) => {
    const documentCounts = new Map<string, number>();
    const emailCounts = new Map<string, number>();
    sourceRows.forEach((row) => {
      const document = onlyDigits(row.studentDocument);
      const email = normalizeEmail(row.studentEmail);
      if (document) documentCounts.set(document, (documentCounts.get(document) || 0) + 1);
      if (email) emailCounts.set(email, (emailCounts.get(email) || 0) + 1);
    });

    return sourceRows.map((row) => {
      const document = onlyDigits(row.studentDocument);
      const email = normalizeEmail(row.studentEmail);
      const errors: string[] = [];

      if (!row.studentName.trim()) errors.push('Nome obrigatório');
      if (!email) errors.push('E-mail obrigatório');
      else if (!/^\S+@\S+\.\S+$/.test(email)) errors.push('E-mail inválido');
      if (!document) errors.push('CPF obrigatório');
      else if (!isValidCpf(document)) errors.push('CPF inválido');
      if (document && (documentCounts.get(document) || 0) > 1) errors.push('CPF repetido no lote');
      if (email && (emailCounts.get(email) || 0) > 1) errors.push('E-mail repetido no lote');

      const existingStudent = students.find((student) => onlyDigits(student.documentNumber || '') === document || normalizeEmail(student.email || '') === email);
      const alreadyCertified = course && certificates.some((certificate) =>
        certificate.status === 'active' &&
        certificate.courseId === course.id &&
        (onlyDigits(certificate.studentDocument || '') === document || (existingStudent && certificate.studentId === existingStudent.id))
      );
      if (alreadyCertified) errors.push('Já existe certificado ativo para este aluno e curso');

      return { ...row, studentDocument: document ? formatCpf(document) : row.studentDocument, status: errors.length ? 'invalid' as const : 'valid' as const, errorMsg: errors.join(' • ') || undefined };
    });
  };

  const setAndValidateRows = (nextRows: BatchRow[]) => setRows(validateRows(nextRows));
  const updateRow = (id: string, updates: Partial<BatchRow>) => setAndValidateRows(rows.map((row) => row.id === id ? { ...row, ...updates } : row));
  const removeRow = (id: string) => setAndValidateRows(rows.filter((row) => row.id !== id));
  const addRow = () => setAndValidateRows([...rows, { id: `row-${Date.now()}`, studentName: '', studentEmail: '', studentDocument: '', status: 'invalid', errorMsg: 'Preencha os dados' }]);

  const validCount = useMemo(() => rows.filter((row) => row.status === 'valid').length, [rows]);
  const invalidCount = rows.length - validCount;

  const downloadModel = () => {
    const csv = '\uFEFFnome_aluno,email,cpf\nNOME COMPLETO,aluno@exemplo.com,123.456.789-09\n';
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'modelo_operador_computador_ia.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const uploadCsv = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImportMessage('');
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '').replace(/^\uFEFF/, '');
      const lines = text.split(/\r?\n/).filter((line) => line.trim());
      if (lines.length < 2) { setImportMessage('O CSV não possui registros para importar.'); return; }
      const separator = lines[0].includes(';') ? ';' : ',';
      const parsed = lines.slice(1).map((line, index) => {
        const values = line.split(separator).map((value) => value.replace(/^['"]|['"]$/g, '').trim());
        return { id: `csv-${Date.now()}-${index}`, studentName: values[0] || '', studentEmail: values[1] || '', studentDocument: values[2] || '', status: 'invalid' as const };
      });
      const checked = validateRows(parsed);
      setRows(checked);
      setIssued([]);
      setImportMessage(`${checked.length} registro(s) importado(s): ${checked.filter((row) => row.status === 'valid').length} válido(s) e ${checked.filter((row) => row.status === 'invalid').length} com pendência.`);
    };
    reader.readAsText(file, 'utf-8');
    event.target.value = '';
  };

  const processBatch = async () => {
    if (!course) { alert('Cadastre o curso Operador de Computador com IA antes da emissão.'); return; }
    const checked = validateRows(rows);
    setRows(checked);
    const validRows = checked.filter((row) => row.status === 'valid');
    if (checked.some((row) => row.status === 'invalid')) { alert('Existem registros com pendências. Corrija todas as linhas antes da emissão.'); return; }
    if (!validRows.length) { alert('Adicione pelo menos um aluno válido para emitir.'); return; }

    setProcessing(true);
    try {
      const results: Certificate[] = [];
      for (const row of validRows) {
        const document = onlyDigits(row.studentDocument);
        const email = normalizeEmail(row.studentEmail);
        let student = students.find((item) => onlyDigits(item.documentNumber || '') === document || normalizeEmail(item.email || '') === email);
        if (!student) {
          student = addStudent({
            fullName: row.studentName.trim().toUpperCase(),
            email,
            documentNumber: formatCpf(document),
            courseId: course.id,
            completionDate: course.endDate || new Date().toISOString().split('T')[0],
            notes: 'Aluno cadastrado automaticamente pela emissão em lote.',
          });
        }

        results.push(issueCertificate({
          studentId: student.id,
          studentName: student.fullName,
          studentEmail: student.email || undefined,
          studentDocument: student.documentNumber || formatCpf(document),
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
      }
      setIssued(results);
      setImportMessage(`${results.length} certificado(s) emitido(s) com sucesso.`);
    } catch {
      alert('Ocorreu um erro durante a emissão em lote. Os registros já processados permanecem salvos.');
    } finally {
      setProcessing(false);
    }
  };

  return <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
    <div><div className="flex items-center gap-2"><Layers className="w-6 h-6 text-indigo-600" /><h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Emissão em Lote</h1></div><p className="text-sm text-slate-500 mt-1">Importe ou adicione alunos e valide tudo antes de emitir os certificados de <strong>Operador de Computador com IA</strong>.</p></div>

    <div className="grid sm:grid-cols-4 gap-4">
      <div className="sm:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5"><div className="font-bold">Curso da emissão</div><div className="text-lg font-extrabold text-indigo-700 dark:text-indigo-300 mt-1">{course?.name || 'Operador de Computador com IA'}</div><div className="text-sm text-slate-500 mt-1">{course?.workloadHours || 230} horas • {course?.modality || 'presencial'}</div></div>
      <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900 rounded-2xl p-5"><div className="text-xs text-slate-500">Registros válidos</div><div className="text-3xl font-black text-emerald-600 mt-1">{validCount}</div></div>
      <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900 rounded-2xl p-5"><div className="text-xs text-slate-500">Pendências</div><div className="text-3xl font-black text-rose-600 mt-1">{invalidCount}</div></div>
    </div>

    <div className="flex flex-wrap gap-2"><label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold cursor-pointer"><Upload className="w-4 h-4" />Importar CSV<input type="file" accept=".csv,text/csv" onChange={uploadCsv} className="hidden" /></label><button onClick={downloadModel} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-bold"><Download className="w-4 h-4" />Baixar modelo CSV</button><button onClick={addRow} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-bold"><Plus className="w-4 h-4" />Adicionar aluno</button></div>

    {importMessage && <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300">{importMessage}</div>}

    {rows.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center text-slate-500"><FileSpreadsheet className="w-10 h-10 mx-auto mb-3 text-slate-300" /><div className="font-bold text-slate-700 dark:text-slate-300">Nenhum aluno no lote</div><p className="text-sm mt-1">Importe um CSV ou clique em “Adicionar aluno” para começar.</p></div> : <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-xs"><thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px]"><tr><th className="px-4 py-3 text-left">Aluno</th><th className="px-4 py-3 text-left">E-mail</th><th className="px-4 py-3 text-left">CPF</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3"></th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{rows.map((row) => <tr key={row.id} className={row.status === 'invalid' ? 'bg-rose-50/40 dark:bg-rose-950/10' : ''}><td className="px-4 py-3"><input value={row.studentName} onChange={(e) => updateRow(row.id, { studentName: e.target.value })} className="w-full min-w-52 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" /></td><td className="px-4 py-3"><input type="email" value={row.studentEmail} onChange={(e) => updateRow(row.id, { studentEmail: e.target.value })} className="w-full min-w-48 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" /></td><td className="px-4 py-3"><input value={row.studentDocument} onChange={(e) => updateRow(row.id, { studentDocument: e.target.value })} className="w-full min-w-40 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" /></td><td className="px-4 py-3 min-w-64">{row.status === 'valid' ? <span className="inline-flex items-center gap-1 text-emerald-600 font-bold"><CheckCircle2 className="w-4 h-4" />Pronto para emitir</span> : <div className="flex items-start gap-1.5 text-rose-600"><XCircle className="w-4 h-4 mt-0.5 shrink-0" /><span className="font-semibold leading-4">{row.errorMsg || 'Corrija este registro'}</span></div>}</td><td className="px-4 py-3"><button onClick={() => removeRow(row.id)} className="text-rose-600" title="Remover linha"><Trash2 className="w-4 h-4" /></button></td></tr>)}</tbody></table></div></div>}

    {invalidCount > 0 && <div className="flex items-start gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-4 text-sm text-amber-800 dark:text-amber-300"><AlertTriangle className="w-5 h-5 shrink-0" /><span>A emissão só será liberada quando todas as linhas estiverem válidas. Isso evita certificados com CPF inválido, dados repetidos ou emissão duplicada.</span></div>}

    <div className="flex justify-end"><button onClick={processBatch} disabled={processing || rows.length === 0 || invalidCount > 0} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed">{processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}Emitir {validCount} certificado(s)</button></div>

    {issued.length > 0 && <section className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-900 p-5"><h2 className="font-bold text-emerald-700">Emissão concluída: {issued.length} certificado(s)</h2><div className="mt-3 space-y-2">{issued.map((cert) => <div key={cert.id} className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800 p-3"><div><div className="font-bold text-sm">{cert.studentName}</div><div className="font-mono text-xs text-slate-500">{cert.code}</div></div><button onClick={() => setSelected(cert)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-bold"><Eye className="w-3.5 h-3.5" />Visualizar</button></div>)}</div></section>}

    {selected && <CertificateModal certificate={selected} isOpen={true} onClose={() => setSelected(null)} setCurrentView={setCurrentView} setValidationSearchCode={setValidationSearchCode} />}
  </div>;
};
