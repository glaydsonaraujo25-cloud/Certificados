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
