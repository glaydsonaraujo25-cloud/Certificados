import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CertificateFrontPage, CertificateBackPage } from '../components/CertificateDocument';
import { CertificateModal } from '../components/CertificateModal';
import { Certificate, SyllabusItem } from '../types';
import { exportTwoPageCertificateToPdf } from '../utils/pdfGenerator';
import { DEFAULT_CVTE_SYLLABUS } from '../utils/storage';
import confetti from 'canvas-confetti';
import {
  CheckCircle,
  User,
  BookOpen,
  Calendar,
  Eye,
  ArrowRight,
  ArrowLeft,
  Info,
  Loader2,
  FileText,
  Layers,
  Plus,
  Trash2,
  Shield,
} from 'lucide-react';

export const CreateCertificateView: React.FC = () => {
  const {
    courses,
    students,
    institution,
    issueCertificate,
    setCurrentView,
    setValidationSearchCode,
  } = useApp();

  // Wizard Step: 1 = Form, 2 = Official Preview
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [previewTab, setPreviewTab] = useState<'front' | 'back' | 'both'>('front');

  // Student Form State
  const [studentMode, setStudentMode] = useState<'existing' | 'new'>('existing');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [studentName, setStudentName] = useState<string>(students[0]?.fullName || 'CARLOS HENRIQUE CAETANO DA SILVA');
  const [studentEmail, setStudentEmail] = useState<string>(students[0]?.email || 'carlos.caetano@eb.mil.br');
  const [studentDocument, setStudentDocument] = useState<string>(students[0]?.documentNumber || '067.440.731-84');
  const [registrationNumber, setRegistrationNumber] = useState<string>(students[0]?.registrationNumber || '07575025319');
  const [cnhCategory, setCnhCategory] = useState<string>(students[0]?.cnhCategory || 'AD');

  // Course Form State
  const [courseMode, setCourseMode] = useState<'existing' | 'new'>('existing');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [courseName, setCourseName] = useState<string>(
    courses[0]?.name || 'Curso Especializado para Condutores de Veículos de Transporte de Emergência'
  );
  const [courseSubhead, setCourseSubhead] = useState<string>(
    courses[0]?.courseSubhead || 'Condutores de Veículos de\nTransporte de Emergência'
  );
  const [workloadHours, setWorkloadHours] = useState<number>(courses[0]?.workloadHours || 50);
  const [modality, setModality] = useState<'online' | 'presencial' | 'hibrido'>(courses[0]?.modality || 'presencial');
  const [instructorName, setInstructorName] = useState<string>(courses[0]?.instructorName || 'Paulo de Jesus Camargo / Erik Santiago');
  const [startDate, setStartDate] = useState<string>(courses[0]?.startDate || '2026-06-08');
  const [endDate, setEndDate] = useState<string>(courses[0]?.endDate || '2026-06-16');

  // Legal Framework & Directives
  const [legalInstruction, setLegalInstruction] = useState<string>(
    institution.legalInstruction || 'Instrução Nº 592, de 10 de agosto de 2020/Detran-DF'
  );
  const [contranResolution, setContranResolution] = useState<string>(
    institution.contranResolution || 'Resolução Nº 1.020/2025 do CONTRAN'
  );
  const [validityText, setValidityText] = useState<string>(
    institution.validityText || 'com validade de cinco anos após o término do curso'
  );

  // Syllabus (Verso) State
  const [syllabus, setSyllabus] = useState<SyllabusItem[]>(
    courses[0]?.syllabus && courses[0]?.syllabus.length > 0 ? courses[0].syllabus : DEFAULT_CVTE_SYLLABUS
  );

  // Emission & Location State
  const [issueDate, setIssueDate] = useState<string>('2026-06-18');
  const [location, setLocation] = useState<string>(`${institution.city || 'Brasília'}-${institution.state || 'DF'}`);

  // Post-Issuance State
  const [createdCertificate, setCreatedCertificate] = useState<Certificate | null>(null);
  const [isIssuing, setIsIssuing] = useState<boolean>(false);

  // Sync selected student
  useEffect(() => {
    if (studentMode === 'existing' && selectedStudentId) {
      const student = students.find((s) => s.id === selectedStudentId);
      if (student) {
        setStudentName(student.fullName);
        setStudentEmail(student.email || '');
        setStudentDocument(student.documentNumber || '');
        if (student.registrationNumber) setRegistrationNumber(student.registrationNumber);
        if (student.cnhCategory) setCnhCategory(student.cnhCategory);
        if (student.courseId && courses.some((c) => c.id === student.courseId)) {
          setSelectedCourseId(student.courseId);
        }
      }
    }
  }, [selectedStudentId, studentMode, students, courses]);

  // Sync selected course
  useEffect(() => {
    if (courseMode === 'existing' && selectedCourseId) {
      const course = courses.find((c) => c.id === selectedCourseId);
      if (course) {
        setCourseName(course.name);
        if (course.courseSubhead) setCourseSubhead(course.courseSubhead);
        setWorkloadHours(course.workloadHours);
        setModality(course.modality);
        setInstructorName(course.instructorName);
        if (course.startDate) setStartDate(course.startDate);
        if (course.endDate) setEndDate(course.endDate);
        if (course.legalInstruction) setLegalInstruction(course.legalInstruction);
        if (course.contranResolution) setContranResolution(course.contranResolution);
        if (course.syllabus && course.syllabus.length > 0) setSyllabus(course.syllabus);
      }
    }
  }, [selectedCourseId, courseMode, courses]);

  // Syllabus row handlers
  const handleUpdateSyllabusRow = (index: number, field: keyof SyllabusItem, value: string) => {
    const updated = [...syllabus];
    updated[index] = { ...updated[index], [field]: value };
    setSyllabus(updated);
  };

  const handleAddSyllabusRow = () => {
    setSyllabus([
      ...syllabus,
      {
        discipline: 'Nova Disciplina Especializada',
        workload: '10h/a',
        grade: '10',
        instructor: instructorName || 'Instrutor Responsável',
      },
    ]);
  };

  const handleRemoveSyllabusRow = (index: number) => {
    if (syllabus.length <= 1) {
      alert('O conteúdo programático deve ter no mínimo uma disciplina.');
      return;
    }
    setSyllabus(syllabus.filter((_, idx) => idx !== index));
  };

  // Validation
  const validateForm = () => {
    if (!studentName.trim()) {
      alert('Por favor, informe o Nome Completo do Aluno.');
      return false;
    }
    if (!courseName.trim()) {
      alert('Por favor, informe o Nome do Curso.');
      return false;
    }
    if (!workloadHours || workloadHours <= 0) {
      alert('Por favor, informe uma carga horária válida.');
      return false;
    }
    return true;
  };

  const handleProceedToPreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmAndIssue = () => {
    setIsIssuing(true);
    try {
      const newCert = issueCertificate({
        studentId: selectedStudentId || `std-temp-${Date.now()}`,
        studentName: studentName.trim().toUpperCase(),
        studentEmail: studentEmail.trim() || undefined,
        studentDocument: studentDocument.trim() || '067.440.731-84',
        registrationNumber: registrationNumber.trim() || '07575025319',
        cnhCategory: cnhCategory.trim() || 'AD',
        courseId: selectedCourseId || `crs-temp-${Date.now()}`,
        courseName: courseName.trim(),
        courseSubhead: courseSubhead.trim(),
        workloadHours: Number(workloadHours),
        modality,
        instructorName: instructorName.trim() || 'Paulo de Jesus Camargo / Erik Santiago',
        institutionName: institution.name || 'Base Administrativa do Quartel-General do Exército – Forte Caxias',
        institutionCnpj: institution.institutionCnpj || '21.744.847/0001-50',
        legalInstruction,
        contranResolution,
        validityText,
        syllabus,
        issueDate,
        startDate,
        endDate,
        location,
        signatoryName: institution.signatoryName || 'Carlos Henrique Ferreira De Mello',
        signatoryRole: institution.signatoryRole || 'Diretor Geral',
        signatoryCpf: institution.signatoryCpf || '981.050.007-68',
        signatureImageUrl: institution.signatureImageUrl,
        templateId: 'official',
      });

      setCreatedCertificate(newCert);

      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#B45309', '#D97706', '#1E3A8A', '#10B981'],
        });
      } catch {}
    } catch (err) {
      alert('Erro ao emitir o certificado. Verifique os dados e tente novamente.');
    } finally {
      setIsIssuing(false);
    }
  };

  const handleResetForNewEmission = () => {
    setCreatedCertificate(null);
    setCurrentStep(1);
    setStudentName('');
    setStudentEmail('');
    setStudentDocument('');
    setStudentMode('new');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold text-xs border border-amber-300 dark:border-amber-800">
              Modelo Oficial Padronizado • Forte Caxias
            </span>
            <span className="text-xs text-slate-400">• A4 Paisagem (Frente & Verso)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Emitir Certificado Oficial
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Preencha os dados do condutor/aluno e diretrizes do curso para gerar o certificado em padrão oficial.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep === 1
                  ? 'bg-amber-600 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              1
            </span>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Dados</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">→</span>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep === 2
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              2
            </span>
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Pré-visualização Oficial</span>
          </div>
        </div>
      </div>

      {/* STEP 1: FORM VIEW */}
      {currentStep === 1 && (
        <form onSubmit={handleProceedToPreview} className="space-y-6">
          {/* Card 1: Aluno / Condutor */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-slate-900 dark:text-white">
                    1. Dados do Aluno / Condutor
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Informações pessoais, CPF, Nº de Registro e Categoria da CNH.
                  </p>
                </div>
              </div>

              {/* Mode Toggle: Existing vs New */}
              <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setStudentMode('existing')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    studentMode === 'existing'
                      ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Cadastrado
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStudentMode('new');
                    setSelectedStudentId('');
                  }}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    studentMode === 'new'
                      ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Novo / Avulso
                </button>
              </div>
            </div>

            {studentMode === 'existing' && students.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Selecionar Aluno da Lista
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-medium"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} {s.documentNumber ? `(CPF: ${s.documentNumber})` : ''} - Reg: {s.registrationNumber || 'N/A'} - Cat: {s.cnhCategory || 'N/A'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nome Completo do Aluno (em letras maiúsculas) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: CARLOS HENRIQUE CAETANO DA SILVA"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  CPF do Aluno *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 067.440.731-84"
                  value={studentDocument}
                  onChange={(e) => setStudentDocument(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nº de Registro CNH
                </label>
                <input
                  type="text"
                  placeholder="Ex: 07575025319"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Categoria CNH
                </label>
                <input
                  type="text"
                  placeholder="Ex: AD, B, D, E"
                  value={cnhCategory}
                  onChange={(e) => setCnhCategory(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-bold"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  E-mail do Aluno
                </label>
                <input
                  type="email"
                  placeholder="aluno@eb.mil.br"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Curso & Normativas */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-slate-900 dark:text-white">
                    2. Dados do Curso, Período & Normativas Oficiais
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Informações acadêmicas e fundamentação legal (CONTRAN/Detran).
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nome Completo do Curso *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Curso Especializado para Condutores de Veículos de Transporte de Emergência"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Carga Horária (h/a) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={2000}
                  value={workloadHours}
                  onChange={(e) => setWorkloadHours(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-bold"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Subtítulo de Destaque no Cabeçalho (Frente)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Condutores de Veículos de Transporte de Emergência"
                  value={courseSubhead}
                  onChange={(e) => setCourseSubhead(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Data de Início
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Data de Término
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Data de Emissão
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Instrução Normativa / Homologação Detran
                </label>
                <input
                  type="text"
                  value={legalInstruction}
                  onChange={(e) => setLegalInstruction(e.target.value)}
                  placeholder="Ex: Instrução Nº 592, de 10 de agosto de 2020/Detran-DF"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Resolução CONTRAN
                </label>
                <input
                  type="text"
                  value={contranResolution}
                  onChange={(e) => setContranResolution(e.target.value)}
                  placeholder="Ex: Resolução Nº 1.020/2025 do CONTRAN"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Conteúdo Programático (Verso do Certificado) */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-slate-900 dark:text-white">
                    3. Conteúdo Programático (Página 2: Verso)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Grade curricular, carga horária por disciplina, notas de avaliação e instrutores.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddSyllabusRow}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 rounded-lg text-xs font-bold border border-amber-200 dark:border-amber-800 hover:bg-amber-100 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Disciplina
              </button>
            </div>

            <div className="space-y-3">
              {syllabus.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700"
                >
                  <div className="md:col-span-5">
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Disciplina
                    </label>
                    <input
                      type="text"
                      value={item.discipline}
                      onChange={(e) => handleUpdateSyllabusRow(idx, 'discipline', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Carga Horária
                    </label>
                    <input
                      type="text"
                      value={item.workload}
                      onChange={(e) => handleUpdateSyllabusRow(idx, 'workload', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium text-center"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Avaliação / Nota
                    </label>
                    <input
                      type="text"
                      value={item.grade}
                      onChange={(e) => handleUpdateSyllabusRow(idx, 'grade', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-black text-center"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Instrutor
                    </label>
                    <input
                      type="text"
                      value={item.instructor}
                      onChange={(e) => handleUpdateSyllabusRow(idx, 'instructor', e.target.value.toUpperCase())}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium uppercase"
                    />
                  </div>

                  <div className="md:col-span-1 flex justify-center pt-4 md:pt-0">
                    <button
                      type="button"
                      onClick={() => handleRemoveSyllabusRow(idx)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg cursor-pointer transition-colors"
                      title="Remover disciplina"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Institutional Template Notice */}
            <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
              <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-950 dark:text-amber-100">Padrão Oficial de Emissão:</strong> Os brasões heráldicos do SGEx e da Base Administrativa do QGEx, a moldura histórica com cantoneiras barrocas, a assinatura oficial do Diretor Geral ({institution.signatoryName || 'Carlos Henrique Ferreira De Mello'}) e o CNPJ ({institution.institutionCnpj || '21.744.847/0001-50'}) são renderizados com exatidão no documento final.
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl shadow-md transition-all hover:scale-[1.01] cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Pré-visualizar Certificado Oficial (Frente & Verso)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: PREVIEW & CONFIRMATION VIEW */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Preview Controls Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-16 z-30">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar e Editar</span>
              </button>

              {/* Preview Tab Selector */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewTab('front')}
                  className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    previewTab === 'front'
                      ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Página 1: Frente
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('back')}
                  className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    previewTab === 'back'
                      ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Página 2: Verso
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('both')}
                  className={`px-3 py-1.5 rounded-md transition-all cursor-pointer hidden md:inline-block ${
                    previewTab === 'both'
                      ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-amber-300 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Ambas as Páginas
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleConfirmAndIssue}
                disabled={isIssuing}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all hover:scale-[1.01] disabled:opacity-50 cursor-pointer"
              >
                {isIssuing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                <span>Confirmar e Emitir Certificado</span>
              </button>
            </div>
          </div>

          {/* Certificate Canvas Render */}
          <div className="bg-slate-200/80 dark:bg-slate-950 p-4 sm:p-8 rounded-2xl border border-slate-300 dark:border-slate-800 flex flex-col items-center gap-6 overflow-x-auto shadow-inner">
            {(previewTab === 'front' || previewTab === 'both') && (
              <div className="flex flex-col items-center w-full">
                {previewTab === 'both' && (
                  <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> Página 1: Frente
                  </div>
                )}
                <div className="transform scale-[0.70] sm:scale-[0.85] lg:scale-95 origin-top transition-transform shadow-2xl rounded-lg overflow-hidden">
                  <CertificateFrontPage
                    certificate={{
                      studentName: studentName.toUpperCase(),
                      studentDocument,
                      registrationNumber,
                      cnhCategory,
                      courseName,
                      courseSubhead,
                      workloadHours,
                      modality,
                      instructorName,
                      institutionName: institution.name || 'Base Administrativa do Quartel-General do Exército – Forte Caxias',
                      institutionCnpj: institution.institutionCnpj || '21.744.847/0001-50',
                      legalInstruction,
                      contranResolution,
                      validityText,
                      issueDate,
                      startDate,
                      endDate,
                      location,
                      signatoryName: institution.signatoryName || 'Carlos Henrique Ferreira De Mello',
                      signatoryRole: institution.signatoryRole || 'Diretor Geral',
                      signatoryCpf: institution.signatoryCpf || '981.050.007-68',
                      signatureImageUrl: institution.signatureImageUrl,
                      code: '006/CVTE/2026',
                    }}
                    elementId="preview-front-certificate-canvas"
                  />
                </div>
              </div>
            )}

            {(previewTab === 'back' || previewTab === 'both') && (
              <div className="flex flex-col items-center w-full">
                {previewTab === 'both' && (
                  <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mt-4 mb-2 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" /> Página 2: Verso (Conteúdo Programático)
                  </div>
                )}
                <div className="transform scale-[0.70] sm:scale-[0.85] lg:scale-95 origin-top transition-transform shadow-2xl rounded-lg overflow-hidden">
                  <CertificateBackPage
                    certificate={{
                      code: '006/CVTE/2026',
                      syllabus,
                    }}
                    elementId="preview-back-certificate-canvas"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success Modal after issuance */}
      {createdCertificate && (
        <CertificateModal
          certificate={createdCertificate}
          isOpen={!!createdCertificate}
          onClose={handleResetForNewEmission}
          setCurrentView={setCurrentView}
          setValidationSearchCode={setValidationSearchCode}
        />
      )}
    </div>
  );
};
