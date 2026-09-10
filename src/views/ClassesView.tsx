import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import type { CourseClass } from '../types';

const input = 'block w-full mt-1 rounded-xl border p-3 bg-white dark:bg-slate-800';
type ClassDraft = Omit<CourseClass, 'id' | 'createdAt' | 'updatedAt'>;

export function ClassesView() {
  const { classes, courses, students, saveClass, deleteClass, setCurrentView } = useApp();
  const empty = (): ClassDraft => ({
    name: '',
    courseId: courses[0]?.id || '',
    startDate: '',
    endDate: '',
    instructorName: '',
    studentIds: [],
    studentGrades: {},
    validityYears: 5,
  });

  const [draft, setDraft] = useState<ClassDraft>(empty);
  const [editing, setEditing] = useState<string>();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const selectedCourse = useMemo(
    () => courses.find(course => course.id === draft.courseId) || courses[0],
    [courses, draft.courseId],
  );
  const syllabus = selectedCourse?.syllabus || [];

  const edit = (item?: CourseClass) => {
    setDraft(item ? {
      name: item.name,
      courseId: item.courseId,
      startDate: item.startDate,
      endDate: item.endDate,
      instructorName: item.instructorName,
      studentIds: [...item.studentIds],
      studentGrades: { ...(item.studentGrades || {}) },
      validityYears: item.validityYears || 5,
      notes: item.notes,
    } : empty());
    setEditing(item?.id);
    setOpen(true);
    setError('');
  };

  const emit = (id: string) => {
    sessionStorage.setItem('certifyai_prefill_class', id);
    setCurrentView('create-certificate');
  };

  const toggleStudent = (studentId: string, checked: boolean) => {
    setDraft(current => {
      const nextGrades = { ...(current.studentGrades || {}) };
      if (!checked) delete nextGrades[studentId];
      return {
        ...current,
        studentIds: checked
          ? Array.from(new Set([...current.studentIds, studentId]))
          : current.studentIds.filter(id => id !== studentId),
        studentGrades: nextGrades,
      };
    });
  };

  const setGrade = (studentId: string, subjectIndex: number, value: string) => {
    if (value !== '' && !/^\d{0,2}([.,]\d{0,1})?$/.test(value)) return;
    const normalized = value.replace(',', '.');
    if (normalized !== '' && Number(normalized) > 10) return;
    setDraft(current => {
      const grades = [...(current.studentGrades?.[studentId] || [])];
      grades[subjectIndex] = normalized;
      return {
        ...current,
        studentGrades: {
          ...(current.studentGrades || {}),
          [studentId]: grades,
        },
      };
    });
  };

  return <div className="p-4 sm:p-8 space-y-6 max-w-6xl w-full mx-auto">
    <div className="flex justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold">Turmas</h1>
        <p className="text-sm text-slate-500">Organize períodos, instrutores, participantes e notas.</p>
      </div>
      <button className="rounded-xl px-4 py-2 bg-indigo-600 text-white" onClick={() => edit()}>Nova turma</button>
    </div>

    {error && <p role="alert" className="bg-rose-50 text-rose-800 p-4 rounded-xl">{error}</p>}

    {open && <form className="bg-white dark:bg-slate-900 border rounded-2xl p-5 space-y-5" onSubmit={e => {
      e.preventDefault();
      try {
        saveClass(draft, editing);
        setOpen(false);
        setError('');
      } catch (err) {
        setError((err as Error).message);
      }
    }}>
      <h2 className="text-xl font-bold">{editing ? 'Editar turma' : 'Nova turma'}</h2>

      <div className="grid sm:grid-cols-2 gap-4">
        <label>Nome da turma<input required className={input} value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })}/></label>
        <label>Instrutor responsável<input required className={input} value={draft.instructorName} onChange={e => setDraft({ ...draft, instructorName: e.target.value })}/></label>
        <label>Início<input required type="date" className={input} value={draft.startDate} onChange={e => setDraft({ ...draft, startDate: e.target.value })}/></label>
        <label>Término<input required type="date" className={input} value={draft.endDate} onChange={e => setDraft({ ...draft, endDate: e.target.value })}/></label>
        <label>Validade após o término (anos)<input required type="number" min="1" max="20" className={input} value={draft.validityYears} onChange={e => setDraft({ ...draft, validityYears: Number(e.target.value) })}/></label>
      </div>

      <fieldset className="border rounded-xl p-4">
        <legend className="font-semibold">Participantes ({draft.studentIds.length})</legend>
        <label>Buscar condutor<input className={input} value={search} onChange={e => setSearch(e.target.value)}/></label>
        <div className="max-h-60 overflow-auto mt-3 space-y-2">
          {students.filter(s => s.fullName.toLowerCase().includes(search.toLowerCase())).map(student => <label key={student.id} className="flex gap-3 items-center">
            <input type="checkbox" checked={draft.studentIds.includes(student.id)} onChange={e => toggleStudent(student.id, e.target.checked)}/>
            {student.fullName}
          </label>)}
          {!students.length && <p>Cadastre os condutores antes de adicioná-los à turma.</p>}
        </div>
      </fieldset>

      {draft.studentIds.length > 0 && syllabus.length > 0 && <section className="border rounded-xl p-4 space-y-4">
        <div>
          <h3 className="font-bold">Notas dos participantes</h3>
          <p className="text-xs text-slate-500 mt-1">Informe notas de 0 a 10. As notas preenchidas serão exibidas na coluna “Avaliação” do verso do certificado.</p>
        </div>
        <div className="space-y-4">
          {draft.studentIds.map(studentId => {
            const student = students.find(s => s.id === studentId);
            if (!student) return null;
            return <div key={studentId} className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4">
              <h4 className="font-semibold mb-3">{student.fullName}</h4>
              <div className="grid md:grid-cols-2 gap-3">
                {syllabus.map((subject, index) => <label key={`${studentId}-${index}`} className="text-xs font-semibold">
                  {subject.discipline}
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    inputMode="decimal"
                    placeholder="Nota (0 a 10)"
                    className={input}
                    value={draft.studentGrades?.[studentId]?.[index] || ''}
                    onChange={e => setGrade(studentId, index, e.target.value)}
                  />
                </label>)}
              </div>
            </div>;
          })}
        </div>
      </section>}

      <p className="text-sm text-slate-500">Alterar a turma não modifica certificados já emitidos.</p>
      <div className="flex gap-3">
        <button className="bg-indigo-600 text-white rounded-xl px-5 py-2">Salvar turma</button>
        <button type="button" onClick={() => setOpen(false)}>Fechar</button>
      </div>
    </form>}

    <div className="grid md:grid-cols-2 gap-4">
      {classes.map(item => <article key={item.id} className="bg-white dark:bg-slate-900 border rounded-2xl p-5 space-y-3">
        <h2 className="font-bold text-xl">{item.name}</h2>
        <p>{item.startDate.split('-').reverse().join('/')} a {item.endDate.split('-').reverse().join('/')}</p>
        <p className="text-sm">{item.instructorName} • {item.studentIds.length} participantes • Validade: {item.validityYears || 5} anos</p>
        <div className="flex flex-wrap gap-3">
          <button className="text-indigo-600 font-bold" onClick={() => emit(item.id)}>Emitir para turma</button>
          <button onClick={() => edit(item)}>Editar</button>
          <button className="text-rose-600" onClick={() => {
            if (!confirm(`Excluir a turma ${item.name}?`)) return;
            try {
              deleteClass(item.id);
              setError('');
            } catch (err) {
              setError((err as Error).message);
            }
          }}>Excluir</button>
        </div>
      </article>)}
    </div>

    {!classes.length && !open && <p className="p-8 text-center text-slate-500">Nenhuma turma cadastrada.</p>}
  </div>;
}
