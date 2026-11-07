import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);const sharp=require('C:/Users/Local_2/AgentHub/visual-qa-tools/node_modules/sharp');
const base='http://127.0.0.1:3001/api/v1';const codes=[];
for(let batch=0;batch<10;batch++){const r=await Promise.all(Array.from({length:10},()=>fetch(base+'/public/site-shell').then(res=>res.status)));codes.push(...r);}
const shell=await(await fetch(base+'/public/site-shell')).json();const logo=shell.data.brand.logo.url;
const original=await fetch(logo);const bytes=Buffer.from(await original.arrayBuffer());const info=await sharp(bytes).metadata();const stats=await sharp(bytes).stats();const thumbUrl=logo.replace(/\.png$/,'_thumb.png');const thumb=await fetch(thumbUrl);const tb=Buffer.from(await thumb.arrayBuffer());const ti=await sharp(tb).metadata();const ts=await sharp(tb).stats();
const report={getRequests:codes.length,statusCounts:codes.reduce((a,c)=>(a[c]=(a[c]||0)+1,a),{}),logo:{url:logo,status:original.status,format:info.format,hasAlpha:info.hasAlpha,alphaMin:stats.channels.at(-1).min},thumbnail:{status:thumb.status,format:ti.format,hasAlpha:ti.hasAlpha,alphaMin:ts.channels.at(-1).min}};
await fs.writeFile(new URL('rate-and-logo-check.json',import.meta.url),JSON.stringify(report,null,2));console.log(JSON.stringify(report));if(codes.some(c=>c!==200)||!info.hasAlpha||stats.channels.at(-1).min!==0||!ti.hasAlpha||ts.channels.at(-1).min!==0)process.exitCode=1;
