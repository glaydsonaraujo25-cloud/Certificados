import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ApiKey, ApiRequestLog, ApiScope } from '../types';
import {
  Key,
  ShieldCheck,
  Code2,
  Terminal,
  Activity,
  Copy,
  Check,
  Plus,
  Trash2,
  RefreshCw,
  Play,
  FileCode2,
  Lock,
  Unlock,
  AlertCircle,
  ExternalLink,
  BookOpen,
  Server,
  Layers,
  Send,
  Zap,
  Globe,
  Sliders,
  Webhook,
} from 'lucide-react';

interface EndpointDoc {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'DELETE' | 'PATCH';
  path: string;
  access: 'Público' | 'Protegido';
  scope: ApiScope | 'none';
  description: string;
  defaultParams?: Record<string, string>;
  defaultBody?: any;
  requestHeaders?: Record<string, string>;
  responseExample: any;
}

const API_ENDPOINTS: EndpointDoc[] = [
  {
    id: 'validate-cert',
    name: '1. Validar Certificado (Público)',
    method: 'GET',
    path: '/api/v1/certificates/validate/:codeOrUuid',
    access: 'Público',
    scope: 'none',
    description:
      'Validação pública e segura de autenticidade. Retorna estritamente as informações necessárias e mascara dados sensíveis do aluno (LGPD).',
    defaultParams: {
      codeOrUuid: 'CERT-2026-A8F42X',
    },
    responseExample: {
      success: true,
      data: {
        code: 'CERT-2026-A8F42X',
        uuid: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        status: 'active',
        statusLabel: 'Certificado Válido',
        student: {
          name: 'Lucas Henrique de Almeida',
          documentMasked: '***.456.789-**',
        },
        course: {
          name: 'Desenvolvimento Web Fullstack com React & Node',
          workloadHours: 120,
          modality: 'online',
        },
        institution: {
          name: 'Tech Academy Brasil',
          instructor: 'Prof. Carlos Eduardo Silveira',
        },
        validity: {
          issueDate: '2025-03-20',
          expiresAt: null,
          isExpired: false,
        },
        verification: {
          isAuthentic: true,
          verifiedAt: '2026-08-26T10:35:00.000Z',
        },
      },
    },
  },
  {
    id: 'get-cert-full',
    name: '2. Consultar Certificado Completo',
    method: 'GET',
    path: '/api/v1/certificates/:idOrCode',
    access: 'Protegido',
    scope: 'certificates:read',
    description:
      'Recupera todos os dados estruturados do certificado para sistemas educacionais, ERPs e backends corporativos.',
    defaultParams: {
      idOrCode: 'CERT-2026-A8F42X',
    },
    responseExample: {
      success: true,
      data: {
        id: 'cert-1',
        uuid: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        code: 'CERT-2026-A8F42X',
        studentId: 'student-1',
        studentName: 'Lucas Henrique de Almeida',
        studentDocument: '12345678909',
        courseName: 'Desenvolvimento Web Fullstack com React & Node',
        workloadHours: 120,
        modality: 'online',
        issueDate: '2025-03-20',
        integrityHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        status: 'active',
      },
    },
  },
  {
    id: 'get-cert-status',
    name: '3. Consultar Status & Integridade',
    method: 'GET',
    path: '/api/v1/certificates/:idOrCode/status',
    access: 'Protegido',
    scope: 'certificates:read',
    description:
      'Avalia se o hash SHA-256 é consistente com os dados originais e audita a situação cadastral e vigência.',
    defaultParams: {
      idOrCode: 'CERT-2026-A8F42X',
    },
    responseExample: {
      success: true,
      data: {
        certificateId: 'cert-1',
        code: 'CERT-2026-A8F42X',
        uuid: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        currentStatus: 'active',
        isExpired: false,
        isCancelled: false,
        isAuthentic: true,
        integrity: {
          hashMatches: true,
          algorithm: 'SHA-256',
        },
      },
    },
  },
  {
    id: 'issue-cert',
    name: '4. Emitir Certificado',
    method: 'POST',
    path: '/api/v1/certificates/issue',
    access: 'Protegido',
    scope: 'certificates:write',
    description:
      'Gera um novo certificado oficial com UUID v4, código alfanumérico, cálculo de hash SHA-256 e gravação na trilha de auditoria.',
    defaultBody: {
      studentName: 'Ana Beatriz Vasconcellos',
      studentEmail: 'ana.beatriz@exemplo.com.br',
      studentDocument: '11122233344',
      courseName: 'Arquitetura Cloud & DevOps',
      workloadHours: 60,
      modality: 'online',
      issueDate: '2026-04-10',
      instructorName: 'Prof. Marcos Vinicius',
      institutionName: 'Tech Academy Brasil',
      signatoryName: 'Prof. Marcos Vinicius',
      signatoryRole: 'Coordenador do Curso',
    },
    responseExample: {
      success: true,
      data: {
        id: 'cert-177123894',
        uuid: '550e8400-e29b-41d4-a716-446655440000',
        code: 'CERT-2026-N7X99A',
        status: 'active',
        studentName: 'Ana Beatriz Vasconcellos',
        courseName: 'Arquitetura Cloud & DevOps',
        workloadHours: 60,
        issueDate: '2026-04-10',
        integrityHash: 'a89c72e90f6b78... (64 hex characters)',
        validationUrl: 'https://certify.academy/#validate?code=CERT-2026-N7X99A',
      },
    },
  },
  {
    id: 'create-student',
    name: '5. Criar Aluno',
    method: 'POST',
    path: '/api/v1/students',
    access: 'Protegido',
    scope: 'students:write',
    description:
      'Cadastra um aluno com validação de duplicidade de e-mail e conferência de documento.',
    defaultBody: {
      fullName: 'Rodrigo Mendonça Prado',
      email: 'rodrigo.mendonca@exemplo.com.br',
      documentNumber: '33344455566',
      notes: 'Matrícula integrada via Moodle LMS',
    },
    responseExample: {
      success: true,
      data: {
        id: 'student-177123999',
        fullName: 'Rodrigo Mendonça Prado',
        email: 'rodrigo.mendonca@exemplo.com.br',
        documentNumber: '33344455566',
        createdAt: '2026-08-26T10:35:00.000Z',
      },
    },
  },
  {
    id: 'get-courses',
    name: '6. Consultar Cursos Disponíveis',
    method: 'GET',
    path: '/api/v1/courses',
    access: 'Protegido',
    scope: 'courses:read',
    description:
      'Lista os cursos cadastrados na instituição, carga horária e contadores de certificados emitidos.',
    responseExample: {
      success: true,
      data: [
        {
          id: 'course-1',
          name: 'Desenvolvimento Web Fullstack com React & Node',
          workloadHours: 120,
          modality: 'online',
          instructorName: 'Prof. Carlos Eduardo Silveira',
          certificatesIssuedCount: 2,
        },
      ],
    },
  },
  {
    id: 'cancel-cert',
    name: '7. Cancelar / Revogar Certificado',
    method: 'POST',
    path: '/api/v1/certificates/:id/cancel',
    access: 'Protegido',
    scope: 'certificates:admin',
    description:
      'Anula formalmente um certificado no validador público por motivo disciplinar, inconsistência de notas ou erro cadastral.',
    defaultParams: {
      id: 'cert-1',
    },
    defaultBody: {
      reason: 'Inconsistência identificada nas horas complementares pelo conselho acadêmico.',
    },
    responseExample: {
      success: true,
      data: {
        id: 'cert-1',
        code: 'CERT-2026-A8F42X',
        status: 'cancelled',
        cancelledAt: '2026-08-26T10:35:00.000Z',
        cancellationReason: 'Inconsistência identificada nas horas complementares.',
      },
    },
  },
];

export const ApiManagementView: React.FC = () => {
  const { user } = useApp();

  const [activeTab, setActiveTab] = useState<'docs' | 'keys' | 'logs' | 'integrations'>('docs');
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDoc>(API_ENDPOINTS[0]);

  // Keys Management State
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyIntegration, setNewKeyIntegration] = useState<ApiKey['integrationType']>('moodle');
  const [newKeyRateLimit, setNewKeyRateLimit] = useState(60);
  const [newKeyScopes, setNewKeyScopes] = useState<ApiScope[]>([
    'certificates:read',
    'certificates:write',
    'students:read',
    'courses:read',
  ]);
  const [justGeneratedKey, setJustGeneratedKey] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Playground State
  const [playgroundAuthKey, setPlaygroundAuthKey] = useState<string>('');
  const [playgroundUseAuth, setPlaygroundUseAuth] = useState(true);
  const [playgroundParams, setPlaygroundParams] = useState<Record<string, string>>({});
  const [playgroundBody, setPlaygroundBody] = useState<string>('');
  const [playgroundResponse, setPlaygroundResponse] = useState<any>(null);
  const [playgroundStatus, setPlaygroundStatus] = useState<number | null>(null);
  const [playgroundTimeMs, setPlaygroundTimeMs] = useState<number | null>(null);
  const [playgroundHeaders, setPlaygroundHeaders] = useState<Record<string, string>>({});
  const [playgroundLoading, setPlaygroundLoading] = useState(false);

  // Request Logs State
  const [requestLogs, setRequestLogs] = useState<ApiRequestLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logFilter, setLogFilter] = useState<'all' | '2xx' | '4xx' | '429'>('all');

  // Load API Keys from Server
  const fetchKeys = async () => {
    setLoadingKeys(true);
    try {
      // Use Master Admin Key for internal client sync
      const res = await fetch('/api/v1/auth/keys', {
        headers: {
          'X-API-Key': 'cert_live_sec99_admin_master_key_8849',
        },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setApiKeys(json.data);
          if (!playgroundAuthKey && json.data.length > 0) {
            setPlaygroundAuthKey(json.data[0].key || '');
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch API keys:', err);
    } finally {
      setLoadingKeys(false);
    }
  };

  // Load Logs from Server
  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch('/api/v1/auth/logs?limit=100', {
        headers: {
          'X-API-Key': 'cert_live_sec99_admin_master_key_8849',
        },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setRequestLogs(json.data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch request logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchKeys();
    fetchLogs();
  }, []);

  // Update playground defaults when endpoint changes
  useEffect(() => {
    setPlaygroundParams(selectedEndpoint.defaultParams || {});
    setPlaygroundBody(
      selectedEndpoint.defaultBody ? JSON.stringify(selectedEndpoint.defaultBody, null, 2) : ''
    );
    setPlaygroundResponse(null);
    setPlaygroundStatus(null);
    setPlaygroundTimeMs(null);
    setPlaygroundHeaders({});
    setPlaygroundUseAuth(selectedEndpoint.access === 'Protegido');
  }, [selectedEndpoint]);

  // Execute Live HTTP Request in Playground
  const handleExecutePlayground = async () => {
    setPlaygroundLoading(true);
    setPlaygroundResponse(null);
    setPlaygroundStatus(null);
    setPlaygroundTimeMs(null);

    let url = selectedEndpoint.path;
    // Replace URL path params
    Object.entries(playgroundParams).forEach(([paramKey, val]) => {
      url = url.replace(`:${paramKey}`, encodeURIComponent(String(val || '')));
    });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (playgroundUseAuth && playgroundAuthKey.trim()) {
      headers['X-API-Key'] = playgroundAuthKey.trim();
    }

    const startTime = performance.now();

    try {
      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers,
      };

      if (selectedEndpoint.method !== 'GET' && playgroundBody.trim()) {
        options.body = playgroundBody.trim();
      }

      const res = await fetch(url, options);
      const endTime = performance.now();
      const elapsed = Math.round(endTime - startTime);

      setPlaygroundStatus(res.status);
      setPlaygroundTimeMs(elapsed);

      // Extract Rate Limit Headers
      const rHeaders: Record<string, string> = {};
      res.headers.forEach((value, name) => {
        if (name.startsWith('x-ratelimit') || name === 'retry-after') {
          rHeaders[name] = value;
        }
      });
      setPlaygroundHeaders(rHeaders);

      const json = await res.json().catch(() => ({ raw: 'Resposta não é JSON' }));
      setPlaygroundResponse(json);

      // Refresh logs after calling
      setTimeout(fetchLogs, 250);
    } catch (err: any) {
      setPlaygroundStatus(500);
      setPlaygroundTimeMs(Math.round(performance.now() - startTime));
      setPlaygroundResponse({
        success: false,
        error: {
          code: 'CLIENT_FETCH_ERROR',
          message: err.message || 'Falha ao conectar com o servidor.',
          timestamp: new Date().toISOString(),
        },
      });
    } finally {
      setPlaygroundLoading(false);
    }
  };

  // Create API Key Handler
  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    try {
      const res = await fetch('/api/v1/auth/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'cert_live_sec99_admin_master_key_8849',
        },
        body: JSON.stringify({
          name: newKeyName.trim(),
          scopes: newKeyScopes,
          rateLimitPerMinute: newKeyRateLimit,
          integrationType: newKeyIntegration,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setJustGeneratedKey(json.data.key);
        fetchKeys();
      }
    } catch (err) {
      console.error('Error creating key:', err);
    }
  };

  // Revoke Key Handler
  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('Deseja realmente revogar esta Chave de API? Qualquer integração que utilize este token será bloqueada imediatamente.')) {
      return;
    }
    try {
      await fetch(`/api/v1/auth/keys/${keyId}/revoke`, {
        method: 'POST',
        headers: {
          'X-API-Key': 'cert_live_sec99_admin_master_key_8849',
        },
      });
      fetchKeys();
    } catch (err) {
      console.error('Error revoking key:', err);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  // Filter logs
  const filteredLogs = requestLogs.filter((log) => {
    if (logFilter === '2xx') return log.statusCode >= 200 && log.statusCode < 300;
    if (logFilter === '4xx') return log.statusCode >= 400 && log.statusCode < 500 && log.statusCode !== 429;
    if (logFilter === '429') return log.statusCode === 429;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-xs">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  API Segura de Certificados
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Gateway v1.0.0 Online
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Arquitetura de microsserviços com autenticação por chave, RBAC, rate limiting, hashing SHA-256 e trilha de auditoria.
              </p>
            </div>
          </div>
        </div>

        {/* Action Quick Links */}
        <div className="flex items-center gap-2">
          <a
            href="/api/v1/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <FileCode2 className="w-4 h-4 text-indigo-500" />
            <span>OpenAPI Spec (JSON)</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </a>
          <button
            onClick={() => setShowNewKeyModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Chave de API</span>
          </button>
        </div>
      </div>

      {/* Security Architecture KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
            <Lock className="w-4 h-4 text-indigo-500" />
            <span>Autenticação & RBAC</span>
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            {apiKeys.filter((k) => k.status === 'active').length} Chaves Ativas
          </p>
          <p className="text-[11px] text-slate-400">Tokens Bearer / X-API-Key</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Rate Limiting Ativo</span>
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">Sliding Window</p>
          <p className="text-[11px] text-slate-400">60 req/min c/ Retry-After 429</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Integridade SHA-256</span>
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">Criptográfico</p>
          <p className="text-[11px] text-slate-400">Auditoria anti-adulteração</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-semibold mb-1">
            <Activity className="w-4 h-4 text-blue-500" />
            <span>Trilha de Auditoria</span>
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            {requestLogs.length} Requisições
          </p>
          <p className="text-[11px] text-slate-400">Logs estruturados em tempo real</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('docs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shrink-0 ${
            activeTab === 'docs'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Documentação & Testador Interativo</span>
        </button>

        <button
          onClick={() => setActiveTab('keys')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shrink-0 ${
            activeTab === 'keys'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Chaves de API & Permissões ({apiKeys.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shrink-0 ${
            activeTab === 'logs'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Logs de Requisições ({requestLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('integrations')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shrink-0 ${
            activeTab === 'integrations'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Webhook className="w-4 h-4" />
          <span>Guias de Integração (Moodle, Canvas, Hotmart)</span>
        </button>
      </div>

      {/* TAB 1: DOCUMENTATION & PLAYGROUND */}
      {activeTab === 'docs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Endpoint Navigation */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-2 shadow-xs">
            <div className="px-2 py-1 mb-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Catálogo de Operações
              </h2>
              <p className="text-xs text-slate-500">Selecione uma rota para inspecionar e testar</p>
            </div>

            <div className="space-y-1.5">
              {API_ENDPOINTS.map((endpoint) => {
                const isSelected = selectedEndpoint.id === endpoint.id;
                return (
                  <button
                    key={endpoint.id}
                    onClick={() => setSelectedEndpoint(endpoint)}
                    className={`w-full text-left p-3 rounded-2xl transition-all flex flex-col gap-1.5 border ${
                      isSelected
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-800 text-indigo-950 dark:text-indigo-100 shadow-xs'
                        : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          endpoint.method === 'GET'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : endpoint.method === 'POST'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {endpoint.method}
                      </span>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          endpoint.access === 'Público'
                            ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800/60'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60'
                        }`}
                      >
                        {endpoint.access}
                      </span>
                    </div>

                    <span className="font-bold text-xs truncate">{endpoint.name}</span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                      {endpoint.path}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Endpoint Details & Interactive Tester */}
          <div className="lg:col-span-8 space-y-6">
            {/* Header Card of Selected Endpoint */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                      selectedEndpoint.method === 'GET'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : selectedEndpoint.method === 'POST'
                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    {selectedEndpoint.method}
                  </span>
                  <code className="text-base font-mono font-bold text-slate-900 dark:text-white">
                    {selectedEndpoint.path}
                  </code>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      selectedEndpoint.access === 'Público'
                        ? 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {selectedEndpoint.access === 'Público' ? 'Consulta Pública' : 'Requer Autenticação'}
                  </span>
                  {selectedEndpoint.scope !== 'none' && (
                    <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                      Escopo: {selectedEndpoint.scope}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedEndpoint.description}
              </p>
            </div>

            {/* Interactive Sandbox Tester */}
            <div className="bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-base text-white">Testar Endpoint em Tempo Real</h3>
                </div>
                <span className="text-xs text-slate-400">Execução HTTP Real contra o Express Gateway</span>
              </div>

              {/* Authentication Selector for Sandbox */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-400" />
                    <span>Autenticação na Requisição:</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={playgroundUseAuth}
                      onChange={(e) => setPlaygroundUseAuth(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-0"
                    />
                    <span>Incluir cabeçalho X-API-Key</span>
                  </label>
                </div>

                {playgroundUseAuth && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={playgroundAuthKey}
                      onChange={(e) => setPlaygroundAuthKey(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                    >
                      {apiKeys.map((k) => (
                        <option key={k.id} value={k.key}>
                          {k.name} ({k.integrationType.toUpperCase()}) - {k.maskedKey}
                        </option>
                      ))}
                      <option value="invalid_token_12345">Token Inválido (Para testar erro 401)</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Ou digite uma chave personalizada"
                      value={playgroundAuthKey}
                      onChange={(e) => setPlaygroundAuthKey(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs font-mono"
                    />
                  </div>
                )}
              </div>

              {/* URL Path Parameters Editor */}
              {selectedEndpoint.defaultParams && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">Parâmetros de Rota (Path Params):</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.entries(selectedEndpoint.defaultParams).map(([paramName, defaultVal]) => (
                      <div key={paramName} className="flex items-center gap-2 bg-slate-800/40 p-2 rounded-xl border border-slate-700">
                        <span className="text-xs font-mono text-indigo-400">:{paramName}</span>
                        <input
                          type="text"
                          value={playgroundParams[paramName] ?? defaultVal}
                          onChange={(e) =>
                            setPlaygroundParams({ ...playgroundParams, [paramName]: e.target.value })
                          }
                          className="flex-1 bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-2.5 py-1 text-xs font-mono"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* JSON Body Editor for POST */}
              {selectedEndpoint.method === 'POST' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">Corpo da Requisição (JSON Body):</label>
                  <textarea
                    rows={7}
                    value={playgroundBody}
                    onChange={(e) => setPlaygroundBody(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-emerald-400 rounded-2xl p-3 text-xs font-mono focus:outline-none focus:border-indigo-500"
                    placeholder="{ ... }"
                  />
                </div>
              )}

              {/* Action Button */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400">
                  Headers enviados: <code>Content-Type: application/json</code>
                  {playgroundUseAuth && <code>, X-API-Key: {playgroundAuthKey ? '***' : 'none'}</code>}
                </span>

                <button
                  onClick={handleExecutePlayground}
                  disabled={playgroundLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {playgroundLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{playgroundLoading ? 'Enviando...' : 'Executar Chamada Real'}</span>
                </button>
              </div>

              {/* Live Response Panel */}
              {playgroundStatus !== null && (
                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-300">Resposta do Servidor:</span>
                      <span
                        className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                          playgroundStatus >= 200 && playgroundStatus < 300
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : playgroundStatus === 429
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        HTTP {playgroundStatus} {playgroundStatus === 200 ? 'OK' : playgroundStatus === 201 ? 'Created' : playgroundStatus === 401 ? 'Unauthorized' : playgroundStatus === 403 ? 'Forbidden' : playgroundStatus === 429 ? 'Too Many Requests' : 'Error'}
                      </span>
                      {playgroundTimeMs !== null && (
                        <span className="text-xs font-mono text-slate-400">
                          {playgroundTimeMs} ms
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => copyToClipboard(JSON.stringify(playgroundResponse, null, 2), 'playground-res')}
                      className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-800"
                    >
                      {copiedKeyId === 'playground-res' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Copiar Resposta</span>
                    </button>
                  </div>

                  {/* Rate Limit Headers display */}
                  {Object.keys(playgroundHeaders).length > 0 && (
                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <span className="text-indigo-400 font-semibold">Rate Limit:</span>
                      {playgroundHeaders['x-ratelimit-remaining'] && (
                        <span>Restantes: {playgroundHeaders['x-ratelimit-remaining']}</span>
                      )}
                      {playgroundHeaders['x-ratelimit-limit'] && (
                        <span>Limite: {playgroundHeaders['x-ratelimit-limit']} req/min</span>
                      )}
                      {playgroundHeaders['retry-after'] && (
                        <span className="text-amber-400 font-bold">Retry-After: {playgroundHeaders['retry-after']}s</span>
                      )}
                    </div>
                  )}

                  {/* Formatted JSON Output */}
                  <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto max-h-96">
                    {JSON.stringify(playgroundResponse, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: API KEYS MANAGEMENT */}
      {activeTab === 'keys' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Chaves de Acesso e Credenciais de Integração
              </h2>
              <p className="text-sm text-slate-500">
                Cada chave possui escopos de autorização (RBAC) e limites de requisições dedicados.
              </p>
            </div>
            <button
              onClick={() => setShowNewKeyModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Gerar Nova Chave</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-xs ${
                        key.integrationType === 'moodle'
                          ? 'bg-orange-500'
                          : key.integrationType === 'canvas'
                          ? 'bg-rose-500'
                          : key.integrationType === 'hotmart'
                          ? 'bg-red-600'
                          : key.integrationType === 'eduzz'
                          ? 'bg-amber-600'
                          : 'bg-indigo-600'
                      }`}
                    >
                      <Key className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                          {key.name}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            key.status === 'active'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {key.status === 'active' ? 'Ativa' : 'Revogada'}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        Integração: {key.integrationType.toUpperCase()} • Limite: {key.rateLimitPerMinute} req/min
                      </span>
                    </div>
                  </div>

                  {key.status === 'active' && (
                    <button
                      onClick={() => handleRevokeKey(key.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Revogar Chave"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Key token copy box */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                  <code className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate">
                    {key.key || key.maskedKey}
                  </code>
                  <button
                    onClick={() => copyToClipboard(key.key || key.maskedKey, key.id)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 shrink-0"
                    title="Copiar Token"
                  >
                    {copiedKeyId === key.id ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Scopes Badges */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Escopos de Permissão (RBAC):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {key.scopes.map((scope) => (
                      <span
                        key={scope}
                        className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Metadata timestamp */}
                <div className="text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2 flex items-center justify-between">
                  <span>Criada em: {new Date(key.createdAt).toLocaleDateString('pt-BR')}</span>
                  <span>
                    Último uso: {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleTimeString('pt-BR') : 'Nunca'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: REQUEST LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Trilha de Requisições e Auditoria da API
              </h2>
              <p className="text-sm text-slate-500">
                Monitoramento em tempo real de latência, códigos HTTP, clientes autenticados e IPs.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setLogFilter('all')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    logFilter === 'all' ? 'bg-white dark:bg-slate-700 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Todos ({requestLogs.length})
                </button>
                <button
                  onClick={() => setLogFilter('2xx')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    logFilter === '2xx' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Sucessos (2xx)
                </button>
                <button
                  onClick={() => setLogFilter('4xx')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    logFilter === '4xx' ? 'bg-white dark:bg-slate-700 text-rose-600 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Erros (4xx)
                </button>
                <button
                  onClick={() => setLogFilter('429')}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    logFilter === '429' ? 'bg-white dark:bg-slate-700 text-amber-600 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Rate Limit (429)
                </button>
              </div>

              <button
                onClick={fetchLogs}
                disabled={loadingLogs}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                title="Atualizar Logs"
              >
                <RefreshCw className={`w-4 h-4 ${loadingLogs ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Método</th>
                    <th className="p-3.5">Endpoint</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Latência</th>
                    <th className="p-3.5">Cliente / Chave</th>
                    <th className="p-3.5">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400">
                        Nenhum log encontrado para o filtro selecionado.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3.5 text-slate-500 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black ${
                              log.method === 'GET'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                            }`}
                          >
                            {log.method}
                          </span>
                        </td>
                        <td className="p-3.5 font-semibold text-slate-900 dark:text-white truncate max-w-xs">
                          {log.path}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded font-bold ${
                              log.statusCode >= 200 && log.statusCode < 300
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : log.statusCode === 429
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            {log.statusCode}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300">{log.durationMs} ms</td>
                        <td className="p-3.5 text-slate-700 dark:text-slate-300 truncate max-w-xs">
                          {log.clientName || 'Público'}
                        </td>
                        <td className="p-3.5 text-slate-400">{log.ip}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: INTEGRATION GUIDES */}
      {activeTab === 'integrations' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Modelos de Integração com Plataformas Educacionais & Sistemas
            </h2>
            <p className="text-sm text-slate-500">
              Copie exemplos prontos em cURL, Node.js, Python e PHP para integrar emissões automáticas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Moodle LMS Integration */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center text-white font-bold">
                  M
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Moodle LMS - Conclusão de Curso
                  </h3>
                  <p className="text-xs text-slate-400">Gatilho no evento <code>\core\event\course_completed</code></p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300">
                Configure o Webhook ou plugin do Moodle para enviar os dados do aluno concluinte para a API CertifyAI:
              </p>

              <pre className="bg-slate-950 p-4 rounded-2xl text-emerald-400 text-xs font-mono overflow-x-auto">
{`// PHP / Moodle Webhook Handler
$payload = json_encode([
    'studentName' => $user->firstname . ' ' . $user->lastname,
    'studentEmail' => $user->email,
    'courseName' => $course->fullname,
    'workloadHours' => 40,
    'modality' => 'online',
    'issueDate' => date('Y-m-d')
]);

$ch = curl_init('https://certify.academy/api/v1/certificates/issue');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'X-API-Key: cert_live_mdl_a872e456b3294c718a2098'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);`}
              </pre>
            </div>

            {/* Hotmart / Eduzz Integration */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center text-white font-bold">
                  H
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Hotmart Club / Eduzz Webhook
                  </h3>
                  <p className="text-xs text-slate-400">Emissão 100% automatizada por progresso</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300">
                Receba o webhook do Hotmart Club e emita o certificado com validação instantânea:
              </p>

              <pre className="bg-slate-950 p-4 rounded-2xl text-emerald-400 text-xs font-mono overflow-x-auto">
{`// Node.js Express Webhook Receiver
app.post('/webhook/hotmart', async (req, res) => {
  const { buyer, product } = req.body.data;
  
  const certRes = await fetch('https://certify.academy/api/v1/certificates/issue', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.CERTIFY_API_KEY
    },
    body: JSON.stringify({
      studentName: buyer.name,
      studentEmail: buyer.email,
      studentDocument: buyer.document,
      courseName: product.name,
      workloadHours: 40,
      modality: 'online'
    })
  });
  
  const certificate = await certRes.json();
  res.json({ ok: true, certCode: certificate.data.code });
});`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* NEW API KEY MODAL */}
      {showNewKeyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                  <Key className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Gerar Nova Chave de API
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowNewKeyModal(false);
                  setJustGeneratedKey(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {justGeneratedKey ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                    <Check className="w-5 h-5" />
                    <span>Chave Gerada com Sucesso!</span>
                  </div>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    Copie a chave agora. Por razões de segurança, o token completo não será exibido novamente.
                  </p>
                </div>

                <div className="p-3 bg-slate-950 rounded-2xl text-emerald-400 font-mono text-xs break-all flex items-center justify-between gap-2">
                  <span>{justGeneratedKey}</span>
                  <button
                    onClick={() => copyToClipboard(justGeneratedKey, 'new-key-full')}
                    className="p-1.5 text-slate-400 hover:text-white shrink-0"
                  >
                    {copiedKeyId === 'new-key-full' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  onClick={() => {
                    setShowNewKeyModal(false);
                    setJustGeneratedKey(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                >
                  Concluir e Fechar
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateApiKey} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Nome da Aplicação ou Sistema:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Moodle Produção, Webhook Hotmart, ERP Totvs"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Tipo de Integração:
                    </label>
                    <select
                      value={newKeyIntegration}
                      onChange={(e) => setNewKeyIntegration(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    >
                      <option value="moodle">Moodle LMS</option>
                      <option value="canvas">Canvas LMS</option>
                      <option value="hotmart">Hotmart</option>
                      <option value="eduzz">Eduzz</option>
                      <option value="hris">RH / ERP Corporativo</option>
                      <option value="custom">Personalizada / Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Limite de Taxa (req/min):
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={1000}
                      value={newKeyRateLimit}
                      onChange={(e) => setNewKeyRateLimit(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                    Escopos de Permissão (RBAC):
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      { id: 'certificates:read', label: 'Consultar Certificados' },
                      { id: 'certificates:write', label: 'Emitir Certificados' },
                      { id: 'certificates:admin', label: 'Cancelar / Revogar' },
                      { id: 'students:read', label: 'Consultar Alunos' },
                      { id: 'students:write', label: 'Criar / Atualizar Alunos' },
                      { id: 'courses:read', label: 'Consultar Cursos' },
                      { id: 'admin', label: 'Administrador Total' },
                    ].map((scope) => (
                      <label key={scope.id} className="flex items-center gap-2 text-slate-600 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newKeyScopes.includes(scope.id as ApiScope)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewKeyScopes([...newKeyScopes, scope.id as ApiScope]);
                            } else {
                              setNewKeyScopes(newKeyScopes.filter((s) => s !== scope.id));
                            }
                          }}
                          className="rounded text-indigo-600"
                        />
                        <span className="text-[11px]">{scope.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowNewKeyModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                  >
                    Gerar Chave
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
