'use client';
import { FormEvent,useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { submitLeadRequest } from '@/lib/api/client';
export function NewsletterSignup({title,subtitle,consent,message}:{title?:string;subtitle?:string;consent?:string;message?:string}){
 const { isEnglish } = useTranslation();
 const ui = (vi: string, en: string) => isEnglish ? en : vi;
 const [busy,setBusy]=useState(false);const [result,setResult]=useState<{success:boolean;message:string}|null>(null);
 async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();const form=event.currentTarget;const data=new FormData(form);const email=String(data.get('email')||'').trim();setBusy(true);setResult(null);
  const response=await submitLeadRequest({name:email,phone:'',email,message:message||title||'Yêu cầu liên hệ qua email',sourcePage:window.location.pathname+'#newsletter',privacyConsent:data.get('consent')==='on',privacyPolicyVersion:'v1.0.0',honeypot:String(data.get('website')||'')});setBusy(false);setResult(response);if(response.success)form.reset();
 }
 return <section className="solar-newsletter solar-container"><div>{title&&<h2>{title}</h2>}{subtitle&&<p>{subtitle}</p>}</div><form onSubmit={submit} aria-busy={busy}><input name="website" type="text" className="hidden" tabIndex={-1} aria-hidden="true"/><div><input type="email" name="email" aria-label={ui("Email liên hệ", "Contact email")} placeholder={ui("Nhập địa chỉ email của bạn", "Enter your email address")} maxLength={254} required/><button disabled={busy} type="submit">{busy?ui("Đang gửi…", "Sending…"):ui("Đăng ký", "Subscribe")}<ArrowRight size={15}/></button></div><label><input type="checkbox" name="consent" required/>{consent||ui("Tôi đồng ý được liên hệ qua email.", "I agree to be contacted by email.")}</label>{result&&<p role={result.success?'status':'alert'}>{isEnglish ? (result.success ? "Thank you. Your request was received." : "Unable to send. Please check the form and try again.") : result.message}</p>}</form></section>;
}
