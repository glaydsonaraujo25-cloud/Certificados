import React from 'react';
import { Certificate, SyllabusItem } from '../types';
import { SGExEmblem } from './emblems/SGExEmblem';
import { BAdmQgexEmblem } from './emblems/BAdmQgexEmblem';
import { TopFiligree, BottomFiligree } from './emblems/FiligreeOrnaments';
import {
  VintageCornerTL,
  VintageCornerTR,
  VintageCornerBL,
  VintageCornerBR,
} from './emblems/VintageCorners';
import { MilitarySignatureGraphic } from './emblems/SignatureGraphic';
import { QrCodeRenderer } from './QrCodeRenderer';
import { formatVerificationUrl } from '../utils/codeGenerator';
import { DEFAULT_CVTE_SYLLABUS } from '../utils/storage';

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
  page?: 'front' | 'back';
}

/**
 * Render the Front Page (Página 1: Frente)
 */
export const CertificateFrontPage: React.FC<CertificateDocumentProps> = ({
  certificate,
  elementId = 'certificate-front-canvas',
  isCancelled = false,
}) => {
  const {
    code = '006/CVTE/2026',
    studentName = 'CARLOS HENRIQUE CAETANO DA SILVA',
    studentDocument = '067.440.731-84',
    registrationNumber = '07575025319',
    cnhCategory = 'AD',
    courseName = 'Curso Especializado para Condutores de Veículos de Transporte de Emergência',
    courseSubhead = 'Condutores de Veículos de\nTransporte de Emergência',
    workloadHours = 50,
    startDate = '2026-06-08',
    endDate = '2026-06-16',
    issueDate = '2026-06-18',
    location = 'Brasília-DF',
    legalInstruction = 'Instrução Nº 592, de 10 de agosto de 2020/Detran-DF',
    contranResolution = 'Resolução Nº 1.020/2025 do CONTRAN',
    validityText = 'com validade de cinco anos após o término do curso',
    institutionCnpj = '21.744.847/0001-50',
    signatoryName = 'Carlos Henrique Ferreira De Mello',
    signatoryRole = 'Diretor Geral',
    signatoryCpf = '981.050.007-68',
    signatureImageUrl,
    customText,
  } = certificate;

  // Format dates
  const formatDateBR = (isoDate?: string) => {
    if (!isoDate) return '';
    try {
      const parts = isoDate.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      return isoDate;
    } catch {
      return isoDate;
    }
  };

  const formatDateExtensoBR = (isoDate?: string) => {
    if (!isoDate) return '18 de junho de 2026';
    try {
      const parts = isoDate.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        });
      }
      return isoDate;
    } catch {
      return isoDate;
    }
  };

  const startFormatted = formatDateBR(startDate) || '08/06/2026';
  const endFormatted = formatDateBR(endDate) || '16/06/2026';
  const formattedIssueDate = formatDateExtensoBR(issueDate);

  // Subhead split into 2 lines
  const subheadLines = (courseSubhead || 'Condutores de Veículos de\nTransporte de Emergência').split('\n');

  return (
    <div
      id={elementId}
      className="certificate-container relative bg-[#FAF9F5] select-none text-slate-900 overflow-hidden shadow-2xl font-serif"
      style={{
        width: '1050px',
        height: '742px', // Exact A4 Landscape (1:1.414 ratio)
        minWidth: '1050px',
        minHeight: '742px',
        maxWidth: '1050px',
        maxHeight: '742px',
        boxSizing: 'border-box',
      }}
    >
      {/* Cancellation Watermark */}
      {isCancelled && (
        <div className="absolute inset-0 z-50 bg-rose-950/20 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
          <div className="transform -rotate-12 border-8 border-rose-700 bg-rose-50/95 px-16 py-6 rounded-3xl shadow-2xl flex flex-col items-center">
            <span className="text-5xl font-black text-rose-700 tracking-widest uppercase font-sans">
              CANCELADO / REVOGADO
            </span>
            <span className="text-sm font-bold text-rose-900 tracking-wider mt-2 font-sans">
              Documento formalmente invalidado no registro oficial
            </span>
          </div>
        </div>
      )}

      {/* Ornate Framing Borders */}
      <div className="w-full h-full p-7 flex flex-col justify-between relative box-border">
        {/* Outer Heavy Border */}
        <div className="absolute inset-4 border-[3.5px] border-[#111827] pointer-events-none" />
        
        {/* Inner Fine Margin Border */}
        <div className="absolute inset-6 border-[1px] border-[#111827] pointer-events-none" />

        {/* 4 Baroque Corner Flourishes */}
        <div className="absolute top-3.5 left-3.5 pointer-events-none">
          <VintageCornerTL size={74} color="#111827" />
        </div>
        <div className="absolute top-3.5 right-3.5 pointer-events-none">
          <VintageCornerTR size={74} color="#111827" />
        </div>
        <div className="absolute bottom-3.5 left-3.5 pointer-events-none">
          <VintageCornerBL size={74} color="#111827" />
        </div>
        <div className="absolute bottom-3.5 right-3.5 pointer-events-none">
          <VintageCornerBR size={74} color="#111827" />
        </div>

        {/* ============================================================ */}
        {/* 1. TOP HEADER ROW: SGEx Crest | Title Block | BAdmQgex + Code */}
        {/* ============================================================ */}
        <div className="relative z-10 grid grid-cols-12 items-start pt-2 px-3">
          {/* Left Crest: SGEx */}
          <div className="col-span-2 flex justify-start pl-2 pt-1">
            <SGExEmblem size={74} />
          </div>

          {/* Center Title Block */}
          <div className="col-span-8 flex flex-col items-center text-center">
            {/* Top Filigree */}
            <TopFiligree width={210} color="#111827" className="mb-0.5" />

            {/* Title: CERTIFICADO with elegant warm gradient */}
            <h1
              className="text-[44px] leading-none font-serif font-black tracking-[0.16em] uppercase text-transparent bg-clip-text bg-gradient-to-b from-[#C2410C] via-[#D97706] to-[#9A3412]"
              style={{
                textShadow: '0 1px 1px rgba(0,0,0,0.08)',
                filter: 'drop-shadow(0 1px 1px rgba(217, 119, 6, 0.25))',
              }}
            >
              CERTIFICADO
            </h1>

            {/* Subtitle */}
            <div className="pt-1.5 pb-0.5 font-sans font-black text-slate-900 text-lg sm:text-[19px] leading-snug tracking-tight">
              {subheadLines.map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
            </div>

            {/* Bottom Filigree Divider */}
            <BottomFiligree width={310} color="#111827" className="mt-1" />
          </div>

          {/* Right Crest: B ADM QGEX + Certificate Code */}
          <div className="col-span-2 flex flex-col items-end pr-2 pt-1">
            <BAdmQgexEmblem size={74} />
            <div className="pt-2 text-right">
              <span className="font-sans font-black text-[16px] text-slate-900 tracking-wider">
                {code}
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. BODY CONTENT: Attestation Paragraph */}
        {/* ============================================================ */}
        <div className="relative z-10 px-8 my-auto pt-1 pb-2">
          {customText ? (
            <p className="text-[14.8px] leading-[1.8] text-slate-900 text-justify font-serif">
              {customText}
            </p>
          ) : (
            <p className="text-[14.8px] leading-[1.8] text-slate-900 text-justify font-serif">
              A Instituição de Ensino de Trânsito da Base Administrativa do Quartel-General do Exército – Forte Caxias – ({legalInstruction}) certifica que{' '}
              <strong className="font-extrabold text-slate-950 uppercase">{studentName}</strong>, inscrito no CPF nº{' '}
              <strong className="font-bold text-slate-950">{studentDocument}</strong> e no Nº REGISTRO{' '}
              <strong className="font-bold text-slate-950">{registrationNumber}</strong>, categoria{' '}
              <strong className="font-bold text-slate-950">“{cnhCategory}”</strong>, concluiu com aproveitamento o{' '}
              <strong className="font-extrabold text-slate-950">{courseName}</strong>, ministrado pela IET - Forte Caxias, no período de{' '}
              <strong className="font-bold text-slate-950">{startFormatted} a {endFormatted}</strong>, com carga horária de{' '}
              <strong className="font-bold text-slate-950">{workloadHours}h/a</strong>, {validityText}, conforme {contranResolution}.
            </p>
          )}

          {/* Location and Issue Date */}
          <div className="text-center pt-5">
            <p className="font-serif font-bold text-[14.5px] text-slate-900">
              {location}, {formattedIssueDate}
            </p>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. FOOTER: Signature (Left) & CNPJ / Institution (Right) */}
        {/* ============================================================ */}
        <div className="relative z-10 px-8 pb-3 grid grid-cols-12 items-end">
          {/* Bottom Left: Official Signature */}
          <div className="col-span-6 flex flex-col items-start pl-2">
            <div className="h-14 flex items-center justify-start mb-0.5">
              {signatureImageUrl ? (
                <img
                  src={signatureImageUrl}
                  alt={signatoryName}
                  className="max-h-14 max-w-[190px] object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <MilitarySignatureGraphic width={175} />
              )}
            </div>
            <div className="text-left font-sans">
              <p className="text-[12px] font-bold text-slate-950 leading-tight">
                {signatoryName}
              </p>
              <p className="text-[11px] text-slate-800 leading-tight">
                {signatoryRole}
              </p>
              <p className="text-[11px] text-slate-800 leading-tight">
                {signatoryCpf}
              </p>
            </div>
          </div>

          {/* Bottom Right: CNPJ & Military Institution Name */}
          <div className="col-span-6 flex flex-col items-end pr-2 text-right font-sans">
            <p className="text-[11.5px] font-bold text-slate-950 tracking-wide">
              CNPJ Nº {institutionCnpj}
            </p>
            <p className="text-[10px] font-bold text-slate-950 uppercase tracking-wider pt-0.5">
              BASE ADMINISTRATIVA DO QUARTEL-GENERAL DO EXÉRCITO
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Render the Back Page (Página 2: Verso - Conteúdo Programático)
 */
export const CertificateBackPage: React.FC<CertificateDocumentProps> = ({
  certificate,
  elementId = 'certificate-back-canvas',
  isCancelled = false,
}) => {
  const {
    code = '006/CVTE/2026',
    syllabus = DEFAULT_CVTE_SYLLABUS,
  } = certificate;

  const activeSyllabus: SyllabusItem[] = syllabus && syllabus.length > 0 ? syllabus : DEFAULT_CVTE_SYLLABUS;

  return (
    <div
      id={elementId}
      className="certificate-container relative bg-[#FAF9F5] select-none text-slate-900 overflow-hidden shadow-2xl font-serif"
      style={{
        width: '1050px',
        height: '742px',
        minWidth: '1050px',
        minHeight: '742px',
        maxWidth: '1050px',
        maxHeight: '742px',
        boxSizing: 'border-box',
      }}
    >
      {/* Cancellation Watermark */}
      {isCancelled && (
        <div className="absolute inset-0 z-50 bg-rose-950/20 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
          <div className="transform -rotate-12 border-8 border-rose-700 bg-rose-50/95 px-16 py-6 rounded-3xl shadow-2xl flex flex-col items-center">
            <span className="text-5xl font-black text-rose-700 tracking-widest uppercase font-sans">
              CANCELADO / REVOGADO
            </span>
          </div>
        </div>
      )}

      {/* Ornate Framing Borders */}
      <div className="w-full h-full p-7 flex flex-col justify-between relative box-border">
        {/* Outer Heavy Border */}
        <div className="absolute inset-4 border-[3.5px] border-[#111827] pointer-events-none" />
        
        {/* Inner Fine Margin Border */}
        <div className="absolute inset-6 border-[1px] border-[#111827] pointer-events-none" />

        {/* 4 Baroque Corner Flourishes */}
        <div className="absolute top-3.5 left-3.5 pointer-events-none">
          <VintageCornerTL size={74} color="#111827" />
        </div>
        <div className="absolute top-3.5 right-3.5 pointer-events-none">
          <VintageCornerTR size={74} color="#111827" />
        </div>
        <div className="absolute bottom-3.5 left-3.5 pointer-events-none">
          <VintageCornerBL size={74} color="#111827" />
        </div>
        <div className="absolute bottom-3.5 right-3.5 pointer-events-none">
          <VintageCornerBR size={74} color="#111827" />
        </div>

        {/* ============================================================ */}
        {/* 1. VERSO HEADER: SGEx Crest | Institution Big Headline | B ADM QGEX */}
        {/* ============================================================ */}
        <div className="relative z-10 grid grid-cols-12 items-center pt-2 px-3">
          {/* Left Crest: SGEx */}
          <div className="col-span-2 flex justify-start pl-2">
            <SGExEmblem size={68} />
          </div>

          {/* Center Institution Title */}
          <div className="col-span-8 flex flex-col items-center text-center font-sans">
            <h2 className="text-[21px] font-black tracking-[0.04em] uppercase text-slate-950 leading-tight">
              BASE ADMINISTRATIVA DO QUARTEL-GENERAL DO EXÉRCITO
            </h2>
            <h3 className="text-[21px] font-black tracking-[0.08em] uppercase text-slate-950 leading-tight mt-0.5">
              “FORTE CAXIAS”
            </h3>
          </div>

          {/* Right Crest: B ADM QGEX */}
          <div className="col-span-2 flex justify-end pr-2">
            <BAdmQgexEmblem size={68} />
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. SUBHEADER: CONTEÚDO PROGRAMÁTICO & CODE */}
        {/* ============================================================ */}
        <div className="relative z-10 px-8 pt-3 pb-1 grid grid-cols-12 items-center font-sans">
          <div className="col-span-2" />
          <div className="col-span-8 text-center">
            <span className="font-black text-[15px] tracking-[0.14em] uppercase text-slate-950">
              CONTEÚDO PROGRAMÁTICO
            </span>
          </div>
          <div className="col-span-2 text-right">
            <span className="font-black text-[15px] text-slate-950 tracking-wider">
              {code}
            </span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. SYLLABUS TABLE GRID */}
        {/* ============================================================ */}
        <div className="relative z-10 px-8 my-auto font-sans">
          <table className="w-full border-collapse border-[2px] border-slate-950 bg-slate-50/70">
            {/* Table Header */}
            <thead>
              <tr className="bg-[#E2E8F0] border-b-[2px] border-slate-950">
                <th className="border-r-[2px] border-slate-950 py-3.5 px-4 text-center text-[12px] font-black text-slate-950 uppercase tracking-wider w-[28%]">
                  DISCIPLINA
                </th>
                <th className="border-r-[2px] border-slate-950 py-3.5 px-4 text-center text-[12px] font-black text-slate-950 uppercase tracking-wider w-[22%]">
                  CARGA HORÁRIA
                </th>
                <th className="border-r-[2px] border-slate-950 py-3.5 px-4 text-center text-[12px] font-black text-slate-950 uppercase tracking-wider w-[20%]">
                  AVALIAÇÃO
                </th>
                <th className="py-3.5 px-4 text-center text-[12px] font-black text-slate-950 uppercase tracking-wider w-[30%]">
                  INSTRUTOR
                </th>
              </tr>
            </thead>

            {/* Table Rows */}
            <tbody className="divide-y-[1.5px] divide-slate-950 text-slate-950">
              {activeSyllabus.map((row, idx) => (
                <tr
                  key={idx}
                  className={`border-b-[1.5px] border-slate-950 ${
                    idx % 2 === 0 ? 'bg-[#F1F5F9]/70' : 'bg-[#E2E8F0]/40'
                  }`}
                >
                  <td className="border-r-[2px] border-slate-950 py-3.5 px-4 text-center font-bold text-[12.5px] leading-snug">
                    {row.discipline}
                  </td>
                  <td className="border-r-[2px] border-slate-950 py-3.5 px-4 text-center font-bold text-[13px]">
                    {row.workload}
                  </td>
                  <td className="border-r-[2px] border-slate-950 py-3.5 px-4 text-center font-black text-[13px]">
                    {row.grade}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-[12px] uppercase">
                    {row.instructor}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Verso Bottom Margin spacing */}
        <div className="relative z-10 pb-4" />
      </div>
    </div>
  );
};

/**
 * Unified Certificate Document Component with Front / Back Support
 */
export const CertificateDocument: React.FC<CertificateDocumentProps> = ({
  certificate,
  elementId = 'certificate-document-canvas',
  isCancelled = false,
  page = 'front',
}) => {
  if (page === 'back') {
    return (
      <CertificateBackPage
        certificate={certificate}
        elementId={elementId}
        isCancelled={isCancelled}
      />
    );
  }

  return (
    <CertificateFrontPage
      certificate={certificate}
      elementId={elementId}
      isCancelled={isCancelled}
    />
  );
};
