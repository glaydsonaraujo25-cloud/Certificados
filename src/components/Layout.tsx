import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { LayoutDashboard, Award, PlusCircle, Users, Layers, CheckCircle, Settings, Sun, Moon, Menu, X, Search } from 'lucide-react';

interface LayoutProps { children: React.ReactNode; }
const digits=(value:string)=>value.replace(/\D/g,'');
const formatCpf=(value?:string)=>{const d=digits(value||'').slice(0,11);return d.length===11?`${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`:(value||'');};

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { theme, toggleTheme, currentView, setCurrentView, institution, students, certificates, setValidationSearchCode } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState('');

  const navItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    { id: 'create-certificate', label: 'Emitir Certificado', icon: PlusCircle, highlight: true },
    { id: 'batch-emission', label: 'Emitir por Excel', icon: Layers },
    { id: 'certificates', label: 'Certificados', icon: Award },
    { id: 'students', label: 'Condutores', icon: Users },
    { id: 'validate', label: 'Validar Certificado', icon: CheckCircle },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const searchResults = useMemo(() => {
    const q = quickSearch.trim().toLowerCase(); const qDigits=digits(quickSearch);
    if (q.length < 2) return [];
    const studentResults = students.filter((s) => s.fullName.toLowerCase().includes(q) || (s.email||'').toLowerCase().includes(q) || (qDigits && digits(s.documentNumber||'').includes(qDigits)) || (qDigits && digits(s.registrationNumber||'').includes(qDigits))).slice(0,4).map((s)=>({id:s.id,type:'student' as const,title:s.fullName,subtitle:s.documentNumber?formatCpf(s.documentNumber):(s.registrationNumber||s.email)}));
    const certificateResults = certificates.filter((c) => c.studentName.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || (qDigits && digits(c.studentDocument||'').includes(qDigits)) || (qDigits && digits(c.registrationNumber||'').includes(qDigits))).slice(0,4).map((c)=>({id:c.id,type:'certificate' as const,title:c.studentName,subtitle:c.code,code:c.code}));
    return [...studentResults,...certificateResults].slice(0,8);
  }, [quickSearch, students, certificates]);

  const handleResult = (result: (typeof searchResults)[number]) => { if(result.type==='certificate'&&result.code){setValidationSearchCode(result.code);setCurrentView('validate');}else{sessionStorage.setItem('certifyai_student_search',result.title);setCurrentView('students');}setQuickSearch('');setMobileMenuOpen(false); };
  const handleNavClick = (viewId:string)=>{setCurrentView(viewId);setMobileMenuOpen(false);setQuickSearch('');};
  const QuickSearch=()=> <div className="relative px-3 pb-3"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/><input value={quickSearch} onChange={e=>setQuickSearch(e.target.value)} placeholder="Buscar condutor, CPF ou código..." className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"/></div>{searchResults.length>0&&<div className="absolute left-3 right-3 top-12 z-50 bg-white dark:bg-slate-900 border rounded-xl shadow-xl overflow-hidden">{searchResults.map(r=><button key={`${r.type}-${r.id}`} onClick={()=>handleResult(r)} className="w-full text-left px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 border-b last:border-b-0"><div className="text-xs font-bold truncate">{r.title}</div><div className="text-[10px] text-slate-500 truncate">{r.type==='certificate'?'Certificado':'Condutor'} • {r.subtitle}</div></button>)}</div>}</div>;
  const Navigation=({mobile=false}:{mobile?:boolean})=><nav className={`${mobile?'mt-2':'px-3'} space-y-1`}>{navItems.map(item=>{const Icon=item.icon,isActive=currentView===item.id;return <button key={item.id} onClick={()=>handleNavClick(item.id)} className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive?'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold':item.highlight?'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/50':'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'}`}><div className="flex items-center gap-3"><Icon className="w-4 h-4"/><span>{item.label}</span></div>{item.highlight&&!isActive&&<span className="w-2 h-2 rounded-full bg-indigo-600"/>}</button>;})}</nav>;

  return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col md:flex-row transition-colors"><header className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b sticky top-0 z-40"><div className="flex items-center gap-2.5"><div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white"><Award className="w-5 h-5"/></div><div><span className="font-bold text-base">Certificados CVTE</span><span className="text-[10px] block text-indigo-600 -mt-1">Emissão e controle</span></div></div><div className="flex gap-2"><button onClick={toggleTheme} className="p-2">{theme==='dark'?<Sun className="w-4 h-4"/>:<Moon className="w-4 h-4"/>}</button><button onClick={()=>setMobileMenuOpen(!mobileMenuOpen)} className="p-2">{mobileMenuOpen?<X className="w-6 h-6"/>:<Menu className="w-6 h-6"/>}</button></div></header><aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r shrink-0 h-screen sticky top-0"><div className="p-5 border-b flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white"><Award className="w-5 h-5"/></div><div className="min-w-0"><h1 className="font-extrabold text-lg">Certificados CVTE</h1><p className="text-xs text-slate-500 truncate max-w-[150px]">{institution.name||'Instituição'}</p></div></div><div className="pt-3"><QuickSearch/></div><Navigation/><div className="mt-auto p-4 text-[10px] text-center text-slate-400">Curso Especializado para Condutores de Veículos de Transporte de Emergência</div></aside>{mobileMenuOpen&&<div className="md:hidden fixed inset-0 z-50 bg-slate-900/60 flex"><div className="w-80 bg-white dark:bg-slate-900 h-full p-4 shadow-2xl"><div className="flex justify-between items-center pb-3"><strong>Certificados CVTE</strong><button onClick={()=>setMobileMenuOpen(false)}><X className="w-5 h-5"/></button></div><QuickSearch/><Navigation mobile/></div><div className="flex-1" onClick={()=>setMobileMenuOpen(false)}/></div>}<main className="flex-1 min-w-0 flex flex-col min-h-screen overflow-y-auto">{children}</main></div>;
};
