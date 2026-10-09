const yen = (value: number) => `¥${value.toLocaleString('en-US')}`
const hkd = (value: number) => `HK$${(Math.round(value / 20 / 10) * 10).toLocaleString('en-US')}`
const defaults = [150000, 270000, 9200, 60000, 8000, 30000]
const labels = ['學費', '住宿', '交通', '膳食（假設）', '文化活動', '機票']

const budgetScript = `(() => {
  const root = document.currentScript.closest('[data-sb]');
  if (!root || root.dataset.sbReady) return;
  root.dataset.sbReady = 'true';
  const read = name => {
    const input = root.querySelector('[data-sb-input="' + name + '"]');
    const value = Number(input.value);
    return input.validity.valid && input.value !== '' && Number.isFinite(value) && value >= Number(input.min) && (!input.max || value <= Number(input.max)) ? value : null;
  };
  const update = () => {
    const months = read('months'), room = read('room'), food = read('food'), activities = read('activities'), rate = read('rate');
    if ([months, room, food, activities, rate].some(value => value === null)) {
      root.querySelector('[data-sb-status]').textContent = '請填返範圍內嘅數字；下面暫時保留上次嘅計算。';
      return;
    }
    root.querySelector('[data-sb-status]').textContent = '';
    const days = months * 30;
    const values = [150000 * months, room * days, 460 * 20 * months, food * days, 4000 * activities, 1500 * rate];
    values.push(values.reduce((sum, value) => sum + value, 0));
    root.querySelectorAll('[data-sb-row]').forEach((row, index) => {
      row.querySelector('[data-sb-yen]').textContent = '¥' + values[index].toLocaleString('en-US');
      row.querySelector('[data-sb-hkd]').textContent = 'HK$' + (Math.round(values[index] / rate / 10) * 10).toLocaleString('en-US');
    });
  };
  root.addEventListener('input', update);
})();`

export const StudyBudget = () => (
  <section class="sb-tool" data-sb="" aria-label="東京遊學預算計算機">
    <span class="sb-kicker">阿陳小工具</span>
    <h2>東京遊學要預幾多錢？</h2>
    <p>用阿陳真實帳單做底，改成你自己嘅情況。</p>
    <div class="sb-layout">
      <div class="sb-inputs">
        <label>讀幾多個月<input type="number" min="1" max="6" step="1" value="1" data-sb-input="months" /></label>
        <label>每晚住宿（日圓）<input type="number" min="3000" max="20000" step="500" value="9000" data-sb-input="room" /></label>
        <label>每日膳食（日圓・假設）<input type="number" min="1000" max="5000" step="100" value="2000" data-sb-input="food" /></label>
        <label>文化活動次數<input type="number" min="0" max="10" step="1" value="2" data-sb-input="activities" /></label>
        <label>匯率：1 港幣 = 幾多日圓<input type="number" min="0.01" step="any" value="20" data-sb-input="rate" /></label>
        <p class="sb-help">每個月按 30 日、20 日上堂計。學費每月 ¥150,000；交通每個上堂日 ¥460；文化活動每次 ¥4,000；來回機票 HK$1,500。</p>
        <p class="sb-help">住宿預設係蒲田酒店私人房包早餐，平日同週末價錢可以差一倍。</p>
        <p class="sb-help" data-sb-status="" role="status"></p>
      </div>
      <div class="sb-receipt">
        <table>
          <caption>你嘅遊學預算</caption>
          <thead><tr><th scope="col">項目</th><th scope="col">日圓</th><th scope="col">港幣</th></tr></thead>
          <tbody>{labels.map((label, index) => <tr data-sb-row=""><th scope="row">{label}</th><td data-sb-yen="">{yen(defaults[index])}</td><td data-sb-hkd="">{hkd(defaults[index])}</td></tr>)}</tbody>
          <tfoot><tr data-sb-row=""><th scope="row">總計</th><td data-sb-yen="">{yen(527200)}</td><td data-sb-hkd="">{hkd(527200)}</td></tr></tfoot>
        </table>
        <p class="sb-help">港幣四捨五入到十位。</p>
        <div class="sb-notes">
          <p>預設數字來自阿陳 2026 年喺東京讀一個月嘅真實帳單。阿陳實際總數係 605,790 日圓（約 HK$30,000）。</p>
          <p>膳食係假設值；娛樂、購物冇計。價錢會變，出發前請再查。</p>
          <p><a href="/guides/tokyo-language-school-one-month-cost">睇阿陳完整帳單</a> · <a href="https://www.youtube.com/watch?v=StNJHl-WkBA" target="_blank" rel="noopener">睇原片</a></p>
        </div>
      </div>
    </div>
    <script dangerouslySetInnerHTML={{ __html: budgetScript }} />
  </section>
)
