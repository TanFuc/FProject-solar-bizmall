'use client';
import { FormEvent, useState } from 'react';
import { VisualImage } from '@/components/ui/VisualImage';
import { object } from '@/lib/api/blocks';
interface MediaRow { id:string; url:string; originalName:string }
interface PageRow { id:string; pageKey:string; title:string }
const origin=(process.env.NEXT_PUBLIC_API_BASE_URL||'http://localhost:3001').replace(/\/$/,'');
const api=origin.endsWith('/api/v1')?origin:`${origin}/api/v1`;
function records(value:unknown):Record<string,unknown>[] {return Array.isArray(value)?value.filter(object):[];}
const slotNames:Record<string,string>={home:'Nhà ở',factory:'Nhà xưởng',office:'Doanh nghiệp',ev:'Trạm sạc',panel:'Tấm pin',inverter:'Inverter',battery:'Pin lưu trữ',charger:'Bộ sạc',electrical:'Thiết bị điện',logo:'Logo'};
const fieldNames:Record<string,string>={solutions:'Tiêu đề giải pháp',products:'Tiêu đề sản phẩm',projects:'Tiêu đề dự án',news:'Tiêu đề tin tức',features:'Tiêu đề cam kết',consultation:'Tiêu đề tư vấn',consultationSubtitle:'Mô tả tư vấn',contact:'Tiêu đề liên hệ',form:'Tiêu đề biểu mẫu',branches:'Tiêu đề chi nhánh',faq:'Tiêu đề hỏi đáp'};
function copyValues(value:string):Record<string,string>{const parsed:unknown=JSON.parse(value);const result:Record<string,string>={};if(object(parsed))for(const [key,text]of Object.entries(parsed)){if(typeof text==='string')result[key]=text;}return result;}
function parseBlocks(value:string):Record<string,unknown>[] {const parsed:unknown=JSON.parse(value);if(!Array.isArray(parsed)||!parsed.every(object))throw new Error('Cấu trúc nội dung trang không hợp lệ.');return parsed;}
export default function MediaManager(){
 const [token,setToken]=useState('');const [email,setEmail]=useState('');const [password,setPassword]=useState('');
 const [media,setMedia]=useState<MediaRow[]>([]);const [pages,setPages]=useState<PageRow[]>([]);const [selected,setSelected]=useState<MediaRow|null>(null);
 const [pageId,setPageId]=useState('');const [baseRevision,setBaseRevision]=useState('');const [blocks,setBlocks]=useState<Record<string,unknown>[]>([]);const [seo,setSeo]=useState<string|null>(null);
 const [replacementSource,setReplacementSource]=useState('');
 const [slot,setSlot]=useState('hero');const [title,setTitle]=useState('');const [accent,setAccent]=useState('');const [subtitle,setSubtitle]=useState('');const [copy,setCopy]=useState('{}');
 const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');const [error,setError]=useState('');
 async function call(path:string, options:RequestInit={},access=token):Promise<unknown>{
  const headers=new Headers(options.headers);if(access)headers.set('Authorization',`Bearer ${access}`);
  const response=await fetch(api+path,{...options,headers,cache:'no-store',credentials:'include'});
  const payload:unknown=await response.json();if(!response.ok){const detail=object(payload)&&object(payload.error)&&typeof payload.error.message==='string'?payload.error.message:`HTTP ${response.status}`;throw new Error(detail);}
  return object(payload)?payload.data:undefined;
 }
 async function load(access=token){
  const [files,pageList]=await Promise.all([call('/admin/media?pageSize=100',{},access),call('/admin/pages',{},access)]);
  setMedia(records(files).flatMap(row=>typeof row.id==='string'&&typeof row.url==='string'&&typeof row.originalName==='string'?[{id:row.id,url:row.url,originalName:row.originalName}]:[]));
  setPages(records(pageList).flatMap(row=>typeof row.id==='string'&&typeof row.pageKey==='string'&&typeof row.title==='string'?[{id:row.id,pageKey:row.pageKey,title:row.title}]:[]));
 }
 async function action(work:()=>Promise<void>){setBusy(true);setError('');setMessage('');try{await work();}catch(e){setError(e instanceof Error?e.message:'Không thực hiện được yêu cầu.');}finally{setBusy(false);}}
 async function login(e:FormEvent<HTMLFormElement>){e.preventDefault();await action(async()=>{
  const data=await call('/admin/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})},'');
  if(!object(data)||typeof data.accessToken!=='string')throw new Error('Backend chưa cấp phiên đăng nhập hợp lệ.');
  await load(data.accessToken);setToken(data.accessToken);setPassword('');setMessage('Đã kết nối tài khoản quản trị backend.');
 });}
 async function readPage(id:string){await action(async()=>{
  const data=await call(`/admin/pages/${id}`);if(!object(data))throw new Error('Không đọc được trang.');
  const revisionId=typeof data.currentDraftRevisionId==='string'?data.currentDraftRevisionId:data.publishedRevisionId;
  const revision=records(data.revisions).find(row=>row.id===revisionId);if(!revision||typeof revision.blocksJson!=='string'||typeof revision.id!=='string')throw new Error('Trang chưa có bản nội dung để chỉnh sửa.');
  const next=parseBlocks(revision.blocksJson);setPageId(id);setBaseRevision(revision.id);setBlocks(next);setSeo(typeof revision.seoJson==='string'?revision.seoJson:null);setSlot('hero');
  const hero=next.find(b=>b.type==='heroCarousel');const slides=hero&&object(hero.data)?records(hero.data.slides):[];const slide=slides[0];
  setTitle(slide&&typeof slide.title==='string'?slide.title:'');setAccent(slide&&typeof slide.accentPhrase==='string'?slide.accentPhrase:'');setSubtitle(slide&&typeof slide.subtitle==='string'?slide.subtitle:'');
  const text=next.find(b=>b.id==='seed_visual_v3_copy');setCopy(JSON.stringify(text&&object(text.data)&&object(text.data.copy)?text.data.copy:{},null,2));
 });}
 async function upload(e:FormEvent<HTMLFormElement>){e.preventDefault();const form=e.currentTarget;const data=new FormData(form);const file=data.get('file');if(!(file instanceof File)||!file.size)return;
  if(file.size>25*1024*1024){setError('Ảnh cần nhỏ hơn 25 MB.');return;}
  await action(async()=>{const result=await call('/admin/media/upload',{method:'POST',body:data});if(!object(result)||typeof result.id!=='string'||typeof result.url!=='string'||typeof result.originalName!=='string')throw new Error('Phản hồi upload chưa hợp lệ.');
   setSelected({id:result.id,url:result.url,originalName:result.originalName});await load();form.reset();setMessage('Đã upload và lưu ảnh trong thư viện. Chọn trang rồi xuất bản để áp dụng.');
  });
 }
 const gallery=blocks.find(b=>b.id==='seed_visual_v3_media');const slots=gallery&&object(gallery.data)?records(gallery.data.items).flatMap(item=>typeof item.key==='string'?[item.key]:[]):[];
 async function replaceUsage(restore=false){await action(async()=>{
  if(!replacementSource)throw new Error('Chọn ảnh đang được sử dụng.');
  if(!restore&&!selected)throw new Error('Chọn ảnh mới từ thư viện.');
  if(!restore&&selected?.id===replacementSource)throw new Error('Ảnh mới phải khác ảnh cần thay.');
  await call(`/admin/media/${replacementSource}/replacement`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({replacementId:restore?null:selected?.id})});
  await load();setMessage(restore?'Đã khôi phục ảnh gốc tại các vị trí sử dụng.':'Đã thay ảnh tại tất cả vị trí sử dụng ảnh cũ. Tải lại website để xem.');
 });}
 async function publish(){await action(async()=>{
  if(!pageId)throw new Error('Chọn trang cần chỉnh sửa.');
  const latest=await call(`/admin/pages/${pageId}`);if(!object(latest)||latest.currentDraftRevisionId!==baseRevision)throw new Error('Trang đã được thay đổi ở phiên khác. Vui lòng tải lại trang trước khi lưu.');
  const next=structuredClone(blocks);const hero=next.find(b=>b.type==='heroCarousel');if(!hero||!object(hero.data))throw new Error('Trang chưa có khối hero.');const slides=records(hero.data.slides);const slide=slides[0];if(!slide)throw new Error('Trang chưa có slide.');
  slide.title=title;slide.accentPhrase=accent;slide.subtitle=subtitle;
  if(selected&&slot==='hero'){slide.desktopMediaId=selected.id;slide.mobileMediaId=selected.id;delete slide.desktopMediaUrl;delete slide.mobileMediaUrl;}
  hero.data.slides=slides;
  if(selected&&slot.startsWith('gallery:')){const key=slot.substring(8);const block=next.find(b=>b.id==='seed_visual_v3_media');if(!block||!object(block.data))throw new Error('Không tìm thấy thư viện ảnh của trang.');const items=records(block.data.items);const item=items.find(i=>i.key===key);if(!item)throw new Error('Không tìm thấy vị trí ảnh.');item.mediaId=selected.id;delete item.mediaUrl;block.data.items=items;}
  const text:unknown=JSON.parse(copy);if(!object(text)||Object.values(text).some(v=>typeof v!=='string'))throw new Error('Nội dung CMS phải là một đối tượng gồm các trường văn bản.');
  const textBlock=next.find(b=>b.id==='seed_visual_v3_copy');if(textBlock&&object(textBlock.data))textBlock.data.copy=text;
  await call(`/admin/pages/${pageId}/revisions`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({blocksJson:JSON.stringify(next),seoJson:seo})});
  await call(`/admin/pages/${pageId}/publish`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});
  await readPage(pageId);setSelected(null);setMessage('Đã lưu bản mới và xuất bản. Website sẽ sử dụng dữ liệu vừa cập nhật.');
 });}
 return <section className="media-manager"><header><div><p>BM SOLAR / ADMIN</p><h1>Ảnh & nội dung website</h1></div>{token&&<button onClick={()=>{setToken('');setMedia([]);setBlocks([]);setSelected(null);}}>Đăng xuất</button>}</header>
  {error&&<p role="alert" className="media-error">{error}</p>}{message&&<p role="status" className="media-success">{message}</p>}
  {!token?<form onSubmit={login} className="media-login"><h2>Đăng nhập quản trị</h2><p>Sử dụng tài khoản quản trị website hiện có của bạn.</p><label>Email<input type="email" autoComplete="username" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Mật khẩu<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/></label><button disabled={busy} type="submit">{busy?'Đang kết nối…':'Đăng nhập'}</button></form>:
  <div className="media-workspace"><div><form onSubmit={upload} className="media-panel"><h2>Upload ảnh</h2><label>Chọn ảnh (tối đa 25 MB)<input type="file" name="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" required /></label><button disabled={busy} type="submit">Upload vào thư viện</button></form>
   <div className="media-library">{media.map(file=><button key={file.id} type="button" className={selected?.id===file.id?'selected':''} onClick={()=>setSelected(file)}><VisualImage src={file.url} alt={file.originalName} width={180} height={110} className="object-cover"/><span>{file.originalName}</span></button>)}</div></div>
   <div><section className="media-panel media-replacement"><h2>Thay ảnh đã sử dụng</h2><p className="media-selection">Áp dụng cho mọi vị trí đang dùng ảnh cũ: logo, thiết bị, giải pháp, dự án và bài viết. Ảnh gốc được giữ lại để khôi phục.</p><label>Ảnh cần thay<select value={replacementSource} onChange={e=>setReplacementSource(e.target.value)}><option value="">Chọn ảnh hiện tại</option>{media.map(file=><option key={file.id} value={file.id}>{file.originalName}</option>)}</select></label><p className="media-selection">{selected?`Ảnh mới: ${selected.originalName}`:'Chọn ảnh mới từ thư viện bên trái.'}</p><div className="flex flex-wrap gap-3 mt-4"><button type="button" disabled={busy||!selected||!replacementSource} onClick={()=>void replaceUsage()}>Thay ảnh trên website</button><button type="button" disabled={busy||!replacementSource} onClick={()=>void replaceUsage(true)}>Khôi phục ảnh gốc</button></div></section>
   <form className="media-panel" onSubmit={e=>{e.preventDefault();void publish();}}><h2>Áp dụng vào website</h2><label>Trang<select value={pageId} onChange={e=>void readPage(e.target.value)} required><option value="">Chọn trang</option>{pages.map(page=><option key={page.id} value={page.id}>{page.title} ({page.pageKey})</option>)}</select></label>
    {pageId&&<><label>Vị trí ảnh<select value={slot} onChange={e=>setSlot(e.target.value)}><option value="hero">Ảnh hero</option>{slots.map(key=><option key={key} value={`gallery:${key}`}>{slotNames[key] || key}</option>)}</select></label><p className="media-selection">{selected?`Ảnh đã chọn: ${selected.originalName}`:'Chọn ảnh từ thư viện để thay. Nếu không chọn, ảnh hiện tại được giữ nguyên.'}</p><label>Tiêu đề hero<textarea value={title} onChange={e=>setTitle(e.target.value)} required rows={2}/></label><label>Dòng nhấn mạnh<input value={accent} onChange={e=>setAccent(e.target.value)}/></label><label>Mô tả<textarea value={subtitle} onChange={e=>setSubtitle(e.target.value)} rows={3}/></label>{Object.entries(copyValues(copy)).map(([key,value])=><label key={key}>{fieldNames[key] || value.slice(0,70)}<textarea value={value} onChange={e=>setCopy(JSON.stringify({...copyValues(copy),[key]:e.target.value}))} rows={2}/></label>)}<button type="submit" disabled={busy}>{busy?'Đang lưu…':'Lưu & xuất bản'}</button></>}
   </form></div></div>}
 </section>;
}
