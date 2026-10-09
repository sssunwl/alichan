const script = String.raw`(() => {
  const root = document.currentScript.closest('[data-trends]');
  const $ = s => root.querySelector(s);
  let data = null, tab = 'matched';
  const el = (tag, text, cls) => { const n = document.createElement(tag); if (text != null) n.textContent = text; if (cls) n.className = cls; return n; };
  const relative = value => { const ms = Date.now() - Date.parse(value); if (!Number.isFinite(ms)) return '時間未提供'; const hours = Math.max(0, Math.floor(ms / 3600000)); return hours < 1 ? '啱啱' : hours < 24 ? hours + ' 小時前' : Math.floor(hours / 24) + ' 日前'; };
  const render = () => {
    const list = $('[data-list]'); list.replaceChildren();
    const items = [...data.items].sort((a,b) => Number(Boolean(b.matched.length)) - Number(Boolean(a.matched.length))).filter(t => tab === 'all' || t.matched.length);
    if (!items.length) list.append(el('p', '暫時未有同阿陳有關嘅熱搜。', 'tool-empty'));
    items.forEach(t => {
      const card = el('article', null, 'ps-card'); const head = el('header'); head.append(el('h2', t.title), el('span', '搜尋量 ' + t.traffic, 'tool-chip'), el('small', relative(t.pubDate))); card.append(head);
      const chips = el('div', null, 'tool-chips'); t.matched.forEach(w => chips.append(el('span', w, 'tool-chip'))); card.append(chips);
      t.news.slice(0,2).forEach(n => { const p = el('p'); const a = el('a', n.title); try { const u = new URL(n.url); if (['http:', 'https:'].includes(u.protocol)) { a.href = u.href; a.target = '_blank'; a.rel = 'noopener noreferrer'; } } catch {} p.append(a, el('small', ' · ' + n.source)); card.append(p); });
      const button = el('button', '諗下點拍', 'tool-button'); button.type = 'button'; const out = el('div'); out.setAttribute('aria-live', 'polite'); card.append(button, out);
      button.addEventListener('click', async () => { button.disabled = true; out.replaceChildren(el('p', '諗緊…')); try { const r = await fetch('/cms/api/trend-idea', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({trend:t.title, news:t.news.map(n=>n.title)}) }); const d = await r.json(); if (!r.ok) throw new Error(d.error || '暫時拎唔到拍片諗法'); if (!Array.isArray(d.ideas)) throw new Error('回傳資料唔齊'); out.replaceChildren(); if (!d.ideas.length) out.append(el('p','暫時未諗到，陣間再試。')); d.ideas.forEach(i => { const box = el('div', null, 'tool-idea'); box.append(el('h3',i.title),el('span',i.platform,'tool-chip'),el('p',i.angle)); out.append(box); }); } catch(e) { out.replaceChildren(el('p', '諗法載入失敗：' + e.message, 'tool-error')); } finally { button.disabled = false; } }); list.append(card);
    });
  };
  let watchBusy = false;
  const renderWatch = () => { const box = $('[data-watch]'); box.replaceChildren(); data.watch.forEach((word,i) => { const chip=el('span',word,'tool-chip'),b=el('button','×','ta-chip-remove');b.type='button';b.disabled=watchBusy;b.setAttribute('aria-label','移除關注字：'+word);b.addEventListener('click',()=>updateWatch(data.watch.filter((_,n)=>n!==i)));chip.append(b);box.append(chip); }); };
  const updateWatch = async words => { if(watchBusy)return;watchBusy=true;renderWatch();$('[data-watch-form] button').disabled=true;$('[data-watch-status]').textContent='更新緊…';try {const r=await fetch('/cms/api/watch',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify({words})});const d=await r.json();if(!r.ok)throw new Error(d.error||'更新失敗');if(!Array.isArray(d.words))throw new Error('回傳資料唔齊');data.watch=d.words;$('[name=watchWord]').value='';$('[data-watch-status]').textContent='已更新';await load(true);}catch(e){$('[data-watch-status]').textContent='更新失敗：'+e.message;}finally{watchBusy=false;renderWatch();$('[data-watch-form] button').disabled=false;} };
  $('[data-watch-form]').addEventListener('submit',e=>{e.preventDefault();const word=$('[name=watchWord]').value.trim();if(!data||!word)return;if(data.watch.includes(word)){$('[data-watch-status]').textContent='呢個關注字已經喺名單。';return;}updateWatch([...data.watch,word]);});
  const load = async (fresh = false) => { const b = $('[data-refresh]'); b.disabled = true; $('[data-status]').textContent = '載入緊熱搜…'; try { const r = await fetch('/cms/api/trends' + (fresh === true ? '?fresh=1' : '')); const d = await r.json(); if (!r.ok) throw new Error(d.error || '伺服器回應 ' + r.status); if (!Array.isArray(d.items) || !Array.isArray(d.watch)) throw new Error('回傳資料唔齊'); data = d; $('[data-source]').textContent = '資料來源：Google Trends 香港每日熱搜 · 更新時間 ' + d.fetchedAt; renderWatch(); render(); $('[data-status]').textContent = ''; } catch(e) { $('[data-status]').textContent = '熱搜載入失敗：' + e.message + '。可以撳重新整理再試。'; } finally { b.disabled = false; } };
  root.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => { tab = b.dataset.tab; root.querySelectorAll('[data-tab]').forEach(x=>x.setAttribute('aria-pressed',String(x===b))); if(data) render(); })); $('[data-refresh]').addEventListener('click',load); load();
})();`

export const TrendsStudio = () => (
  <div class="ps wrap" data-trends="">
    <link rel="stylesheet" href="/cms/kit/dev.css" /><link rel="stylesheet" href="/cms/kit/tools.css" /><link rel="stylesheet" href="/cms/kit/app.css" />
    <p class="dev-flag">開發中 · 只有 SS 睇到</p><h1>熱門話題追蹤</h1><p class="ps-lead">睇吓香港人搵緊咩，再諗邊啲話題可以拍成阿陳嘅片。</p>
    <div class="tool-toolbar"><p data-source="">資料來源：Google Trends 香港每日熱搜 · 更新時間 —</p><button type="button" class="tool-button" data-refresh="">重新整理</button></div>
    <p class="tool-error" data-status="" role="status"></p>
    <div class="tool-toolbar" aria-label="熱搜篩選"><button type="button" class="tool-button" data-tab="matched" aria-pressed="true">同阿陳有關</button><button type="button" class="tool-button" data-tab="all" aria-pressed="false">全部熱搜</button></div>
    <div class="tool-stack" data-list=""></div><section class="ps-step"><h2>追蹤名單 · 關注字</h2><div class="tool-chips" data-watch=""></div><form class="ta-watch-form" data-watch-form=""><input name="watchWord" required aria-label="新增關注字" placeholder="加一個想追嘅字" /><button type="submit" class="tool-button">加入</button></form><p class="tool-error" data-watch-status="" role="status"></p></section>
    <script dangerouslySetInnerHTML={{ __html: script }} />
  </div>
)
