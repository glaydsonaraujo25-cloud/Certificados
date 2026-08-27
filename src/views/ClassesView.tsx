import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { CourseClass } from '../types';
import { BookOpen, CalendarDays, Edit2, PlusCircle, Search, Trash2, Users, X } from 'lucide-react';

export const ClassesView: React.FC = () => {
  const { classes, courses, students, certificates, addClass, updateClass, deleteClass } = useApp();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<CourseClass | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [courseId, setCourseId] = useState(courses[0]?.id || '');
  const [startDate, setStartDate] = useState(courses[0]?.startDate || '');
  const [endDate, setEndDate] = useState(courses[0]?.endDate || '');
  const [instructorName, setInstructorName] = useState(courses[0]?.instructorName || 'Instrutor Responsável');
  const [studentIds, setStudentIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const filtered = useMemo(() => classes.filter((item) => {
    const course = courses.find((courseItem) => courseItem.id === item.courseId);
    const text = `${item.name} ${course?.name || ''} ${item.instructorName}`.toLowerCase();
    return text.includes(search.toLowerCase());
  }), [classes, courses, search]);

  const openCreate = () => {
    const course = courses[0];
    setEditing(null); setName(''); setCourseId(course?.id || ''); setStartDate(course?.startDate || ''); setEndDate(course?.endDate || ''); setInstructorName(course?.instructorName || 'Instrutor Responsável'); setStudentIds([]); setNotes(''); setError(''); setModalOpen(true);
  };
  const openEdit = (item: CourseClass) => { setEditing(item); setName(item.name); setCourseId(item.courseId); setStartDate(item.startDate); setEndDate(item.endDate); setInstructorName(item.instructorName); setStudentIds(item.studentIds); setNotes(item.notes || ''); setError(''); setModalOpen(true); };
  const onCourseChange = (id: string) => { setCourseId(id); const course = courses.find((item) => item.id === id); if (course) { setStartDate(course.startDate); setEndDate(course.endDate); setInstructorName(course.instructorName || 'Instrutor Responsável'); } setStudentIds((prev) => prev.filter((studentId) => students.find((student) => student.id === studentId)?.courseId === id)); };
  const toggleStudent = (id: string) => setStudentIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) { setError('Informe o nome da turma.'); return; }
    if (!courseId) { setError('Selecione um curso.'); return; }
    if (!startDate || !endDate) { setError('Informe as datas da turma.'); return; }
    if (startDate > endDate) { setError('A data inicial não pode ser posterior à data final.'); return; }
    const payload = { name: name.trim(), courseId, startDate, endDate, instructorName: instructorName.trim() || 'Instrutor Responsável', studentIds, notes: notes.trim() };
    if (editing) updateClass(editing.id, payload); else addClass(payload);
    setModalOpen(false);
  };

  const eligibleStudents = students.filter((student) => !student.courseId || student.courseId === courseId || studentIds.includes(student.id));

  return <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><h1 className="text-2xl sm:text-3xl font-extrabold">Turmas</h1><p className="text-sm text-slate-500 mt-1">Organize alunos por turma, período e instrutor para facilitar emissões e acompanhamento.</p></div><button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold"><PlusCircle className="w-4 h-4" />Nova Turma</button></div>

    <div className="relative max-w-xl"><Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar turma, curso ou instrutor..." className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm" /></div>

    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">{filtered.length === 0 ? <div className="md:col-span-2 xl:col-span-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center text-slate-400">Nenhuma turma cadastrada.</div> : filtered.map((item) => {
      const course = courses.find((courseItem) => courseItem.id === item.courseId);
      const activeCerts = certificates.filter((cert) => cert.status === 'active' && item.studentIds.includes(cert.studentId)).length;
      return <div key={item.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4"><div className="flex items-start justify-between gap-3"><div><h2 className="font-extrabold text-lg">{item.name}</h2><p className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold mt-1">{course?.name || 'Curso não encontrado'}</p></div><div className="flex gap-1"><button onClick={() => openEdit(item)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><Edit2 className="w-4 h-4" /></button><button onClick={() => confirm(`Excluir a turma ${item.name}?`) && deleteClass(item.id)} className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"><Trash2 className="w-4 h-4" /></button></div></div><div className="grid grid-cols-2 gap-3 text-xs"><div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3"><div className="flex items-center gap-1 text-slate-500"><Users className="w-3.5 h-3.5" />Alunos</div><div className="text-xl font-black mt-1">{item.studentIds.length}</div></div><div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3"><div className="flex items-center gap-1 text-slate-500"><BookOpen className="w-3.5 h-3.5" />Certificados</div><div className="text-xl font-black mt-1">{activeCerts}</div></div></div><div className="text-xs text-slate-500 space-y-1"><div className="flex items-center gap-2"><CalendarDays className="w-3.5 h-3.5" />{new Date(`${item.startDate}T00:00:00`).toLocaleDateString('pt-BR')} a {new Date(`${item.endDate}T00:00:00`).toLocaleDateString('pt-BR')}</div><div>Instrutor: <strong>{item.instructorName}</strong></div></div></div>;
    })}</div>

    {modalOpen && <div className="fixed inset-0 z-[80] bg-slate-950/70 flex items-center justify-center p-4"><div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl"><div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3"><div><h3 className="font-extrabold text-lg">{editing ? 'Editar Turma' : 'Nova Turma'}</h3><p className="text-xs text-slate-500">Defina período, instrutor e participantes.</p></div><button onClick={() => setModalOpen(false)}><X className="w-5 h-5" /></button></div><form onSubmit={save} className="mt-5 space-y-4">{error && <div className="rounded-xl bg-rose-50 text-rose-700 px-3 py-2 text-sm font-semibold">{error}</div>}<div className="grid sm:grid-cols-2 gap-3"><label className="text-xs font-semibold sm:col-span-2">Nome da turma<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Operador IA — Turma 01/2026" className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" /></label><label className="text-xs font-semibold sm:col-span-2">Curso<select value={courseId} onChange={(e) => onCourseChange(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</select></label><label className="text-xs font-semibold">Início<input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" /></label><label className="text-xs font-semibold">Término<input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" /></label><label className="text-xs font-semibold sm:col-span-2">Instrutor<input value={instructorName} onChange={(e) => setInstructorName(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" /></label></div><div><div className="flex items-center justify-between"><h4 className="font-bold text-sm">Alunos da turma</h4><span className="text-xs text-slate-500">{studentIds.length} selecionado(s)</span></div><div className="mt-2 max-h-60 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">{eligibleStudents.length === 0 ? <div className="p-6 text-center text-sm text-slate-400">Cadastre alunos para adicioná-los à turma.</div> : eligibleStudents.map((student) => <label key={student.id} className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"><input type="checkbox" checked={studentIds.includes(student.id)} onChange={() => toggleStudent(student.id)} /><div><div className="text-sm font-semibold">{student.fullName}</div><div className="text-[11px] text-slate-500">{student.email}</div></div></label>)}</div></div><label className="text-xs font-semibold">Observações<textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800" /></label><div className="flex justify-end gap-2"><button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-semibold">Cancelar</button><button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold">{editing ? 'Salvar Alterações' : 'Criar Turma'}</button></div></form></div></div>}
  </div>;
};
