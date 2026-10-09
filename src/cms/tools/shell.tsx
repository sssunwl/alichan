import type { Child } from 'hono/jsx'

export const TOOLS = [
  { id: 'reels', icon: '🎬', name: 'Reel 企劃板', tagline: '影完嘢即刻變三條 Reel idea，排好期一眼睇晒', steps: ['講吓今日影咗咩', '揀 idea 加入排程', '排日子，拍完更新進度'], accent: 'var(--accent)' },
  { id: 'posts', icon: '✍️', name: '帖文生成器', tagline: '放字幕，一次出 YouTube／IG／FB／Threads', steps: ['貼字幕或者上載 .srt', '揀優惠碼同留言關鍵字', '撳生成，逐個平台複製'], accent: 'var(--marker)' },
  { id: 'carousel', icon: '🖼️', name: '輪播圖生成器', tagline: '揀篇攻略，自動砌好一套 IG 輪播圖', steps: ['揀一篇攻略', '揀款式，改字同換相', '下載成套輪播圖'], accent: 'var(--ink)' },
  { id: 'thumbs', icon: '🎨', name: '縮圖 Prompt', tagline: '跟你一貫風格，出 ChatGPT 生圖 prompt', steps: ['填片名同縮圖方向', '揀參考相，整理 prompt', '複製去 ChatGPT 生圖'], accent: 'var(--accent)' },
  { id: 'trends', icon: '🔥', name: '熱門話題', tagline: '香港今日熱搜，同你有關嘅即刻話你知', steps: ['加返你想追嘅關注字', '睇同你有關嘅熱搜', '撳「諗下點拍」搵角度'], accent: 'var(--marker)' },
  { id: 'rivals', icon: '👀', name: '同行追蹤', tagline: '同類頻道出咩片、同邊個品牌合作', steps: ['加入想追嘅頻道', '睇出片同觀看概覽', '睇最新片同合作品牌'], accent: 'var(--ink)' },
  { id: 'quote', icon: '🧾', name: '報價單', tagline: '揀套餐即出 A4 報價單', steps: ['填返自己嘅收費', '揀套餐同合作項目', '列印 PDF 或複製報價'], accent: 'var(--accent)' },
  { id: 'budget', icon: '🧮', name: '遊學預算計算機', tagline: '讀者用嘅小工具示範', steps: ['揀遊學日數', '調整住宿同活動', '睇日圓同港幣預算'], accent: 'var(--marker)' },
] as const
export type ToolId = (typeof TOOLS)[number]['id']
const Styles = () => <><link rel="stylesheet" href="/cms/kit/dev.css" /><link rel="stylesheet" href="/cms/kit/tools.css" /><link rel="stylesheet" href="/cms/kit/app.css" /></>
const script = String.raw`(() => {
  const root = document.currentScript.closest('[data-tools-app]');
  const strip = root.querySelector('[data-steps]'), button = root.querySelector('[data-steps-toggle]');
  const apply = hidden => { strip.hidden = hidden; button.textContent = hidden ? '點用' : '收起'; button.setAttribute('aria-expanded', String(!hidden)); };
  try { apply(localStorage.getItem('alichan-tools-steps-hidden') === '1'); } catch {}
  button.addEventListener('click', () => { apply(!strip.hidden); try { localStorage.setItem('alichan-tools-steps-hidden', strip.hidden ? '1' : '0'); } catch {} });
})();`
export const ToolsHome = () => <div class="ta-home"><Styles /><header class="ta-hero"><span class="ta-kicker">ALICHAN / CREATOR DESK</span><h1>阿陳嘅<br />創作工具箱</h1><p>全部喺網站後台，只有你同 SS 用得。撳任何一個即刻試。</p><small>8 個工具 · 手機都用得</small></header><div class="ta-grid">{TOOLS.map(t => <a class="ta-card" href={`/cms/tools/${t.id}`} style={{ '--tool-accent': t.accent }}><div class="ta-card-top"><span class="ta-icon" aria-hidden="true">{t.icon}</span><div class={`ta-mini ta-mini-${t.id}`} aria-hidden="true"><i /><i /><i /><b /></div></div><h2>{t.name}</h2><p>{t.tagline}</p><span class="ta-try">試用 →</span></a>)}</div><footer class="ta-home-footer"><a href="/cms">← 返 CMS</a></footer></div>
export const ToolsShell = ({ active, children }: { active: ToolId; children: Child }) => {
  const tool = TOOLS.find(t => t.id === active)!
  return <div class="ta-app" data-tools-app=""><Styles /><nav class="ta-rail" aria-label="創作工具"><a class="ta-brand" href="/cms/tools">阿陳<span>工具箱</span></a>{TOOLS.map(t => <a href={`/cms/tools/${t.id}`} aria-current={t.id === active ? 'page' : undefined}><span aria-hidden="true">{t.icon}</span><span>{t.name}</span></a>)}</nav><div class="ta-workspace"><header class="ta-bar"><a href="/cms/tools">← 工具箱</a><strong>{tool.icon} {tool.name}</strong><small>阿陳工具箱</small></header><div class="ta-guide"><button type="button" class="tool-button" data-steps-toggle="" aria-expanded="true">收起</button><ol data-steps="" aria-label="點用">{tool.steps.map((s, i) => <li><b>{i + 1}</b>{s}</li>)}</ol></div><div class="ta-main">{children}</div></div><script dangerouslySetInnerHTML={{ __html: script }} /></div>
}
