import { ContentSuggestions } from '@/components/blocks/ContentSuggestions';
import { localizeSiteShell } from '@/lib/i18n/site-shell';
import {CmsJourney,CmsProcess} from '@/components/blocks/CmsSections';
import {MapPin,Phone,Mail,ArrowUpRight} from 'lucide-react';
import {getSiteShell} from '@/lib/api/client';
import {getPageVisuals} from '@/lib/api/visuals';
import {visualMetadata} from '@/lib/api/visual-metadata';
import {PageHero,SectionHeading} from '@/components/layout/PageHero';
import {ConsultationFormBlock} from '@/components/blocks/ConsultationFormBlock';
import {JourneyCtaBanner} from '@/components/blocks/JourneyCtaBanner';
import type {ContactChannelItem} from '@/types/bmsolar-api';
export async function generateMetadata(){return visualMetadata('contact','/lien-he');}
function action(channel:ContactChannelItem){if(channel.actionUrl)return channel.actionUrl;if(channel.type==='phone')return 'tel:'+channel.target.replace(/[^+\d]/g,'');if(channel.type==='email')return 'mailto:'+channel.target;return channel.target;}
export default async function ContactPage(){
 const visuals=await getPageVisuals('contact');
 const rawShell=await getSiteShell(visuals.page.locale);
 const shell=visuals.page.locale === 'en-US' ? localizeSiteShell(rawShell) : rawShell;
 const copy=visuals.copy;
  const ui = (vi: string, en: string) => visuals.page.locale === "en-US" ? en : vi;

 const branches=shell.utilityBar.branches.filter(branch=>branch.isActive);const channels=branches[0]?.channels||[];
 return <div className="solar-page solar-page-lien-he"><PageHero visuals={visuals}/><section className="solar-container solar-page-section"><SectionHeading eyebrow={copy.sectionEyebrow} title={copy.sectionTitle}/><div className="solar-contact-actions">
 {channels.filter(channel=>['phone','email'].includes(channel.type)).map(channel=><a key={channel.id} href={action(channel)}>{channel.type==='phone'?<Phone/>:<Mail/>}<div><span>{channel.label}</span><strong>{channel.formatted||channel.target}</strong></div><ArrowUpRight size={18}/></a>)}
 {branches[0]&&<a href="#chi-nhanh"><MapPin/><div><span>{copy.branchTitle}</span><strong>{branches[0].name}</strong></div><ArrowUpRight size={18}/></a>}
 </div><div className="solar-contact-columns"><ConsultationFormBlock variant="contact" headline={copy.formTitle} subheading={copy.formSubtitle} consentLabel={copy.consent} source="Liên hệ tư vấn"/><div id="chi-nhanh" className="solar-branch-list"><h2>{copy.branchTitle}</h2>{branches.map(branch=>{const branchChList = (branch.channels && branch.channels.length > 0) ? branch.channels : [...(branch.phone ? [{ id: 'p_'+branch.id, type: 'phone', label: 'Hotline', target: branch.phone, formatted: branch.phone, sortOrder: 1, enabled: true, isActive: true }] : []), ...(branch.email ? [{ id: 'e_'+branch.id, type: 'email', label: 'Email', target: branch.email, formatted: branch.email, sortOrder: 2, enabled: true, isActive: true }] : [])]; return (<article key={branch.id} className={branch.isHeadquarters ? 'solar-branch-hq' : ''}><div className="solar-branch-heading"><MapPin/><div><div className="flex items-center gap-2"><h3>{branch.name}</h3>{branch.isHeadquarters && <span className="inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 border border-amber-500/30">{ui("Trụ sở chính", "Head office")}</span>}</div>{branch.provinceName && <span className="text-[11px] text-slate-500 font-medium">{branch.provinceName}</span>}</div></div><p>{branch.streetAddress}</p>{branchChList.map(channel=><a key={channel.id} href={action(channel)}>{channel.type==='phone'?<Phone size={14}/>:<Mail size={14}/>} {channel.formatted||channel.target}</a>)}{branch.hours&&Object.entries(branch.hours).map(([day,hours])=><p key={day} className="text-xs text-slate-600"><strong>{day}:</strong> {hours}</p>)}<a className="solar-map-link" href={branch.mapEmbedUrl ? branch.mapEmbedUrl.replace('&output=embed','') : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.streetAddress)}`} target="_blank" rel="noopener noreferrer">{ui("Xem bản đồ & Chỉ đường", "Map and directions")} <ArrowUpRight size={13}/></a></article>);})}{branches[0]&&<iframe className="solar-branch-map" title={branches[0].name} loading="lazy" referrerPolicy="no-referrer" src={branches[0].mapEmbedUrl || `https://maps.google.com/maps?q=${encodeURIComponent(branches[0].streetAddress)}&output=embed`}/>}</div></div></section>
 <section className="solar-contact-faq"><div className="solar-container"><SectionHeading eyebrow={copy.faqEyebrow} title={copy.faqTitle}/>{[1,2,3,4].map(index=>copy[`faq${index}q`]&&<details key={index}><summary>{copy[`faq${index}q`]}</summary><p>{copy[`faq${index}a`]}</p></details>)}</div></section><CmsJourney copy={copy} mediaUrl={visuals.media.factory}/>  <ContentSuggestions  />
    </div>;
}
