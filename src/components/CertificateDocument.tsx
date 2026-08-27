import React from 'react';
import { Certificate, SyllabusItem } from '../types';
import { SGExEmblem } from './emblems/SGExEmblem';
import { BAdmQgexEmblem } from './emblems/BAdmQgexEmblem';
import { TopFiligree, BottomFiligree } from './emblems/FiligreeOrnaments';
import { VintageCornerTL, VintageCornerTR, VintageCornerBL, VintageCornerBR } from './emblems/VintageCorners';
import { MilitarySignatureGraphic } from './emblems/SignatureGraphic';
import { DEFAULT_CVTE_SYLLABUS } from '../utils/storage';

interface CertificateDocumentProps {
  certificate: Partial<Certificate> & { studentName: string; courseName: string; workloadHours: number; issueDate: string; code: string };
  elementId?: string;
  isCancelled?: boolean;
  page?: 'front' | 'back';
}

const formatCpf = (value?: string) => {
  const digits = (value || '').replace(/\D/g, '').slice(0, 11);
  if (digits.length !== 11) return value || '';
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
};

const formatDateExtenso = (iso?: string) => {
  if (!iso) return '';
  const p = iso.split('-');
  if (p.length !== 3) return iso;
  return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2])).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
};

const formatPeriod = (start?: string, end?: string) => {
  if (!start || !end) return '';
  const s = new Date(`${start}T00:00:00`);
  const e = new Date(`${end}T00:00:00`);
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) return `${String(s.getDate()).padStart(2, '0')} a ${String(e.getDate()).padStart(2, '0')} de ${e.toLocaleDateString('pt-BR', { month: 'long' })} de ${e.getFullYear()}`;
  return `${s.toLocaleDateString('pt-BR')} a ${e.toLocaleDateString('pt-BR')}`;
};

const Underline: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => <span className={`font-bold border-b-[2px] border-slate-900 pb-[1px] ${className}`}>{children}</span>;

const Frame: React.FC<{ children: React.ReactNode; isCancelled?: boolean }> = ({ children, isCancelled }) => <div className="w-full h-full relative box-border bg-white">
  {isCancelled && <div className="absolute inset-0 z-50 bg-white/70 flex items-center justify-center"><div className="-rotate-12 border-8 border-rose-700 px-14 py-5 text-5xl font-black text-rose-700">CANCELADO</div></div>}
  <div className="absolute inset-[14px] border-[3px] border-slate-900" />
  <div className="absolute inset-[24px] border border-slate-900" />
  <div className="absolute top-2 left-2"><VintageCornerTL size={82} color="#111827" /></div><div className="absolute top-2 right-2"><VintageCornerTR size={82} color="#111827" /></div><div className="absolute bottom-2 left-2"><VintageCornerBL size={82} color="#111827" /></div><div className="absolute bottom-2 right-2"><VintageCornerBR size={82} color="#111827" /></div>
  {children}
</div>;

export const CertificateFrontPage: React.FC<CertificateDocumentProps> = ({ certificate, elementId = 'certificate-front-canvas', isCancelled = false }) => {
  const {
    code = '006/CVTE/2026', studentName = 'NOME DO ALUNO', studentDocument = '000.000.000-00', registrationNumber = '0000000000', cnhCategory = 'AD',
    courseName = 'Curso Especializado para Condutores de Veículos de Transporte de Emergência', courseSubhead = 'Condutores de Veículos de Transporte de Emergência', workloadHours = 50,
    startDate, endDate, issueDate, location = 'Brasília-DF', institutionName = 'Instituição de Ensino de Trânsito da Base Administrativa do Quartel-General do Exército – Forte Caxias', institutionCnpj = '21.744.847/0001-50',
    legalInstruction = 'Instrução Nº 592, de 10 de agosto de 2020/Detran-DF', contranResolution = 'Resolução Nº 1.020/2025 do CONTRAN', validityText = 'validade de cinco anos após o término do curso',
    signatoryName = 'Carlos Henrique Ferreira De Mello', signatoryRole = 'Diretor Geral', signatoryCpf = '981.050.007-68', signatureImageUrl,
  } = certificate;

  const formattedStudentCpf = formatCpf(studentDocument);

  return <div id={elementId} className="certificate-container relative overflow-hidden bg-white text-slate-900 shadow-2xl font-serif" style={{ width: 1050, height: 742, minWidth: 1050, minHeight: 742 }}>
    <Frame isCancelled={isCancelled}>
      <div className="absolute inset-0 z-10 px-14 pt-10 pb-10 flex flex-col">
        <div className="grid grid-cols-12 items-start">
          <div className="col-span-2 flex justify-center pt-2"><SGExEmblem size={86} /></div>
          <div className="col-span-8 text-center flex flex-col items-center">
            <TopFiligree width={210} color="#111827" />
            <h1 className="text-[42px] leading-none font-normal tracking-wide text-[#E9782A] mt-1">CERTIFICADO</h1>
            <div className="mt-3 max-w-[410px] font-sans font-extrabold text-[18px] leading-[1.15]">{courseSubhead}</div>
            <BottomFiligree width={280} color="#111827" className="mt-1" />
          </div>
          <div className="col-span-2 flex flex-col items-center pt-2"><BAdmQgexEmblem size={86} /><div className="mt-3 font-sans text-[18px]"><Underline>{code}</Underline></div></div>
        </div>

        <div className="mt-8 px-2 text-[17px] leading-[1.75] text-justify">
          <p>
            {institutionName} ({legalInstruction}) certifica que <Underline className="uppercase">{studentName}</Underline>, inscrito no CPF nº <Underline>{formattedStudentCpf}</Underline> e no Nº REGISTRO <Underline>{registrationNumber}</Underline>, categoria “<Underline>{cnhCategory}</Underline>”, concluiu com aproveitamento o <Underline>{courseName}</Underline>, ministrado pela IET - Forte Caxias, no período de <Underline>{formatPeriod(startDate, endDate)}</Underline>, com carga horária de <Underline>{workloadHours}h/a</Underline>, com {validityText}, conforme {contranResolution}.
          </p>
        </div>

        <div className="mt-7 text-center text-[17px] font-bold"><Underline>{location}, {formatDateExtenso(issueDate)}</Underline></div>

        <div className="mt-auto grid grid-cols-12 items-end px-5 pb-1">
          <div className="col-span-4 text-center font-sans">
            <div className="h-48px flex items-center justify-center">{signatureImageUrl ? <img src={signatureImageUrl} alt={signatoryName} className="max-h-14 max-w-[200px] object-contain" /> : <MilitarySignatureGraphic width={170} />}</div>
            <div className="mx-auto w-56 border-t border-slate-900 pt-1"><p className="text-[11px] font-bold">{signatoryName}</p><p className="text-[10px] font-bold">{signatoryRole}</p>{signatoryCpf && <p className="text-[10px] font-bold">{signatoryCpf}</p>}</div>
          </div>
          <div className="col-span-4" />
          <div className="col-span-4 text-center font-sans text-[10px] font-bold leading-snug"><p>CNPJ Nº {institutionCnpj}</p><p>BASE ADMINISTRATIVA DO QUARTEL-GENERAL DO EXÉRCITO</p></div>
        </div>
      </div>
    </Frame>
  </div>;
};

export const CertificateBackPage: React.FC<CertificateDocumentProps> = ({ certificate, elementId = 'certificate-back-canvas', isCancelled = false }) => {
  const { code = '006/CVTE/2026', syllabus = DEFAULT_CVTE_SYLLABUS } = certificate;
  const rows: SyllabusItem[] = syllabus?.length ? syllabus : DEFAULT_CVTE_SYLLABUS;
  return <div id={elementId} className="certificate-container relative overflow-hidden bg-white text-slate-900 shadow-2xl font-serif" style={{ width: 1050, height: 742, minWidth: 1050, minHeight: 742 }}>
    <Frame isCancelled={isCancelled}>
      <div className="absolute inset-0 z-10 px-14 py-12 flex flex-col">
        <div className="grid grid-cols-12 items-center"><div className="col-span-2 flex justify-center"><SGExEmblem size={72} /></div><div className="col-span-8 text-center font-sans"><h2 className="text-[20px] font-black uppercase">Base Administrativa do Quartel-General do Exército</h2><p className="mt-2 text-[17px] font-extrabold uppercase">Curso Especializado para Condutores de Veículos de Transporte de Emergência</p></div><div className="col-span-2 flex justify-center"><BAdmQgexEmblem size={72} /></div></div>
        <div className="mt-6 flex items-center justify-between font-sans"><h3 className="font-black text-[16px] uppercase tracking-wide">Conteúdo Programático</h3><Underline>{code}</Underline></div>
        <div className="mt-5"><table className="w-full border-collapse border-2 border-slate-900 font-sans"><thead><tr className="bg-slate-200"><th className="border border-slate-900 p-3 text-[12px]">DISCIPLINA</th><th className="border border-slate-900 p-3 text-[12px]">CARGA HORÁRIA</th><th className="border border-slate-900 p-3 text-[12px]">AVALIAÇÃO</th><th className="border border-slate-900 p-3 text-[12px]">INSTRUTOR</th></tr></thead><tbody>{rows.map((row, i) => <tr key={i}><td className="border border-slate-900 p-3 text-[12px] font-bold">{row.discipline}</td><td className="border border-slate-900 p-3 text-[12px] text-center font-bold">{row.workload}</td><td className="border border-slate-900 p-3 text-[12px] text-center font-bold">{row.grade}</td><td className="border border-slate-900 p-3 text-[11px] text-center font-bold">{row.instructor}</td></tr>)}</tbody></table></div>
        <div className="mt-auto text-center font-sans text-[11px]">Instituição de Ensino de Trânsito • Base Administrativa do Quartel-General do Exército – Forte Caxias</div>
      </div>
    </Frame>
  </div>;
};

export const CertificateDocument: React.FC<CertificateDocumentProps> = (props) => props.page === 'back' ? <CertificateBackPage {...props} /> : <CertificateFrontPage {...props} />;
