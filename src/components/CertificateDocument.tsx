import React from 'react';
import { Certificate } from '../types';
import { QrCodeRenderer } from './QrCodeRenderer';
import { formatVerificationUrl } from '../utils/codeGenerator';
import { interpolateCertificateText } from '../utils/storage';
import { Award, ShieldCheck } from 'lucide-react';

interface CertificateDocumentProps {
  certificate: Partial<Certificate> & {
    studentName: string;
    courseName: string;
    workloadHours: number;
    issueDate: string;
    code: string;
  };
  elementId?: string;
  isCancelled?: boolean;
  scale?: number;
}

export const CertificateDocument: React.FC<CertificateDocumentProps> = ({
  certificate,
  elementId = 'certificate-document-canvas',
  isCancelled = false,
}) => {
  const {
    code = 'CERT-2026-000001',
    studentName = 'Nome do Aluno',
    studentDocument,
    courseName = 'Nome do Curso',
    workloadHours = 40,
    modality = 'online',
    instructorName = 'Prof. Instrutor',
    institutionName = 'Tech Academy Brasil',
    institutionLogoUrl,
    issueDate = new Date().toISOString().split('T')[0],
    startDate = '2026-01-10',
    endDate = '2026-02-15',
    location = 'São Paulo, SP',
    signatoryName = 'Dra. Maria Souza',
    signatoryRole = 'Diretora Acadêmica & Coordenadora de Ensino',
    signatureImageUrl,
    secondSignatoryName = 'Prof. Carlos Eduardo Silveira',
    secondSignatoryRole = 'Coordenador do Conselho Pedagógico',
    secondSignatureImageUrl,
    customText,
    observations,
    integrityHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  } = certificate;

  const verificationUrl = formatVerificationUrl(code);

  // Format date to Brazilian long format: "26 de agosto de 2026"
  const formattedIssueDate = (() => {
    try {
      const parts = issueDate.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        });
      }
      return issueDate;
    } catch {
      return issueDate;
    }
  })();

  // Resolve body text by interpolating placeholders if needed
  const bodyText = customText
    ? interpolateCertificateText(customText, {
        studentName,
        courseName,
        workloadHours,
        startDate,
        endDate,
        issueDate,
        instructorName,
        institutionName,
        location,
        studentDocument,
      })
    : `Certificamos que ${studentName} concluiu com êxito o curso ${courseName}, com carga horária de ${workloadHours} horas na modalidade ${
        modality === 'online' ? 'Online' : modality === 'presencial' ? 'Presencial' : 'Híbrida'
      }, realizado no período de ${startDate.split('-').reverse().join('/')} a ${endDate
        .split('-')
        .reverse()
        .join('/')}.`;

  // Dynamic font sizing for long student names to prevent ugly line breaks
  const getStudentNameFontSize = (name: string) => {
    if (name.length > 40) return 'text-2xl sm:text-3xl';
    if (name.length > 28) return 'text-3xl sm:text-4xl';
    return 'text-4xl sm:text-5xl';
  };

  return (
    <div
      id={elementId}
      className="certificate-container relative bg-[#FCFBF7] select-none text-slate-900 overflow-hidden shadow-2xl font-serif"
      style={{
        width: '1050px',
        height: '742px', // Proportional to A4 Landscape (297 / 210 = 1.414 ratio)
        minWidth: '1050px',
        minHeight: '742px',
        maxWidth: '1050px',
        maxHeight: '742px',
        boxSizing: 'border-box',
      }}
    >
      {/* Cancellation Watermark overlay */}
      {isCancelled && (
        <div className="absolute inset-0 z-50 bg-rose-950/20 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
          <div className="transform -rotate-12 border-8 border-rose-700 bg-rose-50/95 px-16 py-6 rounded-3xl shadow-2xl flex flex-col items-center">
            <span className="text-5xl font-black text-rose-700 tracking-widest uppercase font-sans">
              CANCELADO / REVOGADO
            </span>
            <span className="text-sm font-bold text-rose-900 tracking-wider mt-2 font-sans">
              Documento formalmente invalidado no sistema de registro e autenticidade
            </span>
          </div>
        </div>
      )}

      {/* Official Security Border Frame */}
      <div className="w-full h-full p-8 flex flex-col justify-between relative border-[12px] border-[#0F172A] box-border">
        {/* Inner Gold Guilloché Security Border */}
        <div className="absolute inset-2.5 border-[2px] border-[#D97706] pointer-events-none" />
        <div className="absolute inset-3.5 border-[1px] border-[#B45309]/50 pointer-events-none" />

        {/* Security Corner Ornaments (CSS Vector-drawn) */}
        <div className="absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 border-[#D97706] pointer-events-none" />
        <div className="absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 border-[#D97706] pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-7 h-7 border-b-2 border-l-2 border-[#D97706] pointer-events-none" />
        <div className="absolute bottom-4 right-4 w-7 h-7 border-b-2 border-r-2 border-[#D97706] pointer-events-none" />

        {/* Subtle Background Watermark Seal */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.035] pointer-events-none">
          <Award className="w-[540px] h-[540px] text-[#0F172A]" />
        </div>

        {/* 1. TOP HEADER: Institution & Official Crest */}
        <header className="relative z-10 text-center space-y-1 pt-1">
          <div className="flex items-center justify-center gap-3">
            {institutionLogoUrl ? (
              <img
                src={institutionLogoUrl}
                alt={institutionName}
                className="h-11 max-w-[200px] object-contain"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#0F172A] flex items-center justify-center text-white shadow-xs">
                <Award className="w-6 h-6 text-amber-400" />
              </div>
            )}
            <span
              className="text-xs font-bold tracking-[0.25em] uppercase text-slate-800 font-sans"
            >
              {institutionName}
            </span>
          </div>

          <div className="pt-2">
            <h1
              className="text-3xl sm:text-4xl font-extrabold tracking-[0.18em] uppercase text-[#0F172A]"
            >
              CERTIFICADO DE CONCLUSÃO
            </h1>
            <div className="flex items-center justify-center gap-3 mt-1.5">
              <span className="h-[1px] w-20 bg-gradient-to-r from-transparent to-[#D97706]" />
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#B45309] font-sans">
                DOCUMENTO OFICIAL REGISTRADO
              </span>
              <span className="h-[1px] w-20 bg-gradient-to-l from-transparent to-[#D97706]" />
            </div>
          </div>
        </header>

        {/* 2. CENTRAL BODY: Certificate Attestation */}
        <main className="relative z-10 text-center px-8 space-y-3.5 my-auto">
          <p className="text-sm italic text-slate-600 font-serif">
            Certificamos para os devidos fins que
          </p>

          {/* Student Name */}
          <div className="space-y-1">
            <h2
              className={`font-black text-[#0F172A] tracking-wide leading-tight max-w-[860px] mx-auto transition-all ${getStudentNameFontSize(
                studentName
              )}`}
            >
              {studentName}
            </h2>
            {studentDocument && (
              <p className="text-[11px] font-sans text-slate-500 font-medium">
                Documento de Identificação: {studentDocument}
              </p>
            )}
          </div>

          {/* Main Statement */}
          <p className="text-base text-slate-700 leading-relaxed max-w-[860px] mx-auto font-serif">
            {bodyText}
          </p>

          {/* Optional Observations / Complementary Text */}
          {observations && (
            <p className="text-xs italic text-slate-500 max-w-[780px] mx-auto pt-0.5">
              Nota complementar: {observations}
            </p>
          )}

          {/* Location and Issue Date */}
          <p className="text-xs text-slate-600 font-serif pt-1">
            {location}, {formattedIssueDate}.
          </p>
        </main>

        {/* 3. FOOTER: Signatures & Cryptographic QR Verification */}
        <footer className="relative z-10 border-t border-slate-200/80 pt-4 pb-1">
          <div className="grid grid-cols-12 items-end gap-4">
            {/* Left Column: Official Signatures */}
            <div className="col-span-8 flex items-end justify-start gap-8 pl-4">
              {/* Primary Signature */}
              <div className="text-center min-w-[200px] max-w-[240px]">
                <div className="h-11 flex items-center justify-center mb-1">
                  {signatureImageUrl ? (
                    <img
                      src={signatureImageUrl}
                      alt={signatoryName}
                      className="max-h-11 max-w-[170px] object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="font-serif italic text-base text-slate-800 tracking-wider font-semibold border-b border-dashed border-slate-300 pb-0.5 px-4">
                      {signatoryName}
                    </div>
                  )}
                </div>
                <div className="border-t border-slate-800 pt-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{signatoryName}</p>
                  <p className="text-[10px] text-slate-500 font-sans truncate">{signatoryRole}</p>
                </div>
              </div>

              {/* Second Signature (if configured or enabled) */}
              {secondSignatoryName && (
                <div className="text-center min-w-[200px] max-w-[240px]">
                  <div className="h-11 flex items-center justify-center mb-1">
                    {secondSignatureImageUrl ? (
                      <img
                        src={secondSignatureImageUrl}
                        alt={secondSignatoryName}
                        className="max-h-11 max-w-[170px] object-contain"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="font-serif italic text-base text-slate-800 tracking-wider font-semibold border-b border-dashed border-slate-300 pb-0.5 px-4">
                        {secondSignatoryName}
                      </div>
                    )}
                  </div>
                  <div className="border-t border-slate-800 pt-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{secondSignatoryName}</p>
                    <p className="text-[10px] text-slate-500 font-sans truncate">{secondSignatoryRole}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Authenticity QR Code & Public Validation Box */}
            <div className="col-span-4 flex items-center justify-end gap-3 pr-2">
              <div className="text-right space-y-0.5 font-sans">
                <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>AUTENTICIDADE VERIFICÁVEL</span>
                </div>
                <p className="text-[10px] font-bold text-slate-800 tracking-wider font-mono">
                  {code}
                </p>
                <p className="text-[9px] text-slate-400 font-mono truncate max-w-[150px]" title={integrityHash}>
                  SHA256: {integrityHash.slice(0, 12)}...
                </p>
              </div>

              {/* QR Code Container */}
              <div className="p-1.5 bg-white rounded-lg border border-slate-200 shadow-xs shrink-0">
                <QrCodeRenderer
                  value={verificationUrl}
                  size={58}
                  className="rounded-xs"
                />
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
