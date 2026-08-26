import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import { AlertTriangle, Award, Edit2, PlusCircle, Search, Trash2, X } from 'lucide-react';

export const StudentsView: React.FC = () => {
  const { students, courses, addStudent, updateStudent, deleteStudent, certificates, setCurrentView } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [feedback, setFeedback] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [courseId, setCourseId] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [notes, setNotes] = useState('');

  const filteredStudents = students.filter((student) => {
    const search = searchTerm.toLowerCase();
    return (student.fullName.toLowerCase().includes(search) || student.email.toLowerCase().includes(search) || Boolean(student.documentNumber?.includes(searchTerm))) && (!courseFilter || student.courseId === courseFilter);
  });

  const showFeedback = (message: string) => { setFeedback(message); window.setTimeout(() => setFeedback(''), 3000); };
  const resetForm = () => { setFullName(''); setEmail(''); setDocumentNumber(''); setCourseId(courses[0]?.id || ''); setCompletionDate(new Date().toISOString().split('T')[0]); setNotes(''); };
  const openCreate = () => { setEditingStudent(null); resetForm(); setIsModalOpen(true); };
  const openEdit = (student: Student) => { setEditingStudent(student); setFullName(student.fullName); setEmail(student.email); setDocumentNumber(student.documentNumber || ''); setCourseId(student.courseId || ''); setCompletionDate(student.completionDate || ''); setNotes(student.notes || ''); setIsModalOpen(true); };

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (!fullName.trim() || !email.trim()) return;
    const payload = { fullName: fullName.trim().toUpperCase(), email: email.trim(), documentNumber: documentNumber.trim(), courseId, completionDate, notes: notes.trim(), registrationNumber: undefined, cnhCategory: undefined };
    if (editingStudent) { updateStudent(editingStudent.id, payload); showFeedback('Aluno atualizado com sucesso.'); }
    else { addStudent(payload); showFeedback('Aluno cadastrado com sucesso.'); }
    setIsModalOpen(false);
  };

  const confirmDelete = () => { if (!studentToDelete) return; deleteStudent(studentToDelete.id); showFeedback(`Aluno ${studentToDelete.fullName} excluído com sucesso.`); setStudentToDelete(null); };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Cadastro de Alunos</h1><p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gerencie os alunos do curso Operador de Computador com IA e seus certificados.</p></div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"><PlusCircle className="w-4 h-4" />Cadastrar Novo Aluno</button>
      </div>

      {feedback && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">{feedback}</div>}

      <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="relative flex-1"><Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" /><input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Buscar por nome, e-mail ou CPF..." className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" /></div>
        <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className="sm:w-64 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"><option value="">Todos os Cursos</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</select>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 uppercase text-[10px]"><tr><th className="px-4 py-3.5">Nome do Aluno</th><th className="px-4 py-3.5">CPF / Documento</th><th className="px-4 py-3.5">Curso</th><th className="px-4 py-3.5">Conclusão</th><th className="px-4 py-3.5">Certificados</th><th className="px-4 py-3.5 text-right">Ações</th></tr></thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredStudents.length === 0 ? <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">Nenhum aluno encontrado.</td></tr> : filteredStudents.map((student) => {
              const certs = certificates.filter((cert) => cert.studentId === student.id || cert.studentName === student.fullName);
              const course = courses.find((item) => item.id === student.courseId);
              return <tr key={student.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40"><td className="px-4 py-3.5"><div className="font-bold text-slate-900 dark:text-white">{student.fullName}</div><div className="text-[11px] text-slate-400">{student.email}</div></td><td className="px-4 py-3.5 font-mono text-slate-600 dark:text-slate-300">{student.documentNumber || '-'}</td><td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">{course?.name || '-'}</td><td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">{student.completionDate ? new Date(`${student.completionDate}T00:00:00`).toLocaleDateString('pt-BR') : '-'}</td><td className="px-4 py-3.5"><span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800"><Award className="w-3 h-3" />{certs.length}</span></td><td className="px-4 py-3.5"><div className="flex justify-end gap-1.5"><button onClick={() => setCurrentView('create-certificate')} className="px-2 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 dark:bg-indigo-950 rounded-lg">Emitir</button><button onClick={() => openEdit(student)} className="p-1.5 text-slate-500 hover:text-indigo-600"><Edit2 className="w-3.5 h-3.5" /></button><button onClick={() => setStudentToDelete(student)} className="p-1.5 text-slate-400 hover:text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button></div></td></tr>;
            })}
          </tbody>
        </table></div>
      </div>

      {isModalOpen && <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4"><div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto"><div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800"><h3 className="font-bold text-lg">{editingStudent ? 'Editar Aluno' : 'Novo Aluno'}</h3><button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5" /></button></div><form onSubmit={save} className="space-y-3 mt-4"><label className="block text-xs font-semibold">Nome Completo *<input value={fullName} onChange={(e) => setFullName(e.target.value)} required className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" /></label><label className="block text-xs font-semibold">E-mail *<input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" /></label><label className="block text-xs font-semibold">CPF / Documento<input value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" /></label><label className="block text-xs font-semibold">Curso<select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"><option value="">Sem vínculo</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</select></label><label className="block text-xs font-semibold">Data de Conclusão<input type="date" value={completionDate} onChange={(e) => setCompletionDate(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" /></label><label className="block text-xs font-semibold">Observações<textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" /></label><div className="flex justify-end gap-2 pt-3"><button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold">Cancelar</button><button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">{editingStudent ? 'Salvar Alterações' : 'Cadastrar Aluno'}</button></div></form></div></div>}

      {studentToDelete && <div className="fixed inset-0 z-[60] bg-slate-900/70 flex items-center justify-center p-4"><div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6"><div className="flex gap-3"><div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center"><AlertTriangle className="w-5 h-5" /></div><div><h3 className="font-extrabold">Excluir aluno?</h3><p className="mt-1 text-sm text-slate-500">O cadastro de <strong>{studentToDelete.fullName}</strong> será removido. Certificados já emitidos serão preservados.</p></div></div><div className="mt-6 flex justify-end gap-2"><button onClick={() => setStudentToDelete(null)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-semibold">Cancelar</button><button onClick={confirmDelete} className="px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-bold">Excluir aluno</button></div></div></div>}
    </div>
  );
};
