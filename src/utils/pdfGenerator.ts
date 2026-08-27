import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfExportOptions {
  elementId: string;
  studentName?: string;
  courseName?: string;
  pageSuffix?: string;
  onProgress?: (status: string) => void;
}

export interface TwoPagePdfExportOptions {
  frontElementId: string;
  backElementId: string;
  studentName?: string;
  courseName?: string;
  onProgress?: (status: string) => void;
}

const renderElement = async (element: HTMLElement, status?: (value: string) => void, message = 'Renderizando certificado...') => {
  status?.(message);
  if (document.fonts) await document.fonts.ready;
  return html2canvas(element, {
    scale: 3,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });
};

const cleanFilenamePart = (value: string, max = 60) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-zA-Z0-9_-]+/g, '_')
  .replace(/_+/g, '_')
  .replace(/^_|_$/g, '')
  .slice(0, max) || 'Certificado';

export const getCertificatePdfFilename = (studentName = 'Certificado', code?: string) => {
  const cleanStudent = cleanFilenamePart(studentName);
  const cleanCode = code ? cleanFilenamePart(code, 30) : '';
  return `${cleanCode ? `${cleanCode}_` : ''}${cleanStudent}.pdf`;
};

const createTwoPagePdf = async (frontElementId: string, backElementId: string, onProgress?: (status: string) => void) => {
  const frontEl = document.getElementById(frontElementId);
  const backEl = document.getElementById(backElementId);
  if (!frontEl) throw new Error(`Front element with id "${frontElementId}" not found.`);

  const frontCanvas = await renderElement(frontEl, onProgress, 'Renderizando Página 1 (Frente)...');
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
  pdf.addImage(frontCanvas.toDataURL('image/png', 1), 'PNG', 0, 0, 297, 210, undefined, 'FAST');

  if (backEl) {
    const backCanvas = await renderElement(backEl, onProgress, 'Renderizando Página 2 (Verso)...');
    pdf.addPage('a4', 'landscape');
    pdf.addImage(backCanvas.toDataURL('image/png', 1), 'PNG', 0, 0, 297, 210, undefined, 'FAST');
  }
  return pdf;
};

export async function renderTwoPageCertificatePdfBlob(options: TwoPagePdfExportOptions): Promise<Blob> {
  options.onProgress?.('Preparando documento...');
  const pdf = await createTwoPagePdf(options.frontElementId, options.backElementId, options.onProgress);
  options.onProgress?.('Finalizando PDF...');
  return pdf.output('blob');
}

export async function exportCertificateToPdf(options: PdfExportOptions): Promise<void> {
  const { elementId, studentName = 'Certificado', courseName = 'Curso', pageSuffix = '', onProgress } = options;
  const element = document.getElementById(elementId);
  if (!element) throw new Error(`Element with id "${elementId}" not found for PDF export.`);
  try {
    const canvas = await renderElement(element, onProgress, 'Renderizando em alta resolução...');
    onProgress?.('Gerando documento PDF A4 Paisagem...');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
    pdf.addImage(canvas.toDataURL('image/png', 1), 'PNG', 0, 0, 297, 210, undefined, 'FAST');
    const cleanStudent = cleanFilenamePart(studentName);
    const cleanCourse = cleanFilenamePart(courseName, 30);
    const suffix = pageSuffix ? `_${cleanFilenamePart(pageSuffix, 20)}` : '';
    pdf.save(`Certificado_${cleanStudent}_${cleanCourse}${suffix}.pdf`);
    onProgress?.('Download concluído!');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

export async function exportTwoPageCertificateToPdf(options: TwoPagePdfExportOptions): Promise<void> {
  const { studentName = 'Certificado', courseName = 'Curso', onProgress } = options;
  try {
    const pdf = await createTwoPagePdf(options.frontElementId, options.backElementId, onProgress);
    const cleanStudent = cleanFilenamePart(studentName);
    const cleanCourse = cleanFilenamePart(courseName, 30);
    pdf.save(`Certificado_Oficial_${cleanStudent}_${cleanCourse}_Completo.pdf`);
    onProgress?.('Download concluído com sucesso!');
  } catch (error) {
    console.error('Error generating 2-page PDF:', error);
    throw error;
  }
}
