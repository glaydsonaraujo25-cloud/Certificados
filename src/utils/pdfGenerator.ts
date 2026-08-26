import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfExportOptions {
  elementId: string;
  studentName?: string;
  courseName?: string;
  onProgress?: (status: string) => void;
}

/**
 * Exports an HTML element rendered as A4 Landscape (297 x 210 mm) to PDF.
 */
export async function exportCertificateToPdf(options: PdfExportOptions): Promise<void> {
  const { elementId, studentName = 'Certificado', courseName = 'Curso', onProgress } = options;

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
    const filename = `Certificado_${cleanStudent}_${cleanCourse}.pdf`;

    pdf.save(filename);

    if (onProgress) onProgress('Download concluído!');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}
