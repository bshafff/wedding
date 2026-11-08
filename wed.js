// Data vendor & budget (disinkron & digabung di server, aman diedit dari 2 HP)
const WK='sr_wed',STAT=['Survey','Shortlist','Dipilih','Booked','Coret'];
const CATS=[['venue','Venue','🏛️'],['katering','Katering','🍽️'],['dekor','Dekorasi','💐'],['foto','Foto & Video','📸'],['mua','MUA & Busana','💄'],['musik','MC & Musik','🎤'],['wo','Wedding Organizer','📋'],['lain','Lainnya','✨']];
const uid=()=>Math.random().toString(36).slice(2,9);
const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const lines=s=>String(s||'').split('\n').map(x=>x.trim()).filter(Boolean);
const chosen=v=>v.status==='Dipilih'||v.status==='Booked';
if(!localStorage[K])localStorage[K]=DEFAULT_URL;
function wl(){try{const j=JSON.parse(localStorage[WK]||'{}');return{vendors:j.vendors||[],kv:j.kv||{},del:j.del||{}}}catch(e){return{vendors:[],kv:{},del:{}}}}
let wver=0,wbusy=null;
function wsv(d){wver++;localStorage[WK]=JSON.stringify(d);drawPage();wsync()}
const kvGet=(k,def)=>{const x=wl().kv[k];return x?x.v:def};
function kvSet(k,v){const d=wl();d.kv[k]={v,u:Date.now()};wsv(d)}
function vSave(v){const d=wl();v.u=Date.now();const i=d.vendors.findIndex(x=>x.id===v.id);i<0?d.vendors.push(v):d.vendors[i]=v;
  if(chosen(v)&&v.cat!=='lain')d.vendors.forEach(x=>{if(x.id!==v.id&&x.cat===v.cat&&chosen(x)){x.status='Shortlist';x.u=Date.now()}});wsv(d)}
function vDel(id){const d=wl();d.vendors=d.vendors.filter(x=>x.id!==id);d.del[id]=Date.now();wsv(d)}
function wsync(){if(wbusy)return wbusy;wbusy=(async()=>{try{for(let i=0;i<4;i++){if(!navigator.onLine)break;const v=wver;let j;
  try{const r=await fetch(localStorage[K]||DEFAULT_URL,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({action:'wedSave',data:wl()})});j=JSON.parse(await r.text())}
  catch(e){toast('Belum tersambung ke Sheet, data tersimpan di HP');break}
  if(!j.ok){toast(j.error||'Apps Script belum diperbarui (lihat PETUNJUK)');break}
  if(v!==wver)continue;localStorage[WK]=JSON.stringify(j.data);break}}finally{wbusy=null;drawPage()}})();return wbusy}
const _s=window.sync;window.sync=async()=>{await _s();await wsync()};
addEventListener('load',()=>{wsync();setInterval(()=>{if(!document.hidden)wsync()},30000)});
function sheet(html){const m=document.createElement('div');m.id='md';m.onclick=e=>{if(e.target===m)m.remove()};m.innerHTML='<div class="mc">'+html+'</div>';document.body.appendChild(m);return m}
