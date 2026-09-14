const DEFAULT_URL='https://mkrcbtrrjktucznzybmv.supabase.co';
const DEFAULT_PUBLISHABLE_KEY='sb_publishable_n6vURyoecZ9DOQhkf04LMg_ZJVeapYM';
export const supabaseConfig={
  url:(import.meta.env.VITE_SUPABASE_URL||DEFAULT_URL).replace(/\/$/,''),
  publishableKey:import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY||DEFAULT_PUBLISHABLE_KEY,
};
export interface SupabaseSession {access_token:string;refresh_token:string;expires_in:number;user:{id:string;email?:string};}
const SESSION_KEY='certifyai_supabase_session';
export const getSupabaseSession=():SupabaseSession|null=>{try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}};
export const saveSupabaseSession=(session:SupabaseSession|null)=>session?localStorage.setItem(SESSION_KEY,JSON.stringify(session)):localStorage.removeItem(SESSION_KEY);
export async function supabaseRequest<T>(path:string,options:RequestInit={},accessToken?:string):Promise<T>{
 const response=await fetch(`${supabaseConfig.url}${path}`,{...options,headers:{apikey:supabaseConfig.publishableKey,Authorization:`Bearer ${accessToken||supabaseConfig.publishableKey}`,'Content-Type':'application/json',Prefer:'return=representation',...(options.headers||{})}});
 if(!response.ok){const body=await response.text();throw new Error(body||`Supabase respondeu ${response.status}`);}
 const text=await response.text();return(text?JSON.parse(text):null) as T;
}
export async function signInWithPassword(email:string,password:string){
 const session=await supabaseRequest<SupabaseSession>('/auth/v1/token?grant_type=password',{method:'POST',body:JSON.stringify({email,password})});
 saveSupabaseSession(session);return session;
}
export async function signUp(email:string,password:string,name:string){
 const result=await supabaseRequest<SupabaseSession&{user:{id:string;email?:string}}>('/auth/v1/signup',{method:'POST',body:JSON.stringify({email,password,data:{name}})});
 if(result.access_token)saveSupabaseSession(result);return result;
}
export async function recoverPassword(email:string){
 return supabaseRequest('/auth/v1/recover',{method:'POST',body:JSON.stringify({email,redirect_to:location.origin})});
}
export async function consumeAuthRedirect():Promise<SupabaseSession|null>{
 const params=new URLSearchParams(location.hash.replace(/^#/,''));
 const access_token=params.get('access_token'),refresh_token=params.get('refresh_token');
 if(!access_token||!refresh_token)return null;
 const user=await supabaseRequest<{id:string;email?:string}>('/auth/v1/user',{},access_token);
 const session={access_token,refresh_token,expires_in:Number(params.get('expires_in')||3600),user};
 saveSupabaseSession(session);history.replaceState(null,'',location.pathname+location.search);return session;
}
export async function signOut(){
 const session=getSupabaseSession();if(session)await supabaseRequest('/auth/v1/logout',{method:'POST'},session.access_token).catch(()=>undefined);saveSupabaseSession(null);
}
export async function checkSupabaseSchema(){
 const session=getSupabaseSession();if(!session)return{connected:true,authenticated:false};
 await supabaseRequest('/rest/v1/profiles?select=id&limit=1',{},session.access_token);return{connected:true,authenticated:true};
}
