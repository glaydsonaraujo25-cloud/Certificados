import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { CertificateFrontPage, CertificateBackPage } from '../components/CertificateDocument';
import { CertificateModal } from '../components/CertificateModal';
import { Certificate, SyllabusItem } from '../types';
import { DEFAULT_CVTE_SYLLABUS } from '../utils/storage';
import confetti from 'canvas-confetti';
import { ArrowLeft, ArrowRight, CheckCircle, Eye, FileText, Layers, Loader2, Plus, Trash2, User, BookOpen, AlertTriangle } from 'lucide-react';

const onlyDigits = (value: string, maxLength = 11) => value.replace(/\D/g, '').slice(0, maxLength);

const isValidCpf = (value: string) => onlyDigits(value).length === 11;

export const CreateCertificateView: React.FC = () => {
  const { courses, students, certificates, institution, issueCertificate, setCurrentView, setValidationSearchCode } = useApp();
  const prefillStudentId = typeof window !== 'undefined' ? sessionStorage.getItem('certifyai_prefill_student') || '' : '';
  const prefillCourseId = typeof window !== 'undefined' ? sessionStorage.getItem('certifyai_prefill_course') || '' : '';
  const initialStudent = students.find((student) => student.id === prefillStudentId) || students[0];
  const initialCourse = courses.find((course) => course.id === (prefillCourseId || initialStudent?.courseId)) || courses[0];

  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [previewTab, setPreviewTab] = useState<'front' | 'back' | 'both'>('front');
  const [studentMode, setStudentMode] = useState<'existing' | 'new'>('existing');
  const [selectedStudentId, setSelectedStudentId] = useState(initialStudent?.id || '');
  const [studentName, setStudentName] = useState(initialStudent?.fullName || '');
  const [studentEmail, setStudentEmail] = useState(initialStudent?.email || '');
  const [studentDocument, setStudentDocument] = useState(onlyDigits(initialStudent?.documentNumber || ''));
  const [registrationNumber, setRegistrationNumber] = useState(onlyDigits(initialStudent?.registrationNumber || ''));
  const [cnhCategory, setCnhCategory] = useState(initialStudent?.cnhCategory || 'AD');
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourse?.id || '');
  const [courseName, setCourseName] = useState(initialCourse?.name || 'Curso Especializado para Condutores de Veículos de Transporte de Emergência');
  const [courseSubhead, setCourseSubhead] = useState(initialCourse?.courseSubhead || 'Condutores de Veículos de Transporte de Emergência');
  const [workloadHours, setWorkloadHours] = useState(initialCourse?.workloadHours || 50);
  const [modality, setModality] = useState<'online' | 'presencial' | 'hibrido'>(initialCourse?.modality || 'presencial');
  const [instructorName, setInstructorName] = useState(initialCourse?.instructorName || 'Instrutor Responsável');
  const [startDate, setStartDate] = useState(initialCourse?.startDate || '');
  const [endDate, setEndDate] = useState(initialCourse?.endDate || '');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState(`${institution.city || 'Brasília'}-${institution.state || 'DF'}`);
  const [syllabus, setSyllabus] = useState<SyllabusItem[]>(initialCourse?.syllabus?.length ? initialCourse.syllabus : DEFAULT_CVTE_SYLLABUS);
  const [createdCertificate, setCreatedCertificate] = useState<Certificate | null>(null);
  const [isIssuing, setIsIssuing] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<Certificate | null>(null);

  useEffect(() => { if (typeof window !== 'undefined') { sessionStorage.removeItem('certifyai_prefill_student'); sessionStorage.removeItem('certifyai_prefill_course'); } }, []);
  useEffect(() => {
    if (studentMode !== 'existing' || !selectedStudentId) return;
    const student = students.find((item) => item.id === selectedStudentId); if (!student) return;
    setStudentName(student.fullName); setStudentEmail(student.email || ''); setStudentDocument(onlyDigits(student.documentNumber || '')); setRegistrationNumber(onlyDigits(student.registrationNumber || '')); setCnhCategory(student.cnhCategory || 'AD');
    if (student.courseId && courses.some((course) => course.id === student.courseId)) setSelectedCourseId(student.courseId);
  }, [selectedStudentId, studentMode, students, courses]);
  useEffect(() => {
    const course = courses.find((item) => item.id === selectedCourseId); if (!course) return;
    setCourseName(course.name); setCourseSubhead(course.courseSubhead || course.name); setWorkloadHours(course.workloadHours); setModality(course.modality); setInstructorName(course.instructorName || 'Instrutor Responsável'); setStartDate(course.startDate || ''); setEndDate(course.endDate || ''); setSyllabus(course.syllabus?.length ? course.syllabus : DEFAULT_CVTE_SYLLABUS);
  }, [selectedCourseId, courses]);

  const updateSyllabus = (index: number, field: keyof SyllabusItem, value: string) => setSyllabus((prev) => prev.map((row, idx) => idx === index ? { ...row, [field]: value } : row));
  const validate = () => {
    if (!studentName.trim()) return alert('Informe o nome completo do aluno.'), false;
    if (studentDocument.length !== 11) return alert('O CPF deve conter exatamente 11 dígitos.'), false;
    if (!isValidCpf(studentDocument)) return alert('O CPF deve conter exatamente 11 dígitos.'), false;
    if (registrationNumber.length !== 11) return alert('O Nº REGISTRO do condutor deve conter exatamente 11 dígitos.'), false;
    if (!cnhCategory.trim()) return alert('Informe a categoria da CNH.'), false;
    if (studentEmail.trim() && !/^\S+@\S+\.\S+$/.test(studentEmail.trim())) return alert('Informe um e-mail válido.'), false;
    if (!courseName.trim() || workloadHours <= 0) return alert('Revise os dados do curso.'), false;
    if (!startDate || !endDate || startDate > endDate) return alert('Revise as datas de início e término.'), false;
    if (!issueDate || !location.trim()) return alert('Informe data e local de emissão.'), false;
    return true;
  };
  const findDuplicate = () => { const doc = studentDocument.replace(/\D/g, ''); return certificates.find((cert) => cert.status === 'active' && (selectedStudentId ? cert.studentId === selectedStudentId : cert.studentDocument?.replace(/\D/g, '') === doc) && (selectedCourseId ? cert.courseId === selectedCourseId : cert.courseName === courseName)) || null; };

  const performIssue = () => {
    setIsIssuing(true);
    try {
      const cert = issueCertificate({
        studentId: selectedStudentId || `student-${Date.now()}`, studentName: studentName.trim().toUpperCase(), studentEmail: studentEmail.trim() || undefined, studentDocument: studentDocument.trim(), registrationNumber: registrationNumber.trim(), cnhCategory: cnhCategory.trim().toUpperCase(),
        courseId: selectedCourseId || `course-${Date.now()}`, courseName: courseName.trim(), courseSubhead: courseSubhead.trim(), workloadHours: Number(workloadHours), modality, instructorName: instructorName.trim() || 'Instrutor Responsável', institutionName: institution.name, institutionCnpj: institution.institutionCnpj,
        legalInstruction: institution.legalInstruction, contranResolution: institution.contranResolution, validityText: institution.validityText, syllabus, issueDate, startDate, endDate, location,
        signatoryName: institution.signatoryName || 'Diretor Geral', signatoryRole: institution.signatoryRole || 'Diretor Geral', signatoryCpf: institution.signatoryCpf, signatureImageUrl: institution.signatureImageUrl, templateId: 'official',
      });
      setCreatedCertificate(cert); setDuplicateWarning(null); try { confetti({ particleCount: 80, spread: 75, origin: { y: 0.6 } }); } catch {}
    } catch { alert('Erro ao emitir o certificado. Verifique os dados e tente novamente.'); }
    finally { setIsIssuing(false); }
  };
  const issue = () => { if (!validate()) return; const duplicate = findDuplicate(); if (duplicate) { setDuplicateWarning(duplicate); return; } performIssue(); };

  const previewCertificate = { studentName: studentName.toUpperCase() || 'NOME DO ALUNO', studentDocument: studentDocument || '00000000000', registrationNumber: registrationNumber || '00000000000', cnhCategory: cnhCategory || 'AD', courseName, courseSubhead, workloadHours, modality, instructorName, institutionName: institution.name, institutionCnpj: institution.institutionCnpj, legalInstruction: institution.legalInstruction, contranResolution: institution.contranResolution, validityText: institution.validityText, syllabus, issueDate, startDate, endDate, location, signatoryName: institution.signatoryName || 'Diretor Geral', signatoryRole: institution.signatoryRole || 'Diretor Geral', signatoryCpf: institution.signatoryCpf, signatureImageUrl: institution.signatureImageUrl, code: '006/CVTE/2026' };

  return <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto w-full">
    <div><div className="inline-flex px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold">Modelo Oficial • CVTE</div><h1 className="text-2xl sm:text-3xl font-extrabold mt-2">Emitir Certificado</h1><p className="text-sm text-slate-500">Preencha os dados do condutor conforme o modelo oficial.</p></div>
    {currentStep === 1 ? <form onSubmit={(e) => { e.preventDefault(); if (validate()) setCurrentStep(2); }} className="space-y-5">
      <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between gap-3 border-b pb-3"><div className="flex items-center gap-2"><User className="w-5 h-5 text-indigo-600" /><div><h2 className="font-bold">Dados do Condutor</h2><p className="text-xs text-slate-500">Campos sublinhados no certificado.</p></div></div><div className="flex p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs"><button type="button" onClick={() => setStudentMode('existing')} className={`px-3 py-1.5 rounded-md ${studentMode === 'existing' ? 'bg-white dark:bg-slate-700 font-bold' : ''}`}>Cadastrado</button><button type="button" onClick={() => { setStudentMode('new'); setSelectedStudentId(''); setStudentName(''); setStudentEmail(''); setStudentDocument(''); setRegistrationNumber(''); setCnhCategory('AD'); }} className={`px-3 py-1.5 rounded-md ${studentMode === 'new' ? 'bg-white dark:bg-slate-700 font-bold' : ''}`}>Novo</button></div></div>
        {studentMode === 'existing' && <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"><option value="">Selecione um aluno</option>{students.map((s) => <option key={s.id} value={s.id}>{s.fullName}</option>)}</select>}
        <div className="grid sm:grid-cols-2 gap-3"><input value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Nome completo *" className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border" /><input value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} placeholder="E-mail" type="email" className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border" /><div><input value={studentDocument} onChange={(e) => setStudentDocument(onlyDigits(e.target.value))} inputMode="numeric" pattern="[0-9]*" maxLength={11} placeholder="CPF *" className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border" /><p className="mt-1 text-[10px] text-slate-500">{studentDocument.length}/11 dígitos</p></div><div><input value={registrationNumber} onChange={(e) => setRegistrationNumber(onlyDigits(e.target.value))} inputMode="numeric" pattern="[0-9]*" maxLength={11} placeholder="Nº REGISTRO / CONDUTOR *" className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border" /><p className="mt-1 text-[10px] text-slate-500">{registrationNumber.length}/11 dígitos</p></div><input value={cnhCategory} onChange={(e) => setCnhCategory(e.target.value.toUpperCase())} placeholder="Categoria CNH (ex.: AD) *" className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border" /></div>
      </section>
      <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4"><div className="flex items-center gap-2 border-b pb-3"><BookOpen className="w-5 h-5 text-indigo-600" /><div><h2 className="font-bold">Curso CVTE</h2><p className="text-xs text-slate-500">Curso, período e carga horária também ficam sublinhados.</p></div></div><select value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border">{courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select><div className="grid sm:grid-cols-2 gap-3"><input value={courseName} onChange={(e) => setCourseName(e.target.value)} className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border" /><input type="number" min="1" value={workloadHours} onChange={(e) => setWorkloadHours(Number(e.target.value))} className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border" /><label className="text-xs font-semibold">Início<input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border" /></label><label className="text-xs font-semibold">Término<input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border" /></label></div>
        <div className="space-y-2"><div className="flex justify-between"><h3 className="text-sm font-bold">Conteúdo Programático</h3><button type="button" onClick={() => setSyllabus((p) => [...p, { discipline: 'Novo conteúdo', workload: '5h/a', grade: 'Apto', instructor: instructorName }])} className="text-xs text-indigo-600 flex gap-1"><Plus className="w-3.5 h-3.5" />Adicionar</button></div>{syllabus.map((row, i) => <div key={i} className="grid grid-cols-12 gap-2"><input value={row.discipline} onChange={(e) => updateSyllabus(i, 'discipline', e.target.value)} className="col-span-7 px-2 py-2 rounded-lg border bg-slate-50 dark:bg-slate-800 text-xs" /><input value={row.workload} onChange={(e) => updateSyllabus(i, 'workload', e.target.value)} className="col-span-3 px-2 py-2 rounded-lg border bg-slate-50 dark:bg-slate-800 text-xs" /><button type="button" onClick={() => setSyllabus((p) => p.filter((_, idx) => idx !== i))} className="col-span-2 text-rose-600 flex justify-center items-center"><Trash2 className="w-4 h-4" /></button></div>)}</div>
      </section>
      <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border grid sm:grid-cols-2 gap-3"><label className="text-xs font-semibold">Data de emissão<input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border" /></label><label className="text-xs font-semibold">Local<input value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border" /></label></section>
      <div className="flex justify-end"><button type="submit" className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl"><Eye className="w-4 h-4" />Pré-visualizar<ArrowRight className="w-4 h-4" /></button></div>
    </form> : <div className="space-y-5"><div className="sticky top-3 z-30 bg-white dark:bg-slate-900 border rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3"><button onClick={() => setCurrentStep(1)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-semibold"><ArrowLeft className="w-4 h-4" />Voltar e editar</button><div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 text-xs"><button onClick={() => setPreviewTab('front')} className="px-3 py-1.5">Frente</button><button onClick={() => setPreviewTab('back')} className="px-3 py-1.5">Verso</button><button onClick={() => setPreviewTab('both')} className="px-3 py-1.5">Ambos</button></div><button onClick={issue} disabled={isIssuing} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold">{isIssuing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}Confirmar e Emitir</button></div><div className="bg-slate-200 dark:bg-slate-950 rounded-2xl p-5 overflow-x-auto flex flex-col items-center gap-6">{(previewTab === 'front' || previewTab === 'both') && <div><div className="text-xs font-bold text-slate-500 mb-2 flex gap-1"><FileText className="w-4 h-4" />Frente</div><CertificateFrontPage certificate={previewCertificate} elementId="preview-front-certificate-canvas" /></div>}{(previewTab === 'back' || previewTab === 'both') && <div><div className="text-xs font-bold text-slate-500 mb-2 flex gap-1"><Layers className="w-4 h-4" />Verso</div><CertificateBackPage certificate={previewCertificate} elementId="preview-back-certificate-canvas" /></div>}</div></div>}
    {duplicateWarning && <div className="fixed inset-0 z-[70] bg-slate-900/70 flex items-center justify-center p-4"><div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6"><div className="flex gap-3"><AlertTriangle className="w-5 h-5 text-amber-600" /><div><h3 className="font-extrabold">Certificado já existente</h3><p className="text-sm text-slate-500">Já existe um certificado ativo: <strong>{duplicateWarning.code}</strong>.</p></div></div><div className="mt-6 flex justify-end gap-2"><button onClick={() => setDuplicateWarning(null)} className="px-4 py-2 rounded-xl bg-slate-100">Cancelar</button><button onClick={performIssue} className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold">Emitir mesmo assim</button></div></div></div>}
    {createdCertificate && <CertificateModal certificate={createdCertificate} isOpen={true} onClose={() => { setCreatedCertificate(null); setCurrentStep(1); }} setCurrentView={setCurrentView} setValidationSearchCode={setValidationSearchCode} />}
  </div>;
};