import React, { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { AlertTriangle, CheckCircle2, Download, FileSpreadsheet, Upload } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ImportRow {
  id: string;
  name: string;
  email: string;
  document: string;
  registrationNumber: string;
  cnhCategory: string;
  status: 'valid' | 'invalid';
  error?: string;
}

const digits = (value: string) => value.replace(/\D/g, '').slice(0, 11);
const isValidCpf = (value: string) => digits(value).length === 11;
const getCell = (row: Record<string, unknown>, aliases: string[]) => {
  const found = Object.entries(row).find(([key]) => aliases.includes(key.trim().toLowerCase()));
  return found ? String(found[1] ?? '').trim() : '';
};

export const ImportStudentsView: React.FC = () => {
  const { courses, classes, students, addStudent, updateClass } = useApp();
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [classId, setClassId] = useState('');
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [message, setMessage] = useState('');

  const selectedCourse = courses.find((c) => c.id === courseId);
  const availableClasses = classes.filter((c) => c.courseId === courseId);

  const validate = (input: ImportRow[]) => {
    const emails = new Map<string, number>();
    const docs = new Map<string, number>();
    const registrations = new Map<string, number>();
    input.forEach((row) => {
      const email = row.email.trim().toLowerCase();
      const doc = digits(row.document);
      const registration = digits(row.registrationNumber);
      if (email) emails.set(email, (emails.get(email) || 0) + 1);
      if (doc) docs.set(doc, (docs.get(doc) || 0) + 1);
      if (registration) registrations.set(registration, (registrations.get(registration) || 0) + 1);
    });
    return input.map((row) => {
      const email = row.email.trim().toLowerCase();
      const doc = digits(row.document);
      const registration = digits(row.registrationNumber);
      const category = row.cnhCategory.trim().toUpperCase();
      let error = '';
      if (!row.name.trim()) error = 'Nome obrigatório.';
      else if (!email || !/^\S+@\S+\.\S+$/.test(email)) error = 'E-mail inválido.';
      else if (doc.length !== 11) error = 'CPF deve ter 11 dígitos.';
      else if (!isValidCpf(doc)) error = 'CPF deve ter 11 dígitos.';
      else if (registration.length !== 11) error = 'Nº de registro deve ter 11 dígitos.';
      else if (!category) error = 'Categoria da CNH obrigatória.';
      else if ((emails.get(email) || 0) > 1) error = 'E-mail repetido na planilha.';
      else if ((docs.get(doc) || 0) > 1) error = 'CPF repetido na planilha.';
      else if ((registrations.get(registration) || 0) > 1) error = 'Nº de registro repetido na planilha.';
      else if (students.some((s) => s.email.trim().toLowerCase() === email)) error = 'E-mail já cadastrado.';
      else if (students.some((s) => digits(s.documentNumber || '') === doc)) error = 'CPF já cadastrado.';
      else if (students.some((s) => digits(s.registrationNumber || '') === registration)) error = 'Nº de registro já cadastrado.';
      return { ...row, document: doc, registrationNumber: registration, cnhCategory: category, status: error ? 'invalid' as const : 'valid' as const, error: error || undefined };
    });
  };

  const importExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      if (!sheet) throw new Error('Planilha sem abas.');
      const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
      const parsed: ImportRow[] = data.map((item, index) => ({
        id: `import-${Date.now()}-${index}`,
        name: getCell(item, ['nome_aluno', 'nome', 'aluno', 'nome completo', 'nome_completo']),
        email: getCell(item, ['email', 'e-mail', 'e_mail']),
        document: getCell(item, ['cpf', 'documento', 'cpf_documento', 'cpf/documento']),
        registrationNumber: getCell(item, ['numero_registro', 'n_registro', 'registro', 'nº registro', 'numero do condutor', 'n condutor']),
        cnhCategory: getCell(item, ['categoria', 'categoria_cnh', 'cnh', 'categoria da cnh']),
        status: 'invalid',
      }));
      setRows(validate(parsed));
      setMessage('');
    } catch {
      setMessage('Não foi possível ler a planilha. Confira o modelo CVTE e tente novamente.');
    } finally {
      event.target.value = '';
    }
  };

  const validCount = useMemo(() => rows.filter((r) => r.status === 'valid').length, [rows]);

  const downloadModel = () => {
    const ws = XLSX.utils.json_to_sheet([{ nome_aluno: 'NOME COMPLETO', email: 'aluno@exemplo.com', cpf: '00000000000', numero_registro: '00000000000', categoria_cnh: 'AD' }]);
    ws['!cols'] = [{ wch: 36 }, { wch: 30 }, { wch: 18 }, { wch: 18 }, { wch: 16 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Condutores');
    XLSX.writeFile(wb, 'modelo_importacao_condutores_cvte.xlsx');
  };

  const saveAll = () => {
    if (!selectedCourse) { setMessage('Selecione o curso CVTE.'); return; }
    if (!rows.length || rows.some((r) => r.status === 'invalid')) { setMessage('Corrija todos os registros antes de importar.'); return; }
    const importedIds: string[] = [];
    rows.forEach((row) => {
      const student = addStudent({
        fullName: row.name.trim().toUpperCase(),
        email: row.email.trim().toLowerCase(),
        documentNumber: digits(row.document),
        registrationNumber: digits(row.registrationNumber),
        cnhCategory: row.cnhCategory.trim().toUpperCase(),
        courseId: selectedCourse.id,
        classId: classId || undefined,
        completionDate: selectedCourse.endDate,
        notes: 'Condutor importado por planilha Excel para o curso CVTE.',
      });
      importedIds.push(student.id);
    });
    if (classId) {
      const selectedClass = classes.find((c) => c.id === classId);
      if (selectedClass) updateClass(classId, { studentIds: Array.from(new Set([...selectedClass.studentIds, ...importedIds])) });
    }
    setRows([]);
    setMessage(`${importedIds.length} condutor(es) importado(s) com sucesso.`);
  };

  return <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
    <div><div className="flex items-center gap-2"><FileSpreadsheet className="w-6 h-6 text-indigo-600" /><h1 className="text-2xl sm:text-3xl font-extrabold">Importar Condutores</h1></div><p className="text-sm text-slate-500 mt-1">Cadastre condutores do CVTE por Excel sem emitir certificados.</p></div>
    {message && <div className="rounded-xl border border-indigo-200 bg-indigo-50 dark:bg-indigo-950/40 px-4 py-3 text-sm text-indigo-800 dark:text-indigo-200">{message}</div>}
    <div className="grid md:grid-cols-2 gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800"><label className="text-xs font-semibold">Curso<select value={courseId} onChange={(e) => { setCourseId(e.target.value); setClassId(''); }} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border">{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</select></label><label className="text-xs font-semibold">Turma (opcional)<select value={classId} onChange={(e) => setClassId(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"><option value="">Sem turma</option>{availableClasses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div>
    <div className="flex flex-wrap gap-2"><label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold cursor-pointer"><Upload className="w-4 h-4" />Importar Excel<input type="file" accept=".xlsx,.xls" onChange={importExcel} className="hidden" /></label><button onClick={downloadModel} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border text-sm font-bold"><Download className="w-4 h-4" />Baixar modelo CVTE</button></div>
    <div className="rounded-xl border border-indigo-200 bg-indigo-50 dark:bg-indigo-950/40 px-4 py-3 text-xs text-indigo-800 dark:text-indigo-200">Colunas: <strong>nome_aluno</strong>, <strong>email</strong>, <strong>cpf</strong>, <strong>numero_registro</strong> e <strong>categoria_cnh</strong>. CPF e registro devem possuir exatamente 11 dígitos.</div>
    <div className="bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-xs"><thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px]"><tr><th className="px-4 py-3 text-left">Nome</th><th className="px-4 py-3 text-left">CPF</th><th className="px-4 py-3 text-left">Nº Registro</th><th className="px-4 py-3 text-left">CNH</th><th className="px-4 py-3 text-left">E-mail</th><th className="px-4 py-3 text-left">Status</th></tr></thead><tbody className="divide-y">{rows.length === 0 ? <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">Nenhuma planilha carregada.</td></tr> : rows.map((row) => <tr key={row.id}><td className="px-4 py-3 font-semibold">{row.name}</td><td className="px-4 py-3 font-mono">{row.document}</td><td className="px-4 py-3 font-mono">{row.registrationNumber}</td><td className="px-4 py-3 font-bold">{row.cnhCategory}</td><td className="px-4 py-3">{row.email}</td><td className="px-4 py-3">{row.status === 'valid' ? <span className="inline-flex items-center gap-1 text-emerald-600 font-bold"><CheckCircle2 className="w-4 h-4" />Pronto</span> : <div><span className="inline-flex items-center gap-1 text-rose-600 font-bold"><AlertTriangle className="w-4 h-4" />Corrigir</span><div className="text-[10px] text-rose-600 mt-1">{row.error}</div></div>}</td></tr>)}</tbody></table></div></div>
    <div className="flex justify-end"><button onClick={saveAll} disabled={!rows.length || validCount !== rows.length} className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold disabled:opacity-40">Importar {validCount} condutor(es)</button></div>
  </div>;
};