import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { CertificateFrontPage, CertificateBackPage } from '../components/CertificateDocument';
import { CertificateModal } from '../components/CertificateModal';
import { Certificate, SyllabusItem } from '../types';
import { DEFAULT_AI_SYLLABUS } from '../utils/storage';
import confetti from 'canvas-confetti';
import { ArrowLeft, ArrowRight, CheckCircle, Eye, FileText, Layers, Loader2, Plus, Trash2, User, BookOpen } from 'lucide-react';

export const CreateCertificateView: React.FC = () => {
  const { courses, students, institution, issueCertificate, setCurrentView, setValidationSearchCode } = useApp();
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [previewTab, setPreviewTab] = useState<'front' | 'back' | 'both'>('front');
  const [studentMode, setStudentMode] = useState<'existing' | 'new'>('existing');
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');
  const [studentName, setStudentName] = useState(students[0]?.fullName || '');
  const [studentEmail, setStudentEmail] = useState(students[0]?.email || '');
  const [studentDocument, setStudentDocument] = useState(students[0]?.documentNumber || '');
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');
  const [courseName, setCourseName] = useState(courses[0]?.name || 'Operador de Computador com IA');
  const [courseSubhead, setCourseSubhead] = useState(courses[0]?.courseSubhead || 'Operador de Computador com Inteligência Artificial');
  const [workloadHours, setWorkloadHours] = useState(courses[0]?.workloadHours || 230);
  const [modality, setModality] = useState<'online' | 'presencial' | 'hibrido'>(courses[0]?.modality || 'presencial');
  const [instructorName, setInstructorName] = useState(courses[0]?.instructorName || 'Instrutor Responsável');
  const [startDate, setStartDate] = useState(courses[0]?.startDate || '');
  const [endDate, setEndDate] = useState(courses[0]?.endDate || '');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState(`${institution.city || 'Brasília'}-${institution.state || 'DF'}`);
  const [syllabus, setSyllabus] = useState<SyllabusItem[]>(courses[0]?.syllabus?.length ? courses[0].syllabus : DEFAULT_AI_SYLLABUS);
  const [createdCertificate, setCreatedCertificate] = useState<Certificate | null>(null);
  const [isIssuing, setIsIssuing] = useState(false);

  useEffect(() => {
    if (studentMode !== 'existing' || !selectedStudentId) return;
    const student = students.find((item) => item.id === selectedStudentId);
    if (!student) return;
    setStudentName(student.fullName);
    setStudentEmail(student.email || '');
    setStudentDocument(student.documentNumber || '');
    if (student.courseId && courses.some((course) => course.id === student.courseId)) setSelectedCourseId(student.courseId);
  }, [selectedStudentId, studentMode, students, courses]);

  useEffect(() => {
    const course = courses.find((item) => item.id === selectedCourseId);
    if (!course) return;
    setCourseName(course.name);
    setCourseSubhead(course.courseSubhead || course.name);
    setWorkloadHours(course.workloadHours);
    setModality(course.modality);
    setInstructorName(course.instructorName || 'Instrutor Responsável');
    setStartDate(course.startDate || '');
    setEndDate(course.endDate || '');
    setSyllabus(course.syllabus?.length ? course.syllabus : DEFAULT_AI_SYLLABUS);
  }, [selectedCourseId, courses]);

  const updateSyllabus = (index: number, field: keyof SyllabusItem, value: string) => {
    setSyllabus((prev) => prev.map((row, idx) => idx === index ? { ...row, [field]: value } : row));
  };

  const validate = () => {
    if (!studentName.trim()) { alert('Informe o nome completo do aluno.'); return false; }
    if (!studentDocument.trim()) { alert('Informe o CPF ou documento do aluno.'); return false; }
    if (!courseName.trim()) { alert('Informe o nome do curso.'); return false; }
    if (workloadHours <= 0) { alert('Informe uma carga horária válida.'); return false; }
    return true;
  };

  const issue = () => {
    if (!validate()) return;
    setIsIssuing(true);
    try {
      const cert = issueCertificate({
        studentId: selectedStudentId || `student-${Date.now()}`,
        studentName: studentName.trim().toUpperCase(),
        studentEmail: studentEmail.trim() || undefined,
        studentDocument: studentDocument.trim(),
        courseId: selectedCourseId || `course-${Date.now()}`,
        courseName: courseName.trim(),
        courseSubhead: courseSubhead.trim(),
        workloadHours: Number(workloadHours),
        modality,
        instructorName: instructorName.trim() || 'Instrutor Responsável',
        institutionName: institution.name,
        institutionCnpj: institution.institutionCnpj,
        syllabus,
        issueDate,
        startDate,
        endDate,
        location,
        signatoryName: institution.signatoryName || 'Diretor Geral',
        signatoryRole: institution.signatoryRole || 'Diretor Geral',
        signatoryCpf: institution.signatoryCpf,
        signatureImageUrl: institution.signatureImageUrl,
        templateId: 'official',
      });
      setCreatedCertificate(cert);
      try { confetti({ particleCount: 80, spread: 75, origin: { y: 0.6 } }); } catch {}
    } catch {
      alert('Erro ao emitir o certificado. Verifique os dados e tente novamente.');
    } finally {
      setIsIssuing(false);
    }
  };

  const previewCertificate = {
    studentName: studentName.toUpperCase() || 'NOME DO ALUNO',
    studentDocument: studentDocument || '000.000.000-00',
    courseName,
    courseSubhead,
    workloadHours,
    modality,
    instructorName,
    institutionName: institution.name,
    institutionCnpj: institution.institutionCnpj,
    syllabus,
    issueDate,
    startDate,
    endDate,
    location,
    signatoryName: institution.signatoryName || 'Diretor Geral',
    signatoryRole: institution.signatoryRole || 'Diretor Geral',
    signatoryCpf: institution.signatoryCpf,
    signatureImageUrl: institution.signatureImageUrl,
    code: 'PRÉVIA',
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto w-full">
      <div>
        <div className="inline-flex px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold">Modelo Oficial • Operador de Computador com IA</div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">Emitir Certificado</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Cadastre os dados do aluno e confirme as informações do curso antes da emissão.</p>
      </div>

      {currentStep === 1 ? (
        <form onSubmit={(e) => { e.preventDefault(); if (validate()) setCurrentStep(2); }} className="space-y-5">
          <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2"><User className="w-5 h-5 text-indigo-600" /><div><h2 className="font-bold">Dados do Aluno</h2><p className="text-xs text-slate-500">Nome, e-mail e CPF/documento.</p></div></div>
              <div className="flex p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs">
                <button type="button" onClick={() => setStudentMode('existing')} className={`px-3 py-1.5 rounded-md ${studentMode === 'existing' ? 'bg-white dark:bg-slate-700 font-bold shadow-xs' : ''}`}>Cadastrado</button>
                <button type="button" onClick={() => { setStudentMode('new'); setSelectedStudentId(''); setStudentName(''); setStudentEmail(''); setStudentDocument(''); }} className={`px-3 py-1.5 rounded-md ${studentMode === 'new' ? 'bg-white dark:bg-slate-700 font-bold shadow-xs' : ''}`}>Novo</button>
              </div>
            </div>
            {studentMode === 'existing' && <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"><option value="">Selecione um aluno</option>{students.map((student) => <option key={student.id} value={student.id}>{student.fullName}</option>)}</select>}
            <div className="grid sm:grid-cols-2 gap-3">
              <input value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Nome completo" className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
              <input value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} placeholder="E-mail" type="email" className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
            </div>
            <input value={studentDocument} onChange={(e) => setStudentDocument(e.target.value)} placeholder="CPF / Documento" className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
          </section>

          <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3"><BookOpen className="w-5 h-5 text-indigo-600" /><div><h2 className="font-bold">Curso Operador de Computador com IA</h2><p className="text-xs text-slate-500">Informações acadêmicas e conteúdo programático.</p></div></div>
            <select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm">{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</select>
            <div className="grid sm:grid-cols-2 gap-3">
              <input value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="Nome do curso" className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
              <input type="number" min="1" value={workloadHours} onChange={(e) => setWorkloadHours(Number(e.target.value))} placeholder="Carga horária" className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
              <input value={instructorName} onChange={(e) => setInstructorName(e.target.value)} placeholder="Instrutor responsável" className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
              <select value={modality} onChange={(e) => setModality(e.target.value as any)} className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm"><option value="presencial">Presencial</option><option value="online">Online</option><option value="hibrido">Híbrido</option></select>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between"><h3 className="text-sm font-bold">Conteúdo Programático</h3><button type="button" onClick={() => setSyllabus((prev) => [...prev, { discipline: 'Novo conteúdo', workload: '10h/a', grade: '10', instructor: instructorName || 'Instrutor Responsável' }])} className="text-xs font-semibold text-indigo-600 flex items-center gap-1"><Plus className="w-3.5 h-3.5" />Adicionar</button></div>
              {syllabus.map((row, index) => <div key={index} className="grid grid-cols-12 gap-2"><input value={row.discipline} onChange={(e) => updateSyllabus(index, 'discipline', e.target.value)} className="col-span-6 px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs" /><input value={row.workload} onChange={(e) => updateSyllabus(index, 'workload', e.target.value)} className="col-span-2 px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs" /><input value={row.grade} onChange={(e) => updateSyllabus(index, 'grade', e.target.value)} className="col-span-2 px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs" /><button type="button" onClick={() => setSyllabus((prev) => prev.filter((_, idx) => idx !== index))} className="col-span-2 flex justify-center items-center text-rose-600"><Trash2 className="w-4 h-4" /></button></div>)}
            </div>
          </section>

          <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 grid sm:grid-cols-2 gap-3">
            <label className="text-xs font-semibold">Data de emissão<input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" /></label>
            <label className="text-xs font-semibold">Local<input value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700" /></label>
          </section>

          <div className="flex justify-end"><button type="submit" className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl"><Eye className="w-4 h-4" />Pré-visualizar<ArrowRight className="w-4 h-4" /></button></div>
        </form>
      ) : (
        <div className="space-y-5">
          <div className="sticky top-3 z-30 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <button onClick={() => setCurrentStep(1)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-semibold"><ArrowLeft className="w-4 h-4" />Voltar e editar</button>
            <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 text-xs"><button onClick={() => setPreviewTab('front')} className={`px-3 py-1.5 rounded-md ${previewTab === 'front' ? 'bg-white dark:bg-slate-700 font-bold' : ''}`}>Frente</button><button onClick={() => setPreviewTab('back')} className={`px-3 py-1.5 rounded-md ${previewTab === 'back' ? 'bg-white dark:bg-slate-700 font-bold' : ''}`}>Verso</button><button onClick={() => setPreviewTab('both')} className={`px-3 py-1.5 rounded-md ${previewTab === 'both' ? 'bg-white dark:bg-slate-700 font-bold' : ''}`}>Ambos</button></div>
            <button onClick={issue} disabled={isIssuing} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold disabled:opacity-50">{isIssuing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}Confirmar e Emitir</button>
          </div>
          <div className="bg-slate-200 dark:bg-slate-950 rounded-2xl p-5 overflow-x-auto flex flex-col items-center gap-6">
            {(previewTab === 'front' || previewTab === 'both') && <div><div className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1"><FileText className="w-4 h-4" />Frente</div><div className="origin-top scale-[0.72] sm:scale-[0.85] lg:scale-95"><CertificateFrontPage certificate={previewCertificate} elementId="preview-front-certificate-canvas" /></div></div>}
            {(previewTab === 'back' || previewTab === 'both') && <div><div className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1"><Layers className="w-4 h-4" />Verso</div><div className="origin-top scale-[0.72] sm:scale-[0.85] lg:scale-95"><CertificateBackPage certificate={previewCertificate} elementId="preview-back-certificate-canvas" /></div></div>}
          </div>
        </div>
      )}

      {createdCertificate && <CertificateModal certificate={createdCertificate} isOpen={true} onClose={() => { setCreatedCertificate(null); setCurrentStep(1); }} setCurrentView={setCurrentView} setValidationSearchCode={setValidationSearchCode} />}
    </div>
  );
};
