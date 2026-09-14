import { expiryDate } from '../utils/lifecycle';
import { CertificatePreview } from '../components/CertificatePreview';
import { isValidCpf } from '../utils/validation';
import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { CertificateFrontPage, CertificateBackPage } from '../components/CertificateDocument';
import { CertificateModal } from '../components/CertificateModal';
import { Certificate } from '../types';
import confetti from 'canvas-confetti';
import { ArrowLeft, ArrowRight, CheckCircle, Eye, FileText, Layers, Loader2, User, AlertTriangle } from 'lucide-react';

const onlyDigits = (value: string, maxLength = 11) => value.replace(/\D/g, '').slice(0, maxLength);
const formatCpfInput = (value: string) => { const d = onlyDigits(value); return d.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/(\d{3})(\d{1,2})$/, '$1-$2'); };
const CNH_CATEGORIES = ['A','B','C','D','E','AB','AC','AD','AE'];
const DRAFT_KEY = 'certifyai_cvte_draft_v1';

export const CreateCertificateView: React.FC = () => {
  const { classes, courses, students, certificates, institution, issueCertificate, setCurrentView, setValidationSearchCode } = useApp();
  const [classId,setClassId]=useState(()=>sessionStorage.getItem('certifyai_prefill_class')||'');
  const selectedClass=classes.find(c=>c.id===classId);
  const course = courses.find(c=>c.id===selectedClass?.courseId)||courses[0];
  const [validityYears,setValidityYears]=useState(5);
  const prefillStudentId = typeof window !== 'undefined' ? sessionStorage.getItem('certifyai_prefill_student') || '' : '';
  const initialStudent = students.find((student) => student.id === prefillStudentId);
  const savedDraft = useMemo(() => { try { return typeof window !== 'undefined' ? JSON.parse(localStorage.getItem(DRAFT_KEY) || '{}') : {}; } catch { return {}; } }, []);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [previewTab, setPreviewTab] = useState<'front' | 'back' | 'both'>('front');
  const [selectedStudentId, setSelectedStudentId] = useState(initialStudent?.id || '');
  const [studentName, setStudentName] = useState(initialStudent?.fullName || savedDraft.studentName || '');
  const [studentEmail, setStudentEmail] = useState(initialStudent?.email || savedDraft.studentEmail || '');
  const [studentDocument, setStudentDocument] = useState(onlyDigits(initialStudent?.documentNumber || savedDraft.studentDocument || ''));
  const [registrationNumber, setRegistrationNumber] = useState(onlyDigits(initialStudent?.registrationNumber || savedDraft.registrationNumber || ''));
  const [cnhCategory, setCnhCategory] = useState(initialStudent?.cnhCategory || savedDraft.cnhCategory || 'AD');
  const [startDate, setStartDate] = useState(savedDraft.startDate || course?.startDate || '');
  const [endDate, setEndDate] = useState(savedDraft.endDate || course?.endDate || '');
  const [issueDate, setIssueDate] = useState(savedDraft.issueDate || new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState(savedDraft.location || `${institution.city || 'Brasília'}-${institution.state || 'DF'}`);
  const [manualGrades, setManualGrades] = useState<string[]>(Array.isArray(savedDraft.manualGrades) ? savedDraft.manualGrades : []);
  const [createdCertificate, setCreatedCertificate] = useState<Certificate | null>(null);
  const [formError, setFormError] = useState('');
  const showError = (message: string) => { setFormError(message); return false; };
  const [isIssuing, setIsIssuing] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<Certificate | null>(null);

  const classGrades = selectedClass?.studentGrades?.[selectedStudentId] || [];
  const certificateSyllabus = useMemo(() => course?.syllabus?.map((item, index) => ({
    ...item,
    grade: manualGrades[index]?.trim() || classGrades[index]?.trim() || item.grade,
  })), [course, manualGrades, classGrades]);

  useEffect(() => { sessionStorage.removeItem('certifyai_prefill_student'); sessionStorage.removeItem('certifyai_prefill_course'); }, []);
  useEffect(() => {
    if (!selectedStudentId) return;
    const s=students.find(x=>x.id===selectedStudentId);
    if(!s)return;
    setStudentName(s.fullName);setStudentEmail(s.email||'');setStudentDocument(onlyDigits(s.documentNumber||''));setRegistrationNumber(onlyDigits(s.registrationNumber||''));setCnhCategory(s.cnhCategory||'AD');
    const grades=selectedClass?.studentGrades?.[selectedStudentId] || [];
    setManualGrades(grades);
  }, [selectedStudentId, students, selectedClass]);
  useEffect(() => { localStorage.setItem(DRAFT_KEY, JSON.stringify({studentName,studentEmail,studentDocument,registrationNumber,cnhCategory,startDate,endDate,issueDate,location,manualGrades})); }, [studentName,studentEmail,studentDocument,registrationNumber,cnhCategory,startDate,endDate,issueDate,location,manualGrades]);

  useEffect(()=>{sessionStorage.removeItem('certifyai_prefill_class');if(!selectedClass){setManualGrades([]);return;}setStartDate(selectedClass.startDate);setEndDate(selectedClass.endDate);setValidityYears(selectedClass.validityYears||5);setSelectedStudentId('');setStudentName('');setStudentDocument('');setRegistrationNumber('');setManualGrades([]);},[classId]);
  const validate = () => {
    setFormError('');
    if (selectedClass && !selectedClass.studentIds.includes(selectedStudentId)) return showError('Selecione um participante da turma.');
    if (!Number.isInteger(validityYears)||validityYears<1||validityYears>20) return showError('Validade deve ser de 1 a 20 anos.');
    if (issueDate<endDate) return showError('Emissão não pode ser anterior ao término do curso.');
    if (!studentName.trim()) return showError('Informe o nome completo do condutor.'), false;
    if (!isValidCpf(studentDocument)) return showError('Informe um CPF válido.'), false;
    if (registrationNumber.length !== 11) return showError('O Nº REGISTRO deve conter exatamente 11 dígitos.'), false;
    if (!cnhCategory) return showError('Selecione a categoria da CNH.'), false;
    if (studentEmail.trim() && !/^\S+@\S+\.\S+$/.test(studentEmail.trim())) return showError('Informe um e-mail válido.'), false;
    if (!course) return showError('O curso CVTE não está configurado.'), false;
    if (!startDate || !endDate || startDate > endDate) return showError('Revise o período do curso.'), false;
    if (!issueDate || !location.trim()) return showError('Informe data e local de emissão.'), false;
    const invalidGrade = manualGrades.some(value => value.trim() !== '' && (Number.isNaN(Number(value)) || Number(value) < 0 || Number(value) > 10));
    if (invalidGrade) return showError('As notas devem estar entre 0 e 10.'), false;
    return true;
  };
  const findDuplicate = () => certificates.find(c => c.status==='active' && onlyDigits(c.studentDocument||'')===studentDocument && c.courseId===course?.id) || null;
  const performIssue = () => {
    if (isIssuing || !course) return; setIsIssuing(true);
    try { const cert=issueCertificate({classId:classId||undefined,expiresAt:expiryDate(endDate,validityYears),studentId:selectedStudentId||'',studentName:studentName.trim().toUpperCase(),studentEmail:studentEmail.trim()||undefined,studentDocument,registrationNumber,cnhCategory,courseId:course.id,courseName:course.name,courseSubhead:course.courseSubhead||'Condutores de Veículos de Transporte de Emergência',workloadHours:course.workloadHours,modality:course.modality,instructorName:selectedClass?.instructorName||course.instructorName||'Instrutor Responsável',institutionName:institution.name,institutionCnpj:institution.institutionCnpj,legalInstruction:institution.legalInstruction,contranResolution:institution.contranResolution,validityText:`validade de ${validityYears} anos após o término do curso`,syllabus:certificateSyllabus,issueDate,startDate,endDate,location,signatoryName:institution.signatoryName||'Diretor Geral',signatoryRole:institution.signatoryRole||'Diretor Geral',signatoryCpf:institution.signatoryCpf,signatureMode:institution.signatureMode||'none',signatureImageUrl:institution.signatureMode==='image'?institution.signatureImageUrl:undefined,signatureScale:institution.signatureScale||100,signatureOffsetX:institution.signatureOffsetX||0,signatureOffsetY:institution.signatureOffsetY||0,templateId:'official'}); setCreatedCertificate(cert);setDuplicateWarning(null);localStorage.removeItem(DRAFT_KEY);try{confetti({particleCount:70,spread:70,origin:{y:.6}})}catch{} } catch (error) { setFormError(error instanceof Error ? error.message : 'Erro ao emitir o certificado.'); } finally { setIsIssuing(false); }
  };
  const issue=()=>{if(!validate())return;const d=findDuplicate();if(d){setDuplicateWarning(d);return;}performIssue();};
  const resetForNext=()=>{setCreatedCertificate(null);setCurrentStep(1);setSelectedStudentId('');setStudentName('');setStudentEmail('');setStudentDocument('');setRegistrationNumber('');setCnhCategory('AD');setManualGrades([]);localStorage.removeItem(DRAFT_KEY);};
  const previewCertificate={studentName:studentName.toUpperCase()||'NOME DO CONDUTOR',studentDocument:studentDocument||'00000000000',registrationNumber:registrationNumber||'00000000000',cnhCategory,courseName:course?.name||'Curso Especializado para Condutores de Veículos de Transporte de Emergência',courseSubhead:course?.courseSubhead||'Condutores de Veículos de Transporte de Emergência',workloadHours:course?.workloadHours||50,modality:course?.modality||'presencial',instructorName:course?.instructorName||'',institutionName:institution.name,institutionCnpj:institution.institutionCnpj,legalInstruction:institution.legalInstruction,contranResolution:institution.contranResolution,validityText:`validade de ${validityYears} anos após o término do curso`,syllabus:certificateSyllabus,issueDate,startDate,endDate,location,signatoryName:institution.signatoryName||'Diretor Geral',signatoryRole:institution.signatoryRole||'Diretor Geral',signatoryCpf:institution.signatoryCpf,signatureMode:institution.signatureMode||'none',signatureImageUrl:institution.signatureMode==='image'?institution.signatureImageUrl:undefined,signatureScale:institution.signatureScale||100,signatureOffsetX:institution.signatureOffsetX||0,signatureOffsetY:institution.signatureOffsetY||0,code:'001/CVTE/'+new Date().getFullYear()};

  return <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto w-full">
    <div><div className="inline-flex px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">Modelo Oficial • CVTE</div><h1 className="text-2xl sm:text-3xl font-extrabold mt-2">Emitir Certificado</h1><p className="text-sm text-slate-500">Preencha os dados do condutor e, se desejar, informe as notas que aparecerão no verso.</p></div>
    <label className="block font-semibold">Validade após o término (anos)<input type="number" min="1" max="20" disabled={Boolean(selectedClass)} className="block mt-2 border rounded-xl p-3 bg-white dark:bg-slate-800" value={validityYears} onChange={e=>setValidityYears(Number(e.target.value))}/></label>
    {formError && <p role="alert" className="rounded-xl bg-rose-50 text-rose-800 p-4">{formError}</p>}
    {currentStep===1 ? <form onSubmit={e=>{e.preventDefault();if(validate())setCurrentStep(2)}} className="space-y-5">
      <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border space-y-4"><div className="flex items-center gap-2 border-b pb-3"><User className="w-5 h-5 text-indigo-600"/><div><h2 className="font-bold">Dados do Condutor</h2><p className="text-xs text-slate-500">Nome será impresso em letras maiúsculas.</p></div></div>
        {students.length>0&&<select value={selectedStudentId} onChange={e=>setSelectedStudentId(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"><option value="">Novo condutor / preencher manualmente</option>{students.filter(s=>!selectedClass||selectedClass.studentIds.includes(s.id)).map(s=><option key={s.id} value={s.id}>{s.fullName}</option>)}</select>}
        <div className="grid sm:grid-cols-2 gap-3"><input value={studentName} onChange={e=>setStudentName(e.target.value)} placeholder="Nome completo *" className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border uppercase"/><input value={studentEmail} onChange={e=>setStudentEmail(e.target.value)} placeholder="E-mail (opcional)" type="email" className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"/><div><input value={formatCpfInput(studentDocument)} onChange={e=>setStudentDocument(onlyDigits(e.target.value))} inputMode="numeric" placeholder="CPF *" className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"/><p className="mt-1 text-[10px] text-slate-500">{studentDocument.length}/11 dígitos</p></div><div><input value={registrationNumber} onChange={e=>setRegistrationNumber(onlyDigits(e.target.value))} inputMode="numeric" maxLength={11} placeholder="Nº REGISTRO / CONDUTOR *" className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"/><p className="mt-1 text-[10px] text-slate-500">{registrationNumber.length}/11 dígitos</p></div><label className="text-xs font-semibold">Categoria CNH<select value={cnhCategory} onChange={e=>setCnhCategory(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border">{CNH_CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></label></div>
      </section>
      <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border space-y-4"><div><h2 className="font-bold">Notas das matérias</h2><p className="text-xs text-slate-500 mt-1">Opcional. Informe notas de 0 a 10. Se deixar em branco, será mantida a avaliação padrão da matéria.</p></div><div className="grid sm:grid-cols-2 gap-3">{course?.syllabus?.map((item,index)=><label key={item.id||index} className="text-xs font-semibold">{item.discipline}<div className="mt-1 flex items-center gap-2"><input type="number" min="0" max="10" step="0.1" inputMode="decimal" value={manualGrades[index]||''} onChange={e=>setManualGrades(values=>{const next=[...values];next[index]=e.target.value;return next;})} placeholder={classGrades[index]||item.grade||'Nota'} className="w-28 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"/><span className="text-[11px] text-slate-500">/ 10</span></div></label>)}</div>{selectedClass&&selectedStudentId&&<p className="text-xs text-indigo-600">As notas cadastradas na turma foram carregadas. Você pode alterá-las somente para este certificado antes de emitir.</p>}</section>
      <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border"><h2 className="font-bold mb-3">Período e emissão</h2><div className="grid sm:grid-cols-2 gap-3"><label className="text-xs font-semibold">Início<input type="date" value={startDate} disabled={Boolean(selectedClass)} onChange={e=>setStartDate(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"/></label><label className="text-xs font-semibold">Término<input type="date" value={endDate} disabled={Boolean(selectedClass)} onChange={e=>setEndDate(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"/></label><label className="text-xs font-semibold">Data de emissão<input type="date" value={issueDate} onChange={e=>setIssueDate(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"/></label><label className="text-xs font-semibold">Local<input value={location} onChange={e=>setLocation(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"/></label></div><p className="mt-3 text-xs text-slate-500">Curso: <strong>{course?.name}</strong> • Carga horária: <strong>{course?.workloadHours||50}h/a</strong></p></section>
      <div className="flex justify-end"><button type="submit" className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl"><Eye className="w-4 h-4"/>Revisar certificado<ArrowRight className="w-4 h-4"/></button></div>
    </form> : <div className="space-y-5"><div className="bg-white dark:bg-slate-900 border rounded-2xl p-4"><h2 className="font-bold">Confirme antes de emitir</h2><div className="mt-3 grid sm:grid-cols-3 gap-2 text-xs"><div><span className="text-slate-500">Condutor</span><strong className="block">{studentName.toUpperCase()}</strong></div><div><span className="text-slate-500">CPF</span><strong className="block">{formatCpfInput(studentDocument)}</strong></div><div><span className="text-slate-500">Registro / CNH</span><strong className="block">{registrationNumber} • {cnhCategory}</strong></div></div><div className="mt-3 pt-3 border-t"><p className="text-xs text-slate-500">As notas informadas serão exibidas na coluna <strong>Avaliação</strong> do verso do certificado.</p></div></div><div className="sticky top-3 z-30 bg-white dark:bg-slate-900 border rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3"><button onClick={()=>setCurrentStep(1)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-semibold"><ArrowLeft className="w-4 h-4"/>Voltar e corrigir</button><div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1 text-xs"><button onClick={()=>setPreviewTab('front')} className="px-3 py-1.5">Frente</button><button onClick={()=>setPreviewTab('back')} className="px-3 py-1.5">Verso</button><button onClick={()=>setPreviewTab('both')} className="px-3 py-1.5">Ambos</button></div><button onClick={issue} disabled={isIssuing} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 disabled:opacity-50 text-white text-sm font-bold">{isIssuing?<Loader2 className="w-4 h-4 animate-spin"/>:<CheckCircle className="w-4 h-4"/>}Emitir certificado</button></div><div className="bg-slate-200 dark:bg-slate-950 rounded-2xl p-5 overflow-x-auto flex flex-col items-center gap-6">{(previewTab==='front'||previewTab==='both')&&<div className="w-full min-w-0"><div className="text-xs font-bold text-slate-500 mb-2 flex gap-1"><FileText className="w-4 h-4"/>Frente</div><CertificatePreview><CertificateFrontPage certificate={previewCertificate}/></CertificatePreview></div>}{(previewTab==='back'||previewTab==='both')&&<div className="w-full min-w-0"><div className="text-xs font-bold text-slate-500 mb-2 flex gap-1"><Layers className="w-4 h-4"/>Verso</div><CertificatePreview><CertificateBackPage certificate={previewCertificate}/></CertificatePreview></div>}</div></div>}
    {duplicateWarning&&<div className="fixed inset-0 z-[70] bg-slate-900/70 flex items-center justify-center p-4"><div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6"><div className="flex gap-3"><AlertTriangle className="w-5 h-5 text-amber-600"/><div><h3 className="font-extrabold">Condutor já certificado</h3><p className="text-sm text-slate-500">Este CPF já possui o certificado ativo <strong>{duplicateWarning.code}</strong>.</p></div></div><div className="mt-6 flex flex-wrap justify-end gap-2"><button onClick={()=>{setValidationSearchCode(duplicateWarning.code);setCurrentView('validate');setDuplicateWarning(null)}} className="px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-bold">Visualizar existente</button><button onClick={()=>setDuplicateWarning(null)} className="px-4 py-2 rounded-xl bg-slate-100">Voltar</button><button onClick={performIssue} disabled={isIssuing} className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold">Emitir mesmo assim</button></div></div></div>}
    {createdCertificate&&<CertificateModal certificate={createdCertificate} isOpen={true} onClose={resetForNext} setCurrentView={setCurrentView} setValidationSearchCode={setValidationSearchCode}/>} 
  </div>;
};