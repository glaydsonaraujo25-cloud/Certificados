import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CertificateModal } from '../components/CertificateModal';
import {
  Award,
  BookOpen,
  Users,
  CheckCircle,
  PlusCircle,
  TrendingUp,
  FileCheck,
  Ban,
  ArrowRight,
  ShieldCheck,
  Search,
  Download,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Certificate } from '../types';

export const DashboardView: React.FC = () => {
  const {
    certificates,
    courses,
    students,
    setCurrentView,
    auditLogs,
    setSelectedCertificateId,
    setValidationSearchCode,
  } = useApp();

  const [activeModalCert, setActiveModalCert] = useState<Certificate | null>(null);
  const [quickSearchCode, setQuickSearchCode] = useState('');

  const totalCertificates = certificates.length;
  const activeCertificates = certificates.filter((c) => c.status === 'active').length;
  const cancelledCertificates = certificates.filter((c) => c.status === 'cancelled').length;
  const totalCourses = courses.length;
  const totalStudents = students.length;

  const recentCertificates = [...certificates]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const handleQuickValidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearchCode.trim()) {
      setValidationSearchCode(quickSearchCode.trim().toUpperCase());
      setCurrentView('validate');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>CertifyAI — Emissão Inteligente com QR Code</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Painel de Controle & Emissão
          </h1>
          <p className="text-sm text-indigo-100/80 leading-relaxed">
            Gerencie cursos, alunos e emita certificados verificáveis com códigos únicos de autenticidade, selos personalizáveis e integração de IA.
          </p>
        </div>

        {/* Quick action buttons in banner */}
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setCurrentView('create-certificate')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-950 font-bold text-sm shadow-md hover:bg-indigo-50 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-4 h-4 text-indigo-600" />
            <span>Emitir Certificado</span>
          </button>

          <button
            onClick={() => setCurrentView('validate')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-700/60 hover:bg-indigo-700 text-white font-medium text-sm border border-indigo-500/40 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>Validador Público</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Certificates */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Certificados Emitidos
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {totalCertificates}
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{activeCertificates} ativos ({cancelledCertificates} revogados)</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Total Courses */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Cursos Cadastrados
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {totalCourses}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Online, Presencial e Híbrido
            </p>
          </div>
        </div>

        {/* Metric 3: Total Students */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Alunos Registrados
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {totalStudents}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Prontos para certificação
            </p>
          </div>
        </div>

        {/* Metric 4: Autenticidade & Validações */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-500/30 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Taxa de Autenticidade
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              100%
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              QR Code e Código Único
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Certificates & Quick Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Certificates Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base text-slate-900 dark:text-white">
                Últimos Certificados Emitidos
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Acompanhe o status e faça download rápido em PDF
              </p>
            </div>
            <button
              onClick={() => setCurrentView('certificates')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Ver todos ({totalCertificates})
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentCertificates.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                Nenhum certificado emitido ainda. Clique em "Emitir Certificado" para começar.
              </div>
            ) : (
              recentCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {cert.studentName}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          cert.status === 'active'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {cert.status === 'active' ? 'Ativo' : 'Cancelado'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>{cert.courseName}</span>
                      <span>•</span>
                      <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                        {cert.code}
                      </span>
                      <span>•</span>
                      <span>{cert.workloadHours}h</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveModalCert(cert)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-semibold transition-colors"
                    >
                      Visualizar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: Quick Tools (Validator + Audit Logs) */}
        <div className="space-y-6">
          {/* Quick Validator Form */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Validação Rápida
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Digite o código de autenticidade impresso no certificado para conferir a validade.
            </p>

            <form onSubmit={handleQuickValidate} className="space-y-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ex: CERT-2026-A8F42X"
                  value={quickSearchCode}
                  onChange={(e) => setQuickSearchCode(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs font-mono uppercase rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:normal-case placeholder:font-sans focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Verificar Autenticidade
              </button>
            </form>
          </div>

          {/* Recent Audit Activities */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
              <span>Atividades Recentes</span>
              <span className="text-[11px] font-normal text-slate-400">Auditoria</span>
            </h3>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {auditLogs.slice(0, 4).map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        log.action === 'issued'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : log.action === 'cancelled'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          : log.action === 'tamper_detected'
                          ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
                          : log.action === 'integrity_verified'
                          ? 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300'
                          : log.action === 'duplicated'
                          ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                          : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                      }`}
                    >
                      {log.action === 'issued'
                        ? 'Emissão'
                        : log.action === 'cancelled'
                        ? 'Cancelamento'
                        : log.action === 'tamper_detected'
                        ? 'Alerta'
                        : log.action === 'integrity_verified'
                        ? 'Integridade'
                        : log.action === 'duplicated'
                        ? 'Duplicação'
                        : 'Atualização'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-tight">
                    {log.details}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for full certificate view & download */}
      {activeModalCert && (
        <CertificateModal
          certificate={activeModalCert}
          onClose={() => setActiveModalCert(null)}
        />
      )}
    </div>
  );
};
