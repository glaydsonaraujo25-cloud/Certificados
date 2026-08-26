import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Certificate } from '../types';
import { CertificateModal } from '../components/CertificateModal';
import { maskDocumentNumber } from '../utils/integrity';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  Building,
  User,
  Clock,
  Eye,
  Ban,
  Calendar,
  Lock,
  QrCode,
  Fingerprint,
} from 'lucide-react';

export const ValidateCertificateView: React.FC = () => {
  const {
    certificates,
    validationSearchCode,
    setValidationSearchCode,
    checkCertificateIntegrity,
  } = useApp();

  const [inputCode, setInputCode] = useState(validationSearchCode || '');
  const [searchedCode, setSearchedCode] = useState<string | null>(null);
  const [foundCert, setFoundCert] = useState<Certificate | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeModalCert, setActiveModalCert] = useState<Certificate | null>(null);

  // If validationSearchCode was preloaded, perform search immediately
  useEffect(() => {
    if (validationSearchCode) {
      setInputCode(validationSearchCode);
      executeSearch(validationSearchCode);
    }
  }, [validationSearchCode]);

  const executeSearch = (codeToSearch: string) => {
    const clean = codeToSearch.trim();
    if (!clean) return;

    setSearchedCode(clean);
    setHasSearched(true);

    const cleanUpper = clean.toUpperCase();
    const match = certificates.find(
      (c) => c.code.toUpperCase() === cleanUpper || c.uuid === clean || c.id === clean
    );

    setFoundCert(match || null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(inputCode);
  };

  const handleQuickTestCode = (code: string) => {
    setInputCode(code);
    setValidationSearchCode(code);
    executeSearch(code);
  };

  // Run integrity and status evaluation
  const integrityResult = foundCert ? checkCertificateIntegrity(foundCert.code) : null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-4xl mx-auto w-full">
      {/* Header Banner */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50 text-xs font-bold shadow-xs">
          <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Serviço Público de Autenticação e Integridade</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
          Validação de Certificados
        </h1>

        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
          Consulte a autenticidade, vigência e integridade de certificados de conclusão emitidos por meio do código público ou UUID.
        </p>
      </div>

      {/* Main Search Input Form */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              required
              id="input-validation-code"
              placeholder="Digite o código (ex: CERT-2026-A8F42X) ou UUID..."
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 text-sm sm:text-base font-mono font-bold tracking-wider uppercase rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            id="btn-verificar-codigo"
            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm sm:text-base rounded-2xl shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Validar Certificado</span>
          </button>
        </form>

        {/* Quick Test Demo Codes for all 4 states */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Casos de teste disponíveis:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              id="test-code-valid"
              onClick={() => handleQuickTestCode('CERT-2026-A8F42X')}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-mono text-[11px] hover:bg-emerald-100 transition-colors"
            >
              Válido (A8F42X)
            </button>
            <button
              type="button"
              id="test-code-expired"
              onClick={() => handleQuickTestCode('CERT-2025-EXP999')}
              className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-mono text-[11px] hover:bg-amber-100 transition-colors"
            >
              Expirado (EXP999)
            </button>
            <button
              type="button"
              id="test-code-cancelled"
              onClick={() => handleQuickTestCode('CERT-2026-C4N15Q')}
              className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-mono text-[11px] hover:bg-rose-100 transition-colors"
            >
              Cancelado (C4N15Q)
            </button>
            <button
              type="button"
              id="test-code-notfound"
              onClick={() => handleQuickTestCode('CERT-0000-INEXISTENTE')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[11px] hover:bg-slate-200 transition-colors"
            >
              Não encontrado
            </button>
          </div>
        </div>
      </div>

      {/* Validation Result Box */}
      {hasSearched && (
        <div className="space-y-6">
          {!foundCert ? (
            /* 1. CERTIFICADO NÃO ENCONTRADO */
            <div
              id="status-not-found"
              className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-300 dark:border-slate-700 p-6 sm:p-8 shadow-sm space-y-4 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center mx-auto">
                <XCircle className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">
                  Resultado da Consulta
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  Certificado não encontrado
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto pt-1">
                  Não foi localizado nenhum certificado cadastrado com o código ou identificador informado{' '}
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    "{searchedCode}"
                  </span>
                  .
                </p>
              </div>

              <div className="pt-2 text-xs text-slate-400 max-w-md mx-auto">
                Certifique-se de que digitou o código exatamente como consta no documento impresso ou digital.
              </div>
            </div>
          ) : integrityResult?.isCancelled || integrityResult?.hasBeenTampered ? (
            /* 2. CERTIFICADO CANCELADO */
            <div
              id="status-cancelled"
              className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-rose-500 p-6 sm:p-8 shadow-sm space-y-6"
            >
              {/* Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-rose-100 dark:border-rose-950">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                    <Ban className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                      Status do Documento
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-rose-700 dark:text-rose-400">
                      Certificado cancelado
                    </h2>
                  </div>
                </div>

                <div className="font-mono text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
                  Código: {foundCert.code}
                </div>
              </div>

              {/* Public Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    Aluno Associado
                  </span>
                  <p className="text-base font-bold text-slate-900 dark:text-white">
                    {foundCert.studentName}
                  </p>
                  {foundCert.studentDocument && (
                    <p className="text-xs text-slate-500 font-mono">
                      Documento: {maskDocumentNumber(foundCert.studentDocument)}
                    </p>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-slate-500" />
                    Curso
                  </span>
                  <p className="text-base font-bold text-slate-900 dark:text-white">
                    {foundCert.courseName}
                  </p>
                  <p className="text-xs text-slate-500">
                    Carga Horária: {foundCert.workloadHours} horas
                  </p>
                </div>
              </div>

              {/* Cancellation Reason Notice */}
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 space-y-1.5">
                <span className="text-xs font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  Motivo do Registro de Anulação
                </span>
                <p className="text-xs text-rose-800 dark:text-rose-300">
                  {foundCert.cancellationReason || 'Documento revogado formalmente pela instituição emissora.'}
                </p>
                {foundCert.cancelledAt && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400">
                    Data do cancelamento: {new Date(foundCert.cancelledAt).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            </div>
          ) : integrityResult?.isExpired ? (
            /* 3. CERTIFICADO EXPIRADO */
            <div
              id="status-expired"
              className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-amber-500 p-6 sm:p-8 shadow-sm space-y-6"
            >
              {/* Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-amber-100 dark:border-amber-950">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Clock className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                      Validade Expirada
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-amber-700 dark:text-amber-400">
                      Certificado expirado
                    </h2>
                  </div>
                </div>

                <div className="font-mono text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
                  Código: {foundCert.code}
                </div>
              </div>

              {/* Public Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-500" />
                    Aluno Certificado
                  </span>
                  <p className="text-base font-bold text-slate-900 dark:text-white">
                    {foundCert.studentName}
                  </p>
                  {foundCert.studentDocument && (
                    <p className="text-xs text-slate-500 font-mono">
                      Documento: {maskDocumentNumber(foundCert.studentDocument)}
                    </p>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    Curso & Carga Horária
                  </span>
                  <p className="text-base font-bold text-slate-900 dark:text-white">
                    {foundCert.courseName}
                  </p>
                  <p className="text-xs text-slate-500">
                    Carga Horária: {foundCert.workloadHours} horas
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-amber-500" />
                    Instituição Emissora
                  </span>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {foundCert.institutionName}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                    Prazos de Vigência
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300">
                    Emissão: {new Date(foundCert.issueDate + 'T12:00:00Z').toLocaleDateString('pt-BR')}
                  </p>
                  {foundCert.expiresAt && (
                    <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                      Validade expirada em: {new Date(foundCert.expiresAt + 'T12:00:00Z').toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
              </div>

              {/* Expiration Notice */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-300">
                Este certificado concluiu o período de vigência estipulado para a habilitação profissional. Para renovação, consulte a instituição emissora.
              </div>
            </div>
          ) : (
            /* 4. CERTIFICADO VÁLIDO */
            <div
              id="status-valid"
              className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-emerald-500 p-6 sm:p-8 shadow-sm space-y-6"
            >
              {/* Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-emerald-100 dark:border-emerald-950">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                      Autenticidade & Integridade Confirmadas
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                      Certificado válido
                    </h2>
                  </div>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-1">
                  <div className="font-mono text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
                    Código: {foundCert.code}
                  </div>
                </div>
              </div>

              {/* Public Verified Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-500" />
                    Aluno Certificado
                  </span>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white">
                    {foundCert.studentName}
                  </p>
                  {foundCert.studentDocument && (
                    <p className="text-xs text-slate-500 font-mono">
                      Documento: {maskDocumentNumber(foundCert.studentDocument)}
                    </p>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-indigo-500" />
                    Curso Concluído
                  </span>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white">
                    {foundCert.courseName}
                  </p>
                  <p className="text-xs text-slate-500">
                    Modalidade: {foundCert.modality === 'online' ? 'Online' : foundCert.modality === 'presencial' ? 'Presencial' : 'Híbrida'}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-indigo-500" />
                    Instituição Emissora
                  </span>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {foundCert.institutionName}
                  </p>
                  <p className="text-xs text-slate-500">
                    Instrutor: {foundCert.instructorName}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    Carga Horária & Emissão
                  </span>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {foundCert.workloadHours} horas de formação
                  </p>
                  <p className="text-xs text-slate-500">
                    Data de Emissão: {new Date(foundCert.issueDate + 'T12:00:00Z').toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {/* View Official Document Action */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500">
                  Documento com selo digital e verificação de integridade ativa.
                </span>

                <button
                  type="button"
                  id="btn-visualizar-doc-publico"
                  onClick={() => setActiveModalCert(foundCert)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Visualizar Documento Oficial</span>
                </button>
              </div>
            </div>
          )}

          {/* Privacy and Security Notice (Non-substitution clause) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Nota de Segurança e Privacidade:</strong> A validação criptográfica verifica a integridade dos dados registrados no ato da emissão e assegura a detecção de alterações não autorizadas. O hash de integridade opera como selo de consistência e não substitui os controles de autenticação, autorização ou a segurança física e lógica da infraestrutura de dados. Hashes internos e credenciais sensíveis são protegidos e não expostos publicamente.
            </p>
          </div>
        </div>
      )}

      {/* Modal View for Certificate if clicked */}
      {activeModalCert && (
        <CertificateModal
          certificate={activeModalCert}
          onClose={() => setActiveModalCert(null)}
        />
      )}
    </div>
  );
};
