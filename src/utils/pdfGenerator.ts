import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

export interface PdfExportOptions { elementId:string; studentName?:string; courseName?:string; pageSuffix?:string; onProgress?:(status:string)=>void; }
export interface TwoPagePdfExportOptions { frontElementId:string; backElementId:string; studentName?:string; courseName?:string; code?:string; onProgress?:(status:string)=>void; }
const renderElement=async(element:HTMLElement,status?:(v:string)=>void,message='Renderizando certificado...')=>{
 status?.(message);
 if(document.fonts)await document.fonts.ready;
 await Promise.all(Array.from(element.querySelectorAll('img')).map(async image=>{
   if(!image.complete)await new Promise<void>((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Tempo esgotado ao carregar os brasões. Recarregue a página e tente novamente.')),15000);image.addEventListener('load',()=>{clearTimeout(timer);resolve();},{once:true});image.addEventListener('error',()=>{clearTimeout(timer);reject(new Error('Não foi possível carregar um brasão.'));},{once:true});});
   if(!image.naturalWidth)throw new Error('Não foi possível carregar um brasão. Recarregue a página.');
 }));
 return html2canvas(element,{scale:2,useCORS:true,allowTaint:false,backgroundColor:'#ffffff',logging:false,width:1050,height:742,windowWidth:1200,windowHeight:900,scrollX:0,scrollY:0,imageTimeout:15000,onclone:(doc,clone)=>{
   // Capture only the page, outside transformed/clipped modal ancestors.
   doc.body.appendChild(clone);Object.assign(clone.style,{position:'absolute',left:'0px',top:'0px',transform:'none',margin:'0',boxShadow:'none'});
 }});
};
const cleanFilenamePart=(value:string,max=60)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'_').replace(/_+/g,'_').replace(/^_|_$/g,'').slice(0,max)||'Certificado';
export const getCertificatePdfFilename=(studentName='Certificado',code?:string)=>{const student=cleanFilenamePart(studentName.toUpperCase());const cleanCode=code?cleanFilenamePart(code,30).replace(/_/g,'-'):'';return `${cleanCode?`${cleanCode}_`:''}${student}.pdf`;};
const createTwoPagePdf=async(frontElementId:string,backElementId:string,onProgress?:(s:string)=>void)=>{const frontEl=document.getElementById(frontElementId);const backEl=document.getElementById(backElementId);if(!backEl)throw new Error('O verso do certificado não está disponível. Feche e abra a prévia.');if(!frontEl)throw new Error(`Front element with id "${frontElementId}" not found.`);const frontCanvas=await renderElement(frontEl,onProgress,'Renderizando Página 1 (Frente)...');const pdf=new jsPDF({orientation:'landscape',unit:'mm',format:'a4',compress:true});pdf.addImage(frontCanvas.toDataURL('image/png',1),'PNG',0,0,297,210,undefined,'FAST');if(backEl){const backCanvas=await renderElement(backEl,onProgress,'Renderizando Página 2 (Verso)...');pdf.addPage('a4','landscape');pdf.addImage(backCanvas.toDataURL('image/png',1),'PNG',0,0,297,210,undefined,'FAST');}return pdf;};
export async function renderTwoPageCertificatePdfBlob(options:TwoPagePdfExportOptions):Promise<Blob>{options.onProgress?.('Preparando documento...');const pdf=await createTwoPagePdf(options.frontElementId,options.backElementId,options.onProgress);options.onProgress?.('Finalizando PDF...');return pdf.output('blob');}
export async function exportCertificateToPdf(options:PdfExportOptions):Promise<void>{const{elementId,studentName='Certificado',courseName='Curso',pageSuffix='',onProgress}=options;const element=document.getElementById(elementId);if(!element)throw new Error(`Element with id "${elementId}" not found for PDF export.`);const canvas=await renderElement(element,onProgress,'Renderizando em alta resolução...');onProgress?.('Gerando documento PDF A4 Paisagem...');const pdf=new jsPDF({orientation:'landscape',unit:'mm',format:'a4',compress:true});pdf.addImage(canvas.toDataURL('image/png',1),'PNG',0,0,297,210,undefined,'FAST');const suffix=pageSuffix?`_${cleanFilenamePart(pageSuffix,20)}`:'';pdf.save(`${getCertificatePdfFilename(studentName).replace('.pdf','')}${suffix}.pdf`);onProgress?.('Download concluído!');}
export async function exportTwoPageCertificateToPdf(options:TwoPagePdfExportOptions):Promise<void>{const{studentName='Certificado',code,onProgress}=options;const pdf=await createTwoPagePdf(options.frontElementId,options.backElementId,onProgress);pdf.save(getCertificatePdfFilename(studentName,code));onProgress?.('Download concluído com sucesso!');}

