import { getPageBySlug } from './client';
import { heroSlides, object } from './blocks';
export function pageCopy(blocks:import('@/types/bmsolar-api').CMSBlock[]) {
 const source=blocks.find(block=>block.id==='seed_visual_v3_copy')?.data.copy;
 const result:Record<string,string>={};if(object(source))for(const [key,value] of Object.entries(source)){if(typeof value==='string')result[key]=value;}
 return result;
}
export async function getPageVisuals(key:string) {
 const page=await getPageBySlug(key);
 const heroBlock=page.blocks.find(block=>block.type==='heroCarousel'&&block.enabled);
 const hero=heroSlides(heroBlock?.data.slides)[0];
 const gallery=page.blocks.find(block=>block.type==='projectGallery'&&block.enabled);
 const media:Record<string,string>={};
 if(Array.isArray(gallery?.data.items)) for(const item of gallery.data.items) {
  if(object(item)&&typeof item.key==='string'&&typeof item.mediaUrl==='string'&&/^https?:\/\//.test(item.mediaUrl)) media[item.key]=item.mediaUrl;
 }
 return {page,hero,media,copy:pageCopy(page.blocks)};
}
