import { guides, type Guide } from '../../content/guides'
import { site } from '../../site.config'

export type Slide = { kind: 'cover' | 'tldr' | 'facts' | 'point' | 'places' | 'faq' | 'cta'; kicker?: string; title: string; body?: string; items?: { label: string; value?: string; total?: boolean }[]; t?: number }
export function buildDeck(g: Guide, keyword: string): Slide[] {
  const tail: Slide[] = []
  if (g.places?.length) tail.push({ kind: 'places', title: '地址清單', items: g.places.slice(0, 5).map(p => ({ label: p.name, value: p.what })) })
  if (g.faq.length) tail.push({ kind: 'faq', title: '大家問', items: g.faq.slice(0, 2).map(q => ({ label: q.q, value: q.a })) })
  tail.push({ kind: 'cta', title: `留言「${keyword}」`, body: '我 DM 你完整攻略連結！\n全文喺 alichan.sssuni.com' })
  const start: Slide[] = [{ kind: 'cover', kicker: g.tags[0], title: g.title, t: g.sections[0]?.t ?? 0 }, { kind: 'tldr', title: '一句講晒', items: g.tldr.map(label => ({ label })) }]
  if (g.facts?.length) start.push({ kind: 'facts', title: g.factsCaption ?? '花費', items: [...g.facts.slice(0, 6).map(f => ({ label: f.label, value: f.value })), ...(g.factsTotal ? [{ label: g.factsTotal.label, value: g.factsTotal.value, total: true }] : [])], t: g.facts[0].t })
  const points: Slide[] = g.sections.slice(0, Math.max(0, 10 - start.length - tail.length)).map(s => ({ kind: 'point', title: s.heading, body: Array.from(s.body[0] ?? '').length > 70 ? Array.from(s.body[0]).slice(0, 70).join('') + '…' : s.body[0], t: s.t }))
  return [...start, ...points, ...tail]
}
const styles = [['receipt', '帳單'], ['scrapbook', '手帳'], ['bold', '大字報'], ['route', '路線']]
const esc = (v: unknown) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
function slideHTML(s: Slide, index: number, total: number, photo: string, style: string, brand: { shortName: string; instagramHandle: string }) {
  return `<article class="cs-slide cs-style-${style} cs-kind-${s.kind}" data-slide="${index}">${s.kind === 'point' ? `<span class="cs-point-number">${String(index - 1).padStart(2, '0')}</span>` : ''}<div class="cs-paper"><button type="button" class="cs-photo" aria-label="換下一張影片畫面"><img src="${esc(photo)}" crossorigin="anonymous" alt="影片畫面"></button><div class="cs-copy"><span class="cs-kicker" contenteditable="true" data-edit="kicker">${esc(s.kicker || brand.shortName)}</span><h3 contenteditable="true" data-edit="title">${esc(s.title)}</h3>${s.body !== undefined ? `<p class="cs-body" contenteditable="true" data-edit="body">${esc(s.body)}</p>` : ''}<div class="cs-items">${(s.items || []).map((item, i) => `<div class="cs-item${item.total ? ' cs-total' : ''}"><span contenteditable="true" data-edit="label" data-item="${i}">${esc(item.label)}</span>${item.value !== undefined ? `<strong contenteditable="true" data-edit="value" data-item="${i}">${esc(item.value)}</strong>` : ''}</div>`).join('')}</div>${s.t !== undefined ? `<span class="cs-time">▶ ${Math.floor(s.t / 60)}:${String(s.t % 60).padStart(2, '0')}</span>` : ''}</div><span class="cs-stamp">真實花費</span>${s.kind === 'cover' ? '<span class="cs-route-end">完整攻略</span>' : ''}</div><footer><span>${index + 1}/${total}</span><span class="cs-signature">${s.kind === 'cover' || s.kind === 'cta' ? '<img src="/cms/kit/avatar.jpg" crossorigin="anonymous" alt="">' : ''}@${esc(brand.instagramHandle)}</span></footer></article>`
}
const client = `(() => {
 const root = document.currentScript.closest('.cs-studio');
 if (!root || root.dataset.ready) return; root.dataset.ready = '1';
 const data = JSON.parse(root.querySelector('#cs-data').textContent);
 const preview = root.querySelector('.cs-preview'), keyword = root.querySelector('#cs-keyword'), download = root.querySelector('.cs-download'), status = root.querySelector('.cs-status');
 let active = 0, style = 'receipt', busy = false;
 const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const brand = ${JSON.stringify({ shortName: site.shortName, instagramHandle: site.instagramHandle })};
 const html = ${slideHTML.toString().replace(/\besc\(/g, 'escape(')};
 data.forEach(g => { g.hidden = []; g.photos = g.deck.map(s => { const t = s.t ?? g.deck[0].t ?? 0; return [...g.frames].sort((a,b) => Math.abs(a.t-t)-Math.abs(b.t-t)); }); g.selected = g.deck.map(() => 0); });
 const count = () => data[active].deck.length - data[active].hidden.filter(Boolean).length;
 const update = () => { download.textContent = '下載全部（' + count() + ' 張）'; download.disabled = busy || !count(); };
 const fit = () => { preview.querySelectorAll('.cs-slide').forEach(node => {
  node.querySelectorAll('[data-edit]').forEach(e => e.style.fontSize = '');
  const title = node.querySelector('h3'), copy = node.querySelector('.cs-copy');
  if (node.classList.contains('cs-kind-cta') && !node.classList.contains('cs-style-bold')) {
   let n = 0; while ((title.scrollHeight > parseFloat(getComputedStyle(title).lineHeight) * 2 + 1 || title.scrollWidth > title.clientWidth) && n++ < 60) title.style.fontSize = (parseFloat(getComputedStyle(title).fontSize) * .95) + 'px';
  }
  // 只喺真係溢出（>8px）先縮字；縮完冇改善就停（溢出可能嚟自固定元素），最細 28px（IG 手機仲睇得清）
  let n = 0, prev = Infinity; while (copy.scrollHeight > copy.clientHeight + 8 && copy.scrollHeight < prev && n++ < 30) {
   prev = copy.scrollHeight;
   copy.querySelectorAll('[data-edit]').forEach(e => { if (node.classList.contains('cs-style-bold') && node.classList.contains('cs-kind-point') && e.classList.contains('cs-body')) return; const size = parseFloat(getComputedStyle(e).fontSize); e.style.fontSize = Math.max(e.tagName === 'H3' ? 56 : 28, size * .95) + 'px'; });
  }
 }); };
 const scale = () => { preview.querySelectorAll('.cs-preview-card').forEach(card => card.style.setProperty('--cs-scale', card.clientWidth / 1080)); };
 const render = () => {
  const g = data[active];
  preview.innerHTML = g.deck.map((s,i) => '<div class="cs-preview-card' + (g.hidden[i] ? ' cs-hidden' : '') + '"><div class="cs-slide-window">' + html(s,i,g.deck.length,g.photos[i][g.selected[i]].url,style,brand) + '</div><div class="cs-toolbar"><button type="button" class="cs-toggle" data-toggle="' + i + '" aria-pressed="' + !!g.hidden[i] + '">' + (g.hidden[i] ? '顯示' : '隱藏') + '</button><button type="button" data-swap="' + i + '">↻ 換相</button></div></div>').join('');
  root.querySelectorAll('[data-guide]').forEach(b => b.setAttribute('aria-pressed', Number(b.dataset.guide) === active));
  root.querySelectorAll('[data-style]').forEach(b => b.setAttribute('aria-pressed', b.dataset.style === style));
  scale(); fit(); update();
 };
 root.addEventListener('click', event => {
  if (busy) return;
  const b = event.target.closest('button'); if (!b) return;
  if (b.dataset.guide !== undefined) { active = Number(b.dataset.guide); keyword.value = data[active].keyword; render(); preview.scrollLeft = 0; }
  if (b.dataset.style) { style = b.dataset.style; render(); }
  if (b.dataset.toggle !== undefined) { const i = Number(b.dataset.toggle); data[active].hidden[i] = !data[active].hidden[i]; render(); }
  if (b.classList.contains('cs-photo') || b.dataset.swap !== undefined) { const i = Number(b.dataset.swap ?? b.closest('[data-slide]').dataset.slide), g = data[active]; g.selected[i] = (g.selected[i]+1)%g.photos[i].length; preview.querySelector('[data-slide="'+i+'"] .cs-photo img').src = g.photos[i][g.selected[i]].url; }
 });
 root.addEventListener('input', event => {
  const g = data[active];
  if (event.target === keyword) { g.keyword = keyword.value; const i = g.deck.findIndex(s => s.kind === 'cta'); g.deck[i].title = '留言「' + keyword.value + '」'; preview.querySelector('[data-slide="'+i+'"] h3').textContent = g.deck[i].title; fit(); }
  else if (event.target.dataset.edit) { const e = event.target, s = g.deck[Number(e.closest('[data-slide]').dataset.slide)]; if (e.dataset.item !== undefined) s.items[Number(e.dataset.item)][e.dataset.edit] = e.innerText; else s[e.dataset.edit] = e.innerText; fit(); }
 });
 root.addEventListener('paste', event => { if (event.target.isContentEditable) { event.preventDefault(); const selection = window.getSelection(); if (!selection.rangeCount) return; const range = selection.getRangeAt(0); range.deleteContents(); const text = document.createTextNode(event.clipboardData.getData('text/plain')); range.insertNode(text); range.setStartAfter(text); range.collapse(true); selection.removeAllRanges(); selection.addRange(range); event.target.dispatchEvent(new Event('input', {bubbles:true})); } });
 const load = (url, name) => window[name] ? Promise.resolve() : new Promise((resolve,reject) => { const s = document.createElement('script'); s.src = url; s.onload = () => window[name] ? resolve() : reject(new Error('載入失敗')); s.onerror = reject; document.head.append(s); });
 download.addEventListener('click', async () => {
  if (busy || !count()) return; busy = true; update(); root.querySelector('.cs-controls').inert = true; preview.inert = true;
  let stage;
  try {
   status.textContent = '準備緊字體同相片…';
   await Promise.all([load('https://cdn.jsdelivr.net/npm/html-to-image@1.11.13/dist/html-to-image.js','htmlToImage'), load('https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js','JSZip'), document.fonts.ready]); fit();
   const zip = new window.JSZip(), nodes = [...preview.querySelectorAll('.cs-slide')].filter(n => !data[active].hidden[Number(n.dataset.slide)]);
   stage = document.createElement('div'); stage.className = 'cs-export-stage'; document.body.append(stage);
   for (let i=0;i<nodes.length;i++) {
    status.textContent = (i+1) + '/' + nodes.length;
    const clone = nodes[i].cloneNode(true); clone.classList.add('cs-export'); clone.querySelectorAll('.cs-ui').forEach(n => n.remove()); clone.querySelectorAll('[contenteditable]').forEach(n => n.removeAttribute('contenteditable')); stage.replaceChildren(clone);
    await Promise.all([...clone.querySelectorAll('img')].map(img => img.decode()));
    const blob = await window.htmlToImage.toBlob(clone, {width:1080,height:1440,pixelRatio:1,cacheBust:true}); if (!blob) throw new Error('圖片未能匯出');
    zip.file(String(i+1).padStart(2,'0')+'.png',blob);
   }
   const url = URL.createObjectURL(await zip.generateAsync({type:'blob'})), a = document.createElement('a'); a.href=url; a.download='alichan-'+data[active].slug+'-'+style+'.zip'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url),60000); status.textContent='下載好咗！';
  } catch(error) { status.textContent='下載唔到，請檢查相片同網絡，再試一次。'; console.error(error); }
  finally { stage?.remove(); busy=false; root.querySelector('.cs-controls').inert=false; preview.inert=false; update(); }
 });
 new ResizeObserver(scale).observe(preview); document.fonts.ready.then(fit); render();
})();`

export const CarouselStudio = ({ frames }: { frames: Record<string, number[]> }) => {
  const data = guides.filter(g => g.status === 'review').map(g => ({ slug: g.slug, title: g.title, videoId: g.videoId, keyword: g.tags[0] ?? '', deck: buildDeck(g, g.tags[0] ?? ''), frames: frames[g.videoId]?.length ? frames[g.videoId].map(t => ({ t, url: `/cms/kit/frames/${g.videoId}/${t}.jpg` })) : [{ t: 0, url: `https://i.ytimg.com/vi/${g.videoId}/maxresdefault.jpg` }] }))
  const first = data[0]
  return <main class="cs-studio" aria-label={`${site.name} 輪播圖生成器`}>
    <link rel="stylesheet" href="/cms/kit/carousel.css" />
    <link rel="stylesheet" crossorigin="anonymous" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&family=Noto+Sans+TC:wght@400;500;700;900&family=Outfit:wght@500;700;800&display=swap" />
    <header class="cs-header"><span class="cs-badge">開發中 · 只有 SS 睇到</span><h1>輪播圖生成器 <small>Carousel Studio</small></h1><p>揀文章 → 揀款式 → 下載。相片係由影片自動抽，撳相可以換。</p></header>
    <div class="cs-controls"><h2>揀文章</h2><div class="cs-guides">{data.map((g,i) => <button type="button" data-guide={i} aria-pressed={i === 0}><img src={`https://i.ytimg.com/vi/${g.videoId}/mqdefault.jpg`} alt="" /><span>{g.title}</span></button>)}</div>
    <h2>揀款式</h2><div class="cs-styles">{styles.map(([id,label]) => <button type="button" data-style={id} aria-pressed={id === 'receipt'}><i class={`cs-swatch cs-swatch-${id}`} />{label}</button>)}</div>
    <label class="cs-keyword" for="cs-keyword">留言關鍵字<input id="cs-keyword" type="text" maxlength={40} value={first?.keyword ?? ''} /></label></div>
    <h2>預覽 <small>撳文字就改得 · 左右掃睇下一張</small></h2><div class="cs-preview">{first ? first.deck.map((s,i) => <div class="cs-preview-card" dangerouslySetInnerHTML={{ __html: '<div class="cs-slide-window">' + slideHTML(s,i,first.deck.length,[...first.frames].sort((a,b) => Math.abs(a.t-(s.t ?? first.deck[0].t ?? 0))-Math.abs(b.t-(s.t ?? first.deck[0].t ?? 0)))[0].url,'receipt',site) + '</div>' }} />) : <p>仲未有整理好嘅文章。</p>}</div>
    <noscript>開啟 JavaScript 就可以換款、改字同下載。</noscript><div class="cs-bottom"><span class="cs-status" role="status" aria-live="polite" /><button class="cs-download" type="button" disabled>下載全部（{first?.deck.length ?? 0} 張）</button></div>
    <script type="application/json" id="cs-data" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g,'\\u003c') }} />
    {first && <script dangerouslySetInnerHTML={{ __html: client }} />}
  </main>
}
