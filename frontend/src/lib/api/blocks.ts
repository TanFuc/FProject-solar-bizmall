import { ArticleItem, AudienceItem, ProductCard, ProductCategoryItem, ProjectItem } from '@/types/bmsolar-api';
import type { HeroSlide } from '@/components/blocks/HeroCarousel';
export function object(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value); }
const text = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0;
export function items<T>(value: unknown, guard: (v: unknown) => v is T): T[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const result = value.filter(guard);
  return result.length ? result : undefined;
}
export const category = (v: unknown): v is ProductCategoryItem => object(v) && text(v.id) && text(v.slug) && text(v.name) && typeof v.sortOrder === 'number' && text(v.status) && (v.imageUrl === undefined || text(v.imageUrl));
export const audience = (v: unknown): v is AudienceItem => object(v) && text(v.id) && ['household', 'business', 'industrial'].includes(String(v.code)) && text(v.label) && typeof v.enabled === 'boolean' && (v.imageUrl === undefined || text(v.imageUrl));
export const product = (v: unknown): v is ProductCard => object(v) && text(v.id) && text(v.sku) && text(v.slug) && text(v.name) && typeof v.summary === 'string' && text(v.status) && (v.coverMediaUrl === undefined || text(v.coverMediaUrl));
export const project = (v: unknown): v is ProjectItem => object(v) && text(v.id) && text(v.slug) && text(v.title) && (v.coverMediaUrl === undefined || text(v.coverMediaUrl));
export const article = (v: unknown): v is ArticleItem => object(v) && text(v.id) && text(v.slug) && text(v.title) && (v.coverMediaUrl === undefined || text(v.coverMediaUrl));
export function heroSlides(value: unknown): HeroSlide[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap(v => {
    if (!object(v) || !text(v.title)) return [];
    const cta = object(v.cta) && text(v.cta.label) ? v.cta.label : undefined;
    return [{ eyebrow: text(v.eyebrow) ? v.eyebrow : undefined, benefits: Array.isArray(v.benefits) ? v.benefits.flatMap(b=>object(b)&&text(b.label)&&text(b.iconToken)?[{label:b.label,iconToken:b.iconToken}]:[]) : undefined, title: v.title, subtitle: text(v.subtitle) ? v.subtitle : undefined,
      accentPhrase: text(v.accentPhrase) ? v.accentPhrase : undefined,
      desktopMediaUrl: text(v.desktopMediaUrl) ? v.desktopMediaUrl : undefined,
      mobileMediaUrl: text(v.mobileMediaUrl) ? v.mobileMediaUrl : undefined,
      primaryCtaText: text(v.primaryCtaText) ? v.primaryCtaText : cta,
      secondaryCtaText: text(v.secondaryCtaText) ? v.secondaryCtaText : undefined }];
  });
}

export function featureItems(value:unknown) {
 return Array.isArray(value)?value.flatMap(v=>object(v)&&text(v.iconToken)&&text(v.label)?[{iconToken:v.iconToken,label:v.label,description:text(v.description)?v.description:''}]:[]):[];
}
