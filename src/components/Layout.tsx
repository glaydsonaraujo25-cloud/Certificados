import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Award,
  PlusCircle,
  BookOpen,
  Users,
  Layers,
  CheckCircle,
  Settings,
  Server,
  Sun,
  Moon,
  Menu,
  X,
  History,
  DatabaseBackup,
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const {
    user,
    theme,
    toggleTheme,
    currentView,
    setCurrentView,
    institution,
    switchUserRole,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'create-certificate', label: 'Emitir Certificado', icon: PlusCircle, highlight: true },
    { id: 'certificates', label: 'Certificados', icon: Award },
    { id: 'students', label: 'Alunos', icon: Users },
    { id: 'courses', label: 'Cursos', icon: BookOpen },
    { id: 'batch-emission', label: 'Emissão em Lote', icon: Layers },
    { id: 'validate', label: 'Validar', icon: CheckCircle },
    { id: 'audit', label: 'Auditoria', icon: History },
    { id: 'backup', label: 'Backup', icon: DatabaseBackup },
    { id: 'api', label: 'API & Integrações', icon: Server },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const handleNavClick = (viewId: string) => {
    setCurrentView(viewId);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors">
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">CertifyAI</span>
            <span className="text-[10px] block text-indigo-600 dark:text-indigo-400 font-semibold -mt-1">Certificados Digitais</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'} aria-label="Alternar tema">
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Abrir menu">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 select-none justify-between h-screen sticky top-0">
        <div className="min-h-0">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-sm">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h1 className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">Certify<span className="text-indigo-600 dark:text-indigo-400">AI</span></h1>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">SaaS</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[140px]">{institution.name || 'Instituição'}</p>
              </div>
            </div>
          </div>

          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button key={item.id} id={`nav-${item.id}`} onClick={() => handleNavClick(item.id)} className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs' : item.highlight ? 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'}`}>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive || item.highlight ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.highlight && !isActive && <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3 bg-white dark:bg-slate-900">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-slate-500 dark:text-slate-400 font-medium">Perfil Atual:</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${user?.role === 'admin' ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300' : 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300'}`}>{user?.role === 'admin' ? 'Administrador' : 'Instrutor'}</span>
            </div>
            <button onClick={() => switchUserRole(user?.role === 'admin' ? 'instructor' : 'admin')} className="w-full py-1 px-2 rounded text-[11px] font-medium bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 transition-colors" title="Alternar entre Administrador e Instrutor">
              Alternar para {user?.role === 'admin' ? 'Instrutor' : 'Admin'}
            </button>
          </div>

          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 truncate max-w-[130px]">
              <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center">{user?.name ? user.name[0] : 'U'}</div>
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{user?.name || 'Usuário'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>

            <button onClick={toggleTheme} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all" title={theme === 'dark' ? 'Mudar para Tema Claro (Principal)' : 'Mudar para Tema Escuro'} aria-label="Alternar tema">
              {theme === 'dark' ? <><Sun className="w-3.5 h-3.5 text-amber-400" /><span className="text-[11px]">Claro</span></> : <><Moon className="w-3.5 h-3.5 text-indigo-600" /><span className="text-[11px]">Escuro</span></>}
            </button>
          </div>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex">
          <div className="w-72 bg-white dark:bg-slate-900 h-full p-4 flex flex-col justify-between shadow-2xl">
            <div className="min-h-0">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white"><Award className="w-5 h-5" /></div>
                  <span className="font-bold text-base">CertifyAI</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 text-slate-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X className="w-5 h-5" /></button>
              </div>

              <nav className="mt-4 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button key={item.id} onClick={() => handleNavClick(item.id)} className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium ${isActive ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-600 dark:text-slate-300'}`}>
                      <Icon className="w-4 h-4" /><span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <p className="text-slate-500 mb-2">Conectado como: <strong>{user?.name}</strong></p>
              <button onClick={() => { switchUserRole(user?.role === 'admin' ? 'instructor' : 'admin'); setMobileMenuOpen(false); }} className="w-full py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 font-medium text-slate-700 dark:text-slate-300">Alternar para {user?.role === 'admin' ? 'Instrutor' : 'Admin'}</button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      <main className="flex-1 min-w-0 flex flex-col min-h-screen overflow-y-auto">{children}</main>
    </div>
  );
};
