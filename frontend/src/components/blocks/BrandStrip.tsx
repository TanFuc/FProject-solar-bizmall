import Link from 'next/link';
import { VisualImage } from '@/components/ui/VisualImage';
export interface PublicBrand {id:string;slug:string;name:string;logoUrl?:string}
export function BrandStrip({brands,headline}:{brands:PublicBrand[];headline?:string}) {
 if(!brands.length)return null;
 return <section className="solar-brand-strip">{headline&&<h2>{headline}</h2>}<div>{brands.map(brand=><Link key={brand.id} href={`/san-pham?brand=${brand.slug}`}>
 {brand.logoUrl?<VisualImage src={brand.logoUrl} alt={brand.name} width={120} height={44} className="object-contain"/>:<span>{brand.name}</span>}
 </Link>)}</div></section>;
}
