import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { act, create } from 'react-test-renderer';
import { build } from 'esbuild';
import { unlink } from 'node:fs/promises';
const output = new URL(`./context-${process.pid}.mjs`, import.meta.url);
await build({entryPoints:['src/context/AppContext.tsx'],bundle:true,platform:'node',format:'esm',packages:'external',outfile:output.pathname});
const {AppProvider,useApp}=await import(output.href);
await unlink(output);
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
globalThis.window=new EventTarget();
globalThis.location={search:'',pathname:'/'};
globalThis.document={documentElement:{classList:{toggle(){}}}};
const values=new Map();
globalThis.localStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
let app;
function Probe(){app=useApp();return null;}
const payload={studentId:'',studentName:'CONDUTOR TESTE',studentDocument:'52998224725',studentEmail:'',registrationNumber:'00123456789',cnhCategory:'D',courseId:'course-cvte',courseName:'CVTE',workloadHours:50,modality:'presencial',instructorName:'Instrutor',institutionName:'Instituição',issueDate:'2026-09-02',signatoryName:'Diretor',signatoryRole:'Diretor'};
test('emissão vincula condutor, numeração é única e exclusão preserva certificado',async()=>{
 let root;await act(()=>{root=create(React.createElement(AppProvider,null,React.createElement(Probe)));});
 let first,second;await act(()=>{first=app.issueCertificate(payload);second=app.issueCertificate(payload);});
 assert.equal(app.students.length,1);assert.equal(first.studentId,app.students[0].id);assert.equal(second.studentId,first.studentId);assert.notEqual(first.code,second.code);
 assert.equal(JSON.parse(localStorage.getItem('certifyai_certificates')).length,2);
 await act(()=>app.cancelCertificate(first.id,'Correção'));assert.equal(app.getCertificateByCode(first.code).status,'cancelled');
 await act(()=>app.deleteStudent(first.studentId));assert.equal(app.students.length,0);assert.equal(app.certificates.length,2);
 await act(()=>root.unmount());
});
test('falha de persistência não cria condutor nem certificado na interface',async()=>{
 values.clear();let root;await act(()=>{root=create(React.createElement(AppProvider,null,React.createElement(Probe)));});
 const original=localStorage.setItem;let failed=false;localStorage.setItem=(k,v)=>{if(k==='certifyai_students'&&!failed){failed=true;throw new Error('quota');}original(k,v);};
 await act(()=>assert.throws(()=>app.issueCertificate(payload)));
 assert.equal(app.students.length,0);assert.equal(app.certificates.length,0);assert.equal(localStorage.getItem('certifyai_certificates'),null);
 localStorage.setItem=original;await act(()=>root.unmount());
});
test('turma, validade e retificação preservam o original e seu prazo',async()=>{
 values.clear();let root;await act(()=>{root=create(React.createElement(AppProvider,null,React.createElement(Probe)));});
 let student;await act(()=>{student=app.addStudent({fullName:payload.studentName,email:'',documentNumber:payload.studentDocument});});
 const draft={name:'Turma setembro',courseId:'course-cvte',startDate:'2026-09-01',endDate:'2026-09-02',instructorName:'Instrutor A',studentIds:[student.id],validityYears:5};
 await act(()=>app.saveClass(draft));const classId=app.classes[0].id;
 let original;await act(()=>{original=app.issueCertificate({...payload,classId,startDate:draft.startDate,endDate:draft.endDate});});
 assert.equal(original.expiresAt,'2031-09-02');assert.equal(original.className,draft.name);
 await act(()=>app.saveClass({...draft,validityYears:2},classId));
 let corrected;await act(()=>{corrected=app.rectifyCertificate(original.id,{studentName:'NOME CORRIGIDO',registrationNumber:'00123456789',cnhCategory:'D'},'Correção do nome');});
 assert.equal(corrected.expiresAt,'2031-09-02');assert.equal(corrected.replacesId,original.id);assert.notEqual(corrected.code,original.code);
 const old=app.getCertificateByCode(original.code);assert.equal(old.studentName,payload.studentName);assert.equal(old.status,'cancelled');assert.equal(old.replacedById,corrected.id);
 assert.throws(()=>app.rectifyCertificate(original.id,{},'repetir'));
 assert.throws(()=>app.deleteClass(classId));
 await act(()=>root.unmount());
});
test('retificação com falha de gravação não cancela o original',async()=>{
 values.clear();let root;await act(()=>{root=create(React.createElement(AppProvider,null,React.createElement(Probe)));});
 let original;await act(()=>{original=app.issueCertificate(payload);});
 const write=localStorage.setItem;let failed=false;localStorage.setItem=(k,v)=>{if(k==='certifyai_certificates'&&!failed){failed=true;throw new Error('quota');}write(k,v);};
 await act(()=>assert.throws(()=>app.rectifyCertificate(original.id,{studentName:'CORRIGIDO',registrationNumber:'00123456789',cnhCategory:'D'},'Erro de nome')));
 assert.equal(app.certificates.length,1);assert.equal(app.certificates[0].status,'active');assert.equal(JSON.parse(localStorage.getItem('certifyai_certificates'))[0].status,'active');
 localStorage.setItem=write;await act(()=>root.unmount());
});
