// ===== Shared config =====
const DEFAULT_URL='https://script.google.com/macros/s/AKfycbxzP8Rl5qbokxbR2g_agkGWGK1SJExMosC7pmijOl88iK6f3k5uY8tE7FjqBGZp897Z/exec';
const $=s=>document.querySelector(s);
const R=n=>'Rp'+Math.round(n).toLocaleString('id-ID');
const K='sr_url',D='sr_data';
const COL=['#8f1d21','#b8893b','#5f7f62','#c9694d','#6b4a7a','#3f6e8c','#a8946f','#d08a9b'];

let lastSync='',items=[],demo=false;

function toast(t,ms){const e=$('#st');if(!e)return;e.textContent=t;e.style.display='block';clearTimeout(window._tt);window._tt=setTimeout(()=>e.style.display='none',ms||1800)}

async function load(){
  const u=localStorage[K];
  if(!u){ demo=true; items=JSON.parse(localStorage[D]||'[]'); drawPage(); return; }
  demo=false;
  if(q_().length){ stat(); return; }
  try{
    items=await(await fetch(u)).json();
    localStorage[D]=JSON.stringify(items);
    lastSync=new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
  }catch(e){
    if(!items.length) items=JSON.parse(localStorage[D]||'[]');
    toast('Offline, memakai data terakhir');
  }
  drawPage();
}
async function sync(){ await flush(); if(!q_().length) await load(); }

function q_(){return JSON.parse(localStorage.sr_q||'[]')}
function setq(a){localStorage.sr_q=JSON.stringify(a);stat()}
let flushPromise=null;
async function flush(){
  const u=localStorage[K];
  if(!u||!navigator.onLine)return;
  if(flushPromise)return flushPromise;
  flushPromise=(async()=>{
    try{
      while(true){
        const a=q_(); if(!a.length)break;
        try{
          const res=await fetch(u,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify(a[0])});
          const txt=await res.text();
          if(txt.trim()!=='ok'){
            console.warn('Server tidak balas ok:',res.status,txt.slice(0,200));
            toast('Server belum simpan, coba lagi nanti');
            break;
          }
          const cur=q_();cur.shift();setq(cur);
        }catch(e){
          console.warn('Kirim gagal:',e);
          toast('Belum tersambung, perubahan menunggu');
          break;
        }
      }
    } finally { flushPromise=null; }
  })();
  return flushPromise;
}
function queue(p){ const a=q_();a.push(p);setq(a); flush().then(()=>{ if(!q_().length) load() }); }

function stat(){
  const n=q_().length,e=$('#sy'),c=$('#cn');if(!e)return;
  if(c) c.textContent=navigator.onLine?'🟢 Online':'🔴 Offline · data tersimpan lokal';
  e.textContent=!localStorage[K]?'':n?' · '+n+' perubahan menunggu sinkron':lastSync?' · tersinkron '+lastSync+' · auto-sync aktif':'';
}
function connect(){localStorage[K]=DEFAULT_URL;delete localStorage[D];items=[];toast('Menyambungkan...');sync()}
function demoMode(){localStorage.removeItem(K);load()}
function cfg(){const v=prompt('Tempel URL Web App Apps Script (…/exec). Kosongkan untuk mode demo:',localStorage[K]||''); if(v===null)return; v?localStorage[K]=v.trim():localStorage.removeItem(K); delete localStorage[D]; load(); }
function save(it){localStorage[D]=JSON.stringify(items);if(localStorage[K])queue({no:it.no,done:it.done,tgl:it.tgl,real:it.real,rbrand:it.rbrand||''})}
function tot(){const b=items.reduce((a,x)=>a+x.total,0),d=items.filter(x=>x.done),r=d.reduce((a,x)=>a+(x.real||x.total),0),bd=d.reduce((a,x)=>a+x.total,0);
 return{b,n:items.length,dn:d.length,r,bd,sisa:b-bd,pct:items.length?d.length/items.length*100:0}}

// ===== AUTO UPDATE =====
async function checkUpdate(){
  try{
    const r=await fetch('./version.json?t='+Date.now(),{cache:'no-store'});
    const j=await r.json();
    const seen=localStorage.app_v;
    if(!seen){ localStorage.app_v=j.v; return {state:'first', v:j.v}; }
    if(j.v!==seen){ console.log('Versi baru:',j.v,'(lama:',seen,')'); return {state:'new', v:j.v, old:seen}; }
    return {state:'latest', v:seen};
  }catch(e){ console.warn('Cek update gagal:',e); return {state:'error'}; }
}
async function hardReset(){
  try{
    if('serviceWorker' in navigator){
      const regs=await navigator.serviceWorker.getRegistrations();
      for(const reg of regs) await reg.unregister();
    }
    if('caches' in window){
      const keys=await caches.keys();
      await Promise.all(keys.map(k=>caches.delete(k)));
    }
  }catch(e){}
  try{
    const r=await fetch('./version.json?t='+Date.now(),{cache:'no-store'});
    const j=await r.json(); localStorage.app_v=j.v;
  }catch(e){}
  location.replace(location.pathname+'?fresh='+Date.now());
}
function showUpdateBanner(version){
  if(document.getElementById('ub'))return;
  const b=document.createElement('div');
  b.id='ub';
  b.style.cssText='position:fixed;top:0;left:0;right:0;background:#5f7f62;color:#fff;padding:10px 14px;text-align:center;z-index:99999;font:600 14px Figtree,sans-serif;display:flex;gap:8px;justify-content:center;align-items:center;flex-wrap:wrap';
  b.innerHTML='<span>Versi baru '+version+' tersedia</span>'+
    '<button id="ub-yes" style="padding:6px 12px;border:0;border-radius:6px;background:#fff;color:#5f7f62;font:600 13px Figtree,sans-serif">Muat ulang</button>'+
    '<button id="ub-no" style="padding:6px 12px;border:1px solid #fff;border-radius:6px;background:none;color:#fff;font:600 13px Figtree,sans-serif">Nanti</button>';
  document.body.appendChild(b);
  document.getElementById('ub-yes').onclick=()=>hardReset();
  document.getElementById('ub-no').onclick=()=>b.remove();
}
async function manualUpdate(){
  toast('Memeriksa update...');
  const r=await checkUpdate();
  if(r.state==='error'){ toast('Gagal cek update, periksa koneksi'); return; }
  if(r.state==='first'){ toast('Versi tersimpan: '+r.v); return; }
  if(r.state==='latest'){ toast('Sudah versi terbaru ('+r.v+')'); return; }
  showUpdateBanner(r.v);
  toast('Versi baru tersedia');
}

function renderNav(active){
  const items=[
    ['home','./','🏠','Home'],
    ['daftar','daftar.html','📋','Daftar'],
    ['grafik','grafik.html','📊','Grafik'],
    ['planning','planning.html','💍','Rencana'],
    ['diet','diet.html','🥗','Diet'],
    ['board','board.html','💡','Board']
  ];
  const nav=document.querySelector('nav'); if(!nav)return;
  nav.innerHTML=items.map(x=>`<button class="${active===x[0]?'on':''}" onclick="location.href='${x[1]}'"><div class="ic">${x[2]}</div>${x[3]}</button>`).join('');
}

function welcomeHTML(){
  return `<div class="card" style="text-align:center;padding:30px 18px"><div class="num" style="font-size:24px;color:var(--wine)">Sambungkan ke Google Sheet</div>
<p class="mute" style="margin:10px 0 20px">Ketuk sekali untuk memuat daftar seserahan dan menyinkronkan semua perubahan.</p>
<button onclick="connect()" style="padding:14px 40px;border:0;border-radius:30px;background:var(--wine);color:#fff;font:600 16px Figtree,sans-serif">Sambung</button>
<p style="margin-top:18px"><a href="#" class="mute" onclick="demoMode();return false">Coba mode demo</a></p></div>`;
}

function drawPage(){ if(typeof window.drawPage==='function') window.drawPage(); }

// ===== Install prompt =====
let dp=null;
function showInst(t,f){if($('#ib'))return;const b=document.createElement('button');b.id='ib';b.innerHTML=t+' <span id="ibx" style="margin-left:10px;opacity:.7">✕</span>';
 b.style.cssText='position:fixed;bottom:calc(76px + env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);background:#8f1d21;color:#fff;padding:12px 22px;border:0;border-radius:30px;font:600 14px Figtree,sans-serif;box-shadow:0 4px 12px #0004;z-index:9999;white-space:nowrap';
 b.onclick=ev=>{if(ev.target.id==='ibx'){rmInst();return}f()};document.body.appendChild(b)}
function rmInst(){const b=$('#ib');if(b)b.remove()}
addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e;showInst('⬇️ Install Aplikasi',async()=>{dp.prompt();await dp.userChoice;dp=null;rmInst()})});
addEventListener('appinstalled',rmInst);
if(/iphone|ipad|ipod/i.test(navigator.userAgent)&&!(matchMedia('(display-mode: standalone)').matches||navigator.standalone))showInst('⬇️ Cara pasang di iPhone',()=>alert('Buka lewat Safari, ketuk tombol Bagikan, lalu pilih "Tambah ke Layar Utama".'));

// ===== SW =====
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(e=>console.error('SW gagal:',e)));

// ===== Boot =====
window.addEventListener('load',()=>{
  const stored=JSON.parse(localStorage[D]||'[]');
  if(stored.length) items=stored;
  drawPage();
  checkUpdate().then(r=>{ if(r.state==='new') showUpdateBanner(r.v); });
  sync();
  setInterval(()=>{if(!document.hidden)sync()},30000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()});
  addEventListener('online',()=>{toast('Kembali online, menyinkronkan...');stat();sync()});
  addEventListener('offline',()=>{stat();toast('Mode offline, data disimpan lokal')});
});
