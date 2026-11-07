import { ArticleItem, PaginatedResponse, ProductCard, ProjectItem } from '@/types/bmsolar-api';
import { object } from './blocks';
const text = (v: unknown): string | undefined => typeof v === 'string' && v.trim() ? v : undefined;
export function productFromApi(v: unknown): ProductCard | undefined {
 if (!object(v) || !text(v.id) || !text(v.sku) || !text(v.slug) || !text(v.name)) return undefined;
 const category = text(v.categorySlug) && text(v.categoryName) ? {slug:String(v.categorySlug),name:String(v.categoryName)} : undefined;
 return {id:String(v.id),sku:String(v.sku),slug:String(v.slug),name:String(v.name),summary:text(v.summary)||'',status:'published',brandName:text(v.brandName),coverMediaUrl:text(v.coverMediaUrl)||text(v.coverUrl),category};
}
export function projectFromApi(v: unknown): ProjectItem | undefined {
 if (!object(v) || !text(v.id) || !text(v.slug) || !text(v.title)) return undefined;
 return {id:String(v.id),slug:String(v.slug),title:String(v.title),summary:text(v.summary)||'',coverMediaUrl:text(v.coverMediaUrl)||text(v.coverUrl),completedAt:text(v.completedAt),capacityKwp:typeof v.capacityKwp==='number'?v.capacityKwp:undefined,
 projectType:text(v.projectTypeSlug)&&text(v.projectTypeName)?{slug:String(v.projectTypeSlug),name:String(v.projectTypeName)}:undefined,
 province:text(v.provinceCode)&&text(v.provinceName)?{code:String(v.provinceCode),name:String(v.provinceName)}:undefined};
}
export function articleFromApi(v: unknown): ArticleItem | undefined {
 if (!object(v) || !text(v.id) || !text(v.slug) || !text(v.title)) return undefined;
 return {id:String(v.id),slug:String(v.slug),title:String(v.title),excerpt:text(v.excerpt)||'',coverMediaUrl:text(v.coverMediaUrl)||text(v.coverUrl),publishedAt:text(v.publishedAt),category:text(v.category),readTimeMinutes:typeof v.readTimeMinutes==='number'?v.readTimeMinutes:undefined};
}
export function listFromApi<T>(v: unknown,normalize:(value:unknown)=>T|undefined):PaginatedResponse<T> {
 if (!object(v)||!Array.isArray(v.data)) throw new Error('Invalid public API list');
 const data=v.data.flatMap(item=>{const parsed=normalize(item);return parsed?[parsed]:[]});
 const meta=object(v.meta)?v.meta:{};
 const n=(key:string,fallback:number)=>typeof meta[key]==='number'?meta[key]:fallback;
 return {data,meta:{page:n('page',1),pageSize:n('pageSize',data.length),total:n('total',data.length),totalPages:n('totalPages',1)}};
}
