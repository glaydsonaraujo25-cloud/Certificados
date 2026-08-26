import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import { PlusCircle, Search, Edit2, Trash2, Award, X, AlertTriangle } from 'lucide-react';

export const StudentsView: React.FC = () => {
  const { students, courses, addStudent, updateStudent, deleteStudent, certificates, setCurrentView } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [feedback, setFeedback] = useState<string>('');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [cnhCategory, setCnhCategory] = useState('');
  const [courseId, setCourseId] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [notes, setNotes] = useState('');

  const filteredStudents = students.filter((student) => {
    const search = searchTerm.toLowerCase();
    const matchSearch =
      student.fullName.toLowerCase().includes(search) ||
      student.email.toLowerCase().includes(search) ||
      Boolean(student.documentNumber?.includes(searchTerm)) ||
      Boolean(student.registrationNumber?.includes(searchTerm));
    return matchSearch && (!courseFilter || student.courseId === courseFilter);
  });

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setDocumentNumber('');
    setRegistrationNumber('');
    setCnhCategory('AD');
    setCourseId(courses[0]?.id || '');
    setCompletionDate(new Date().toISOString().split('T')[0]);
    setNotes('');
  };

  const handleOpenCreateModal = () => {
    setEditingStudent(null);
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setFullName(student.fullName);
    setEmail(student.email);
    setDocumentNumber(student.documentNumber || '');
    setRegistrationNumber(student.registrationNumber || '');
    setCnhCategory(student.cnhCategory || 'AD');
    setCourseId(student.courseId || '');
    setCompletionDate(student.completionDate || '');
    setNotes(student.notes || '');
    setIsModalOpen(true);
  };

  const showFeedback = (message: string) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(''), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;

    const payload = {
      fullName: fullName.trim().toUpperCase(),
      email: email.trim(),
      documentNumber: documentNumber.trim(),
      registrationNumber: registrationNumber.trim(),
      cnhCategory: cnhCategory.trim().toUpperCase(),
      courseId,
      completionDate,
      notes: notes.trim(),
    };

    if (editingStudent) {
      updateStudent(editingStudent.id, payload);
      showFeedback('Aluno atualizado com sucesso.');
    } else {
      addStudent(payload);
      showFeedback('Aluno cadastrado com sucesso.');
    }
    setIsModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!studentToDelete) return;
    deleteStudent(studentToDelete.id);
    showFeedback(`Aluno ${studentToDelete.fullName} excluído com sucesso.`);
    setStudentToDelete(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Cadastro de Alunos</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gerencie os estudantes, histórico de conclusões e emissão direta de certificados.</p>
        </div>
        <button onClick={handleOpenCreateModal} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition-all">
          <PlusCircle className="w-4 h-4" /> Cadastrar Novo Aluno
        </button>
      </div>

      {feedback && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">{feedback}</div>}

      <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input type="text" placeholder="Buscar por nome, e-mail ou documento..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500" />
        </div>
        <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className="sm:w-56 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100">
          <option value="">Todos os Cursos</option>
          {courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}
        </select>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-slate-800">
              <tr><th className="px-4 py-3.5">Nome do Aluno</th><th className="px-4 py-3.5">CPF</th><th className="px-4 py-3.5">Nº Registro / CNH</th><th className="px-4 py-3.5">Curso Vinculado</th><th className="px-4 py-3.5">Certificados</th><th className="px-4 py-3.5 text-right">Ações</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">Nenhum aluno encontrado.</td></tr>
              ) : filteredStudents.map((student) => {
                const studentCerts = certificates.filter((cert) => cert.studentId === student.id || cert.studentName === student.fullName);
                const enrolledCourse = courses.find((course) => course.id === student.courseId);
                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3.5"><div className="font-bold text-slate-900 dark:text-white">{student.fullName}</div><div className="text-[11px] text-slate-400">{student.email}</div></td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 font-mono text-[11px]">{student.documentNumber || '-'}</td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 font-mono text-[11px]"><div>Reg: {student.registrationNumber || '-'}</div><div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">Cat: {student.cnhCategory || '-'}</div></td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300 max-w-[180px] truncate">{enrolledCourse?.name || '-'}</td>
                    <td className="px-4 py-3.5"><span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${studentCerts.length ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}><Award className="w-3 h-3" />{studentCerts.length} emitido(s)</span></td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap"><div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => setCurrentView('create-certificate')} className="px-2 py-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 rounded-lg hover:bg-amber-100">Emitir</button>
                      <button onClick={() => handleOpenEditModal(student)} className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" title="Editar aluno"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setStudentToDelete(student)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40" title="Excluir aluno"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3"><h3 className="font-bold text-lg text-slate-900 dark:text-white">{editingStudent ? 'Editar Aluno' : 'Novo Aluno'}</h3><button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleSave} className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Nome Completo *<input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" /></label>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">E-mail *<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" /></label>
              <div className="grid grid-cols-2 gap-3"><label className="text-xs font-semibold text-slate-700 dark:text-slate-300">CPF<input type="text" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} className="mt-1 w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" /></label><label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nº Registro CNH<input type="text" value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} className="mt-1 w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" /></label></div>
              <div className="grid grid-cols-2 gap-3"><label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Categoria CNH<input type="text" value={cnhCategory} onChange={(e) => setCnhCategory(e.target.value.toUpperCase())} className="mt-1 w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" /></label><label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Data de Conclusão<input type="date" value={completionDate} onChange={(e) => setCompletionDate(e.target.value)} className="mt-1 w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" /></label></div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Curso Vinculado<select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="mt-1 w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"><option value="">Sem vínculo</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</select></label>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Observações<textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" /></label>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800"><button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800">Cancelar</button><button type="submit" className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white">{editingStudent ? 'Salvar Alterações' : 'Cadastrar Aluno'}</button></div>
            </form>
          </div>
        </div>
      )}

      {studentToDelete && (
        <div className="fixed inset-0 z-[60] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <div className="flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center shrink-0"><AlertTriangle className="w-5 h-5" /></div><div><h3 className="font-extrabold text-slate-900 dark:text-white">Excluir aluno?</h3><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Você está prestes a excluir <strong>{studentToDelete.fullName}</strong>. Certificados já emitidos não serão apagados.</p></div></div>
            <div className="mt-6 flex justify-end gap-2"><button onClick={() => setStudentToDelete(null)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-semibold">Cancelar</button><button onClick={handleConfirmDelete} className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold">Excluir aluno</button></div>
          </div>
        </div>
      )}
    </div>
  );
};
