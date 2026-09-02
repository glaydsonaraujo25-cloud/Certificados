import { CertificatePreview } from './CertificatePreview';
import { verifyCertificateIntegrity } from '../utils/integrity';
import React, { useState } from 'react';
import { X, Download, Printer, Ban, ShieldCheck, Fingerprint, Loader2, AlertTriangle, FileText, Layers } from 'lucide-react';
import { Certificate } from '../types';
import { useApp } from '../context/AppContext';
import { CertificateFrontPage, CertificateBackPage } from './CertificateDocument';
import { exportCertificateToPdf, exportTwoPageCertificateToPdf } from '../utils/pdfGenerator';
import { IntegrityVerificationResult } from '../utils/integrity';

interface CertificateModalProps {
  certificate: Certificate | null;
  isOpen: boolean;
  onClose: () => void;
  setCurrentView?: (view: string) => void;
  setValidationSearchCode?: (code: string) => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ certificate, isOpen, onClose, setCurrentView, setValidationSearchCode }) => {
  const app = useApp();
  const { cancelCertificate } = app;
  setCurrentView = setCurrentView || app.setCurrentView;
  setValidationSearchCode = setValidationSearchCode || app.setValidationSearchCode;
  certificate = app.certificates.find(c=>c.id===certificate?.id) || certificate;
  const [activeTab, setActiveTab] = useState<'front' | 'back' | 'both'>('front');
  const [downloading, setDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState('');
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [integrityState, setIntegrityState] = useState<IntegrityVerificationResult | null>(null);

  if (!isOpen || !certificate) return null;

  const handleDownloadFullPdf = async () => {
    try {
      setDownloading(true);
      await exportTwoPageCertificateToPdf({
        frontElementId: `modal-front-export-${certificate.id}`,
        backElementId: `modal-back-export-${certificate.id}`,
        studentName: certificate.studentName,
        courseName: certificate.courseName,
        code: certificate.code,
        onProgress: setDownloadStatus,
      });
    } catch {
      alert('Erro ao gerar o PDF completo.');
    } finally {
      setDownloading(false);
      setDownloadStatus('');
    }
  };

  const handleDownloadSinglePage = async (page: 'front' | 'back') => {
    try {
      setDownloading(true);
      await exportCertificateToPdf({
        elementId: page === 'front' ? `modal-front-export-${certificate.id}` : `modal-back-export-${certificate.id}`,
        studentName: certificate.studentName,
        courseName: certificate.courseName,
        pageSuffix: page === 'front' ? 'Frente' : 'Verso',
        onProgress: setDownloadStatus,
      });
    } catch {
      alert('Erro ao gerar o PDF.');
    } finally {
      setDownloading(false);
      setDownloadStatus('');
    }
  };

  const handleGoToValidation = () => {
    setValidationSearchCode(certificate.code);
    setCurrentView('validate');
    onClose();
  };

  const handleConfirmCancel = () => {
    if (!cancelReason.trim()) return;
    cancelCertificate(certificate.id, cancelReason.trim());
    setShowCancelPrompt(false);
    setCancelReason('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-6xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[95vh]">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${certificate.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{certificate.status === 'active' ? 'Ativo e válido' : 'Cancelado'}</span>
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800">{certificate.code}</span>
            <div className="flex bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
              <button onClick={() => setActiveTab('front')} className={`px-3 py-1 rounded-md ${activeTab === 'front' ? 'bg-white dark:bg-slate-700 font-bold' : ''}`}>Frente</button>
              <button onClick={() => setActiveTab('back')} className={`px-3 py-1 rounded-md ${activeTab === 'back' ? 'bg-white dark:bg-slate-700 font-bold' : ''}`}>Verso</button>
              <button onClick={() => setActiveTab('both')} className={`px-3 py-1 rounded-md ${activeTab === 'both' ? 'bg-white dark:bg-slate-700 font-bold' : ''}`}>Ambos</button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setIntegrityState(verifyCertificateIntegrity(certificate))} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700"><Fingerprint className="w-3.5 h-3.5" />Integridade</button>
            <button onClick={handleGoToValidation} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800"><ShieldCheck className="w-3.5 h-3.5" />Validar código</button>
            <button onClick={handleDownloadFullPdf} disabled={downloading} className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 text-white disabled:opacity-50">{downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}PDF completo</button>
            <button onClick={() => window.print()} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800"><Printer className="w-4 h-4" /></button>
            <button onClick={onClose} className="p-1.5 rounded-lg"><X className="w-5 h-5" /></button>
          </div>
        </div>

        {integrityState && <div className={`px-5 py-2.5 text-xs border-b ${integrityState.isAuthentic ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'}`}>{integrityState.isAuthentic ? 'Integridade criptográfica confirmada.' : 'Foi detectada inconsistência nos dados deste certificado.'}</div>}
        {downloading && <div className="px-5 py-2 text-xs bg-indigo-50 text-indigo-700">{downloadStatus || 'Gerando PDF...'}</div>}

        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-100 dark:bg-slate-950 flex flex-col items-center gap-6">
          {(activeTab === 'front' || activeTab === 'both') && <div className="w-full flex flex-col items-center">{activeTab === 'both' && <div className="mb-2 text-xs font-bold text-slate-500 flex items-center gap-1"><FileText className="w-4 h-4" />Frente</div>}<CertificatePreview><CertificateFrontPage certificate={certificate} elementId={`modal-front-display-${certificate.id}`} isCancelled={certificate.status === 'cancelled'} /></CertificatePreview></div>}
          {(activeTab === 'back' || activeTab === 'both') && <div className="w-full flex flex-col items-center">{activeTab === 'both' && <div className="mb-2 text-xs font-bold text-slate-500 flex items-center gap-1"><Layers className="w-4 h-4" />Verso</div>}<CertificatePreview><CertificateBackPage certificate={certificate} elementId={`modal-back-display-${certificate.id}`} isCancelled={certificate.status === 'cancelled'} /></CertificatePreview></div>}
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 px-5 py-3 flex flex-wrap justify-between gap-2">
          <div className="flex gap-2"><button onClick={() => handleDownloadSinglePage('front')} className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold">Baixar frente</button><button onClick={() => handleDownloadSinglePage('back')} className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold">Baixar verso</button></div>
          {certificate.status === 'active' && <button onClick={() => setShowCancelPrompt(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold"><Ban className="w-3.5 h-3.5" />Cancelar certificado</button>}
        </div>

        <div className="fixed -left-[10000px] top-0"><CertificateFrontPage certificate={certificate} elementId={`modal-front-export-${certificate.id}`} isCancelled={certificate.status === 'cancelled'} /><CertificateBackPage certificate={certificate} elementId={`modal-back-export-${certificate.id}`} isCancelled={certificate.status === 'cancelled'} /></div>
      </div>

      {showCancelPrompt && <div className="fixed inset-0 z-[60] bg-slate-900/70 flex items-center justify-center p-4"><div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6"><div className="flex gap-3"><AlertTriangle className="w-5 h-5 text-rose-600" /><div><h3 className="font-bold">Cancelar certificado?</h3><p className="text-sm text-slate-500 mt-1">Informe o motivo do cancelamento.</p></div></div><textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={3} className="mt-4 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-sm" /><div className="mt-4 flex justify-end gap-2"><button onClick={() => setShowCancelPrompt(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm">Voltar</button><button onClick={handleConfirmCancel} className="px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-bold">Confirmar cancelamento</button></div></div></div>}
    </div>
  );
};

