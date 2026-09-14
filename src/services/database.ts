import { AuditLog, Certificate, Course, CourseClass, InstitutionSettings, Student } from '../types';
import { getSupabaseSession, supabaseRequest } from '../lib/supabase';

type CloudData={institution:InstitutionSettings|null;courses:Course[];students:Student[];classes:CourseClass[];certificates:Certificate[];auditLogs:AuditLog[]};
const token=()=>{const value=getSupabaseSession()?.access_token;if(!value)throw new Error('Entre na conta para sincronizar com o banco de dados.');return value;};
const select=async<T>(table:string)=>supabaseRequest<T[]>(`/rest/v1/${table}?select=data&order=created_at.desc`,{},token());
const unwrap=<T>(rows:Array<{data:T}>)=>rows.map(row=>row.data);
export async function loadCloudData():Promise<CloudData>{
 const [institutions,courses,students,classes,certificates,auditLogs]=await Promise.all([
  supabaseRequest<Array<{settings:InstitutionSettings}>>('/rest/v1/institutions?select=settings&limit=1',{},token()),
  select<{data:Course}>('courses'),select<{data:Student}>('students'),select<{data:CourseClass}>('course_classes'),select<{data:Certificate}>('certificates'),select<{data:AuditLog}>('audit_logs')
 ]);
 return{institution:institutions[0]?.settings||null,courses:unwrap(courses),students:unwrap(students),classes:unwrap(classes),certificates:unwrap(certificates),auditLogs:unwrap(auditLogs)};
}
const upsert=async(table:string,rows:unknown[])=>{if(!rows.length)return;await supabaseRequest(`/rest/v1/${table}?on_conflict=owner_id,id`,{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify(rows)},token());};
export async function uploadLocalData(userId:string,data:CloudData){
 if(data.institution)await supabaseRequest('/rest/v1/institutions?on_conflict=owner_id',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({owner_id:userId,name:data.institution.name,settings:data.institution})},token());
 await upsert('courses',data.courses.map(item=>({owner_id:userId,id:item.id,name:item.name,workload_hours:item.workloadHours,start_date:item.startDate||null,end_date:item.endDate||null,data:item})));
 await upsert('students',data.students.map(item=>({owner_id:userId,id:item.id,full_name:item.fullName,document_number:item.documentNumber||null,registration_number:item.registrationNumber||null,data:item})));
 await upsert('course_classes',data.classes.map(item=>({owner_id:userId,id:item.id,course_id:item.courseId,name:item.name,data:item})));
 await upsert('certificates',data.certificates.map(item=>({owner_id:userId,id:item.id,code:item.code,student_id:item.studentId,course_id:item.courseId,status:item.status,issue_date:item.issueDate,expires_at:item.expiresAt||null,integrity_hash:item.integrityHash,data:item})));
 await upsert('audit_logs',data.auditLogs.map(item=>({owner_id:userId,id:item.id,action:item.action,certificate_id:item.certificateId||null,details:item.details,data:item,created_at:item.timestamp})));
}
