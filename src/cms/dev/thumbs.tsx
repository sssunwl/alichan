// YouTube 縮圖 Prompt 生成器（開發中，只有 SS 睇到）
// 流程：填大字／鉤字／價錢標籤 → 出 ChatGPT 生圖 prompt → 連同「樣貌參考圖」+「相似舊縮圖」一齊貼去 ChatGPT。
// 風格係睇晒 113 張舊縮圖（_private/thumbs/sheet*.jpg）歸納出嚟。
import { thumbVideos } from './thumbs-data'

// 樣貌參考：舊縮圖入面阿陳正面清楚嗰幾張（public/cms/dev/ref/，gitignore + Access 保護）。
// 正式版換成阿陳提供嘅乾淨相（正面、側面、全身、常穿風格）。
export const REF_IDS = ['cw7QJqoGHPs', '6WEI1DZreZI', '9Hn97QX5heg', 'T4wP5UZbC4Q', 'yRdZnt3EcBk', '1iT3MtjUehg', 'XL9q66tDFsA', 'h6qNVAu81G8']

const layouts = [
  ['eat', '大頭食嘢', 'close-up of her face on the right half, holding the food up to the camera and biting it, food fills the left half'],
  ['scene', '景點全身', 'she stands in the scenic spot on one side (waist-up or full body), arms open or pointing, the landmark clearly visible behind her'],
  ['duo', '雙人對比', 'two people side by side (her and a companion), both reacting, split composition'],
  ['object', '物件特寫', 'the key object (hotel room, product, receipt, ticket) large in the centre, her face peeking in from one corner reacting'],
] as const

const moods = [
  ['shock', '驚訝', 'wide-eyed shocked expression, mouth open'],
  ['yum', '好食', 'blissful eating expression, eyes half closed, cheeks full'],
  ['happy', '開心', 'big bright smile'],
  ['regret', '後悔／踩雷', 'exaggerated regret, hand on forehead, slightly comic'],
] as const

const flags = [
  ['🇯🇵', '日本', 'Japanese flag'],
  ['🇹🇭', '泰國', 'Thai flag'],
  ['🇹🇼', '台灣', 'Taiwan flag'],
  ['🇭🇰', '香港', 'Hong Kong flag'],
  ['🇨🇳', '中國內地', 'Chinese flag'],
  ['', '唔使', ''],
] as const

const data = { layouts, moods, flags, videos: thumbVideos.map((v) => ({ id: v.id, title: v.title, tier: v.tier })), refs: REF_IDS }

const script = `(() => {
  const root = document.currentScript.closest('[data-tp]');
  const D = JSON.parse(root.querySelector('#tp-data').textContent);
  const $ = (s) => root.querySelector(s);
  const val = (n) => (root.querySelector('[name="' + n + '"]').value || '').trim();
  const pick = (list, key) => list.find((x) => x[0] === key) || list[0];
  const build = () => {
    const layout = pick(D.layouts, val('layout'));
    const mood = pick(D.moods, val('mood'));
    const flag = pick(D.flags, val('flag'));
    const labels = val('labels').split(/\\n+/).map((s) => s.trim()).filter(Boolean).slice(0, 3);
    const lines = [];
    lines.push('Create a YouTube thumbnail, 16:9, 1280x720, in the exact visual style of the attached example thumbnails from the Hong Kong travel YouTube channel 阿陳AliLife.');
    lines.push('');
    lines.push('PERSON: The host is the woman in the attached reference photos. Keep her face, hairstyle, skin tone and body exactly the same as the references. ' + layout[2] + '. Expression: ' + mood[2] + '.');
    lines.push('BACKGROUND: ' + (val('bg') || 'the main scene of the video') + '. Bright, high saturation, sharp, appetising.');
    lines.push('');
    lines.push('TEXT — render exactly these Traditional Chinese characters, heavy black-weight sans-serif (like Noto Sans CJK Black), no typos, nothing else:');
    if (val('headline')) lines.push('1. Main headline across the bottom (about 25% of the height, full width): 「' + val('headline') + '」 — red fill (#E8231F), thick white outline, dark drop shadow.');
    if (val('hook')) lines.push('2. Top-right hook text: 「' + val('hook') + '」 — magenta (#FF2D8A) with white outline, slightly tilted.');
    labels.forEach((l, i) => lines.push((i + 3) + '. Label 「' + l + '」 in a small white rounded box with black text and a red border, with a red arrow pointing to the matching item.'));
    if (val('tag')) lines.push('- Vertical tag 「' + val('tag') + '」: black vertical text in a white box with black border, at the left edge.');
    if (flag[2]) lines.push('- A small ' + flag[2] + ' sticker next to the headline.');
    lines.push('');
    lines.push('EXTRAS: comic speed lines or a burst behind her head, one or two "!!" marks. Busy variety-show style but every text must stay readable on a phone. Keep the bottom-right corner clear (YouTube timestamp).');
    lines.push('Do NOT add any other text, watermark, logo or English words.');
    $('[data-tp-out]').value = lines.join('\\n');
    // 相似舊縮圖：標題同大字／背景字重疊最多
    const words = (val('headline') + val('hook') + val('bg') + val('topic')).replace(/[\\s，。！？!?、｜|]/g, '');
    const score = (t) => { let s = 0; for (let i = 0; i < words.length - 1; i++) if (t.includes(words.slice(i, i + 2))) s++; return s; };
    const sim = D.videos.map((v) => ({ v, s: score(v.title) })).sort((a, b) => b.s - a.s).slice(0, 4).map((x) => x.v);
    $('[data-tp-sim]').innerHTML = sim.map((v) => '<a href="https://i.ytimg.com/vi/' + v.id + '/maxresdefault.jpg" target="_blank" rel="noopener"><img src="https://i.ytimg.com/vi/' + v.id + '/mqdefault.jpg" alt="" loading="lazy"><span></span></a>').join('');
    [...$('[data-tp-sim]').children].forEach((a, i) => (a.querySelector('span').textContent = sim[i].title));
  };
  root.addEventListener('input', (e) => { if (e.target.closest('form')) build(); });
  root.addEventListener('change', (e) => { if (e.target.closest('form')) build(); });
  root.addEventListener('click', async (e) => {
    if (e.target.matches('[data-tp-copy]')) {
      try { await navigator.clipboard.writeText($('[data-tp-out]').value); } catch {}
      e.target.textContent = '已複製'; setTimeout(() => (e.target.textContent = '複製 prompt'), 1400);
    }
    if (e.target.matches('[data-tp-ai]')) {
      const topic = val('topic'); const st = $('[data-tp-status]');
      if (!topic) { st.textContent = '先寫影片主題'; return; }
      e.target.disabled = true; st.textContent = '諗緊…';
      try {
        const r = await fetch('/cms/dev/api/thumb-ideas', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ topic }) });
        const d = await r.json(); if (!r.ok) throw new Error(d.error || r.status);
        st.textContent = '';
        $('[data-tp-ideas]').innerHTML = '';
        d.ideas.forEach((idea) => {
          const b = document.createElement('button'); b.type = 'button'; b.className = 'tp-idea';
          b.textContent = idea.headline + '｜' + idea.hook;
          b.onclick = () => {
            root.querySelector('[name=headline]').value = idea.headline;
            root.querySelector('[name=hook]').value = idea.hook;
            root.querySelector('[name=labels]').value = (idea.labels || []).join('\\n');
            root.querySelector('[name=tag]').value = idea.tag || '';
            build();
          };
          $('[data-tp-ideas]').appendChild(b);
        });
      } catch (err) { st.textContent = '失敗：' + err.message; } finally { e.target.disabled = false; }
    }
  });
  // 自動更新：頻道 RSS 有新片就加入「全部舊縮圖」最前面
  fetch('/cms/dev/api/rivals').then((r) => r.json()).then((d) => {
    const me = (d.channels || []).find((c) => c.note === '自己'); if (!me) return;
    const known = new Set(D.videos.map((v) => v.id));
    const fresh = me.videos.filter((v) => !known.has(v.id));
    if (!fresh.length) return;
    $('[data-tp-new]').textContent = '頻道有 ' + fresh.length + ' 條新片，已自動加入';
    const g = $('[data-tp-all]');
    fresh.reverse().forEach((v) => { const a = document.createElement('a'); a.href = 'https://i.ytimg.com/vi/' + v.id + '/maxresdefault.jpg'; a.target = '_blank'; a.className = 'is-new'; a.innerHTML = '<img loading="lazy" alt="">'; a.firstChild.src = 'https://i.ytimg.com/vi/' + v.id + '/mqdefault.jpg'; a.title = v.title; g.prepend(a); });
  }).catch(() => {});
  build();
})();`

export const ThumbStudio = () => (
  <div class="ps wrap tp" data-tp="">
    <link rel="stylesheet" href="/cms/dev/dev.css" />
    <link rel="stylesheet" href="/cms/dev/tools.css" />
    <p class="dev-flag">開發中 · 只有 SS 睇到</p>
    <h1>YouTube 縮圖 Prompt 生成器</h1>
    <p class="ps-lead">
      填大字同重點，出一段 prompt 貼去 ChatGPT 生圖。記得一齊附上「樣貌參考」同「相似舊縮圖」，ChatGPT 先畫到似阿陳、似佢一貫風格。
    </p>

    <section class="tp-style">
      <strong>阿陳縮圖風格（睇晒 {thumbVideos.length} 張舊圖歸納）</strong>
      <ul>
        <li>底部一行超大紅字白邊標題，5–9 個字</li>
        <li>佢本人大頭、表情誇張（食嘢、驚訝），通常喺中間或右邊</li>
        <li>右上角粉紅鉤字，多數係數字或價錢（「605,790円值得嗎？」）</li>
        <li>白底黑字小標籤 + 紅箭咀指住食物，寫埋價錢</li>
        <li>國旗貼紙、直排標籤（爆吃／必去／推薦）、漫畫速度線</li>
      </ul>
    </section>

    <form class="tp-form" onsubmit="return false">
      <label>
        影片主題（俾 AI 諗大字用）
        <input name="topic" placeholder="例如：大阪二手名牌包＋立食壽司" />
      </label>
      <div class="tp-ai">
        <button type="button" class="btn" data-tp-ai="">
          AI 幫我諗大字
        </button>
        <span data-tp-status="" role="status"></span>
      </div>
      <div class="tp-ideas" data-tp-ideas=""></div>
      <div class="ps-row">
        <label>
          底部大字（5–9 字）
          <input name="headline" value="大阪最新必食必買" />
        </label>
        <label>
          右上鉤字
          <input name="hook" value="CHANEL半價？" />
        </label>
      </div>
      <label>
        價錢標籤（一行一個，最多 3 個）
        <textarea name="labels" rows={3}>
          {'海膽壽司$15\n燒肉¥5500/人'}
        </textarea>
      </label>
      <div class="ps-row">
        <label>
          直排標籤
          <input name="tag" value="爆吃" />
        </label>
        <label>
          國旗
          <select name="flag">
            {flags.map(([k, l]) => (
              <option value={k}>
                {k} {l}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div class="ps-row">
        <label>
          構圖
          <select name="layout">
            {layouts.map(([k, l]) => (
              <option value={k}>{l}</option>
            ))}
          </select>
        </label>
        <label>
          表情
          <select name="mood">
            {moods.map(([k, l]) => (
              <option value={k}>{l}</option>
            ))}
          </select>
        </label>
      </div>
      <label>
        背景畫面
        <input name="bg" value="立食壽司吧枱，海膽同大拖羅特寫" />
      </label>
    </form>

    <section class="ps-card tp-out">
      <header>
        <strong>ChatGPT Prompt</strong>
        <small>英文指示 + 中文字原樣照畫</small>
        <button type="button" class="ps-copy" data-tp-copy="">
          複製 prompt
        </button>
      </header>
      <textarea data-tp-out="" rows={14} readonly></textarea>
    </section>

    <section class="tp-attach">
      <h2>一齊附上呢啲圖</h2>
      <p class="fine">撳圖會開大圖，長按／右鍵儲存，再拖入 ChatGPT。</p>
      <h3>① 樣貌參考（揀 3–4 張）</h3>
      <div class="tp-grid">
        {REF_IDS.map((id) => (
          <a href={`/cms/dev/ref/${id}.jpg`} target="_blank" rel="noopener">
            <img src={`/cms/dev/ref/${id}.jpg`} alt="" loading="lazy" />
          </a>
        ))}
      </div>
      <p class="fine">而家用舊縮圖入面阿陳正面清楚嘅幾張。正式版請阿陳俾 6–10 張乾淨相（正面、側面、全身、常穿風格），效果會好好多。</p>
      <h3>② 相似舊縮圖（做風格參考，揀 1–2 張）</h3>
      <div class="tp-grid tp-sim" data-tp-sim=""></div>
    </section>

    <details class="tp-all-wrap">
      <summary>
        全部舊縮圖（{thumbVideos.length} 張）<small data-tp-new=""></small>
      </summary>
      <div class="tp-grid tp-all" data-tp-all="">
        {thumbVideos.map((v) => (
          <a href={`https://i.ytimg.com/vi/${v.id}/maxresdefault.jpg`} target="_blank" rel="noopener" title={v.title}>
            <img src={`https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`} alt="" loading="lazy" />
          </a>
        ))}
      </div>
    </details>

    <script type="application/json" id="tp-data" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
    <script dangerouslySetInnerHTML={{ __html: script }} />
  </div>
)

export const thumbIdeaPrompt = (topic: string) => {
  const examples = thumbVideos
    .filter((v) => v.tier !== 'C')
    .slice(0, 25)
    .map((v) => `- ${v.title}`)
    .join('\n')
  return `你係香港 YouTuber「阿陳AliLife」嘅縮圖文案助手。佢嘅縮圖：底部一行 5–9 字超大標題（書面中文，台港都睇得明）、右上角一句粉紅鉤字（多數有數字／價錢／問號）、2–3 個白底價錢標籤、一個直排兩字標籤（例如 爆吃、必去、推薦、奢華、逃世）。

阿陳過往標題參考：
${examples}

新片主題：${topic}

諗 4 組縮圖文字。只可以用主題提供嘅資訊，價錢數字主題冇講就唔好作，用「$xx」留空。
只輸出 JSON：{"ideas":[{"headline":"","hook":"","labels":[""],"tag":""}]}`
}
