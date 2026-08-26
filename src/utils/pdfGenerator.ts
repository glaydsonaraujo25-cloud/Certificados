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

/**
 * Exports a single page (A4 Landscape 297 x 210 mm) to PDF.
 */
export async function exportCertificateToPdf(options: PdfExportOptions): Promise<void> {
  const { elementId, studentName = 'Certificado', courseName = 'Curso', pageSuffix = '', onProgress } = options;

  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found for PDF export.`);
  }

  try {
    if (onProgress) onProgress('Preparando fontes e layout...');

    // Wait for fonts to be ready
    if (document.fonts) {
      await document.fonts.ready;
    }

    if (onProgress) onProgress('Renderizando em altíssima resolução (300 DPI)...');

    // Create high-resolution canvas with scale: 3 for crisp vectors & text
    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    if (onProgress) onProgress('Gerando documento PDF A4 Paisagem...');

    // A4 dimensions in mm: 297 width x 210 height (landscape)
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdfWidth = 297;
    const pdfHeight = 210;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

    const cleanStudent = studentName.replace(/[^a-zA-Z0-9À-ÿ]/g, '_');
    const cleanCourse = courseName.replace(/[^a-zA-Z0-9À-ÿ]/g, '_').slice(0, 30);
    const suffix = pageSuffix ? `_${pageSuffix}` : '';
    const filename = `Certificado_${cleanStudent}_${cleanCourse}${suffix}.pdf`;

    pdf.save(filename);

    if (onProgress) onProgress('Download concluído!');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}

/**
 * Exports both Front (Página 1) and Back (Página 2: Conteúdo Programático) into a 2-page PDF.
 */
export async function exportTwoPageCertificateToPdf(options: TwoPagePdfExportOptions): Promise<void> {
  const { frontElementId, backElementId, studentName = 'Certificado', courseName = 'Curso', onProgress } = options;

  const frontEl = document.getElementById(frontElementId);
  const backEl = document.getElementById(backElementId);

  if (!frontEl) {
    throw new Error(`Front element with id "${frontElementId}" not found.`);
  }
  if (!backEl) {
    // If back element doesn't exist, fallback to single page
    return exportCertificateToPdf({
      elementId: frontElementId,
      studentName,
      courseName,
      onProgress,
    });
  }

  try {
    if (onProgress) onProgress('Preparando fontes e layout...');

    if (document.fonts) {
      await document.fonts.ready;
    }

    if (onProgress) onProgress('Renderizando Página 1 (Frente)...');

    const frontCanvas = await html2canvas(frontEl, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: frontEl.scrollWidth,
      windowHeight: frontEl.scrollHeight,
    });

    if (onProgress) onProgress('Renderizando Página 2 (Verso / Conteúdo)...');

    const backCanvas = await html2canvas(backEl, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: backEl.scrollWidth,
      windowHeight: backEl.scrollHeight,
    });

    if (onProgress) onProgress('Compilando PDF Oficial de 2 Páginas...');

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = 297;
    const pdfHeight = 210;

    // Page 1: Frente
    const frontImg = frontCanvas.toDataURL('image/png', 1.0);
    pdf.addImage(frontImg, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

    // Page 2: Verso
    pdf.addPage('a4', 'landscape');
    const backImg = backCanvas.toDataURL('image/png', 1.0);
    pdf.addImage(backImg, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

    const cleanStudent = studentName.replace(/[^a-zA-Z0-9À-ÿ]/g, '_');
    const cleanCourse = courseName.replace(/[^a-zA-Z0-9À-ÿ]/g, '_').slice(0, 30);
    const filename = `Certificado_Oficial_${cleanStudent}_${cleanCourse}_Completo.pdf`;

    pdf.save(filename);

    if (onProgress) onProgress('Download concluído com sucesso!');
  } catch (error) {
    console.error('Error generating 2-page PDF:', error);
    throw error;
  }
}
