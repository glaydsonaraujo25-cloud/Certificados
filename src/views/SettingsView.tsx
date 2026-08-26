import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CertificateDocument } from '../components/CertificateDocument';
import {
  Building2,
  Save,
  RotateCcw,
  Trash2,
  CheckCircle,
  FileSignature,
  Globe,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  Shield,
  Info,
  Sun,
  Moon,
  Palette,
  Award,
  Upload,
  Layers,
  Lock,
  Users,
  Eye,
  Sliders,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    institution,
    updateInstitution,
    resetToDemoData,
    clearAllData,
    theme,
    toggleTheme,
    user,
    switchUserRole,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'model' | 'institution' | 'access' | 'appearance' | 'data'>('model');

  // Institution Form
  const [name, setName] = useState(institution.name);
  const [institutionCnpj, setInstitutionCnpj] = useState(institution.institutionCnpj || '21.744.847/0001-50');
  const [email, setEmail] = useState(institution.email || '');
  const [phone, setPhone] = useState(institution.phone || '');
  const [website, setWebsite] = useState(institution.website || '');
  const [city, setCity] = useState(institution.city || 'Brasília');
  const [state, setState] = useState(institution.state || 'DF');

  // Official Model Settings
  const [logoUrl, setLogoUrl] = useState(institution.logoUrl || '');
  const [signatoryName, setSignatoryName] = useState(institution.signatoryName || 'Carlos Henrique Ferreira De Mello');
  const [signatoryRole, setSignatoryRole] = useState(institution.signatoryRole || 'Diretor Geral');
  const [signatoryCpf, setSignatoryCpf] = useState(institution.signatoryCpf || '981.050.007-68');
  const [signatureImageUrl, setSignatureImageUrl] = useState(institution.signatureImageUrl || '');

  const [legalInstruction, setLegalInstruction] = useState(
    institution.legalInstruction || 'Instrução Nº 592, de 10 de agosto de 2020/Detran-DF'
  );
  const [contranResolution, setContranResolution] = useState(
    institution.contranResolution || 'Resolução Nº 1.020/2025 do CONTRAN'
  );
  const [validityText, setValidityText] = useState(
    institution.validityText || 'com validade de cinco anos após o término do curso'
  );

  const [codeFormat, setCodeFormat] = useState<'sequential' | 'alphanumeric' | 'cvte'>(
    institution.codeFormat || 'cvte'
  );
  const [sealText, setSealText] = useState(institution.sealText || 'DOCUMENTO AUTÊNTICO • IET FORTE CAXIAS');
  const [defaultCertificateText, setDefaultCertificateText] = useState(
    institution.defaultCertificateText ||
      'A Instituição de Ensino de Trânsito da Base Administrativa do Quartel-General do Exército – Forte Caxias – ([INSTRUÇÃO]) certifica que [NOME DO ALUNO], inscrito no CPF nº [CPF] e no Nº REGISTRO [Nº REGISTRO], categoria “[CATEGORIA]”, concluiu com aproveitamento o [NOME DO CURSO], ministrado pela IET - Forte Caxias, no período de [DATA INICIAL] a [DATA FINAL], com carga horária de [CARGA HORÁRIA]h/a, [VALIDADE], conforme [RESOLUÇÃO].'
  );

  const [savedSuccess, setSavedSuccess] = useState(false);
  const isAdmin = user?.role === 'admin';

  // Handle Logo Upload (Base64 data URL)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setLogoUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Signature Upload (Base64 data URL)
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setSignatureImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Insert Variable helper into text
  const insertVariable = (variableTag: string) => {
    setDefaultCertificateText((prev) => `${prev} ${variableTag}`);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Apenas usuários com perfil de Administrador podem alterar as configurações do Modelo Oficial.');
      return;
    }

    updateInstitution({
      name,
      institutionCnpj,
      logoUrl,
      email,
      phone,
      website,
      city,
      state,
      signatoryName,
      signatoryRole,
      signatoryCpf,
      signatureImageUrl,
      legalInstruction,
      contranResolution,
      validityText,
      codeFormat,
      sealText,
      defaultCertificateText,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleReset = () => {
    if (confirm('Deseja restaurar todos os cursos, alunos e certificados padrão de demonstração?')) {
      resetToDemoData();
      alert('Dados de demonstração restaurados com sucesso!');
      window.location.reload();
    }
  };

  const handleClear = () => {
    if (confirm('ATENÇÃO: Deseja apagar todos os dados salvos localmente? Esta ação é irreversível.')) {
      clearAllData();
      alert('Todos os dados foram excluídos.');
      window.location.reload();
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Configurações & Modelo Oficial
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gerencie o layout fixo do certificado oficial, logo, assinaturas digitais, textos institucionais e permissões.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold animate-in fade-in shadow-xs">
            <CheckCircle className="w-4 h-4" />
            <span>Configurações salvas com sucesso!</span>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('model')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'model'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Modelo Oficial do Certificado</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('institution')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'institution'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Dados da Instituição</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('access')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'access'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Controle de Acesso (RBAC)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('appearance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'appearance'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Aparência</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('data')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'data'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Backup & Dados</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: MODELO OFICIAL */}
        {activeTab === 'model' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Warning if not admin */}
            {!isAdmin && (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 flex items-center gap-3 text-xs text-amber-800 dark:text-amber-200">
                <Lock className="w-4 h-4 shrink-0 text-amber-600" />
                <div>
                  <strong>Modo Somente Leitura:</strong> Você está conectado com perfil de <strong>Operador</strong>. Apenas <strong>Administradores</strong> podem alterar o layout e os parâmetros do modelo oficial.
                </div>
              </div>
            )}

            {/* 1. Logotipo Oficial */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h2 className="font-bold text-base text-slate-900 dark:text-white">
                    1. Logotipo Oficial da Instituição
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Exibido no cabeçalho do certificado A4 oficial.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      URL da Imagem da Logo
                    </label>
                    <input
                      type="url"
                      disabled={!isAdmin}
                      placeholder="https://exemplo.com/logo.png"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Ou Fazer Upload de Arquivo (PNG, JPG ou SVG)
                    </label>
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Selecionar Logo do Computador</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={!isAdmin}
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    {logoUrl && (
                      <button
                        type="button"
                        onClick={() => setLogoUrl('')}
                        className="ml-2 text-xs text-rose-500 hover:underline"
                      >
                        Remover
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center min-h-[100px]">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2">
                    Prévia da Logo no Certificado
                  </span>
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logo da Instituição"
                      className="max-h-14 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                      <Award className="w-6 h-6 text-amber-400" />
                      <span>Brasão Oficial Padrão (Sem imagem carregada)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. Assinatura Oficial do Diretor Geral */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <FileSignature className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <div>
                  <h2 className="font-bold text-base text-slate-900 dark:text-white">
                    2. Assinatura Oficial do Diretor Geral & Autenticação
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Defina os dados do signatário oficial responsável pela emissão dos certificados.
                  </p>
                </div>
              </div>

              {/* Primary Signature */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  Diretor Geral / Responsável Oficial
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Nome do Diretor Geral
                    </label>
                    <input
                      type="text"
                      disabled={!isAdmin}
                      value={signatoryName}
                      onChange={(e) => setSignatoryName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Cargo / Função Oficial
                    </label>
                    <input
                      type="text"
                      disabled={!isAdmin}
                      value={signatoryRole}
                      onChange={(e) => setSignatoryRole(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      CPF do Diretor
                    </label>
                    <input
                      type="text"
                      disabled={!isAdmin}
                      value={signatoryCpf}
                      onChange={(e) => setSignatoryCpf(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-amber-500 focus:outline-hidden font-mono"
                    />
                  </div>
                  <div className="md:col-span-3 flex flex-wrap items-center gap-3 pt-1">
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload de Rubrica / Assinatura Digital Oficial</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={!isAdmin}
                        onChange={handleSignatureUpload}
                        className="hidden"
                      />
                    </label>
                    {signatureImageUrl && (
                      <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Imagem de assinatura digital ativa
                        <button
                          type="button"
                          onClick={() => setSignatureImageUrl('')}
                          className="ml-1 text-rose-500 hover:underline"
                        >
                          (Remover)
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Fundamentação Legal & Normativas Oficiais */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Sliders className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <div>
                  <h2 className="font-bold text-base text-slate-900 dark:text-white">
                    3. Fundamentação Legal Padrão & Diretrizes
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Instrução normativa de homologação do Detran, Resolução CONTRAN e prazos de validade.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Instrução Normativa de Credenciamento
                  </label>
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={legalInstruction}
                    onChange={(e) => setLegalInstruction(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-hidden disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Resolução do CONTRAN
                  </label>
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={contranResolution}
                    onChange={(e) => setContranResolution(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-hidden disabled:opacity-60"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Texto de Validade do Curso
                  </label>
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={validityText}
                    onChange={(e) => setValidityText(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-hidden disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            {/* 4. Texto Padrão do Certificado */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Sliders className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <div>
                  <h2 className="font-bold text-base text-slate-900 dark:text-white">
                    4. Texto Padrão do Certificado & Variáveis
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    O texto de atestado que será renderizado automaticamente no corpo do documento.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Template de Texto Oficial
                </label>
                <textarea
                  rows={4}
                  disabled={!isAdmin}
                  value={defaultCertificateText}
                  onChange={(e) => setDefaultCertificateText(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-serif leading-relaxed focus:ring-2 focus:ring-amber-500 focus:outline-hidden disabled:opacity-60"
                />
              </div>

              {/* Quick-insert tags */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Clique para inserir uma tag no texto:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    '[NOME DO ALUNO]',
                    '[CPF]',
                    '[Nº REGISTRO]',
                    '[CATEGORIA]',
                    '[NOME DO CURSO]',
                    '[CARGA HORÁRIA]',
                    '[DATA INICIAL]',
                    '[DATA FINAL]',
                    '[INSTRUÇÃO]',
                    '[RESOLUÇÃO]',
                    '[VALIDADE]',
                    '[LOCAL]',
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      disabled={!isAdmin}
                      onClick={() => insertVariable(tag)}
                      className="px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-mono font-medium hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors border border-amber-200 dark:border-amber-800/60 disabled:opacity-50"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. Formato do Código Único */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <div>
                  <h2 className="font-bold text-base text-slate-900 dark:text-white">
                    5. Formato do Código Único Oficial
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Estrutura do código gerado para cada emissão.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Padrão de Código do Certificado
                  </label>
                  <select
                    disabled={!isAdmin}
                    value={codeFormat}
                    onChange={(e) => setCodeFormat(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-hidden disabled:opacity-60 font-mono"
                  >
                    <option value="cvte">Padrão Oficial Militar / CVTE (Ex: 006/CVTE/2026)</option>
                    <option value="sequential">Sequencial Oficial (Ex: CERT-2026-000001)</option>
                    <option value="alphanumeric">Alfanumérico Aleatório (Ex: CERT-2026-A8F42X)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Texto do Selo de Segurança
                  </label>
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={sealText}
                    onChange={(e) => setSealText(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 focus:outline-hidden disabled:opacity-60"
                  />
                </div>
              </div>
            </div>

            {/* 6. Live Mini Preview */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <h2 className="font-bold text-base text-slate-900 dark:text-white">
                    Pré-visualização do Modelo Oficial (Frente)
                  </h2>
                </div>
                <span className="text-xs font-semibold text-slate-500">A4 Paisagem (297x210mm)</span>
              </div>

              <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-center items-center overflow-x-auto">
                <div className="transform scale-[0.65] sm:scale-[0.78] origin-top transition-transform shadow-xl rounded-lg overflow-hidden">
                  <CertificateDocument
                    certificate={{
                      studentName: 'CARLOS HENRIQUE CAETANO DA SILVA',
                      studentDocument: '067.440.731-84',
                      registrationNumber: '07575025319',
                      cnhCategory: 'AD',
                      courseName: 'Curso Especializado para Condutores de Veículos de Transporte de Emergência',
                      courseSubhead: 'Condutores de Veículos de\nTransporte de Emergência',
                      workloadHours: 50,
                      modality: 'presencial',
                      instructorName: 'Paulo de Jesus Camargo / Erik Santiago',
                      institutionName: name,
                      institutionCnpj: institutionCnpj,
                      institutionLogoUrl: logoUrl || undefined,
                      legalInstruction,
                      contranResolution,
                      validityText,
                      issueDate: '2026-06-18',
                      startDate: '2026-06-08',
                      endDate: '2026-06-16',
                      location: `${city || 'Brasília'}-${state || 'DF'}`,
                      signatoryName: signatoryName || 'Carlos Henrique Ferreira De Mello',
                      signatoryRole: signatoryRole || 'Diretor Geral',
                      signatoryCpf: signatoryCpf || '981.050.007-68',
                      signatureImageUrl: signatureImageUrl || undefined,
                      code: '006/CVTE/2026',
                      templateId: 'official',
                    }}
                    elementId="official-model-settings-preview"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DADOS DA INSTITUIÇÃO */}
        {activeTab === 'institution' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h2 className="font-bold text-base text-slate-900 dark:text-white">
                  Dados Cadastrais da Instituição
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Identificação oficial que constará nos certificados e na página de validação pública.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nome Oficial da Instituição / Escola *
                </label>
                <input
                  type="text"
                  required
                  disabled={!isAdmin}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-hidden disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  CNPJ da Instituição
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  placeholder="Ex: 21.744.847/0001-50"
                  value={institutionCnpj}
                  onChange={(e) => setInstitutionCnpj(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden disabled:opacity-60 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  E-mail de Contato
                </label>
                <input
                  type="email"
                  disabled={!isAdmin}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  disabled={!isAdmin}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Website Oficial
                </label>
                <input
                  type="url"
                  disabled={!isAdmin}
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden disabled:opacity-60"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Cidade
                  </label>
                  <input
                    type="text"
                    disabled={!isAdmin}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    UF
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    disabled={!isAdmin}
                    value={state}
                    onChange={(e) => setState(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-center font-bold uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-hidden disabled:opacity-60"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CONTROLE DE ACESSO (RBAC) */}
        {activeTab === 'access' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h2 className="font-bold text-base text-slate-900 dark:text-white">
                  Controle de Acesso & Perfis de Usuário
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Simulação dos níveis de permissão entre Administrador e Operador.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div
                onClick={() => switchUserRole('admin')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  user?.role === 'admin'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <strong className="text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-indigo-600" />
                    Administrador
                  </strong>
                  {user?.role === 'admin' && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                      Ativo
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Acesso total: Configuração do Modelo Oficial, upload de logo e assinaturas, gestão de cursos, alunos, emissão individual e em lote, e cancelamento com registro em auditoria.
                </p>
              </div>

              <div
                onClick={() => switchUserRole('operator')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  user?.role !== 'admin'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <strong className="text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-600" />
                    Operador
                  </strong>
                  {user?.role !== 'admin' && (
                    <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                      Ativo
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Acesso operacional: Cadastrar alunos, emitir certificados preenchendo os dados autorizados, visualizar e exportar PDFs. Bloqueado para alterar o layout do modelo oficial.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: APARÊNCIA */}
        {activeTab === 'appearance' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Palette className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h2 className="font-bold text-base text-slate-900 dark:text-white">
                  Aparência & Tema da Aplicação
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  O <strong>Tema Claro</strong> é o padrão para manter a fidelidade com a impressão do certificado oficial.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (theme !== 'light') toggleTheme();
                }}
                className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  theme === 'light'
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-white shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-sm block">Tema Claro (Recomendado)</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Máxima nitidez e precisão gráfica para emissão e visualização de certificados.
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (theme !== 'dark') toggleTheme();
                }}
                className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  theme === 'dark'
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-white shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="p-2 rounded-lg bg-slate-800 text-indigo-400">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-sm block">Tema Escuro</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Modo escuro para painéis de monitoramento e auditoria em ambientes com pouca luz.
                  </span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* TAB 5: BACKUP & DADOS */}
        {activeTab === 'data' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <h2 className="font-bold text-base text-slate-900 dark:text-white">
                  Gerenciamento de Dados & Restauração
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Opções de redefinição para demonstração e limpeza de armazenamento local.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <button
                type="button"
                onClick={handleReset}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left space-y-1 transition-all"
              >
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                  <RotateCcw className="w-4 h-4" />
                  <span>Restaurar Demonstração Oficial</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Recarrega os cursos e certificados de demonstração pré-configurados.
                </p>
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 text-left space-y-1 transition-all"
              >
                <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                  <Trash2 className="w-4 h-4" />
                  <span>Limpar Todos os Dados</span>
                </div>
                <p className="text-xs text-rose-700 dark:text-rose-400">
                  Remove certificados, alunos e cursos salvos neste navegador.
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Action Button to Save */}
        {isAdmin && (activeTab === 'model' || activeTab === 'institution') && (
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all hover:scale-[1.01]"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Configurações do Modelo Oficial</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
