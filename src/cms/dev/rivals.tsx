const script = String.raw`(() => {
  const root = document.currentScript.closest('[data-rivals]'); const $ = s => root.querySelector(s);
  const el = (tag,text,cls) => { const n=document.createElement(tag); if(text!=null)n.textContent=text; if(cls)n.className=cls; return n; };
  const views = n => Number(n)>=10000 ? (Number(n)/10000).toFixed(1)+' 萬' : Math.round(Number(n)||0).toLocaleString('zh-HK');
  const age = v => Math.max(1,(Date.now()-Date.parse(v.published))/86400000 || 1);
  const recent = (v,days) => { const time=Date.parse(v.published); return Number.isFinite(time) && time<=Date.now() && time>=Date.now()-days*86400000; };
  const date = v => Number.isFinite(Date.parse(v)) ? new Date(v).toLocaleDateString('zh-HK') : '日期未提供';
  const link = v => { const a=el('a',v.title); a.href='https://www.youtube.com/watch?v='+encodeURIComponent(v.id); a.target='_blank'; a.rel='noopener noreferrer'; return a; };
  const brands = v => { const box=el('div',null,'tool-chips'); v.brands.forEach(b=>box.append(el('span',b,'tool-chip'))); if(v.isSponsored)box.append(el('span','合作片','tool-chip')); return box; };
  const render = d => {
    $('[data-source]').textContent='資料來源：各頻道 YouTube RSS（最新 15 條）· 更新時間 '+d.fetchedAt;
    const rows=$('[data-overview]'), sponsors=$('[data-sponsors]'), cards=$('[data-channels]'); rows.replaceChildren(); sponsors.replaceChildren(); cards.replaceChildren();
    if(!d.channels.length) cards.append(el('p','暫時未有頻道資料。','tool-empty'));
    d.channels.forEach(c=>{
      const videos=c.videos || [], month=videos.filter(v=>recent(v,30)), quarter=videos.filter(v=>recent(v,90)); const top=[...quarter].sort((a,b)=>b.views-a.views)[0];
      const tr=el('tr',null,c.note==='自己'?'tool-self':''); const name=el('td',c.name+(c.note?'（'+c.note+'）':'')); if(c.error)name.append(el('p','載入失敗：'+c.error,'tool-error')); tr.append(name,el('td',c.error?'—':String(month.length)),el('td',c.error?'—':month.length?views(month.reduce((s,v)=>s+v.views,0)/month.length):'—')); const topCell=el('td'); if(top){const a=link(top); a.className='tool-truncate'; a.title=top.title; topCell.append(a,el('small',views(top.views)));} else topCell.textContent='—'; tr.append(topCell,el('td',c.error?'—':String(quarter.filter(v=>v.isSponsored||v.brands.length).length))); rows.append(tr);
      const details=el('details',null,'ps-card'); const summary=el('summary',c.name+(c.note?' · '+c.note:'')+'（'+videos.length+' 條片）'); details.append(summary); if(c.error)details.append(el('p','呢個頻道載入失敗：'+c.error,'tool-error')); if(!videos.length&&!c.error)details.append(el('p','暫時未有影片。'));
      [...videos].sort((a,b)=>Date.parse(b.published)-Date.parse(a.published)).forEach(v=>{ const row=el('article',null,'tool-video'); const img=el('img'); img.src='https://i.ytimg.com/vi/'+encodeURIComponent(v.id)+'/mqdefault.jpg'; img.alt=''; img.loading='lazy'; img.width=160; img.height=90; const body=el('div'); body.append(link(v),el('p',date(v.published)+' · '+views(v.views)+' 次觀看 · 日均 '+views(v.views/age(v))+' 次'),brands(v)); row.append(img,body); details.append(row); }); cards.append(details);
    });
    const all=d.channels.flatMap(c=>(c.videos||[]).filter(v=>v.isSponsored||v.brands.length).map(v=>({v,c}))).sort((a,b)=>Date.parse(b.v.published)-Date.parse(a.v.published));
    if(!all.length)sponsors.append(el('p','暫時未搵到合作品牌。','tool-empty'));
    all.forEach(({v,c})=>{ const row=el('article',null,'ps-card'); row.append(el('small',date(v.published)+' · '+c.name),brands(v),link(v)); sponsors.append(row); });
  };
  const load=async()=>{ const b=$('[data-refresh]'); b.disabled=true; $('[data-status]').textContent='載入緊頻道資料…'; try {const r=await fetch('/cms/dev/api/rivals'); const d=await r.json(); if(!r.ok)throw new Error(d.error||'伺服器回應 '+r.status); if(!Array.isArray(d.channels))throw new Error('回傳資料唔齊'); render(d); $('[data-status]').textContent='';} catch(e){$('[data-status]').textContent='頻道資料載入失敗：'+e.message+'。可以撳重新整理再試。';}finally{b.disabled=false;} }; $('[data-refresh]').addEventListener('click',load); load();
})();`

export const RivalsStudio = () => (
  <div class="ps wrap" data-rivals="">
    <link rel="stylesheet" href="/cms/dev/dev.css" /><link rel="stylesheet" href="/cms/dev/tools.css" />
    <p class="dev-flag">開發中 · 只有 SS 睇到</p><h1>對手追蹤</h1><p class="ps-lead">睇各頻道最近出片同合作品牌，對返阿陳自己嘅表現。</p>
    <div class="tool-toolbar"><p data-source="">資料來源：各頻道 YouTube RSS（最新 15 條）· 更新時間 —</p><button type="button" class="tool-button" data-refresh="">重新整理</button></div><p class="tool-error" data-status="" role="status"></p>
    <section class="ps-step"><h2>概覽</h2><p class="tool-muted">只計 RSS 入面最新 15 條片，未必包晒近 30／90 日所有片；合作標記跟描述文字偵測結果。</p><div class="tool-table-scroll" role="region" aria-label="頻道概覽，可以左右捲" tabindex={0}><table class="tool-table"><thead><tr><th>頻道名</th><th>近 30 日出片數</th><th>近 30 日平均觀看</th><th>近 90 日最高觀看片</th><th>近 90 日合作片數</th></tr></thead><tbody data-overview=""></tbody></table></div></section>
    <section class="ps-step"><h2>最新合作品牌</h2><div class="tool-stack" data-sponsors=""></div></section><section class="ps-step"><h2>每個頻道嘅最新片</h2><div class="tool-stack" data-channels=""></div></section>
    <script dangerouslySetInnerHTML={{ __html: script }} />
  </div>
)
