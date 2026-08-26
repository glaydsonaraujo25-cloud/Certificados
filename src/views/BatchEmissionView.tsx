import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Certificate } from '../types';
import { CertificateModal } from '../components/CertificateModal';
import confetti from 'canvas-confetti';
import {
  Layers,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Download,
  Trash2,
  Eye,
  Plus,
  FileCheck,
  Loader2,
  RefreshCw,
  Sparkles,
  Info,
} from 'lucide-react';

interface BatchRow {
  id: string;
  studentName: string;
  studentEmail: string;
  studentDocument: string;
  courseName: string;
  workloadHours: number;
  startDate: string;
  endDate: string;
  instructorName: string;
  status: 'valid' | 'invalid';
  errorMsg?: string;
}

export const BatchEmissionView: React.FC = () => {
  const {
    institution,
    issueCertificate,
    courses,
    setCurrentView,
  } = useApp();

  const [batchRows, setBatchRows] = useState<BatchRow[]>([
    {
      id: 'row-1',
      studentName: 'Gabriel Medeiros Santos',
      studentEmail: 'gabriel.santos@email.com',
      studentDocument: '111.222.333-44',
      courseName: courses[0]?.name || 'Introdução à Inteligência Artificial & LLMs',
      workloadHours: courses[0]?.workloadHours || 40,
      startDate: '2026-01-10',
      endDate: '2026-02-15',
      instructorName: courses[0]?.instructorName || 'Prof. Carlos Eduardo',
      status: 'valid',
    },
    {
      id: 'row-2',
      studentName: 'Juliana Paes de Oliveira',
      studentEmail: 'juliana.oliveira@email.com',
      studentDocument: '555.666.777-88',
      courseName: courses[0]?.name || 'Introdução à Inteligência Artificial & LLMs',
      workloadHours: courses[0]?.workloadHours || 40,
      startDate: '2026-01-10',
      endDate: '2026-02-15',
      instructorName: courses[0]?.instructorName || 'Prof. Carlos Eduardo',
      status: 'valid',
    },
    {
      id: 'row-3',
      studentName: 'Lucas Ferreira Castro',
      studentEmail: 'lucas.castro@email.com',
      studentDocument: '999.888.777-66',
      courseName: courses[1]?.name || 'Desenvolvimento Web Full Stack Moderno',
      workloadHours: courses[1]?.workloadHours || 80,
      startDate: '2026-01-05',
      endDate: '2026-02-20',
      instructorName: courses[1]?.instructorName || 'Mariana Duarte',
      status: 'valid',
    },
  ]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [issuedResults, setIssuedResults] = useState<Certificate[]>([]);
  const [selectedCertForModal, setSelectedCertForModal] = useState<Certificate | null>(null);

  // Validate a single row
  const validateRow = (row: Partial<BatchRow>): { status: 'valid' | 'invalid'; errorMsg?: string } => {
    if (!row.studentName || !row.studentName.trim()) {
      return { status: 'invalid', errorMsg: 'Nome do aluno obrigatório' };
    }
    if (!row.courseName || !row.courseName.trim()) {
      return { status: 'invalid', errorMsg: 'Nome do curso obrigatório' };
    }
    if (!row.workloadHours || row.workloadHours <= 0) {
      return { status: 'invalid', errorMsg: 'Carga horária inválida' };
    }
    return { status: 'valid' };
  };

  // CSV Import Parser
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        alert('O arquivo CSV parece estar vazio ou contém apenas o cabeçalho.');
        return;
      }

      // Check header
      const rows: BatchRow[] = [];
      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(/[,;]/).map((c) => c.replace(/^["']|["']$/g, '').trim());
        if (cols.length >= 2) {
          const studentName = cols[0] || '';
          const studentEmail = cols[1] || '';
          const studentDocument = cols[2] || '';
          const courseName = cols[3] || courses[0]?.name || 'Curso';
          const workloadHours = parseInt(cols[4], 10) || 40;
          const startDate = cols[5] || '2026-01-10';
          const endDate = cols[6] || '2026-02-15';
          const instructorName = cols[7] || institution.signatoryName || 'Prof. Instrutor';

          const val = validateRow({ studentName, courseName, workloadHours });
          rows.push({
            id: `row-csv-${i}-${Date.now()}`,
            studentName,
            studentEmail,
            studentDocument,
            courseName,
            workloadHours,
            startDate,
            endDate,
            instructorName,
            status: val.status,
            errorMsg: val.errorMsg,
          });
        }
      }

      if (rows.length > 0) {
        setBatchRows(rows);
        setIssuedResults([]);
      }
    };
    reader.readAsText(file);
  };

  // Download Sample CSV
  const handleDownloadSampleCsv = () => {
    const csvContent =
      'nome_aluno,email,documento,curso,carga_horaria,data_inicio,data_fim,instrutor\n' +
      'Maria Fernanda Silva,maria.silva@email.com,123.456.789-00,Introdução à Inteligência Artificial & LLMs,40,2026-01-10,2026-02-15,Prof. Carlos Eduardo\n' +
      'Rodrigo Augusto Ribeiro,rodrigo.ribeiro@email.com,234.567.890-11,Desenvolvimento Web Full Stack Moderno,80,2026-01-05,2026-02-20,Mariana Duarte\n' +
      'Carla Beatriz Nunes,carla.nunes@email.com,345.678.901-22,UI/UX Design & Design Systems,32,2026-01-20,2026-02-18,Rodrigo Lima\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'modelo_importacao_certificados.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add Empty Row
  const handleAddRow = () => {
    const newRow: BatchRow = {
      id: `row-${Date.now()}`,
      studentName: '',
      studentEmail: '',
      studentDocument: '',
      courseName: courses[0]?.name || 'Introdução à Inteligência Artificial & LLMs',
      workloadHours: courses[0]?.workloadHours || 40,
      startDate: '2026-01-10',
      endDate: '2026-02-15',
      instructorName: courses[0]?.instructorName || institution.signatoryName || '',
      status: 'invalid',
      errorMsg: 'Preencha o nome do aluno',
    };
    setBatchRows([...batchRows, newRow]);
  };

  const handleUpdateRow = (id: string, updates: Partial<BatchRow>) => {
    setBatchRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const merged = { ...r, ...updates };
        const val = validateRow(merged);
        return {
          ...merged,
          status: val.status,
          errorMsg: val.errorMsg,
        };
      })
    );
  };

  const handleDeleteRow = (id: string) => {
    setBatchRows(batchRows.filter((r) => r.id !== id));
  };

  // Execute Batch Issuance
  const handleProcessBatch = async () => {
    const validRows = batchRows.filter((r) => r.status === 'valid');
    if (validRows.length === 0) {
      alert('Nenhum registro válido para emissão. Corrija os erros na tabela.');
      return;
    }

    setIsProcessing(true);
    const results: Certificate[] = [];

    for (const row of validRows) {
      try {
        const cert = issueCertificate({
          studentId: `batch-std-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          studentName: row.studentName.trim(),
          studentEmail: row.studentEmail.trim() || undefined,
          studentDocument: row.studentDocument.trim() || undefined,
          courseId: `batch-crs-${Date.now()}`,
          courseName: row.courseName.trim(),
          workloadHours: row.workloadHours,
          modality: 'online',
          instructorName: row.instructorName.trim() || 'Prof. Instrutor',
          institutionName: institution.name || 'Tech Academy Brasil',
          institutionLogoUrl: institution.logoUrl,
          issueDate: new Date().toISOString().split('T')[0],
          startDate: row.startDate,
          endDate: row.endDate,
          location: `${institution.city || 'São Paulo'}, ${institution.state || 'SP'}`,
          signatoryName: institution.signatoryName || 'Dra. Maria Souza',
          signatoryRole: institution.signatoryRole || 'Diretora Acadêmica',
          signatureImageUrl: institution.signatureImageUrl,
          secondSignatoryName: institution.showSecondSignature ? institution.secondSignatureName : undefined,
          secondSignatoryRole: institution.showSecondSignature ? institution.secondSignatureRole : undefined,
          secondSignatureImageUrl: institution.showSecondSignature ? institution.secondSignatureImageUrl : undefined,
          customText: institution.defaultCertificateText,
          templateId: 'official',
        });
        results.push(cert);
      } catch (err) {
        console.error('Error issuing batch certificate:', err);
      }
    }

    setIssuedResults(results);
    setIsProcessing(false);

    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  const validCount = batchRows.filter((r) => r.status === 'valid').length;
  const invalidCount = batchRows.filter((r) => r.status === 'invalid').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-semibold text-xs">
              Emissão Padronizada em Massa
            </span>
            <span className="text-xs text-slate-400">• Modelo Oficial Único</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mt-1">
            Emissão em Lote de Certificados
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Importe planilhas CSV ou preencha a grade de alunos para emitir dezenas de certificados oficiais em segundos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadSampleCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Baixar Planilha Modelo (.CSV)</span>
          </button>

          <label className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Importar Arquivo CSV</span>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Prontos para emissão: <strong className="text-emerald-600 font-bold">{validCount}</strong>
            </span>
          </div>

          {invalidCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Com pendências: <strong className="text-rose-600 font-bold">{invalidCount}</strong>
              </span>
            </div>
          )}

          <div className="text-xs text-slate-500">
            Total na grade: <strong>{batchRows.length}</strong>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddRow}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Linha</span>
          </button>

          <button
            type="button"
            onClick={handleProcessBatch}
            disabled={isProcessing || validCount === 0}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>Emitir {validCount} Certificado(s) em Lote</span>
          </button>
        </div>
      </div>

      {/* Batch Grid Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4 w-10">Status</th>
                <th className="py-3 px-4 min-w-[200px]">Nome do Aluno *</th>
                <th className="py-3 px-4 min-w-[160px]">E-mail</th>
                <th className="py-3 px-4 min-w-[130px]">CPF / Doc</th>
                <th className="py-3 px-4 min-w-[200px]">Curso *</th>
                <th className="py-3 px-4 w-24">Carga (h) *</th>
                <th className="py-3 px-4 min-w-[120px]">Data Conclusão</th>
                <th className="py-3 px-4 w-12 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {batchRows.map((row, idx) => (
                <tr
                  key={row.id}
                  className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors ${
                    row.status === 'invalid' ? 'bg-rose-50/20 dark:bg-rose-950/10' : ''
                  }`}
                >
                  <td className="py-2.5 px-4 text-center">
                    {row.status === 'valid' ? (
                      <span title="Pronto para emissão">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 inline" />
                      </span>
                    ) : (
                      <span title={row.errorMsg || 'Dados incompletos'}>
                        <AlertTriangle className="w-4 h-4 text-rose-500 inline" />
                      </span>
                    )}
                  </td>

                  <td className="py-2.5 px-4">
                    <input
                      type="text"
                      value={row.studentName}
                      onChange={(e) => handleUpdateRow(row.id, { studentName: e.target.value })}
                      placeholder="Nome completo..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </td>

                  <td className="py-2.5 px-4">
                    <input
                      type="email"
                      value={row.studentEmail}
                      onChange={(e) => handleUpdateRow(row.id, { studentEmail: e.target.value })}
                      placeholder="aluno@email.com"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </td>

                  <td className="py-2.5 px-4">
                    <input
                      type="text"
                      value={row.studentDocument}
                      onChange={(e) => handleUpdateRow(row.id, { studentDocument: e.target.value })}
                      placeholder="123.456.789-00"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </td>

                  <td className="py-2.5 px-4">
                    <input
                      type="text"
                      value={row.courseName}
                      onChange={(e) => handleUpdateRow(row.id, { courseName: e.target.value })}
                      placeholder="Nome do curso..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </td>

                  <td className="py-2.5 px-4">
                    <input
                      type="number"
                      min={1}
                      value={row.workloadHours}
                      onChange={(e) =>
                        handleUpdateRow(row.id, { workloadHours: parseInt(e.target.value, 10) || 0 })
                      }
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-center focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono"
                    />
                  </td>

                  <td className="py-2.5 px-4">
                    <input
                      type="date"
                      value={row.endDate}
                      onChange={(e) => handleUpdateRow(row.id, { endDate: e.target.value })}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    />
                  </td>

                  <td className="py-2.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleDeleteRow(row.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                      title="Remover linha"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Success Emission Report Section */}
      {issuedResults.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-emerald-200 dark:border-emerald-900 shadow-md space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100 dark:border-emerald-950 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-slate-900 dark:text-white">
                  Lote Concluído: {issuedResults.length} Certificado(s) Emitido(s) com Sucesso!
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Todos os certificados foram gerados com o Modelo Oficial, hashes de segurança e QR Codes.
                </p>
              </div>
            </div>

            <button
              onClick={() => setCurrentView('certificates')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors"
            >
              <FileCheck className="w-4 h-4" />
              <span>Ver em Certificados Emitidos</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {issuedResults.map((cert) => (
              <div
                key={cert.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 hover:border-indigo-500/50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {cert.studentName}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">{cert.courseName}</p>
                  <span className="font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                    {cert.code}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCertForModal(cert)}
                  className="p-2 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 transition-colors shadow-xs shrink-0"
                  title="Visualizar Certificado Oficial"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal for single view */}
      {selectedCertForModal && (
        <CertificateModal
          certificate={selectedCertForModal}
          onClose={() => setSelectedCertForModal(null)}
        />
      )}
    </div>
  );
};
