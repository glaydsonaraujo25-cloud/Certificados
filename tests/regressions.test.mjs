import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidCpf, matchesStudent } from '../src/utils/validation.ts';
import { calculateCertificateHash, verifyCertificateIntegrity } from '../src/utils/integrity.ts';
import { APP_KEYS, RECOVERY_KEY, restoreBackup, writeTransaction } from '../src/utils/persistence.ts';
const student = {id:'s1',fullName:'MARIA TESTE',email:'maria@example.test',documentNumber:'52998224725',registrationNumber:'00123456789',createdAt:'2026-01-01'};
const certificate = {id:'c1',uuid:'u1',code:'001/CVTE/2026',studentId:'s1',studentName:'MARIA TESTE',studentDocument:student.documentNumber,courseId:'course',courseName:'CVTE',issueDate:'2026-01-01',createdAt:'2026-01-01',workloadHours:50,status:'active'};
certificate.integrityHash=calculateCertificateHash(certificate);
function memory() { const data=new Map(); return {data,getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)}; }
const backup=()=>({format:'certificados-cvte-backup',version:1,data:{certifyai_institution:{name:'Instituição'},certifyai_courses:[],certifyai_students:[student],certifyai_certificates:[certificate],certifyai_theme:'dark'}});
test('busca textual não retorna todos os condutores',()=>{
 assert.equal(matchesStudent(student,'joão'),false);assert.equal(matchesStudent(student,'MARIA'),true);assert.equal(matchesStudent(student,'529.982'),true);assert.equal(matchesStudent(student,'001234'),true);assert.equal(matchesStudent(student,''),true);
});
test('CPF: dígitos verificadores, repetição e comprimento',()=>{
 assert.equal(isValidCpf('529.982.247-25'),true);for(const invalid of ['52998224726','11111111111','00000000000','529982247','529982247250'])assert.equal(isValidCpf(invalid),false);
});
test('consulta rejeita cancelados, expirados, alterados e sem hash',()=>{
 assert.equal(verifyCertificateIntegrity(certificate).isAuthentic,true);
 for(const patch of [{status:'cancelled'},{status:'expired'},{expiresAt:'2000-01-01'},{studentName:'ALTERADO'},{integrityHash:''}])assert.equal(verifyCertificateIntegrity({...certificate,...patch}).isAuthentic,false);
 assert.equal(verifyCertificateIntegrity({...certificate,status:'expired'}).statusLabel,'Certificado expirado');
});
test('backup inválido não altera dados existentes',()=>{
 const storage=memory();storage.setItem('certifyai_students','original');const bad=backup();bad.data.certifyai_students={};assert.throws(()=>restoreBackup(storage,bad));assert.equal(storage.getItem('certifyai_students'),'original');assert.equal(storage.getItem(RECOVERY_KEY),null);
});
test('restauração mantém snapshot e serializa tema corretamente',()=>{
 const storage=memory();storage.setItem('certifyai_students','original');restoreBackup(storage,backup());assert.equal(JSON.parse(storage.getItem(RECOVERY_KEY)).certifyai_students,'original');assert.equal(JSON.parse(storage.getItem('certifyai_theme')),'dark');assert.equal(JSON.parse(storage.getItem('certifyai_students'))[0].id,'s1');
});
test('falha no meio de uma gravação restaura todos os valores anteriores',()=>{
 const storage=memory();storage.setItem('a','old-a');storage.setItem('b','old-b');const set=storage.setItem;let failed=false;storage.setItem=(k,v)=>{if(k==='b'&&!failed){failed=true;throw new Error('quota');}set(k,v);};assert.throws(()=>writeTransaction(storage,{a:'new-a',b:'new-b'}));assert.equal(storage.getItem('a'),'old-a');assert.equal(storage.getItem('b'),'old-b');
});
test('falha de espaço durante restauração preserva registros',()=>{
 const storage=memory();for(const key of APP_KEYS)storage.setItem(key,'original');const set=storage.setItem;let failed=false;storage.setItem=(k,v)=>{if(k==='certifyai_certificates'&&!failed){failed=true;throw new Error('quota');}set(k,v);};assert.throws(()=>restoreBackup(storage,backup()));for(const key of APP_KEYS)assert.equal(storage.getItem(key),'original');assert.ok(storage.getItem(RECOVERY_KEY));
});
