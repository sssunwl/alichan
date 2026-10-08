// /cms：SS 同阿陳嘅溝通位（唔係公開內容）。
// 「外面」= 讀者同品牌睇到嘅網站；「呢度」= 解釋點解要用、點用、要幾錢。
// 已用 Cloudflare Access 鎖住（2026-10-08，policy AliSS：阿陳 + SS 兩個電郵），/cms/lab/* 一齊鎖。
// repo 係 public：呢頁唔可以寫 SS 嘅收費同任何未公開資料。
import { site } from '../site.config'
import { ReviewDemo, ClickDemo } from './demos'

const toc = [
  ['why', '有咩用'],
  ['approve', '你要做咩'],
  ['data', '數據'],
  ['brands', '對品牌'],
  ['content', '建議加咩'],
  ['cost', '成本'],
  ['edit', '點自己改'],
  ['layers', '三層網站'],
  ['future', '之後做咩'],
  ['ig', 'IG 接唔接到'],
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
]

// 後台功能清單（P1 開發範圍）
const admin: [string, string[]][] = [
  ['首頁', ['今個月：/links 瀏覽、優惠碼複製、品牌查詢', '待你審嘅草稿有幾多篇、新查詢有幾多個', '一眼睇到邊篇文最多人睇']],
  ['審稿', ['左邊係草稿，右邊係影片；撳時間碼直接跳去嗰一秒核對', '價錢、店名、日期用黃色標住，全部剔晒先可以發佈', '可以即刻發佈，或者揀日子排程', '改字嘅時候即時預覽手機版']],
  ['文章', ['全部文章一覽，可以搜尋', '價錢過期就改，系統自動更新「資料時間」', '唔想要嘅文可以落架，連結唔會死']],
  ['連結同優惠碼', ['加、改、排序 /links 上面嘅連結', '優惠碼可以設到期日，過期自動收起', '每個碼睇到被複製幾多次、由邊度嚟']],
  ['品牌查詢', ['所有查詢集中一個收件匣，唔再散落 DM 同電郵', '標狀態：新、傾緊、成交、婉拒', '記低預算同日期，之後做年度總結']],
  ['品牌合作頁', ['揀邊幾條 Reels、影片做代表作', '更新粉絲數同觀眾資料（接咗 IG／YouTube 之後自動）']],
  ['數據報告', ['每月 1 號自動整好一份報告寄俾你', '可以直接轉發俾品牌做合作報告']],
  ['設定', ['頭像、自我介紹、社交連結、主色', '每次改動都有記錄，改錯可以一鍵還原']],
]

// 之後可以加嘅嘢（揀佢內容本身有嘅，唔係為做而做）
const future: { tag: string; title: string; body: string; link?: [string, string] }[] = [
  {
    tag: '最值得做',
    title: '「留言關鍵字」變網站專頁',
    body: '你而家每條 Reel 都係「留言『三亞』我 DM 你完整行程」，然後逐個 DM。改成 DM 一條你網站嘅連結：每個關鍵字一頁，有行程、地址、地圖同優惠碼。你唔使逐個 copy-paste，搜尋都搵到，仲知道幾多人睇咗。',
  },
  {
    tag: '已經整咗示範',
    title: '東京遊學預算計算機',
    body: '用你真實帳單做預設，讀者改月數、住宿、膳食，即刻計到總數。呢種工具人會收藏、會轉發，亦係 Google 鍾意嘅內容。',
    link: ['/cms/lab/study-budget', '試用（試驗層）'],
  },
  {
    tag: '工具',
    title: '阿陳地圖',
    body: '你去過嘅餐廳、Cafe、酒店全部釘喺地圖上，可以揀城市：東京、福岡、曼谷、台北、香港。去旅行嘅人會直接開住嚟用。',
  },
  {
    tag: '工具',
    title: '酒店開箱比較表',
    body: '你開箱過嘅酒店排成一張表：區域、價錢、適合邊類人、你嘅一句評語。酒店品牌合作時可以直接放埋入去。',
  },
  {
    tag: '工具',
    title: '日本自駕費用計算',
    body: '高速公路、ETC、油錢、租車，入日數同路線就計到大概要幾錢。等你自駕片嘅字幕到咗就可以做。',
  },
  {
    tag: '生意',
    title: '八珍湯小店',
    body: '產品介紹、點飲、價錢、訂購表單，全部喺你自己網站。IG 負責講故事，網站負責收單。',
  },
  {
    tag: '生意',
    title: '旅行清單換電郵',
    body: '例如「日本自駕出發前檢查表」，讀者留電郵就可以下載。慢慢儲到一班屬於你嘅讀者名單，唔使靠演算法。',
  },
  {
    tag: '品牌',
    title: '一鍵媒體資料包',
    body: '數字自動更新嘅 PDF，品牌問你要 media kit，傳條連結就得。',
  },
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
          <span>審稿、數據、建議、成本。要用你電郵收數字碼登入先入到，其他人睇唔到。</span>
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

    <section id="brands" class="cms-sec wrap">
      <p class="cms-num">04</p>
      <h2>品牌睇到你有自己網站，有咩分別？</h2>
      <p>你同品牌傾嘅時候，可以咁講。外面嘅品牌合作頁已經寫咗精簡版，<a href="/work-with-me">去睇</a>。</p>
      <div class="cms-cards">
        <article>
          <strong>1. 合作有「第二生命」</strong>
          <p>Reel 過咗一兩日就沉底。加一篇網站專頁，寫齊地址、價錢、預約方法同品牌連結，之後幾個月有人搜尋都會見到。品牌買到嘅唔止一條片。</p>
        </article>
        <article>
          <strong>2. 交到真實數字</strong>
          <p>每個合作有專屬連結同優惠碼，記錄點擊同複製次數。合作完你交一份報告：幾多人撳、幾多人複製碼。品牌最想要呢樣，大部分 KOL 俾唔到。</p>
        </article>
        <article>
          <strong>3. 你可以賣組合，收多啲</strong>
          <p>「Reel＋YouTube＋網站專頁」可以當一個套餐報價。多咗一樣長期有效、有數據嘅交付，加價有根據。合作查詢表單已經加咗呢個選項。</p>
        </article>
        <article>
          <strong>4. 睇落專業，少啲來回</strong>
          <p>品牌唔使 DM 問你數據：IG 6.48 萬追蹤、最高 430 萬觀看、YouTube 1.71 萬訂閱，一頁睇晒。查詢表單問清楚類型同內容，你唔使逐個追問。</p>
        </article>
      </div>
      <p class="fine">唔會講嘅：保證銷量、保證搜尋排名。可以講嘅係：專頁會一直喺度，數字會如實報。</p>
    </section>

    <section id="content" class="cms-sec wrap">
      <p class="cms-num">05</p>
      <h2>建議你加嘅內容</h2>
      <div class="cms-cards">
        <article>
          <strong>先補數字（最快）</strong>
          <ul>
            <li>Threads 追蹤人數（IG 6.48 萬已經填咗）</li>
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
      <p class="cms-num">06</p>
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
      <p class="fine">價錢係 2026-10 嘅 Cloudflare 公開價，匯率用 US$1 ≈ HK$7.8。</p>
      <div class="cms-service">
        <strong>上面係「場地」，下面係「做嘢嘅人」</strong>
        <p>平台成本係你直接俾 Cloudflare 嘅，我唔加一蚊。我負責嘅係：每月將你新片變成核對好、排好版、Google 讀得明嘅文章，跟進價錢過期，維護網站，同每月出一份數字報告。呢部分我哋見面傾。</p>
      </div>
    </section>

    <section id="edit" class="cms-sec wrap">
      <p class="cms-num">07</p>
      <h2>你點樣自己改內容：後台有咩</h2>
      <p>
        後台喺「你網域/admin」。登入唔使記密碼：輸入你電郵，收一個 6 位數字碼就入到。手機同電腦都用得，新草稿、新查詢會 Telegram 通知你，喺 Telegram 撳「批准」都得。
      </p>
      <div class="admin-grid">
        {admin.map(([title, items]) => (
          <article>
            <strong>{title}</strong>
            <ul>
              {items.map((i) => (
                <li>{i}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <p class="cms-try">你唔使理：設計、速度、Google 技術設定、主機、備份、保安。</p>
    </section>

    <section id="layers" class="cms-sec wrap">
      <p class="cms-num">08</p>
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

    <section id="future" class="cms-sec wrap">
      <p class="cms-num">09</p>
      <h2>之後可以點發展</h2>
      <p>網站唔止係文章。下面每樣都係由你現有內容出發，揀你想要嘅，一樣一樣加。</p>
      <div class="future-grid">
        {future.map((f) => (
          <article class={f.link ? 'live' : ''}>
            <span>{f.tag}</span>
            <strong>{f.title}</strong>
            <p>{f.body}</p>
            {f.link && (
              <a class="btn" href={f.link[0]}>
                {f.link[1]} →
              </a>
            )}
          </article>
        ))}
      </div>
    </section>

    <section id="ig" class="cms-sec wrap">
      <p class="cms-num">10</p>
      <h2>除咗 YouTube，IG Reels 接唔接到？</h2>
      <p>
        接到。你個 IG 係創作者帳號，可以用 Instagram 官方 API：你授權一次（好似「用 Facebook 登入」咁撳同意），之後系統就讀到你自己嘅 Reels。
      </p>
      <div class="cms-cards">
        <article>
          <strong>而家（Demo）</strong>
          <p>
            品牌合作頁嘅 Reels 立體輪播，係我手動揀咗 7 條、用公開封面整嘅。<a href="/work-with-me">去睇</a>
          </p>
        </article>
        <article>
          <strong>接咗官方 API 之後</strong>
          <ul>
            <li>輪播自動顯示最新、最多人睇嘅 Reels，唔使手動換</li>
            <li>粉絲數、觀看、觀眾地區同年齡自動更新去品牌合作頁</li>
            <li>Reel 嘅文字說明同 YouTube 字幕一樣，自動出網站專頁草稿</li>
            <li>授權每 60 日續一次，系統自動處理</li>
          </ul>
        </article>
        <article>
          <strong>要留意</strong>
          <ul>
            <li>「留言自動 DM」都可以用官方 API 做，但要經 Meta 審批，時間要預長啲</li>
            <li>只會讀你自己帳號，唔會讀其他人</li>
            <li>首頁唔會變成 IG 牆；Reels 只放喺品牌合作頁做代表作</li>
            <li>Threads 都有官方 API，可以一齊接</li>
          </ul>
        </article>
      </div>
    </section>

    <section id="todo" class="cms-sec wrap">
      <p class="cms-num">11</p>
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
          <b>IG 觀眾地區同年齡</b>：IG 專業主控板 → 粉絲 截圖俾我就得；仲有你想喺品牌頁放邊幾條 Reels
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
