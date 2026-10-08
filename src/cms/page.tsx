// /cms：SS 同阿陳嘅溝通位（唔係公開內容）。
// 「外面」= 讀者同品牌睇到嘅網站；「呢度」= 解釋點解要用、點用、要幾錢。
// 正式版會用 Cloudflare Access 鎖住，只有阿陳同 SS 嘅電郵入得。
// repo 係 public：呢頁唔可以寫 SS 嘅收費同任何未公開資料。
import { site } from '../site.config'
import { ReviewDemo, ClickDemo } from './demos'

const toc = [
  ['why', '有咩用'],
  ['approve', '你要做咩'],
  ['data', '數據'],
  ['content', '建議加咩'],
  ['cost', '成本'],
  ['edit', '點自己改'],
  ['layers', '三層網站'],
  ['todo', '等你答'],
] as const

// 2026-10-08 實測 Google 香港（hl=zh-HK），只記錄實際見到嘅結果
const serp = [
  {
    q: '東京遊學一個月 費用',
    video: '你兩條片排影片欄第 1、2 位',
    text: '文字結果全部係留學中介同語言學校，寫每月 8 萬至 35 萬日圓',
    gap: '你實際使咗 605,790 日圓，呢個真實數字喺文字結果入面完全冇出現',
    hit: true,
  },
  {
    q: '福岡 2日1夜 一個人',
    video: '你嘅 YouTube、IG、Trip.com 都有出',
    text: '文字結果係 Trip.com 網誌、樂吃購、旅遊局行程',
    gap: '讀者要睇 17 分鐘片先知去邊，文字版就會俾其他網站攞走',
    hit: true,
  },
  {
    q: '日本自駕 ETC 入油 注意',
    video: '影片欄係其他 YouTuber，冇你',
    text: '文字結果係香港01、喜愛日本、蘇黎世保險網誌',
    gap: '你呢條片有 5.9 萬觀看，但搜尋完全搵唔到',
    hit: false,
  },
]

const costs: [string, string, string][] = [
  ['網域（你自己嘅 .com）', '約 HK$85／年', 'Cloudflare 以成本價代註冊 .com，冇隱藏加價；.hk 網域會貴啲'],
  ['網站主機（Cloudflare Workers）', 'HK$0', '免費額度每日 10 萬次瀏覽；真係爆到先升級，約 HK$40／月'],
  ['資料庫（文章、點擊、查詢）', 'HK$0', 'Cloudflare D1 免費額度 5GB，夠用好多年'],
  ['相片儲存', 'HK$0', 'Cloudflare R2 頭 10GB 免費'],
  ['後台登入保護', 'HK$0', 'Cloudflare Access，50 人以內免費'],
  ['自訂電郵（hello@你網域）', 'HK$0', '轉寄去你現有 Gmail，唔使另外開信箱'],
  ['新片通知（Telegram）', 'HK$0', ''],
  ['AI 將字幕寫成文章', '每篇幾蚊港紙', '視乎用邊個模型；可以用訂閱額度，就唔另外收錢'],
]

export const Cms = () => (
  <div class="cms">
    <link rel="stylesheet" href="/cms.css" />

    <header class="cms-head wrap">
      <p class="cms-badge">阿陳 × SS 工作間 · 只俾你睇</p>
      <h1>呢個網，對你有咩用？</h1>
      <p class="cms-lead">
        你而家睇緊嘅係<b>網站後面一層</b>。外面嗰層係讀者同品牌睇到嘅網站；呢層係我同你傾嘢嘅地方：點解要做、你要做咩、要幾錢、點樣自己改。
      </p>
      <div class="cms-split" aria-label="兩層分別">
        <div>
          <strong>外面（公開）</strong>
          <span>攻略文章、/links 連結頁、品牌合作頁。Google、AI、讀者、品牌睇到。</span>
        </div>
        <div class="me">
          <strong>呢度（只有你同我）</strong>
          <span>審稿、數據、建議、成本。正式版要用你嘅電郵登入先入到。</span>
        </div>
      </div>
      <nav class="cms-toc" aria-label="目錄">
        {toc.map(([id, label], i) => (
          <a href={`#${id}`}>
            <span>{String(i + 1).padStart(2, '0')}</span>
            {label}
          </a>
        ))}
      </nav>
    </header>

    <section id="why" class="cms-sec wrap">
      <p class="cms-num">01</p>
      <h2>Google 已經認得你條片，但「答案」俾人攞咗</h2>
      <p>
        我 2026-10-08 喺 Google 香港搜咗三條同你片有關嘅問題。影片欄有你，係好事；但大部分人想要嘅係一眼睇到嘅答案，嗰個位係文字網站嘅。
      </p>
      <div class="serp-list">
        {serp.map((s) => (
          <article class={`serp ${s.hit ? '' : 'miss'}`}>
            <p class="serp-q">
              <span>Google</span>「{s.q}」
            </p>
            <dl>
              <div>
                <dt>影片欄</dt>
                <dd>{s.video}</dd>
              </div>
              <div>
                <dt>文字結果</dt>
                <dd>{s.text}</dd>
              </div>
            </dl>
            <p class="serp-gap">{s.gap}</p>
          </article>
        ))}
      </div>
      <div class="why-three">
        <div>
          <strong>1. 搜尋同 AI 讀到你</strong>
          <p>Google 嘅文字答案同 ChatGPT 呢類 AI 主要讀文字，唔會睇晒你 17 分鐘片。有文字版，你嘅真實數字先有機會出現，再連返去你條片。</p>
        </div>
        <div>
          <strong>2. 優惠碼擺啱位</strong>
          <p>你嘅 Klook、Tocoo 碼而家收埋喺 YouTube 簡介。文章會喺讀者讀到「交通」「住宿」嗰段就擺出嚟，一撳就複製。</p>
        </div>
        <div>
          <strong>3. 品牌有正式入口</strong>
          <p>品牌唔使喺 DM 度問你數據。合作頁有你嘅數字、代表作同查詢表單，查詢會直接通知你。</p>
        </div>
      </div>
      <p class="fine">
        老實講：搜尋排名同 AI 會唔會引用，冇人可以保證，我都唔會。可以保證嘅係：幾時上線、每月出幾多篇、每月一份數字報告。搜尋流量一般要 3 至 6 個月先見到。
      </p>
      <p class="cms-try">
        想即場試：開 ChatGPT 問「東京遊學一個月要幾錢」，睇下佢答咩數、有冇提你。我哋見面嗰陣一齊試。
      </p>
    </section>

    <section id="approve" class="cms-sec wrap">
      <p class="cms-num">02</p>
      <h2>你唔使寫，只係核對同撳批准</h2>
      <p>你出新片之後，系統自動將字幕整理成草稿。價錢、店名、日期呢啲一定要你親自確認先可以發佈，因為錯一個數，讀者信任就冇咗。試下撳：</p>
      <ReviewDemo />
    </section>

    <section id="data" class="cms-sec wrap">
      <p class="cms-num">03</p>
      <h2>每個 click 都有數</h2>
      <p>
        Linktree 只會話你有幾多人撳。換成你自己嘅 /links，可以知道人由 IG 定 YouTube 嚟、邊個優惠碼最多人複製。呢啲數字之後可以直接擺上品牌合作頁，同品牌傾價更有底氣。
      </p>
      <ClickDemo />
    </section>

    <section id="content" class="cms-sec wrap">
      <p class="cms-num">04</p>
      <h2>建議你加嘅內容</h2>
      <div class="cms-cards">
        <article>
          <strong>先補數字（最快）</strong>
          <ul>
            <li>IG、Threads 追蹤人數</li>
            <li>觀眾地區（YouTube 後台「觀眾」就有，香港／台灣比例）</li>
            <li>做過嘅品牌合作（品牌名、類型；唔使寫價錢）</li>
          </ul>
          <p>品牌合作頁而家呢幾格都寫「待補」，未經你確認我唔會亂填。</p>
        </article>
        <article>
          <strong>舊片變攻略（揀「有人會搜」嘅）</strong>
          <ul>
            <li>日本自駕必知 8 件事（5.9 萬觀看，搜尋完全冇你，最值得做）</li>
            <li>N5 程度去日本留學一個月花了 3 萬港幣</li>
            <li>大阪 CHANEL 二手包＋隱藏版壽司</li>
            <li>澳門狂食 24 小時（23 萬觀看，你最多人睇嗰條）</li>
          </ul>
          <p>唔係 143 條都做。第一期揀 20 至 30 條「攻略／真實花費」類，vlog 就唔使。</p>
        </article>
        <article>
          <strong>八珍湯有自己一頁</strong>
          <p>而家 /links 只係連去 IG。可以喺你網站開一頁講產品、點飲、喺邊買，同時做埋 Google 搜尋入口。呢個係你自己嘅生意，比聯盟佣金更值得做。</p>
        </article>
        <article>
          <strong>留言區問題變 FAQ</strong>
          <p>你片下面成日有人問嘅嘢（例如「N5 去唔去得」「住邊區平」），收集返嚟放入文章「常見問題」。AI 最鍾意引用呢種一問一答。</p>
        </article>
      </div>
    </section>

    <section id="cost" class="cms-sec wrap">
      <p class="cms-num">05</p>
      <h2>自己網域 + 自己後台，成本幾多？</h2>
      <p>網站會開喺<b>你名下</b>嘅 Cloudflare 帳號同網域。下面係平台本身嘅成本，即係你直接俾 Cloudflare 嘅錢：</p>
      <div class="cost-table" role="table" aria-label="成本">
        {costs.map(([item, price, note]) => (
          <div role="row">
            <span role="cell">{item}</span>
            <b role="cell">{price}</b>
            {note && <small role="cell">{note}</small>}
          </div>
        ))}
        <div role="row" class="total">
          <span role="cell">平台成本合計</span>
          <b role="cell">約 HK$85／年</b>
          <small role="cell">即係基本上只係網域費</small>
        </div>
      </div>
      <p class="fine">價錢係 2026-10 嘅 Cloudflare 公開價，匯率用 US$1 ≈ HK$7.8。我嘅開發同維護費另外同你傾，唔喺呢度寫。</p>
    </section>

    <section id="edit" class="cms-sec wrap">
      <p class="cms-num">06</p>
      <h2>你點樣自己改內容</h2>
      <div class="cms-cards">
        <article>
          <strong>登入：唔使記密碼</strong>
          <p>去「你網域/admin」，輸入你電郵，收一個 6 位數字碼，入咗就得。手機都用得。</p>
        </article>
        <article>
          <strong>你可以自己改</strong>
          <ul>
            <li>審稿、改字、撳發佈或者落架</li>
            <li>優惠碼、連結頁排序、加減連結</li>
            <li>合作頁嘅數字同代表作</li>
            <li>睇品牌查詢同每月數據</li>
          </ul>
        </article>
        <article>
          <strong>你唔使理</strong>
          <ul>
            <li>設計、排版、速度</li>
            <li>Google 要嘅技術設定（結構化資料、sitemap）</li>
            <li>主機、備份、保安</li>
          </ul>
          <p>改錯咗都唔怕，每次發佈都有舊版本可以返轉頭。</p>
        </article>
      </div>
    </section>

    <section id="layers" class="cms-sec wrap">
      <p class="cms-num">07</p>
      <h2>三層網站：我點喺你個網後面開發新嘢</h2>
      <div class="layers">
        <div class="layer l1">
          <span>你網域.com</span>
          <strong>公開層</strong>
          <p>攻略、/links、品牌合作頁。所有人睇到，Google 收錄。</p>
        </div>
        <div class="layer l2">
          <span>你網域.com/admin、/cms</span>
          <strong>你同我</strong>
          <p>後台同呢頁。用 Cloudflare Access 鎖住，名單上只有你同我嘅電郵。</p>
        </div>
        <div class="layer l3">
          <span>lab.你網域.com</span>
          <strong>試驗層</strong>
          <p>我開發新功能、新設計嘅地方，例如俾某個品牌睇嘅合作提案頁、俾你朋友 KOL 睇嘅示範。只有你加入名單嘅電郵先入到，睇完就可以將佢移出名單。Google 唔會收錄。</p>
        </div>
      </div>
      <ul class="cms-points">
        <li>試驗層改嘢唔會影響公開層。你睇過、話 OK，我先搬出去。</li>
        <li>網域同 Cloudflare 帳號都喺你名下，我只係成員。你隨時可以移除我，網站照樣繼續行。</li>
        <li>想俾邊個睇試驗層，話我知佢電郵就得；佢都係收數字碼登入，唔使開帳號。</li>
      </ul>
    </section>

    <section id="todo" class="cms-sec wrap">
      <p class="cms-num">08</p>
      <h2>等你答嘅問題</h2>
      <ol class="cms-todo">
        <li>
          <b>兩篇攻略幫我睇</b>：
          <a href="/guides/tokyo-language-school-one-month-cost?review=1">東京遊學</a>、
          <a href="/guides/fukuoka-solo-2-days-1-night?review=1">福岡</a>，每篇頂部有「待確認」清單
        </li>
        <li>
          <b>自駕篇字幕</b>：YouTube Studio → 字幕 → 下載 .srt，傳俾我就得
        </li>
        <li>
          <b>網域</b>：你有冇自己網域？冇嘅話想叫咩名？
        </li>
        <li>
          <b>聯盟計劃</b>：除咗 Klook、Tocoo，仲有冇其他（例如 Agoda、遊學中介轉介）？
        </li>
        <li>
          <b>IG／Threads 數字同觀眾地區</b>：截圖俾我就得
        </li>
        <li>
          <b>你啲 KOL 朋友</b>：如果有人幫佢整呢個，你覺得佢哋一個月肯俾幾多？
        </li>
      </ol>
      <p class="cms-try">有問題直接 WhatsApp 我，或者見面一齊睇。</p>
      <p class="fine">
        <a href="/">← 返去外面睇網站</a> · <a href="/links">/links</a> · <a href="/work-with-me">品牌合作頁</a>
      </p>
    </section>
  </div>
)

export const cmsTitle = `${site.shortName} × SS 工作間`
