import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle, Moon, RotateCcw, Save, Settings, Sun, Trash2 } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { institution, updateInstitution, resetToDemoData, clearAllData, theme, toggleTheme } = useApp();
  const [name, setName] = useState(institution.name);
  const [institutionCnpj, setInstitutionCnpj] = useState(institution.institutionCnpj || '');
  const [city, setCity] = useState(institution.city || 'Brasília');
  const [state, setState] = useState(institution.state || 'DF');
  const [legalInstruction, setLegalInstruction] = useState(institution.legalInstruction || '');
  const [contranResolution, setContranResolution] = useState(institution.contranResolution || '');
  const [validityText, setValidityText] = useState(institution.validityText || 'validade de cinco anos após o término do curso');
  const [signatoryName, setSignatoryName] = useState(institution.signatoryName || '');
  const [signatoryRole, setSignatoryRole] = useState(institution.signatoryRole || 'Diretor Geral');
  const [signatoryCpf, setSignatoryCpf] = useState(institution.signatoryCpf || '');
  const [saved, setSaved] = useState(false);

  const save = (event: React.FormEvent) => {
    event.preventDefault();
    updateInstitution({ name: name.trim(), institutionCnpj: institutionCnpj.trim(), city: city.trim(), state: state.trim().toUpperCase(), legalInstruction: legalInstruction.trim(), contranResolution: contranResolution.trim(), validityText: validityText.trim(), signatoryName: signatoryName.trim(), signatoryRole: signatoryRole.trim(), signatoryCpf: signatoryCpf.trim(), signatureImageUrl: '', codeFormat: 'cvte' });
    setSaved(true); window.setTimeout(() => setSaved(false), 2500);
  };

  return <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto w-full">
    <div className="flex items-center justify-between gap-4"><div><div className="flex items-center gap-2"><Settings className="w-6 h-6 text-indigo-600"/><h1 className="text-2xl sm:text-3xl font-extrabold">Configurações CVTE</h1></div><p className="text-sm text-slate-500 mt-1">Somente informações usadas no certificado e no sistema.</p></div>{saved&&<div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-100 text-emerald-700 text-xs font-bold"><CheckCircle className="w-4 h-4"/>Salvo</div>}</div>

    <form onSubmit={save} className="space-y-5">
      <section className="bg-white dark:bg-slate-900 rounded-2xl border p-6 space-y-4"><div><h2 className="font-bold">Instituição</h2><p className="text-xs text-slate-500">Dados exibidos na frente do certificado.</p></div><label className="block text-xs font-semibold">Nome da instituição<input value={name} onChange={e=>setName(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"/></label><div className="grid sm:grid-cols-3 gap-3"><label className="text-xs font-semibold">CNPJ<input value={institutionCnpj} onChange={e=>setInstitutionCnpj(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"/></label><label className="text-xs font-semibold">Cidade<input value={city} onChange={e=>setCity(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"/></label><label className="text-xs font-semibold">UF<input value={state} maxLength={2} onChange={e=>setState(e.target.value.toUpperCase())} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"/></label></div></section>

      <section className="bg-white dark:bg-slate-900 rounded-2xl border p-6 space-y-4"><div><h2 className="font-bold">Base legal do certificado</h2><p className="text-xs text-slate-500">Estes textos aparecem no corpo do certificado CVTE.</p></div><label className="block text-xs font-semibold">Instrução / DETRAN<input value={legalInstruction} onChange={e=>setLegalInstruction(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"/></label><label className="block text-xs font-semibold">Resolução / CONTRAN<input value={contranResolution} onChange={e=>setContranResolution(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"/></label><label className="block text-xs font-semibold">Validade<input value={validityText} onChange={e=>setValidityText(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"/></label></section>

      <section className="bg-white dark:bg-slate-900 rounded-2xl border p-6 space-y-4"><div><h2 className="font-bold">Responsável</h2><p className="text-xs text-slate-500">A assinatura manuscrita foi removida; permanecem apenas estes dados textuais no rodapé.</p></div><div className="grid sm:grid-cols-3 gap-3"><label className="text-xs font-semibold">Nome<input value={signatoryName} onChange={e=>setSignatoryName(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"/></label><label className="text-xs font-semibold">Função<input value={signatoryRole} onChange={e=>setSignatoryRole(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"/></label><label className="text-xs font-semibold">CPF<input value={signatoryCpf} onChange={e=>setSignatoryCpf(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border"/></label></div></section>

      <div className="flex justify-end"><button type="submit" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold"><Save className="w-4 h-4"/>Salvar Configurações</button></div>
    </form>

    <section className="grid md:grid-cols-2 gap-4 pt-2"><div className="bg-white dark:bg-slate-900 rounded-2xl border p-5"><h2 className="font-bold">Aparência</h2><p className="text-xs text-slate-500 mt-1 mb-3">Alterne entre tema claro e escuro.</p><button onClick={toggleTheme} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-bold">{theme==='dark'?<Sun className="w-4 h-4"/>:<Moon className="w-4 h-4"/>}Usar tema {theme==='dark'?'claro':'escuro'}</button></div><div className="bg-white dark:bg-slate-900 rounded-2xl border p-5"><h2 className="font-bold">Restaurar padrão CVTE</h2><p className="text-xs text-slate-500 mt-1 mb-3">Restaura as configurações oficiais e mantém a base pronta, sem alunos ou certificados de demonstração.</p><button onClick={()=>{if(confirm('Restaurar as configurações padrão do CVTE?')){resetToDemoData();window.location.reload();}}} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-100 text-amber-800 text-sm font-bold"><RotateCcw className="w-4 h-4"/>Restaurar padrão</button></div></section>

    <section className="rounded-2xl border border-rose-200 bg-rose-50/40 dark:bg-rose-950/10 p-5"><h2 className="font-bold text-rose-700">Limpar todos os dados locais</h2><p className="text-xs text-slate-500 mt-1 mb-3">Apaga condutores, certificados e demais dados armazenados neste navegador. Use apenas quando realmente necessário.</p><button onClick={()=>{if(confirm('Apagar todos os dados locais? Esta ação não pode ser desfeita.')){clearAllData();window.location.reload();}}} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-bold"><Trash2 className="w-4 h-4"/>Limpar dados</button></section>
  </div>;
};
