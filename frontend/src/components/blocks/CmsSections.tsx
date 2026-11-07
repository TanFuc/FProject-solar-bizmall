import Link from 'next/link';
import {ArrowRight,MessageCircle,Search,Settings,ShieldCheck,Handshake} from 'lucide-react';
import {SectionHeading} from '@/components/layout/PageHero';
export function CmsJourney({copy,mediaUrl}:{copy:Record<string,string>;mediaUrl?:string}){
 return <section className="solar-cms-journey" style={mediaUrl?{backgroundImage:`linear-gradient(90deg,rgba(5,37,74,.96),rgba(8,72,138,.92)),url("${mediaUrl}")`}:undefined}><div className="solar-container"><div><p>{copy.journeyEyebrow}</p><h2>{copy.journeyTitle}<span>{copy.journeyAccent}</span></h2><p>{copy.journeySubtitle}</p></div><div className="solar-journey-actions"><Link className="solar-orange-button" href="/lien-he#tu-van">{copy.journeyPrimary}<ArrowRight size={15}/></Link><Link className="solar-outline-button" href="/du-an">{copy.journeySecondary}<ArrowRight size={15}/></Link></div></div></section>;
}
export function CmsProcess({copy,count=5}:{copy:Record<string,string>;count?:number}){
 const icons=[MessageCircle,Search,Settings,ShieldCheck,Handshake];
 return <section id="quy-trinh" className="solar-cms-process"><div className="solar-container"><SectionHeading eyebrow={copy.processEyebrow} title={copy.processTitle} label={copy.processLink} link="/giai-phap"/><div className="solar-process-grid" style={{gridTemplateColumns:`repeat(${count},minmax(0,1fr))`}}>{Array.from({length:count},(_,index)=>{const Icon=icons[index]||Handshake;return <article key={index}><span>{String(index+1).padStart(2,'0')}</span><Icon size={24}/><h3>{copy[`process${index+1}Title`]}</h3><p>{copy[`process${index+1}Text`]}</p></article>})}</div></div></section>;
}
