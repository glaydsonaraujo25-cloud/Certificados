import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Course, Modality } from '../types';
import { Plus, Search, Clock, User, Edit2, Trash2, X, Award, Users, AlertTriangle } from 'lucide-react';

export const CoursesView: React.FC = () => {
  const { courses, addCourse, updateCourse, deleteCourse, students, certificates, institution, user, setCurrentView } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [feedback, setFeedback] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [workloadHours, setWorkloadHours] = useState(40);
  const [instructorName, setInstructorName] = useState(institution.signatoryName || '');
  const [institutionName, setInstitutionName] = useState(institution.name || '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [modality, setModality] = useState<Modality>('online');

  const filteredCourses = courses.filter((course) => {
    const search = searchTerm.toLowerCase();
    return course.name.toLowerCase().includes(search) || course.instructorName.toLowerCase().includes(search) || course.description.toLowerCase().includes(search);
  });

  const notify = (message: string) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(''), 3000);
  };

  const handleOpenCreateModal = () => {
    setEditingCourseId(null);
    setName(''); setDescription(''); setWorkloadHours(40);
    setInstructorName(institution.signatoryName || '');
    setInstitutionName(institution.name || '');
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today); setEndDate(today); setModality('online');
    setModalOpen(true);
  };

  const handleOpenEditModal = (course: Course) => {
    setEditingCourseId(course.id); setName(course.name); setDescription(course.description);
    setWorkloadHours(course.workloadHours); setInstructorName(course.instructorName);
    setInstitutionName(course.institutionName); setStartDate(course.startDate || '');
    setEndDate(course.endDate || ''); setModality(course.modality || 'online'); setModalOpen(true);
  };

  const handleOpenEmission = (course: Course) => {
    sessionStorage.setItem('certifyai_prefill_course', course.id);
    sessionStorage.removeItem('certifyai_prefill_student');
    setCurrentView('create-certificate');
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || workloadHours <= 0) return;
    if (startDate && endDate && startDate > endDate) { alert('A data de início não pode ser posterior à data de término.'); return; }
    const payload = { name: name.trim(), description: description.trim(), workloadHours: Number(workloadHours), instructorName: instructorName.trim(), institutionName: institutionName.trim(), startDate, endDate, modality };
    if (editingCourseId) { updateCourse(editingCourseId, payload); notify('Curso atualizado com sucesso.'); }
    else { addCourse(payload); notify('Curso cadastrado com sucesso.'); }
    setModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!courseToDelete) return;
    const linkedStudents = students.some((student) => student.courseId === courseToDelete.id);
    const linkedCertificates = certificates.some((certificate) => certificate.courseId === courseToDelete.id);
    deleteCourse(courseToDelete.id);
    notify(linkedStudents || linkedCertificates ? 'Curso excluído. Alunos e certificados existentes foram preservados.' : 'Curso excluído com sucesso.');
    setCourseToDelete(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Cursos & Treinamentos</h1><p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Cadastre programas formativos, cargas horárias e instrutores credenciados.</p></div>
        <button onClick={handleOpenCreateModal} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all"><Plus className="w-4 h-4" />Cadastrar Novo Curso</button>
      </div>

      {feedback && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">{feedback}</div>}

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs"><div className="relative"><Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" /><input type="text" placeholder="Buscar cursos por nome, instrutor ou descrição..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100" /></div></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCourses.map((course) => {
          const studentCount = students.filter((student) => student.courseId === course.id).length;
          const certCount = certificates.filter((certificate) => certificate.courseId === course.id).length;
          return (
            <div key={course.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:border-indigo-500/30 transition-all group">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2"><span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{course.modality}</span><div className="flex items-center gap-1"><button onClick={() => handleOpenEditModal(course)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800" title="Editar Curso"><Edit2 className="w-3.5 h-3.5" /></button>{user?.role === 'admin' && <button onClick={() => setCourseToDelete(course)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50" title="Excluir Curso"><Trash2 className="w-3.5 h-3.5" /></button>}</div></div>
                <div><h3 className="font-extrabold text-base text-slate-900 dark:text-white">{course.name}</h3><p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{course.description || 'Sem descrição cadastrada.'}</p></div>
                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800"><div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" />Carga Horária: <strong>{course.workloadHours} horas</strong></div><div className="flex items-center gap-2"><User className="w-3.5 h-3.5" />Instrutor(a): {course.instructorName || 'Não especificado'}</div></div>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between"><div className="flex items-center gap-3 text-xs text-slate-500"><span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{studentCount}</span><span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" />{certCount}</span></div><button onClick={() => handleOpenEmission(course)} className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">Emitir certificado →</button></div>
            </div>
          );
        })}
      </div>

      {modalOpen && <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"><div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"><div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3"><h3 className="font-extrabold text-base text-slate-900 dark:text-white">{editingCourseId ? 'Editar Curso' : 'Cadastrar Novo Curso'}</h3><button onClick={() => setModalOpen(false)} className="p-1 text-slate-400"><X className="w-5 h-5" /></button></div><form onSubmit={handleSaveCourse} className="space-y-4 text-xs">
        <label className="block font-semibold text-slate-700 dark:text-slate-300">Nome do Curso *<input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" /></label>
        <label className="block font-semibold text-slate-700 dark:text-slate-300">Descrição<textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" /></label>
        <div className="grid grid-cols-2 gap-3"><label className="font-semibold text-slate-700 dark:text-slate-300">Carga Horária<input type="number" min="1" required value={workloadHours} onChange={(e) => setWorkloadHours(Number(e.target.value))} className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" /></label><label className="font-semibold text-slate-700 dark:text-slate-300">Modalidade<select value={modality} onChange={(e) => setModality(e.target.value as Modality)} className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"><option value="online">Online</option><option value="presencial">Presencial</option><option value="hibrido">Híbrido</option></select></label></div>
        <label className="block font-semibold text-slate-700 dark:text-slate-300">Instrutor(a)<input value={instructorName} onChange={(e) => setInstructorName(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" /></label>
        <label className="block font-semibold text-slate-700 dark:text-slate-300">Instituição<input value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" /></label>
        <div className="grid grid-cols-2 gap-3"><label className="font-semibold text-slate-700 dark:text-slate-300">Início<input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" /></label><label className="font-semibold text-slate-700 dark:text-slate-300">Término<input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" /></label></div>
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800"><button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 font-semibold">Cancelar</button><button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold">Salvar Curso</button></div>
      </form></div></div>}

      {courseToDelete && <div className="fixed inset-0 z-[60] bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4"><div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl"><div className="flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center"><AlertTriangle className="w-5 h-5" /></div><div><h3 className="font-extrabold text-slate-900 dark:text-white">Excluir curso?</h3><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">O curso <strong>{courseToDelete.name}</strong> será removido. Alunos e certificados já existentes serão preservados.</p></div></div><div className="mt-6 flex justify-end gap-2"><button onClick={() => setCourseToDelete(null)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-semibold">Cancelar</button><button onClick={handleConfirmDelete} className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold">Excluir curso</button></div></div></div>}
    </div>
  );
};