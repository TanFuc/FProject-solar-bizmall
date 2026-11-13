'use client';
import { FormEvent,useId,useState } from 'react';
import { ArrowRight,CheckCircle2 } from 'lucide-react';
import { useBranch } from '@/lib/contacts/branchContext';
import { useTranslation } from '@/lib/i18n';
import { submitLeadRequest } from '@/lib/api/client';
interface Props {headline?:string;subheading?:string;source?:string;variant?:'banner'|'contact';consentLabel?:string;mediaUrl?:string;benefits?:string[]}
export function ConsultationFormBlock({headline,subheading,source,variant='banner',consentLabel,mediaUrl,benefits=[]}:Props){
 const { isEnglish } = useTranslation();
 const ui = (vi: string, en: string) => isEnglish ? en : vi;
 const id=useId();const {branches,activeBranch}=useBranch();const [branchId,setBranchId]=useState('');const [busy,setBusy]=useState(false);const [result,setResult]=useState<{success:boolean;message:string}|null>(null);
 async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();const form=event.currentTarget;const data=new FormData(form);const text=(key:string)=>String(data.get(key)||'').trim();setBusy(true);setResult(null);
  const response=await submitLeadRequest({name:text('name'),phone:text('phone'),email:text('email')||undefined,branchId:branchId||activeBranch?.id,message:text('message')||source||headline||'Yêu cầu liên hệ',sourcePage:window.location.pathname,privacyConsent:data.get('consent')==='on',privacyPolicyVersion:'v1.0.0',honeypot:text('website')||undefined});
  setBusy(false);setResult(response);if(response.success)form.reset();
 }
 return <section id="tu-van" className={variant==='contact'?'lead-contact':'solar-consultation lead-banner'}>
 {variant==='banner'&&mediaUrl&&<div className="lead-banner-art" style={{backgroundImage:`linear-gradient(90deg,rgba(4,48,92,.65),rgba(8,78,143,.94)),url("${mediaUrl}")`}}/>}
 <div className="lead-heading">{headline&&<h2>{headline}</h2>}{subheading&&<p>{subheading}</p>}{variant==='banner'&&benefits.length>0&&<ul>{benefits.map(benefit=><li key={benefit}><CheckCircle2 size={14}/>{benefit}</li>)}</ul>}</div>
 {result?.success?<div className="lead-confirmation" role="status"><CheckCircle2 size={32}/><p>{isEnglish ? (result.success ? "Thank you. Your request was received." : "Unable to send. Please check the form and try again.") : result.message}</p><button type="button" onClick={()=>setResult(null)}>{ui("Gửi yêu cầu khác", "Send another request")}</button></div>:
 <form className="lead-form" onSubmit={submit} aria-busy={busy}>
 {result&&!result.success&&<p className="lead-error" role="alert">{isEnglish ? (result.success ? "Thank you. Your request was received." : "Unable to send. Please check the form and try again.") : result.message}</p>}
 <input type="text" name="website" className="hidden" tabIndex={-1} aria-hidden="true" autoComplete="off"/>
 <label htmlFor={`${id}-name`}>{ui("Họ và tên *", "Full name *")}<input id={`${id}-name`} name="name" autoComplete="name" required maxLength={120}/></label>
 <label htmlFor={`${id}-phone`}>{ui("Số điện thoại *", "Phone number *")}<input id={`${id}-phone`} type="tel" name="phone" autoComplete="tel" required maxLength={25}/></label>
 {variant==='contact'&&<label htmlFor={`${id}-email`}>Email<input id={`${id}-email`} type="email" name="email" autoComplete="email" maxLength={254}/></label>}
 <label className={variant==='banner'?'lead-wide':''} htmlFor={`${id}-branch`}>{ui("Chi nhánh tư vấn", "Consulting branch")}<select id={`${id}-branch`} name="branchId" value={branchId||activeBranch?.id||''} onChange={e=>setBranchId(e.target.value)}><option value="">{ui("Chọn chi nhánh", "Select a branch")}</option>{branches.map(branch=><option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label>
 <label className={variant==='contact'?'lead-wide':''} htmlFor={`${id}-message`}>{ui("Nhu cầu tư vấn", "How can we help?")}<textarea id={`${id}-message`} name="message" rows={variant==='contact'?5:1} maxLength={3000}/></label>
 <button className={variant==='contact'?'lead-wide':''} type="submit" disabled={busy}>{busy?ui("Đang gửi…", "Sending…"):ui("Gửi yêu cầu tư vấn", "Request a consultation")}<ArrowRight size={16}/></button>
 <label className="lead-consent lead-wide"><input name="consent" type="checkbox" required/>{consentLabel||ui("Tôi đồng ý được liên hệ theo yêu cầu này.", "I agree to be contacted about this request.")}</label>
 </form>}
 </section>;
}
