import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Printer,
  Ban,
  ShieldCheck,
  Calendar,
  User,
  BookOpen,
  Fingerprint,
  Loader2,
  AlertTriangle,
  FileText,
  Layers,
} from 'lucide-react';
import { Certificate } from '../types';
import { useApp } from '../context/AppContext';
import { CertificateFrontPage, CertificateBackPage } from './CertificateDocument';
import { exportCertificateToPdf, exportTwoPageCertificateToPdf } from '../utils/pdfGenerator';
import { formatVerificationUrl } from '../utils/codeGenerator';
import { IntegrityVerificationResult } from '../utils/integrity';

interface CertificateModalProps {
  certificate: Certificate | null;
  isOpen: boolean;
  onClose: () => void;
  setCurrentView: (view: any) => void;
  setValidationSearchCode: (code: string) => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  certificate,
  isOpen,
  onClose,
  setCurrentView,
  setValidationSearchCode,
}) => {
  const { cancelCertificate, checkCertificateIntegrity } = useApp();

  if (!isOpen || !certificate) return null;

  const [activeTab, setActiveTab] = useState<'front' | 'back' | 'both'>('front');
  const [downloading, setDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedUuid, setCopiedUuid] = useState(false);
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [integrityState, setIntegrityState] = useState<IntegrityVerificationResult | null>(null);

  const verificationUrl = formatVerificationUrl(certificate.code);

  const handleDownloadFullPdf = async () => {
    try {
      setDownloading(true);
      await exportTwoPageCertificateToPdf({
        frontElementId: `modal-front-export-${certificate.id}`,
        backElementId: `modal-back-export-${certificate.id}`,
        studentName: certificate.studentName,
        courseName: certificate.courseName,
        onProgress: (status) => setDownloadStatus(status),
      });
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar o PDF de 2 páginas. Tentando baixar página única...');
      try {
        await exportCertificateToPdf({
          elementId: `modal-front-export-${certificate.id}`,
          studentName: certificate.studentName,
          courseName: certificate.courseName,
          onProgress: (status) => setDownloadStatus(status),
        });
      } catch (e) {
        alert('Erro ao gerar o PDF.');
      }
    } finally {
      setDownloading(false);
      setDownloadStatus('');
    }
  };

  const handleDownloadSinglePage = async (page: 'front' | 'back') => {
    try {
      setDownloading(true);
      const elementId = page === 'front' ? `modal-front-export-${certificate.id}` : `modal-back-export-${certificate.id}`;
      await exportCertificateToPdf({
        elementId,
        studentName: certificate.studentName,
        courseName: certificate.courseName,
        pageSuffix: page === 'front' ? 'Frente' : 'Verso',
        onProgress: (status) => setDownloadStatus(status),
      });
    } catch (err) {
      alert('Erro ao gerar o PDF. Verifique os dados e tente novamente.');
    } finally {
      setDownloading(false);
      setDownloadStatus('');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyUuid = () => {
    if (certificate.uuid) {
      navigator.clipboard.writeText(certificate.uuid);
      setCopiedUuid(true);
      setTimeout(() => setCopiedUuid(false), 2500);
    }
  };

  const handleVerifyIntegrity = () => {
    const res = checkCertificateIntegrity(certificate.code);
    setIntegrityState(res);
  };

  const handleConfirmCancel = () => {
    if (!cancelReason.trim()) {
      alert('Por favor, informe a justificativa do cancelamento.');
      return;
    }
    cancelCertificate(certificate.id, cancelReason);
    setShowCancelPrompt(false);
  };

  const handleGoToValidation = () => {
    setValidationSearchCode(certificate.code);
    setCurrentView('validate');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex flex-wrap items-center gap-2.5">
            <div
              className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                certificate.status === 'active'
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                  : certificate.status === 'expired'
                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                  : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
              }`}
            >
              {certificate.status === 'active' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Ativo e Válido
                </>
              ) : certificate.status === 'expired' ? (
                <>
                  <Calendar className="w-3.5 h-3.5" />
                  Expirado
                </>
              ) : (
                <>
                  <Ban className="w-3.5 h-3.5" />
                  Cancelado
                </>
              )}
            </div>

            <div className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-200/80 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700">
              {certificate.code}
            </div>

            {/* Page Tabs */}
            <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-300/80 dark:border-slate-700 text-xs font-medium ml-1">
              <button
                type="button"
                onClick={() => setActiveTab('front')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  activeTab === 'front'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Página 1: Frente
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('back')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  activeTab === 'back'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Página 2: Verso
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('both')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer hidden md:inline-block ${
                  activeTab === 'both'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Ambas as Páginas
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleVerifyIntegrity}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800/60 transition-colors"
              title="Executar verificação criptográfica dos dados"
            >
              <Fingerprint className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Integridade</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Copiar link da página de validação"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Link'}</span>
            </button>

            <button
              onClick={handleGoToValidation}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Testar validação pública deste certificado"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span>Validar</span>
            </button>

            {/* Download Full PDF (2 Pages) Button */}
            <button
              onClick={handleDownloadFullPdf}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>{downloading ? 'Gerando...' : 'Baixar PDF Completo'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Integrity Check Result Banner */}
        {integrityState && (
          <div
            className={`px-6 py-2.5 border-b text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
              integrityState.isAuthentic
                ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/70 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {integrityState.isAuthentic ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              )}
              <span>
                <strong>Integridade Criptográfica:</strong>{' '}
                {integrityState.hasBeenTampered
                  ? 'Inconsistência detectada! Os dados foram alterados após a emissão.'
                  : `Registro autêntico e inalterado (${integrityState.statusLabel}). Hash SHA-256 verificado.`}
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
              Hash: {certificate.integrityHash?.substring(0, 16)}...
            </span>
          </div>
        )}

        {/* Progress Alert if generating PDF */}
        {downloading && (
          <div className="bg-indigo-50 dark:bg-indigo-950/70 border-b border-indigo-100 dark:border-indigo-900 px-6 py-2 text-xs text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {downloadStatus || 'Renderizando documento em alta resolução (300 DPI)...'}
            </span>
            <span className="font-mono text-[10px]">A4 Paisagem (297x210mm)</span>
          </div>
        )}

        {/* Cancelled Banner if applicable */}
        {certificate.status === 'cancelled' && (
          <div className="bg-rose-50 dark:bg-rose-950/60 border-b border-rose-200 dark:border-rose-900 px-6 py-2.5 text-xs text-rose-800 dark:text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <strong>Atenção:</strong> Este certificado foi formalmente cancelado em{' '}
              {certificate.cancelledAt ? new Date(certificate.cancelledAt).toLocaleDateString('pt-BR') : ''}.
              {certificate.cancellationReason && (
                <span className="text-rose-600 dark:text-rose-300 ml-1">
                  Motivo: "{certificate.cancellationReason}"
                </span>
              )}
            </div>
          </div>
        )}

        {/* Certificate Display Canvas */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-100 dark:bg-slate-950 flex flex-col items-center gap-6">
          {/* Active Display */}
          {(activeTab === 'front' || activeTab === 'both') && (
            <div className="w-full flex flex-col items-center">
              {activeTab === 'both' && (
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Página 1: Frente
                </div>
              )}
              <div className="transform scale-[0.7] sm:scale-[0.85] lg:scale-95 origin-top transition-transform shadow-xl rounded-lg overflow-hidden">
                <CertificateFrontPage
                  certificate={certificate}
                  elementId={`modal-front-display-${certificate.id}`}
                  isCancelled={certificate.status === 'cancelled'}
                />
              </div>
            </div>
          )}

          {(activeTab === 'back' || activeTab === 'both') && (
            <div className="w-full flex flex-col items-center">
              {activeTab === 'both' && (
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-4 mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" /> Página 2: Verso (Conteúdo Programático)
                </div>
              )}
              <div className="transform scale-[0.7] sm:scale-[0.85] lg:scale-95 origin-top transition-transform shadow-xl rounded-lg overflow-hidden">
                <CertificateBackPage
                  certificate={certificate}
                  elementId={`modal-back-display-${certificate.id}`}
                  isCancelled={certificate.status === 'cancelled'}
                />
              </div>
            </div>
          )}
        </div>

        {/* Off-screen Export Containers (fixed 1050x742 for crisp PDF generation) */}
        <div className="fixed -left-[9999px] -top-[9999px] pointer-events-none opacity-100">
          <CertificateFrontPage
            certificate={certificate}
            elementId={`modal-front-export-${certificate.id}`}
            isCancelled={certificate.status === 'cancelled'}
          />
          <CertificateBackPage
            certificate={certificate}
            elementId={`modal-back-export-${certificate.id}`}
            isCancelled={certificate.status === 'cancelled'}
          />
        </div>

        {/* Footer Meta & Cancellation Controls */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Aluno: <strong className="text-slate-800 dark:text-slate-200">{certificate.studentName}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              Curso: <strong className="text-slate-800 dark:text-slate-200">{certificate.courseName}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Emissão: <strong className="text-slate-800 dark:text-slate-200">{certificate.issueDate}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleDownloadSinglePage('front')}
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-medium cursor-pointer"
            >
              Baixar só Frente
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <button
              onClick={() => handleDownloadSinglePage('back')}
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-medium cursor-pointer"
            >
              Baixar só Verso
            </button>

            {certificate.status === 'active' && (
              <>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                {!showCancelPrompt ? (
                  <button
                    onClick={() => setShowCancelPrompt(true)}
                    className="text-rose-600 hover:text-rose-700 dark:text-rose-400 font-medium hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Ban className="w-3 h-3" />
                    Cancelar
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950 p-1.5 rounded-lg border border-rose-200 dark:border-rose-800">
                    <input
                      type="text"
                      placeholder="Motivo..."
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="px-2 py-0.5 text-xs border rounded bg-white dark:bg-slate-800 border-rose-300 text-slate-800 dark:text-slate-200 w-36"
                    />
                    <button
                      onClick={handleConfirmCancel}
                      className="px-2 py-0.5 bg-rose-600 text-white rounded text-[11px] font-bold hover:bg-rose-700 cursor-pointer"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => setShowCancelPrompt(false)}
                      className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-[11px] cursor-pointer"
                    >
                      Voltar
                    </button>
                  </div>
                )}
              </>
            )}

            <span className="text-slate-300 dark:text-slate-700">|</span>
            <button
              onClick={handlePrint}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
