import { isValidCpf, matchesStudent } from '../utils/validation';
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Certificate, Student } from '../types';
import { CertificateModal } from '../components/CertificateModal';
import { AlertTriangle, Award, Edit2, Eye, PlusCircle, Search, Trash2, X } from 'lucide-react';

const digitsOnly = (value: string) => value.replace(/\D/g, '').slice(0, 11);
const formatCpf = (value: string) => { const d = digitsOnly(value); if (d.length !== 11) return d; return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`; };
const CNH_CATEGORIES = ['A','B','C','D','E','AB','AC','AD','AE'];

export const StudentsView: React.FC = () => {
  const { students, courses, addStudent, updateStudent, deleteStudent, certificates, setCurrentView, setValidationSearchCode } = useApp();
  const course = courses[0];
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);
  const [detailCertificate, setDetailCertificate] = useState<Certificate | null>(null);
  const [feedback, setFeedback] = useState('');
  const [formError, setFormError] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [cnhCategory, setCnhCategory] = useState('AD');

  const filteredStudents = students.filter(student => matchesStudent(student, searchTerm));

  const showFeedback = (message: string) => { setFeedback(message); window.setTimeout(() => setFeedback(''), 3000); };
  const resetForm = () => { setFullName(''); setEmail(''); setDocumentNumber(''); setRegistrationNumber(''); setCnhCategory('AD'); setFormError(''); };
  const openCreate = () => { setEditingStudent(null); resetForm(); setIsModalOpen(true); };
  const openEdit = (student: Student) => { setEditingStudent(student); setFullName(student.fullName); setEmail(student.email || ''); setDocumentNumber(digitsOnly(student.documentNumber || '')); setRegistrationNumber(digitsOnly(student.registrationNumber || '')); setCnhCategory(student.cnhCategory || 'AD'); setFormError(''); setIsModalOpen(true); };
  const openEmission = (student: Student) => { sessionStorage.setItem('certifyai_prefill_student', student.id); setCurrentView('create-certificate'); };

  const validateStudent = () => {
    if (!fullName.trim()) return 'Informe o nome completo do condutor.';
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return 'Informe um e-mail válido ou deixe o campo vazio.';
    if (cleanEmail && students.some((student) => student.id !== editingStudent?.id && (student.email || '').trim().toLowerCase() === cleanEmail)) return 'Já existe um condutor cadastrado com este e-mail.';
    const cpf = digitsOnly(documentNumber);
    if (!isValidCpf(cpf)) return 'Informe um CPF válido.';
    if (students.some((student) => student.id !== editingStudent?.id && digitsOnly(student.documentNumber || '') === cpf)) return 'Já existe um condutor cadastrado com este CPF.';
    const registration = digitsOnly(registrationNumber);
    if (registration.length !== 11) return 'O Nº de registro deve possuir exatamente 11 dígitos.';
    if (students.some((student) => student.id !== editingStudent?.id && digitsOnly(student.registrationNumber || '') === registration)) return 'Já existe um condutor cadastrado com este Nº de registro.';
    return '';
  };

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    const error = validateStudent();
    if (error) { setFormError(error); return; }
    const payload = { fullName: fullName.trim().toUpperCase(), email: email.trim().toLowerCase(), documentNumber: digitsOnly(documentNumber), registrationNumber: digitsOnly(registrationNumber), cnhCategory, courseId: course?.id || '', classId: undefined, completionDate: '', notes: '' };
    try {
    if (editingStudent) { updateStudent(editingStudent.id, payload); showFeedback('Condutor atualizado com sucesso.'); }
    else { addStudent(payload); showFeedback('Condutor cadastrado com sucesso.'); }
    setIsModalOpen(false);
    } catch (error) { setFormError(error instanceof Error ? error.message : "Não foi possível salvar."); }
  };

  const confirmDelete = () => { if (!studentToDelete) return; try { deleteStudent(studentToDelete.id); showFeedback(`Condutor ${studentToDelete.fullName} excluído com sucesso.`); setStudentToDelete(null); } catch (error) { showFeedback(error instanceof Error ? error.message : "Não foi possível excluir."); } };

  return <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><h1 className="text-2xl sm:text-3xl font-extrabold">Condutores</h1><p className="text-sm text-slate-500 mt-1">Cadastre apenas os dados necessários para emitir certificados CVTE.</p></div><button onClick={openCreate} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold"><PlusCircle className="w-4 h-4" />Novo Condutor</button></div>
    {feedback && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{feedback}</div>}
    <div className="relative bg-white dark:bg-slate-900 p-4 rounded-2xl border"><Search className="w-4 h-4 text-slate-400 absolute left-7 top-7" /><input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar por nome, CPF ou Nº registro..." className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border" /></div>

    <div className="bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px]"><tr><th className="px-4 py-3.5">Nome</th><th className="px-4 py-3.5">CPF</th><th className="px-4 py-3.5">Nº Registro</th><th className="px-4 py-3.5">CNH</th><th className="px-4 py-3.5">Certificados</th><th className="px-4 py-3.5 text-right">Ações</th></tr></thead><tbody className="divide-y">{filteredStudents.length === 0 ? <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">Nenhum condutor encontrado.</td></tr> : filteredStudents.map((student) => { const certs = certificates.filter((cert) => cert.studentId === student.id || digitsOnly(cert.studentDocument || '') === digitsOnly(student.documentNumber || '')); return <tr key={student.id}><td className="px-4 py-3.5"><div className="font-bold">{student.fullName}</div>{student.email && <div className="text-[11px] text-slate-400">{student.email}</div>}</td><td className="px-4 py-3.5 font-mono">{formatCpf(student.documentNumber || '')}</td><td className="px-4 py-3.5 font-mono">{student.registrationNumber || '-'}</td><td className="px-4 py-3.5 font-bold">{student.cnhCategory || '-'}</td><td className="px-4 py-3.5"><span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800"><Award className="w-3 h-3" />{certs.length}</span></td><td className="px-4 py-3.5"><div className="flex justify-end gap-1.5"><button onClick={() => setDetailStudent(student)} className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 rounded-lg"><Eye className="w-3 h-3" />Detalhes</button><button onClick={() => openEmission(student)} className="px-2 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 rounded-lg">Emitir</button><button onClick={() => openEdit(student)} className="p-1.5 text-slate-500" title="Editar"><Edit2 className="w-3.5 h-3.5" /></button><button onClick={() => setStudentToDelete(student)} className="p-1.5 text-rose-500" title="Excluir"><Trash2 className="w-3.5 h-3.5" /></button></div></td></tr>; })}</tbody></table></div></div>

    {isModalOpen && <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4"><div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full shadow-2xl"><div className="flex items-center justify-between pb-3 border-b"><div><h3 className="font-bold text-lg">{editingStudent ? 'Editar Condutor' : 'Novo Condutor'}</h3><p className="text-xs text-slate-500">Somente quatro dados são necessários.</p></div><button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5" /></button></div><form onSubmit={save} className="space-y-4 mt-4">{formError && <div className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">{formError}</div>}<label className="block text-xs font-semibold">Nome completo *<input value={fullName} onChange={(e) => setFullName(e.target.value)} required className="mt-1 w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border uppercase" /></label><div className="grid sm:grid-cols-2 gap-3"><label className="block text-xs font-semibold">CPF *<input value={formatCpf(documentNumber)} onChange={(e) => setDocumentNumber(digitsOnly(e.target.value))} inputMode="numeric" className="mt-1 w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border" /><span className="text-[10px] text-slate-400">{documentNumber.length}/11 dígitos</span></label><label className="block text-xs font-semibold">Nº Registro / Condutor *<input value={registrationNumber} onChange={(e) => setRegistrationNumber(digitsOnly(e.target.value))} inputMode="numeric" maxLength={11} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border" /><span className="text-[10px] text-slate-400">{registrationNumber.length}/11 dígitos</span></label></div><label className="block text-xs font-semibold">Categoria CNH *<select value={cnhCategory} onChange={(e) => setCnhCategory(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border">{CNH_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}</select></label><label className="block text-xs font-semibold">E-mail <span className="font-normal text-slate-400">(opcional)</span><input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="mt-1 w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border" /></label><div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">Cancelar</button><button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">Salvar Condutor</button></div></form></div></div>}

    {detailStudent && (() => { const studentCerts = certificates.filter((cert) => cert.studentId === detailStudent.id || digitsOnly(cert.studentDocument || '') === digitsOnly(detailStudent.documentNumber || '')); return <div className="fixed inset-0 z-[70] bg-slate-950/70 flex items-center justify-center p-4"><div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl"><div className="flex items-start justify-between gap-3 border-b pb-4"><div><h3 className="text-xl font-extrabold">{detailStudent.fullName}</h3><p className="text-sm text-slate-500">Dados do condutor</p></div><button onClick={() => setDetailStudent(null)}><X className="w-5 h-5" /></button></div><div className="grid sm:grid-cols-3 gap-3 mt-5"><Info label="CPF" value={formatCpf(detailStudent.documentNumber || '')} /><Info label="Nº Registro" value={detailStudent.registrationNumber || '-'} /><Info label="Categoria CNH" value={detailStudent.cnhCategory || '-'} /></div>{detailStudent.email && <div className="mt-3"><Info label="E-mail" value={detailStudent.email} /></div>}<div className="mt-6"><div className="flex items-center justify-between"><h4 className="font-bold">Certificados ({studentCerts.length})</h4><button onClick={() => openEmission(detailStudent)} className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">Emitir certificado</button></div><div className="mt-3 space-y-2">{studentCerts.length === 0 ? <div className="p-6 text-center text-sm text-slate-400 border border-dashed rounded-xl">Nenhum certificado emitido.</div> : studentCerts.map((cert) => <button key={cert.id} onClick={() => setDetailCertificate(cert)} className="w-full flex items-center justify-between rounded-xl border p-3 text-left"><div><div className="font-semibold">{cert.studentName}</div><div className="text-xs font-mono text-indigo-600">{cert.code}</div></div><span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${cert.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{cert.status === 'active' ? 'Ativo' : 'Cancelado'}</span></button>)}</div></div></div></div>; })()}

    {studentToDelete && <div className="fixed inset-0 z-[80] bg-slate-900/70 flex items-center justify-center p-4"><div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6"><div className="flex gap-3"><AlertTriangle className="w-5 h-5 text-rose-600" /><div><h3 className="font-extrabold">Excluir condutor?</h3><p className="mt-1 text-sm text-slate-500">O cadastro de <strong>{studentToDelete.fullName}</strong> será removido. Certificados já emitidos serão preservados.</p></div></div><div className="mt-6 flex justify-end gap-2"><button onClick={() => setStudentToDelete(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-sm">Cancelar</button><button onClick={confirmDelete} className="px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-bold">Excluir</button></div></div></div>}
    {detailCertificate && <CertificateModal certificate={detailCertificate} isOpen={true} onClose={() => setDetailCertificate(null)} setCurrentView={setCurrentView} setValidationSearchCode={setValidationSearchCode} />}
  </div>;
};

const Info: React.FC<{ label: string; value: string }> = ({ label, value }) => <div className="rounded-xl border p-3"><div className="text-[10px] uppercase font-bold text-slate-500">{label}</div><div className="mt-1 text-sm font-semibold break-words">{value}</div></div>;

