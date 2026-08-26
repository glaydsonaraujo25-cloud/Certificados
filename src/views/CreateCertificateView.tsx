import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CertificateDocument } from '../components/CertificateDocument';
import { CertificateModal } from '../components/CertificateModal';
import { Certificate } from '../types';
import { exportCertificateToPdf } from '../utils/pdfGenerator';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle,
  FileCheck,
  User,
  BookOpen,
  Calendar,
  MapPin,
  Eye,
  ArrowRight,
  ArrowLeft,
  Download,
  Copy,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Info,
  Loader2,
} from 'lucide-react';

export const CreateCertificateView: React.FC = () => {
  const {
    courses,
    students,
    institution,
    issueCertificate,
    setCurrentView,
  } = useApp();

  // Wizard Step: 1 = Form, 2 = Official Preview
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Student Form State
  const [studentMode, setStudentMode] = useState<'existing' | 'new'>('existing');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [studentName, setStudentName] = useState<string>(students[0]?.fullName || '');
  const [studentEmail, setStudentEmail] = useState<string>(students[0]?.email || '');
  const [studentDocument, setStudentDocument] = useState<string>(students[0]?.documentNumber || '');

  // Course Form State
  const [courseMode, setCourseMode] = useState<'existing' | 'new'>('existing');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [courseName, setCourseName] = useState<string>(courses[0]?.name || '');
  const [workloadHours, setWorkloadHours] = useState<number>(courses[0]?.workloadHours || 40);
  const [modality, setModality] = useState<'online' | 'presencial' | 'hibrido'>(courses[0]?.modality || 'online');
  const [instructorName, setInstructorName] = useState<string>(courses[0]?.instructorName || '');
  const [startDate, setStartDate] = useState<string>(courses[0]?.startDate || '2026-01-10');
  const [endDate, setEndDate] = useState<string>(courses[0]?.endDate || '2026-02-15');

  // Emission & Location State
  const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState<string>(`${institution.city || 'São Paulo'}, ${institution.state || 'SP'}`);
  const [observations, setObservations] = useState<string>('');

  // Post-Issuance State
  const [createdCertificate, setCreatedCertificate] = useState<Certificate | null>(null);
  const [isIssuing, setIsIssuing] = useState<boolean>(false);
  const [downloadingPdf, setDownloadingPdf] = useState<boolean>(false);

  // Sync selected student
  useEffect(() => {
    if (studentMode === 'existing' && selectedStudentId) {
      const student = students.find((s) => s.id === selectedStudentId);
      if (student) {
        setStudentName(student.fullName);
        setStudentEmail(student.email || '');
        setStudentDocument(student.documentNumber || '');
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
        setWorkloadHours(course.workloadHours);
        setModality(course.modality);
        setInstructorName(course.instructorName);
        if (course.startDate) setStartDate(course.startDate);
        if (course.endDate) setEndDate(course.endDate);
      }
    }
  }, [selectedCourseId, courseMode, courses]);

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
        studentName: studentName.trim(),
        studentEmail: studentEmail.trim() || undefined,
        studentDocument: studentDocument.trim() || undefined,
        courseId: selectedCourseId || `crs-temp-${Date.now()}`,
        courseName: courseName.trim(),
        workloadHours: Number(workloadHours),
        modality,
        instructorName: instructorName.trim() || 'Prof. Coordenador',
        institutionName: institution.name || 'Tech Academy Brasil',
        institutionLogoUrl: institution.logoUrl,
        issueDate,
        startDate,
        endDate,
        location,
        signatoryName: institution.signatureName || 'Dra. Maria Souza',
        signatoryRole: institution.signatureRole || 'Diretora Acadêmica',
        signatureImageUrl: institution.signatureImageUrl,
        secondSignatoryName: institution.showSecondSignature ? institution.secondSignatureName : undefined,
        secondSignatoryRole: institution.showSecondSignature ? institution.secondSignatureRole : undefined,
        secondSignatureImageUrl: institution.showSecondSignature ? institution.secondSignatureImageUrl : undefined,
        customText: institution.defaultCertificateText,
        observations: observations.trim() || undefined,
        templateId: 'official',
      });

      setCreatedCertificate(newCert);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4F46E5', '#D97706', '#10B981', '#3B82F6'],
        });
      } catch {}
    } catch (err) {
      alert('Erro ao emitir o certificado. Verifique os dados e tente novamente.');
    } finally {
      setIsIssuing(false);
    }
  };

  const handleDownloadPdf = async (cert: Certificate) => {
    try {
      setDownloadingPdf(true);
      await exportCertificateToPdf({
        elementId: 'preview-official-certificate-canvas',
        studentName: cert.studentName,
        courseName: cert.courseName,
      });
    } catch (err) {
      alert('Erro ao gerar o arquivo PDF. Tente novamente.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleResetForNewEmission = () => {
    setCreatedCertificate(null);
    setCurrentStep(1);
    setStudentName('');
    setStudentEmail('');
    setStudentDocument('');
    setObservations('');
    setStudentMode('existing');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-semibold text-xs">
              Modelo Oficial Padronizado
            </span>
            <span className="text-xs text-slate-400">• A4 Paisagem (297 x 210 mm)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Emitir Certificado
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Preencha os dados do aluno e do curso para gerar o certificado com identificador e QR Code de autenticidade.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep === 1
                  ? 'bg-indigo-600 text-white'
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
                  ? 'bg-indigo-600 text-white'
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
          {/* Card 1: Aluno */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-slate-900 dark:text-white">
                    1. Dados do Aluno (Destinatário)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    O nome será renderizado em destaque no centro do modelo oficial.
                  </p>
                </div>
              </div>

              {/* Mode Toggle: Existing vs New */}
              <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setStudentMode('existing')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    studentMode === 'existing'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Aluno Cadastrado
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStudentMode('new');
                    setSelectedStudentId('');
                  }}
                  className={`px-3 py-1 rounded-md transition-all ${
                    studentMode === 'new'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
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
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} {s.documentNumber ? `(${s.documentNumber})` : ''} - {s.email}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nome Completo do Aluno *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dra. Mariana Albuquerque de Souza"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  CPF / Identificação (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: 123.456.789-00"
                  value={studentDocument}
                  onChange={(e) => setStudentDocument(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  E-mail do Aluno (Para envio do link de autenticidade)
                </label>
                <input
                  type="email"
                  placeholder="aluno@exemplo.com.br"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Card 2: Curso */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-slate-900 dark:text-white">
                    2. Dados do Curso & Carga Horária
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Informações acadêmicas e período de realização.
                  </p>
                </div>
              </div>

              {/* Mode Toggle: Existing vs New Course */}
              <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setCourseMode('existing')}
                  className={`px-3 py-1 rounded-md transition-all ${
                    courseMode === 'existing'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Curso Cadastrado
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCourseMode('new');
                    setSelectedCourseId('');
                  }}
                  className={`px-3 py-1 rounded-md transition-all ${
                    courseMode === 'new'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Personalizado
                </button>
              </div>
            </div>

            {courseMode === 'existing' && courses.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Selecionar Curso Cadastrado
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.workloadHours}h - {c.modality})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nome do Curso *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Introdução à Inteligência Artificial & LLMs"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Carga Horária (Horas) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={2000}
                  value={workloadHours}
                  onChange={(e) => setWorkloadHours(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium"
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
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Data de Término / Conclusão
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Modalidade
                </label>
                <select
                  value={modality}
                  onChange={(e) => setModality(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="online">Online / EAD</option>
                  <option value="presencial">Presencial</option>
                  <option value="hibrido">Híbrido</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Instrutor / Professor Responsável
                </label>
                <input
                  type="text"
                  placeholder="Ex: Prof. Dr. Carlos Eduardo"
                  value={instructorName}
                  onChange={(e) => setInstructorName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Emissão & Local */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-base text-slate-900 dark:text-white">
                  3. Emissão & Informações Complementares
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Data de registro, cidade e eventuais anotações de verso/rodapé.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Data de Emissão do Certificado
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Localidade (Cidade, UF)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: São Paulo, SP"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Observações ou Texto Complementar (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Aprovado com louvor e distinção no Trabalho de Conclusão."
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Institutional Template Notice */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400">
              <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 dark:text-slate-200">Padronização Institucional Ativa:</strong> O layout, logomarca oficial, assinaturas da diretoria ({institution.signatureName || 'Dra. Maria Souza'}), moldura de alta segurança e QR Code criptográfico são aplicados automaticamente a partir das configurações do <strong>Modelo Oficial</strong>.
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all hover:scale-[1.01]"
            >
              <Eye className="w-4 h-4" />
              <span>Pré-visualizar Certificado Oficial</span>
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
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar e Corrigir Dados</span>
              </button>
              <div className="hidden md:block text-xs text-slate-500">
                Verifique os dados antes da emissão definitiva
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleConfirmAndIssue}
                disabled={isIssuing}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all hover:scale-[1.01] disabled:opacity-50"
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
          <div className="bg-slate-200/80 dark:bg-slate-950 p-4 sm:p-8 rounded-2xl border border-slate-300 dark:border-slate-800 flex justify-center items-center overflow-x-auto shadow-inner">
            <div className="transform scale-[0.80] sm:scale-100 origin-center transition-transform">
              <CertificateDocument
                certificate={{
                  studentName,
                  studentDocument: studentDocument || undefined,
                  courseName,
                  workloadHours,
                  modality,
                  instructorName,
                  institutionName: institution.name || 'Tech Academy Brasil',
                  institutionLogoUrl: institution.logoUrl,
                  issueDate,
                  startDate,
                  endDate,
                  location,
                  signatoryName: institution.signatureName || 'Dra. Maria Souza',
                  signatoryRole: institution.signatureRole || 'Diretora Acadêmica',
                  signatureImageUrl: institution.signatureImageUrl,
                  secondSignatoryName: institution.showSecondSignature ? institution.secondSignatureName : undefined,
                  secondSignatoryRole: institution.showSecondSignature ? institution.secondSignatureRole : undefined,
                  secondSignatureImageUrl: institution.showSecondSignature ? institution.secondSignatureImageUrl : undefined,
                  customText: institution.defaultCertificateText,
                  observations: observations || undefined,
                  code: 'CERT-2026-PREVIEW',
                  templateId: 'official',
                }}
                elementId="preview-official-certificate-canvas"
              />
            </div>
          </div>
        </div>
      )}

      {/* Success Modal after issuance */}
      {createdCertificate && (
        <CertificateModal
          certificate={createdCertificate}
          onClose={handleResetForNewEmission}
        />
      )}
    </div>
  );
};
