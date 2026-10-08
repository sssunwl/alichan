import { guides } from '../content/guides'

const reviewScript = `(() => {
  const root = document.currentScript.closest('[data-cmsd-review]');
  if (!root || root.dataset.cmsdReady) return;
  root.dataset.cmsdReady = 'true';
  const panels = Array.from(root.querySelectorAll('[data-cmsd-panel]'));
  const steps = Array.from(root.querySelectorAll('[data-cmsd-step]'));
  const checks = Array.from(root.querySelectorAll('[data-cmsd-check]'));
  const publish = root.querySelector('[data-cmsd-publish]');
  const remaining = root.querySelector('[data-cmsd-remaining]');
  let current = 0;
  const updateChecks = () => {
    const count = checks.filter(check => !check.checked).length;
    publish.disabled = count > 0;
    remaining.textContent = count ? '仲有 ' + count + ' 項未確認' : '全部確認咗，可以發佈';
  };
  const show = (next, focus) => {
    current = next;
    panels.forEach((panel, index) => { panel.hidden = index !== current; });
    steps.forEach((step, index) => {
      if (index === current) step.setAttribute('aria-current', 'step');
      else step.removeAttribute('aria-current');
    });
    if (focus) panels[current].querySelector('[data-cmsd-heading]').focus();
  };
  root.addEventListener('change', event => {
    if (event.target.matches('[data-cmsd-check]')) updateChecks();
  });
  root.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || !root.contains(button)) return;
    if (button.hasAttribute('data-cmsd-reset')) {
      checks.forEach(check => { check.checked = false; });
      updateChecks();
      show(0, true);
    } else if (button.hasAttribute('data-cmsd-next') && current < 2) {
      show(current + 1, true);
    } else if (button.hasAttribute('data-cmsd-publish') && current === 2) {
      updateChecks();
      if (!publish.disabled) show(3, true);
    }
  });
  updateChecks();
  show(0, false);
})();`

const mmss = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

export const ReviewDemo = () => {
  const guide = guides.find((g) => g.slug === 'tokyo-language-school-one-month-cost')!
  return (
    <section class="cmsd-card" data-cmsd-review="" aria-label="文章批准流程示意">
      <span class="cmsd-badge">示意流程・唔會真係發佈</span>
      <ol class="cmsd-steps" aria-label="流程步驟">
        {['新片', '草稿', '核對', '上線'].map((label, index) => (
          <li data-cmsd-step="" aria-current={index === 0 ? 'step' : undefined}>
            <span>{index + 1}</span> {label}
          </li>
        ))}
      </ol>
      <div class="cmsd-panel" data-cmsd-panel="">
        <div class="cmsd-notification">
          <small class="cmsd-muted">Telegram 通知示意</small>
          <h3 data-cmsd-heading="" tabIndex={-1}>📹 新片上架：{guide.videoTitle}</h3>
          <p>系統已經自動出咗草稿，有 {guide.needsCheck.length} 項要你確認</p>
        </div>
        <button class="cmsd-button" type="button" data-cmsd-next="">打開草稿</button>
      </div>
      <div class="cmsd-panel" data-cmsd-panel="" hidden>
        <h3 data-cmsd-heading="" tabIndex={-1}>{guide.title}</h3>
        <p>{guide.tldr[0]}</p>
        <dl class="cmsd-facts">
          {guide.facts?.slice(0, 3).map((fact) => (
            <div>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
              <small class="cmsd-time">{fact.t === undefined ? '未有時間碼' : mmss(fact.t)}</small>
            </div>
          ))}
        </dl>
        <button class="cmsd-button" type="button" data-cmsd-next="">去核對</button>
      </div>
      <div class="cmsd-panel" data-cmsd-panel="" hidden>
        <h3 data-cmsd-heading="" tabIndex={-1}>核對清單</h3>
        <div class="cmsd-checklist">
          {guide.needsCheck.map((item) => (
            <label><input type="checkbox" data-cmsd-check="" /><span>{item}</span></label>
          ))}
        </div>
        <div class="cmsd-actions">
          <button class="cmsd-button" type="button" data-cmsd-publish="" disabled={guide.needsCheck.length > 0}>發佈</button>
          <span class="cmsd-muted" data-cmsd-remaining="" role="status">仲有 {guide.needsCheck.length} 項未確認</span>
        </div>
      </div>
      <div class="cmsd-panel" data-cmsd-panel="" hidden>
        <h3 data-cmsd-heading="" tabIndex={-1}>✅ 已發佈</h3>
        <p><a href={`/guides/${guide.slug}`}>睇已上線嘅文章</a></p>
        <small class="cmsd-muted">由出片到上線，你做嘅只係剔 {guide.needsCheck.length} 個格。</small>
      </div>
      <button class="cmsd-reset" type="button" data-cmsd-reset="">重新示範</button>
      <script dangerouslySetInnerHTML={{ __html: reviewScript }} />
    </section>
  )
}

export const ClickDemo = () => (
  <section class="cmsd-card" aria-label="連結數據示意">
    <div class="cmsd-dashboard-head">
      <h3>本月連結數據</h3>
      <span class="cmsd-badge">示意數字・未連真實數據</span>
    </div>
    <dl class="cmsd-stats">
      <div><dt>/links 頁瀏覽</dt><dd>1,240</dd></div>
      <div><dt>優惠碼複製</dt><dd>186</dd></div>
      <div><dt>品牌查詢</dt><dd>3</dd></div>
    </dl>
    <table class="cmsd-table">
      <caption>讀者由邊度嚟</caption>
      <thead><tr><th scope="col">來源</th><th scope="col">點擊</th></tr></thead>
      <tbody>
        {([['Instagram bio', '812'], ['YouTube 簡介', '301'], ['Threads', '74'], ['Google 搜尋', '53']]).map(([source, clicks]) => (
          <tr><th scope="row">{source}</th><td>{clicks}</td></tr>
        ))}
      </tbody>
    </table>
    <table class="cmsd-table">
      <caption>優惠碼複製記錄</caption>
      <thead><tr><th scope="col">優惠碼</th><th scope="col">複製次數</th></tr></thead>
      <tbody>
        <tr><th scope="row">Klook <code>ALICHANKLOOK</code></th><td>121</td></tr>
        <tr><th scope="row">Tocoo <code>KBY86Z</code></th><td>65</td></tr>
      </tbody>
    </table>
  </section>
)
