const rates = [
  ['YouTube 專題影片', '一條'], ['YouTube 影片植入', '60–90 秒'], ['IG Reel', '一條'],
  ['IG Story', '一組 3 張'], ['Threads 帖文', '一篇'], ['網站專頁', '攻略文章 + 品牌連結 + 點擊報告'],
  ['「留言關鍵字」DM 連結頁', '一頁'], ['額外使用權', '品牌拎影片落廣告，按月'], ['獨家期', '同類品牌唔接，按月'],
] as const
const terms = [
  ['付款', '確認後付 50% 訂金，發佈後 7 日內付清餘款'], ['修改', '每個交付物包 1 次修改'],
  ['使用權', '發佈後內容版權屬阿陳；品牌二次使用需另購使用權'], ['發佈', '發佈日期雙方確認後定'], ['取消', '拍攝前取消收 30%'],
] as const

const script = String.raw`(() => {
  const root=document.currentScript.closest('[data-quote]'); const $=s=>root.querySelector(s);
  const config=JSON.parse($('[data-config]').textContent); const rates=config.rates;
  let prices=rates.map(()=>''), demo=false, items=[];
  const money=n=>'HK$ '+Number(n).toLocaleString('zh-HK',{minimumFractionDigits:2,maximumFractionDigits:2});
  const number=value=>{ const n=Number(value); return Number.isFinite(n)?Math.max(0,n):0; };
  const el=(tag,text,cls)=>{ const n=document.createElement(tag); if(text!=null)n.textContent=text; if(cls)n.className=cls; return n; };
  const today=new Date(); $('[name=date]').value=[today.getFullYear(),String(today.getMonth()+1).padStart(2,'0'),String(today.getDate()).padStart(2,'0')].join('-');
  const persist=()=>{ try {localStorage.setItem('alichan-ratecard',JSON.stringify({prices,demo})); $('[data-storage]').textContent='';}catch{$('[data-storage]').textContent='呢個瀏覽器儲存唔到收費表；今次仍然可以用。';} };
  try { const saved=JSON.parse(localStorage.getItem('alichan-ratecard')||'null'); if(saved && Array.isArray(saved.prices)){prices=rates.map((_,i)=>saved.prices[i]===''||saved.prices[i]==null?'':String(number(saved.prices[i]))); demo=saved.demo===true;} }catch{$('[data-storage]').textContent='讀唔到之前嘅收費表，先用空白表。';}
  const showRates=()=>{root.querySelectorAll('[data-rate]').forEach(input=>input.value=prices[Number(input.dataset.rate)]); $('[data-demo-warning]').hidden=!demo;};
  const select=$('[data-select]'); rates.forEach((r,i)=>{const o=el('option',r[0]+'（'+r[1]+'）');o.value=i;select.append(o);});
  const input=(value,label,type='text')=>{const n=el('input'); n.type=type; n.value=value; n.setAttribute('aria-label',label); if(type==='number'){n.min='0';n.step='0.01';}return n;};
  const renderItems=()=>{
    const box=$('[data-items]'); box.replaceChildren();
    if(!items.length)box.append(el('p','由收費表揀項目，或者加一個自訂項目。','tool-empty'));
    items.forEach((item,i)=>{const row=el('div',null,'quote-item'); const name=input(item.name,'項目名稱');const unit=input(item.unit,'單位');const quantity=input(item.qty,'數量','number');quantity.min='0.01';const price=input(item.price,'單價 HK$','number');price.placeholder='你嘅價錢';const remove=el('button','移除','tool-button');remove.type='button';remove.setAttribute('aria-label','移除項目 '+(i+1));
      [['項目',name],['單位',unit],['數量',quantity],['單價 HK$',price]].forEach(([title,field])=>{const label=el('label',title);label.append(field);row.append(label);});row.append(remove);
      name.addEventListener('input',()=>{item.name=name.value;update();});unit.addEventListener('input',()=>{item.unit=unit.value;update();});quantity.addEventListener('input',()=>{item.qty=number(quantity.value);update();});price.addEventListener('input',()=>{item.price=price.value===''?'':number(price.value);update();});remove.addEventListener('click',()=>{items.splice(i,1);renderItems();update();});box.append(row);
    });
  };
  const add=index=>{items.push({name:rates[index][0],unit:rates[index][1],qty:1,demo,price:prices[index]===''?'':number(prices[index])});};
  const get=()=>{
    const brand=$('[name=brand]').value.trim(), date=$('[name=date]').value;
    const suffix=(brand.replace(/[^\p{L}\p{N}]/gu,'').slice(0,3)||'XXX').toUpperCase();
    const subtotal=items.reduce((sum,i)=>sum+i.qty*number(i.price),0), value=number($('[name=discount]').value);
    const discount=Math.min(subtotal,$('[name=discountType]').value==='percent'?subtotal*Math.min(100,value)/100:value);
    return {brand,contact:$('[name=contact]').value.trim(),date,valid:number($('[name=valid]').value),id:'Q-'+date.replace(/-/g,'')+'-'+suffix,subtotal,discount,total:subtotal-discount,notes:$('[name=notes]').value.trim(),terms:config.terms.map((t,i)=>[t[0],$('[data-term="'+i+'"]').value])};
  };
  const audience='YouTube 訂閱 '+config.stats.youtubeSubscribers+'、IG 追蹤 '+(config.stats.instagramFollowers??'—')+'、IG 最高觀看 '+config.stats.topReelViews+'（資料時間 '+config.stats.asOf+'）';
  $('[data-audience]').textContent=audience; $('[data-email]').textContent='聯絡電郵 '+config.email;
  const update=()=>{
    const d=get(); ['id','date'].forEach(k=>$('[data-preview="'+k+'"]').textContent=d[k]||'—'); $('[data-preview=brand]').textContent=d.brand||'未填品牌'; $('[data-preview=contact]').textContent=d.contact||'—'; $('[data-preview=valid]').textContent=d.valid+' 日';
    const tbody=$('[data-preview-items]');tbody.replaceChildren();items.forEach(i=>{const row=el('tr');const name=el('td',i.name||'未填項目');name.append(el('small',i.unit));row.append(name,el('td',String(i.qty)),el('td',i.price===''?'待填':money(number(i.price))),el('td',i.price===''?'待填':money(i.qty*number(i.price))));tbody.append(row);});
    ['subtotal','discount','total'].forEach(k=>root.querySelectorAll('[data-total="'+k+'"]').forEach(n=>n.textContent=(k==='discount'?'− ':'')+money(d[k])));
    const list=$('[data-preview-terms]');list.replaceChildren();d.terms.forEach(([name,text])=>{const p=el('p');p.append(el('strong',name+'：'),document.createTextNode(text));list.append(p);}); $('[data-preview-notes]').textContent=d.notes; $('[data-preview-notes-box]').hidden=!d.notes;
    $('[data-preview-demo]').hidden=!(demo||items.some(i=>i.demo)); root.querySelectorAll('[data-missing]').forEach(n=>n.hidden=!items.some(i=>i.price==='')); $('[data-missing]').hidden=!items.some(i=>i.price==='');
  };
  root.addEventListener('input',e=>{if(e.target.matches('[data-rate]')){prices[Number(e.target.dataset.rate)]=e.target.value===''?'':String(number(e.target.value));persist();} update();});root.addEventListener('change',update);
  $('[data-demo]').addEventListener('click',()=>{prices=[30000,15000,8000,3000,2000,5000,1500,4000,6000].map(String);demo=true;persist();showRates();update();});
  $('[data-clear]').addEventListener('click',()=>{prices=rates.map(()=>'');demo=false;persist();showRates();update();});
  $('[data-add]').addEventListener('click',()=>{add(Number(select.value));renderItems();update();});
  $('[data-custom]').addEventListener('click',()=>{items.push({name:'',unit:'',qty:1,price:''});renderItems();update();});
  root.querySelectorAll('[data-package]').forEach(b=>b.addEventListener('click',()=>{JSON.parse(b.dataset.package).forEach(add);renderItems();update();}));
  $('[data-print]').addEventListener('click',()=>window.print());
  $('[data-copy]').addEventListener('click',async()=>{const d=get();const lines=['阿陳 AliLife｜報價單 Quotation',d.id,...((demo||items.some(i=>i.demo))?['示範價，唔係阿陳真實報價']:[]),'品牌：'+(d.brand||'未填品牌'),'聯絡人：'+(d.contact||'—'),'日期：'+d.date+'｜有效期：'+d.valid+' 日',audience,'',...items.map(i=>(i.name||'未填項目')+'（'+i.unit+'） × '+i.qty+'｜單價 '+(i.price===''?'待填':money(number(i.price)))+'｜小計 '+(i.price===''?'待填':money(i.qty*number(i.price)))),'','小計：'+money(d.subtotal),'折扣：− '+money(d.discount),'總計：'+money(d.total),...(items.some(i=>i.price==='')?['有項目未填單價，總計未齊。']:[]),'',...d.terms.map(([n,t])=>n+'：'+t),...(d.notes?['備註：'+d.notes]:[]),'聯絡電郵：'+config.email];try{await navigator.clipboard.writeText(lines.join('\n'));$('[data-copy-status]').textContent='已複製，可以貼去 WhatsApp。';}catch{$('[data-copy-status]').textContent='複製唔到，請喺下面揀文字再複製。';$('[data-copy-fallback]').hidden=false;$('[data-copy-fallback]').value=lines.join('\n');$('[data-copy-fallback]').focus();$('[data-copy-fallback]').select();}});
  showRates();renderItems();update();
})();`

type QuoteProps = { stats: { youtubeSubscribers: string; instagramFollowers: string | null; topReelViews: string; asOf: string }; email: string }
export const QuoteStudio = ({ stats, email }: QuoteProps) => (
  <div class="ps wrap" data-quote="">
    <link rel="stylesheet" href="/cms/dev/dev.css" /><link rel="stylesheet" href="/cms/dev/tools.css" />
    <p class="dev-flag">開發中 · 只有 SS 睇到</p><h1>報價單生成器</h1><p class="ps-lead">填返你嘅收費，揀今次合作要做嘅項目，就可以列印或者複製俾品牌。</p>
    <div class="quote-layout"><div class="quote-editor">
      <section class="ps-card"><div class="tool-toolbar"><h2>收費表</h2><button type="button" class="tool-button" data-demo="">套用示範價（只供試玩）</button><button type="button" class="tool-button" data-clear="">清除</button></div><p class="tool-error" data-demo-warning="" hidden>示範價，唔係阿陳真實報價</p><p class="tool-muted">收費表會存喺呢個瀏覽器。改收費表唔會改已加落報價單嘅項目。</p>
        <div class="quote-rates">{rates.map(([name, unit], i) => <label><span>{name}<small>{unit}</small></span><span class="quote-rate-input"><span>HK$</span><input type="number" min="0" step="0.01" placeholder="你嘅價錢" data-rate={i} aria-label={`${name}單價 HK$`} /></span></label>)}</div><p class="tool-error" data-storage="" role="status"></p>
      </section>
      <section class="ps-card tool-stack"><h2>今次嘅報價單</h2><div class="ps-row"><label>品牌名<input name="brand" /></label><label>聯絡人<input name="contact" /></label><label>報價日期<input name="date" type="date" /></label><label>有效期（日）<input name="valid" type="number" min="0" step="1" value="14" /></label></div>
        <div><h3>快速套餐</h3><p class="tool-muted">撳一下就加落清單，可以再改數量同單價。</p><div class="tool-toolbar"><button type="button" class="tool-button" data-package="[2]">Reel 一條</button><button type="button" class="tool-button" data-package="[2,5]">Reel + 網站專頁</button><button type="button" class="tool-button" data-package="[1,2,3,4,5]">全平台</button></div></div>
        <label>由收費表揀項目<select data-select=""></select></label><div class="tool-toolbar"><button type="button" class="tool-button" data-add="">加項目</button><button type="button" class="tool-button" data-custom="">加自訂項目</button></div><div class="tool-stack" data-items=""></div>
        <div class="ps-row"><label>折扣方式<select name="discountType"><option value="percent">百分比（%）</option><option value="amount">金額（HK$）</option></select></label><label>折扣<input name="discount" type="number" min="0" step="0.01" value="0" /></label></div>
        <div class="quote-totals"><p>小計 <strong data-total="subtotal"></strong></p><p>折扣 <strong data-total="discount"></strong></p><p>總計 <strong data-total="total"></strong></p></div><p class="tool-error" data-missing="" hidden>有項目未填單價，總計未齊。</p>
        <label>備註<textarea name="notes" rows={3}></textarea></label><h3>合作條款（可以改）</h3>{terms.map(([name, value], i) => <label>{name}<textarea data-term={i} rows={2}>{value}</textarea></label>)}
      </section>
    </div><div class="quote-preview-column"><div class="tool-toolbar"><button type="button" class="tool-button" data-print="">列印／存 PDF</button><button type="button" class="tool-button" data-copy="">複製文字版</button></div><p data-copy-status="" role="status"></p><textarea data-copy-fallback="" hidden rows={8} aria-label="報價文字版，揀晒再複製"></textarea>
      <article class="quote-paper" aria-label="報價單預覽"><header><strong>阿陳 AliLife</strong><h2>報價單 Quotation</h2><p data-preview="id"></p></header><p class="tool-error" data-preview-demo="" hidden>示範價，唔係阿陳真實報價</p>
        <div class="quote-meta"><p>品牌：<b data-preview="brand"></b></p><p>聯絡人：<span data-preview="contact"></span></p><p>日期：<span data-preview="date"></span></p><p>有效期：<span data-preview="valid"></span></p></div><p class="quote-audience" data-audience=""></p>
        <table class="quote-table"><thead><tr><th>項目</th><th>數量</th><th>單價</th><th>小計</th></tr></thead><tbody data-preview-items=""></tbody></table><div class="quote-totals"><p>小計 <strong data-total="subtotal"></strong></p><p>折扣 <strong data-total="discount"></strong></p><p>總計 <strong data-total="total"></strong></p></div>
        <p class="tool-error" data-missing="" hidden>有項目未填單價，總計未齊。</p><section class="quote-terms"><h3>合作條款</h3><div data-preview-terms=""></div></section><section data-preview-notes-box="" hidden><h3>備註</h3><p class="quote-notes" data-preview-notes=""></p></section><footer data-email=""></footer>
      </article>
    </div></div>
    <script type="application/json" data-config="" dangerouslySetInnerHTML={{ __html: JSON.stringify({ rates, terms, stats, email }).replace(/</g, '\\u003c') }} />
    <script dangerouslySetInnerHTML={{ __html: script }} />
  </div>
)
