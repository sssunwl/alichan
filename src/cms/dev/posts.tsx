// 帖文生成器（開發中，只有 SS 睇到）
// 揀示範片 → 即刻睇結果；或者貼字幕／上載 .srt → POST /cms/api/posts → Gemini 生成
import { links } from '../../site.config'
import { postSamples } from './post-samples'

const outputs = [
  ['titles', 'YouTube 標題', '書面中文 · 5 個揀一個'],
  ['youtube_description', 'YouTube 簡介', '書面中文 · 含章節時間碼'],
  ['instagram', 'Instagram', '廣東話 · 留言關鍵字開頭'],
  ['facebook', 'Facebook', '廣東話 · 似同朋友傾偈'],
  ['threads', 'Threads', '廣東話 · 短、真人感'],
] as const

const coupons = Object.entries(links)
  .filter(([, l]) => l.code)
  .map(([code, l]) => ({ code, text: `${l.label}${l.note ? `（${l.note}）` : ''}：${l.code}` }))

const script = `(() => {
  const root = document.currentScript.closest('[data-ps]');
  const samples = JSON.parse(root.querySelector('#ps-samples').textContent);
  const $ = (s) => root.querySelector(s);
  const status = $('[data-ps-status]');
  const render = (d, label) => {
    $('[data-ps-out]').hidden = false;
    $('[data-ps-label]').textContent = label;
    const titles = $('[data-ps-field="titles"]');
    titles.innerHTML = '';
    d.titles.forEach((t) => {
      const li = document.createElement('li');
      li.innerHTML = '<span></span><button type="button" class="ps-copy">複製</button>';
      li.firstChild.textContent = t;
      li.lastChild.dataset.text = t;
      titles.appendChild(li);
    });
    ['youtube_description', 'instagram', 'facebook', 'threads'].forEach((k) => {
      const el = $('[data-ps-field="' + k + '"]');
      el.value = d[k];
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 4 + 'px';
      $('[data-ps-count="' + k + '"]').textContent = d[k].length + ' 字';
    });
    const nc = $('[data-ps-check]');
    nc.innerHTML = '';
    (d.needs_check || []).forEach((t) => { const li = document.createElement('li'); li.textContent = t; nc.appendChild(li); });
    $('[data-ps-checkbox]').hidden = !(d.needs_check || []).length;
    $('[data-ps-model]').textContent = d.model ? '模型：' + d.model : '';
  };
  root.addEventListener('click', async (e) => {
    const s = e.target.closest('[data-ps-sample]');
    if (s) {
      root.querySelectorAll('[data-ps-sample]').forEach((b) => b.setAttribute('aria-pressed', b === s));
      render(samples[s.dataset.psSample], '示範結果：' + s.textContent.trim());
      $('[data-ps-out]').scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const c = e.target.closest('.ps-copy');
    if (c) {
      const text = c.dataset.text ?? c.closest('.ps-card').querySelector('textarea').value;
      try { await navigator.clipboard.writeText(text); } catch {}
      const p = c.textContent; c.textContent = '已複製'; setTimeout(() => (c.textContent = p), 1400);
    }
  });
  $('[data-ps-file]').addEventListener('change', async (e) => {
    const f = e.target.files[0];
    if (f) $('[name=transcript]').value = await f.text();
  });
  $('[data-ps-form]').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const body = {
      transcript: fd.get('transcript'),
      videoTitle: fd.get('videoTitle') || undefined,
      keyword: fd.get('keyword') || undefined,
      notes: fd.get('notes') || undefined,
      coupons: fd.getAll('coupon'),
    };
    if (!String(body.transcript).trim()) { status.textContent = '先貼字幕或者上載 .srt'; return; }
    const btn = e.target.querySelector('button[type=submit]');
    btn.disabled = true;
    let n = 0; const tick = setInterval(() => (status.textContent = '生成緊…' + ++n + ' 秒（通常 20–60 秒）'), 1000);
    try {
      const r = await fetch('/cms/api/posts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || r.status);
      render(d, '你貼嘅字幕');
      status.textContent = '';
      $('[data-ps-out]').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      status.textContent = '生成失敗：' + err.message;
    } finally { clearInterval(tick); btn.disabled = false; }
  });
})();`

export const PostStudio = () => {
  const ids = Object.keys(postSamples)
  const label = (id: string) =>
    ({ 'StNJHl-WkBA': '東京遊學一個月', 'd5w9k--VGjA': '福岡 2 天 1 夜', KneeOM1WWvM: '大阪 CHANEL＋壽司' })[id] ?? id
  return (
    <div class="ps wrap" data-ps="">
      <link rel="stylesheet" href="/cms/kit/dev.css" />
      <p class="dev-flag">開發中 · 只有 SS 睇到</p>
      <h1>帖文生成器</h1>
      <p class="ps-lead">
        放入影片字幕，一次過出 YouTube 標題、YouTube 簡介、IG、Facebook、Threads。語氣跟阿陳：YouTube 用書面中文（台港都睇得明），IG／FB／Threads 用廣東話。
      </p>

      <section class="ps-step">
        <h2>
          <span>A</span>睇示範（即刻出）
        </h2>
        <div class="ps-samples">
          {ids.map((id) => (
            <button type="button" data-ps-sample={id} aria-pressed="false">
              <img src={`https://i.ytimg.com/vi/${id}/mqdefault.jpg`} alt="" width="160" height="90" loading="lazy" />
              <span>{label(id)}</span>
            </button>
          ))}
        </div>
      </section>

      <section class="ps-step">
        <h2>
          <span>B</span>用新片字幕生成
        </h2>
        <form data-ps-form="">
          <label class="ps-file">
            上載 .srt／.txt
            <input type="file" accept=".srt,.txt,.vtt" data-ps-file="" />
          </label>
          <label>
            字幕（或者直接貼）
            <textarea name="transcript" rows={6} placeholder="YouTube Studio → 字幕 → 下載 .srt，再貼入嚟"></textarea>
          </label>
          <div class="ps-row">
            <label>
              影片標題（可選）
              <input name="videoTitle" />
            </label>
            <label>
              留言關鍵字（可選）
              <input name="keyword" placeholder="例如：福岡" />
            </label>
          </div>
          <label>
            補充資料（可選：店名、地址、營業時間，以呢度為準）
            <textarea name="notes" rows={3}></textarea>
          </label>
          <fieldset>
            <legend>要放入嘅優惠碼</legend>
            {coupons.map((c) => (
              <label class="ps-check">
                <input type="checkbox" name="coupon" value={c.text} />
                {c.text}
              </label>
            ))}
          </fieldset>
          <button class="btn" type="submit">
            生成帖文
          </button>
          <p class="ps-status" data-ps-status="" role="status"></p>
        </form>
      </section>

      <section class="ps-out" data-ps-out="" hidden>
        <p class="ps-label">
          <b data-ps-label=""></b> <small data-ps-model=""></small>
        </p>
        <div class="ps-checkbox" data-ps-checkbox="">
          <strong>發之前要你確認</strong>
          <ul data-ps-check=""></ul>
        </div>
        {outputs.map(([key, title, hint]) => (
          <article class="ps-card">
            <header>
              <strong>{title}</strong>
              <small>{hint}</small>
              {key !== 'titles' && (
                <>
                  <small class="ps-count" data-ps-count={key}></small>
                  <button type="button" class="ps-copy">
                    複製
                  </button>
                </>
              )}
            </header>
            {key === 'titles' ? <ol class="ps-titles" data-ps-field="titles"></ol> : <textarea data-ps-field={key} rows={8}></textarea>}
          </article>
        ))}
        <p class="fine">所有內容係草稿：價錢、店名、地址一定要對返影片先發。可以直接喺框入面改再複製。</p>
      </section>

      <script type="application/json" id="ps-samples" dangerouslySetInnerHTML={{ __html: JSON.stringify(postSamples).replace(/</g, '\\u003c') }} />
      <script dangerouslySetInnerHTML={{ __html: script }} />
    </div>
  )
}
