import Link from 'next/link';
import { VisualImage } from '@/components/ui/VisualImage';
import { ArrowRight } from 'lucide-react';
import type { getPageVisuals } from '@/lib/api/visuals';
type Visuals=Awaited<ReturnType<typeof getPageVisuals>>;
export function PageHero({visuals}:{visuals:Visuals}){
 return <><section className="solar-page-hero solar-inner-hero">
 <VisualImage src={visuals.hero?.desktopMediaUrl} alt="" fill priority sizes="100vw" className="object-cover"/>
 <div className="solar-inner-hero-shade"/><div className="solar-container solar-inner-hero-copy">
 {visuals.hero?.eyebrow&&<p className="solar-eyebrow">{visuals.hero.eyebrow}</p>}
 <h1>{visuals.hero?.title || visuals.page.title}{visuals.hero?.accentPhrase&&<span>{visuals.hero.accentPhrase}</span>}</h1>
 {visuals.hero?.subtitle&&<p>{visuals.hero.subtitle}</p>}
 <div className="solar-inner-hero-actions"><Link href="/lien-he" className="solar-orange-button">{visuals.hero?.primaryCtaText || 'Liên hệ tư vấn'}<ArrowRight size={16}/></Link><Link href="/giai-phap" className="solar-outline-button">{visuals.copy.heroSecondary || 'Giải pháp'}<ArrowRight size={16}/></Link></div>
 </div></section><div className="solar-container solar-breadcrumb"><Link href="/">Trang chủ</Link><span>›</span><span>{visuals.hero?.eyebrow || visuals.page.title}</span></div></>;
}
export function SectionHeading({eyebrow,title,link,label}:{eyebrow?:string;title?:string;link?:string;label?:string}){
 return <div className="solar-page-section-heading"><div>{eyebrow&&<p>{eyebrow}</p>}{title&&<h2>{title}</h2>}</div>{link&&label&&<Link href={link}>{label}<ArrowRight size={14}/></Link>}</div>;
}
