import React, { useState } from 'react';
import { Certificate } from '../types';
import { CertificateDocument } from './CertificateDocument';
import { exportCertificateToPdf } from '../utils/pdfGenerator';
import { formatVerificationUrl } from '../utils/codeGenerator';
import { useApp } from '../context/AppContext';
import {
  X,
  Download,
  Printer,
  Copy,
  Check,
  Ban,
  ShieldCheck,
  Loader2,
  User,
  BookOpen,
  Fingerprint,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

interface CertificateModalProps {
  certificate: Certificate;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  certificate,
  onClose,
}) => {
  const {
    cancelCertificate,
    setCurrentView,
    setValidationSearchCode,
    checkCertificateIntegrity,
  } = useApp();

  const [downloading, setDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedUuid, setCopiedUuid] = useState(false);
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [integrityState, setIntegrityState] = useState<ReturnType<typeof checkCertificateIntegrity> | null>(null);

  const verificationUrl = formatVerificationUrl(certificate.code);

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      await exportCertificateToPdf({
        elementId: `modal-cert-${certificate.id}`,
        studentName: certificate.studentName,
        courseName: certificate.courseName,
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex flex-wrap items-center gap-3">
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
            
            <div className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
              {certificate.code}
            </div>

            {certificate.uuid && (
              <button
                type="button"
                onClick={handleCopyUuid}
                className="hidden lg:flex items-center gap-1 text-[11px] font-mono text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100/70 dark:bg-slate-800/70 px-2 py-0.5 rounded"
                title="Clique para copiar UUID"
              >
                <Fingerprint className="w-3 h-3 text-indigo-500" />
                <span>UUID: {certificate.uuid.substring(0, 8)}...</span>
                {copiedUuid && <span className="text-emerald-600 font-bold">✓</span>}
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleVerifyIntegrity}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800/60 transition-colors"
              title="Executar verificação criptográfica dos dados"
            >
              <Fingerprint className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Verificar Integridade</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Copiar link da página de validação"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado!' : 'Copiar Link'}</span>
            </button>

            <button
              onClick={handleGoToValidation}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Testar validação pública deste certificado"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span>Validar</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors disabled:opacity-50"
            >
              {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>{downloading ? 'Baixando...' : 'Baixar PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Integrity Check Result Banner if clicked */}
        {integrityState && (
          <div
            className={`px-6 py-3 border-b text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
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
                <strong>Resultado da Integridade:</strong>{' '}
                {integrityState.hasBeenTampered
                  ? 'Inconsistência detectada! Os dados foram alterados após a emissão.'
                  : `Registro íntegro e autêntico (${integrityState.statusLabel}). Hash de emissão validado com sucesso.`}
              </span>
            </div>

            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Operação registrada na trilha de auditoria
            </span>
          </div>
        )}

        {/* Progress Alert if generating PDF */}
        {downloading && (
          <div className="bg-indigo-50 dark:bg-indigo-950/70 border-b border-indigo-100 dark:border-indigo-900 px-6 py-2 text-xs text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {downloadStatus || 'Processando renderização em alta definição...'}
            </span>
            <span className="font-mono text-[10px]">A4 Landscape (297x210mm)</span>
          </div>
        )}

        {/* Cancelled Banner if applicable */}
        {certificate.status === 'cancelled' && (
          <div className="bg-rose-50 dark:bg-rose-950/60 border-b border-rose-200 dark:border-rose-900 px-6 py-3 text-xs text-rose-800 dark:text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <strong>Atenção:</strong> Este certificado foi formalmente cancelado em{' '}
              {certificate.cancelledAt ? new Date(certificate.cancelledAt).toLocaleDateString('pt-BR') : ''}.
              {certificate.cancellationReason && (
                <p className="text-rose-600 dark:text-rose-300 mt-0.5">
                  Motivo registrado: "{certificate.cancellationReason}"
                </p>
              )}
            </div>
            {certificate.cancelledBy && (
              <span className="text-[11px] text-rose-500 dark:text-rose-400">
                Cancelado por: {certificate.cancelledBy}
              </span>
            )}
          </div>
        )}

        {/* Certificate Display Canvas */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 bg-slate-100 dark:bg-slate-950/70 flex justify-center items-center">
          <div className="w-full flex justify-center transform scale-[0.85] sm:scale-100 origin-center transition-transform">
            <CertificateDocument
              certificate={certificate}
              elementId={`modal-cert-${certificate.id}`}
              isCancelled={certificate.status === 'cancelled'}
            />
          </div>
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
            {certificate.status === 'active' && (
              <>
                {!showCancelPrompt ? (
                  <button
                    onClick={() => setShowCancelPrompt(true)}
                    className="text-rose-600 hover:text-rose-700 dark:text-rose-400 font-medium hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Ban className="w-3 h-3" />
                    Cancelar Certificado
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950 p-1.5 rounded-lg border border-rose-200 dark:border-rose-800">
                    <input
                      type="text"
                      placeholder="Motivo do cancelamento..."
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="px-2 py-1 text-xs border rounded bg-white dark:bg-slate-800 border-rose-300 text-slate-800 dark:text-slate-200 w-48"
                    />
                    <button
                      onClick={handleConfirmCancel}
                      className="px-2 py-1 bg-rose-600 text-white rounded text-[11px] font-bold hover:bg-rose-700 cursor-pointer"
                    >
                      Confirmar
                    </button>
                    <button
                      onClick={() => setShowCancelPrompt(false)}
                      className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-[11px] cursor-pointer"
                    >
                      Voltar
                    </button>
                  </div>
                )}
              </>
            )}
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

