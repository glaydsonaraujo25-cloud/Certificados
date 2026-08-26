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
import { DEFAULT_AI_SYLLABUS } from '../utils/storage';

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

const formatDateBR = (isoDate?: string) => {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : isoDate;
};

const formatDateExtensoBR = (isoDate?: string) => {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
};

const CertificateFrame: React.FC<{ children: React.ReactNode; isCancelled?: boolean }> = ({ children, isCancelled }) => (
  <div className="w-full h-full p-7 flex flex-col justify-between relative box-border">
    {isCancelled && (
      <div className="absolute inset-0 z-50 bg-rose-950/20 flex items-center justify-center pointer-events-none">
        <div className="-rotate-12 border-8 border-rose-700 bg-rose-50/95 px-16 py-6 rounded-3xl shadow-2xl">
          <span className="text-5xl font-black text-rose-700 tracking-widest uppercase font-sans">CANCELADO / REVOGADO</span>
        </div>
      </div>
    )}
    <div className="absolute inset-4 border-[3.5px] border-[#111827] pointer-events-none" />
    <div className="absolute inset-6 border border-[#111827] pointer-events-none" />
    <div className="absolute top-3.5 left-3.5 pointer-events-none"><VintageCornerTL size={74} color="#111827" /></div>
    <div className="absolute top-3.5 right-3.5 pointer-events-none"><VintageCornerTR size={74} color="#111827" /></div>
    <div className="absolute bottom-3.5 left-3.5 pointer-events-none"><VintageCornerBL size={74} color="#111827" /></div>
    <div className="absolute bottom-3.5 right-3.5 pointer-events-none"><VintageCornerBR size={74} color="#111827" /></div>
    {children}
  </div>
);

export const CertificateFrontPage: React.FC<CertificateDocumentProps> = ({
  certificate,
  elementId = 'certificate-front-canvas',
  isCancelled = false,
}) => {
  const {
    code = 'CERT-2026-000001',
    studentName = 'NOME DO ALUNO',
    studentDocument = '000.000.000-00',
    courseName = 'Operador de Computador com IA',
    courseSubhead = 'Operador de Computador com Inteligência Artificial',
    workloadHours = 230,
    startDate,
    endDate,
    issueDate,
    location = 'Brasília-DF',
    institutionName = 'Base Administrativa do Quartel-General do Exército – Forte Caxias',
    institutionCnpj = '21.744.847/0001-50',
    signatoryName = 'Carlos Henrique Ferreira De Mello',
    signatoryRole = 'Diretor Geral',
    signatoryCpf = '981.050.007-68',
    signatureImageUrl,
    customText,
  } = certificate;

  const verificationUrl = formatVerificationUrl(code);
  const certificateText = customText ||
    `${institutionName} certifica que ${studentName}, inscrito no CPF nº ${studentDocument}, concluiu com aproveitamento o curso ${courseName}, realizado no período de ${formatDateBR(startDate)} a ${formatDateBR(endDate)}, com carga horária total de ${workloadHours} horas, desenvolvendo competências em informática, produtividade digital e uso responsável de ferramentas de Inteligência Artificial.`;

  return (
    <div id={elementId} className="certificate-container relative bg-[#FAF9F5] select-none text-slate-900 overflow-hidden shadow-2xl font-serif" style={{ width: '1050px', height: '742px', minWidth: '1050px', minHeight: '742px', maxWidth: '1050px', maxHeight: '742px', boxSizing: 'border-box' }}>
      <CertificateFrame isCancelled={isCancelled}>
        <div className="relative z-10 grid grid-cols-12 items-start pt-2 px-3">
          <div className="col-span-2 flex justify-start pl-2 pt-1"><SGExEmblem size={78} /></div>
          <div className="col-span-8 flex flex-col items-center text-center">
            <TopFiligree width={210} color="#111827" className="mb-0.5" />
            <h1 className="text-[44px] leading-none font-serif font-black tracking-[0.16em] uppercase text-transparent bg-clip-text bg-gradient-to-b from-[#C2410C] via-[#D97706] to-[#9A3412]">CERTIFICADO</h1>
            <div className="pt-2 font-sans font-black text-slate-900 text-[20px] leading-snug tracking-tight">{courseSubhead}</div>
            <BottomFiligree width={330} color="#111827" className="mt-1" />
          </div>
          <div className="col-span-2 flex flex-col items-end pr-2 pt-1">
            <BAdmQgexEmblem size={78} />
            <span className="pt-2 font-sans font-black text-[14px] tracking-wider">{code}</span>
          </div>
        </div>

        <div className="relative z-10 px-12 my-auto text-center">
          <p className="text-[16px] leading-[1.9] text-slate-900 text-justify font-serif">{certificateText}</p>
          <p className="font-serif font-bold text-[15px] mt-6">{location}, {formatDateExtensoBR(issueDate)}</p>
        </div>

        <div className="relative z-10 px-10 pb-3 grid grid-cols-12 items-end gap-4">
          <div className="col-span-4 flex items-end gap-3">
            <QrCodeRenderer value={verificationUrl} size={64} />
            <div className="font-sans text-[9px] text-slate-600 leading-tight">
              <strong className="block text-slate-900 text-[10px]">Validação digital</strong>
              Escaneie o QR Code ou consulte pelo código acima.
            </div>
          </div>
          <div className="col-span-4 flex flex-col items-center text-center font-sans">
            <div className="h-12 flex items-center justify-center">
              {signatureImageUrl ? <img src={signatureImageUrl} alt={signatoryName} className="max-h-12 max-w-[190px] object-contain" /> : <MilitarySignatureGraphic width={170} />}
            </div>
            <div className="w-56 border-t border-slate-800 mt-1 pt-1">
              <p className="text-[11px] font-bold">{signatoryName}</p>
              <p className="text-[10px]">{signatoryRole}</p>
              {signatoryCpf && <p className="text-[9px]">CPF: {signatoryCpf}</p>}
            </div>
          </div>
          <div className="col-span-4 text-right font-sans">
            <p className="text-[11px] font-bold">CNPJ Nº {institutionCnpj}</p>
            <p className="text-[10px] font-bold uppercase tracking-wide">BASE ADMINISTRATIVA DO QUARTEL-GENERAL DO EXÉRCITO</p>
            <p className="text-[10px] uppercase">FORTE CAXIAS</p>
          </div>
        </div>
      </CertificateFrame>
    </div>
  );
};

export const CertificateBackPage: React.FC<CertificateDocumentProps> = ({
  certificate,
  elementId = 'certificate-back-canvas',
  isCancelled = false,
}) => {
  const { code = 'CERT-2026-000001', syllabus = DEFAULT_AI_SYLLABUS } = certificate;
  const activeSyllabus: SyllabusItem[] = syllabus?.length ? syllabus : DEFAULT_AI_SYLLABUS;

  return (
    <div id={elementId} className="certificate-container relative bg-[#FAF9F5] select-none text-slate-900 overflow-hidden shadow-2xl font-serif" style={{ width: '1050px', height: '742px', minWidth: '1050px', minHeight: '742px', maxWidth: '1050px', maxHeight: '742px', boxSizing: 'border-box' }}>
      <CertificateFrame isCancelled={isCancelled}>
        <div className="relative z-10 grid grid-cols-12 items-center pt-2 px-3">
          <div className="col-span-2 flex justify-start pl-2"><SGExEmblem size={70} /></div>
          <div className="col-span-8 text-center font-sans">
            <h2 className="text-[21px] font-black uppercase text-slate-950">BASE ADMINISTRATIVA DO QUARTEL-GENERAL DO EXÉRCITO</h2>
            <h3 className="text-[20px] font-black uppercase text-slate-950 mt-1">“FORTE CAXIAS”</h3>
            <p className="mt-2 text-[16px] font-bold uppercase tracking-[0.12em]">OPERADOR DE COMPUTADOR COM IA</p>
          </div>
          <div className="col-span-2 flex justify-end pr-2"><BAdmQgexEmblem size={70} /></div>
        </div>

        <div className="relative z-10 px-10 pt-3 flex items-center justify-between font-sans">
          <span className="font-black text-[15px] tracking-[0.14em] uppercase">CONTEÚDO PROGRAMÁTICO</span>
          <span className="font-black text-[14px]">{code}</span>
        </div>

        <div className="relative z-10 px-10 my-auto font-sans">
          <table className="w-full border-collapse border-2 border-slate-950 bg-slate-50/70">
            <thead>
              <tr className="bg-[#E2E8F0] border-b-2 border-slate-950">
                <th className="border-r-2 border-slate-950 py-3 px-4 text-center text-[12px] font-black uppercase w-[38%]">COMPONENTE / DISCIPLINA</th>
                <th className="border-r-2 border-slate-950 py-3 px-4 text-center text-[12px] font-black uppercase w-[18%]">CARGA HORÁRIA</th>
                <th className="border-r-2 border-slate-950 py-3 px-4 text-center text-[12px] font-black uppercase w-[16%]">AVALIAÇÃO</th>
                <th className="py-3 px-4 text-center text-[12px] font-black uppercase w-[28%]">INSTRUTOR</th>
              </tr>
            </thead>
            <tbody>
              {activeSyllabus.map((row, idx) => (
                <tr key={idx} className={idx % 2 === 0 ? 'bg-[#F8FAFC]' : 'bg-[#EEF2F7]'}>
                  <td className="border-r-2 border-t border-slate-950 py-3 px-4 text-center font-bold text-[12px]">{row.discipline}</td>
                  <td className="border-r-2 border-t border-slate-950 py-3 px-4 text-center font-bold text-[12px]">{row.workload}</td>
                  <td className="border-r-2 border-t border-slate-950 py-3 px-4 text-center font-black text-[12px]">{row.grade}</td>
                  <td className="border-t border-slate-950 py-3 px-4 text-center font-bold text-[11px] uppercase">{row.instructor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="relative z-10 px-10 pb-4 text-center font-sans text-[10px] text-slate-600">Formação em informática, produtividade digital, Inteligência Artificial, engenharia de prompts, segurança digital e uso ético da tecnologia.</div>
      </CertificateFrame>
    </div>
  );
};
