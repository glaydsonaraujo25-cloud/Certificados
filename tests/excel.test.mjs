import test from 'node:test';
import assert from 'node:assert/strict';
import * as XLSX from 'xlsx';
import {createDriverWorkbook,recoverExcelCpf} from '../src/utils/excelDocuments.ts';
test('modelo Excel preserva texto e zeros após salvar e reabrir',()=>{
 const wb=createDriverWorkbook();const ws=wb.Sheets.Condutores;
 for(const key of ['B2','C2','B1001','C1001'])assert.equal(ws[key].z,'@');
 ws.B2.v='01234567890';ws.C2.v='00123456789';
 const restored=XLSX.read(XLSX.write(wb,{type:'buffer',bookType:'xlsx'}),{type:'buffer',cellNF:true});
 assert.equal(restored.Sheets.Condutores.B2.v,'01234567890');assert.equal(restored.Sheets.Condutores.C2.v,'00123456789');assert.equal(restored.Sheets.Condutores.B1001.z,'@');
});
test('recupera zero inicial só se CPF passar nos dígitos verificadores',()=>{
 assert.equal(recoverExcelCpf('1234567890'),'01234567890');
 assert.equal(recoverExcelCpf('1234567891'),'1234567891');
 assert.equal(recoverExcelCpf(''),'');assert.equal(recoverExcelCpf('01234567890'),'01234567890');
 assert.equal(recoverExcelCpf('123456789012'),'123456789012');
});
