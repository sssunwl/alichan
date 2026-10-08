// P0:3 篇人手整理稿。規則（SPEC §5）:
// - 只用字幕或阿陳影片簡介講過嘅內容，唔補任何影片冇嘅事實
// - 每個事實帶時間碼 t（秒），審稿時點過去核對
// - needsCheck 未清空 = 未經阿陳確認，唔可以正式發布

export type Fact = { label: string; value: string; note?: string; t?: number }
export type Section = { heading: string; t?: number; body: string[] }
export type Place = {
  name: string
  what: string
  address?: string
  hours?: string
  closed?: string
  price?: string
  t?: number
}
export type QA = { q: string; a: string }

export type Guide = {
  slug: string
  status: 'review' | 'pending-transcript'
  videoId: string
  videoTitle: string
  uploadDate: string // ISO
  duration: string // ISO 8601
  title: string
  description: string
  dataAsOf: string
  tags: string[]
  tldr: string[]
  factsCaption?: string
  facts?: Fact[]
  factsTotal?: Fact
  places?: Place[]
  sections: Section[]
  faq: QA[]
  affiliates: string[]
  needsCheck: string[]
}

export const guides: Guide[] = [
  {
    slug: 'tokyo-language-school-one-month-cost',
    status: 'review',
    videoId: 'StNJHl-WkBA',
    videoTitle: '東京遊學一個月「真實花費」公開！學費＋住宿＋生活＝台幣/港幣多少？值得嗎？',
    uploadDate: '2026-04-22',
    duration: 'PT17M44S',
    title: '東京遊學一個月要幾錢？阿陳真實帳單：約 60 萬日圓',
    description:
      '阿陳喺東京 Coto Japanese Academy 讀咗一個月日文，學費、住宿、交通、膳食、機票全部拆解，總數約 60 萬日圓。另附住邊區最抵、N5 程度值唔值得去。',
    dataAsOf: '影片 2026-04 發佈（片中講「五月尾」拍攝）',
    tags: ['日本遊學', '東京'],
    tldr: [
      '一個月總花費約 60 萬日圓（包學費、住宿、膳食、交通、機票）。',
      '最大開支係住宿：約 30 萬日圓，大約一半預算。學費其次，約 15 萬日圓。',
      '阿陳嘅建議：如果你同佢一樣係 N5 初學者，先喺香港學到 N4、最好 N3，再去日本會值得好多。',
    ],
    factsCaption: '一個月花費拆解',
    facts: [
      { label: '學費', value: '約 15 萬日圓（約 HK$8,000）', note: 'Coto Japanese Academy，按月計，每日 3 小時', t: 908 },
      { label: '課外活動', value: '4,000 日圓 × 2 次 = 8,000 日圓（約 HK$400 多）', note: '茶道、書道等文化活動', t: 917 },
      { label: '住宿', value: '約 9,000 多日圓/日 × 30 ≈ 30 萬日圓（約 HK$15,000）', note: '蒲田站附近酒店，私人房，包早餐', t: 925 },
      { label: '交通', value: '約 460 日圓/日 × 20 日（約 HK$480）', note: 'JR 蒲田→澀谷，單程 230 日圓', t: 934 },
      { label: '膳食', value: '每餐 600 至 2,000 多日圓', note: '超市減價便當最平；同朋友食燒肉、壽司就貴', t: 942 },
      { label: '娛樂', value: '因人而異', note: '阿陳要拍片所以特別高，參考價值唔大', t: 959 },
      { label: '機票', value: '約 HK$1,500 來回', t: 976 },
    ],
    factsTotal: { label: '總計', value: '約 60 萬日圓', t: 976 },
    sections: [
      {
        heading: '住邊度：澀谷、府中、蒲田點揀',
        t: 32,
        body: [
          '學校喺澀谷。澀谷好方便，但住宿又貴又細，多數係商務酒店嗰種。',
          '阿陳試過住府中，呢區好受留學生歡迎：物價超平，超市好多，住宿平大約三分一至一半，房都大啲。缺點係遠，同埋佢住嗰間冇咁乾淨企理。',
          '最後佢返返去蒲田：有包早餐（7 至 9 點有免費麵包、乳酪、果汁、咖啡），坐 JR 去澀谷，單程 230 日圓。',
        ],
      },
      {
        heading: '酒店價錢會跳：平日同週末可以差一倍',
        t: 104,
        body: [
          '日本酒店星期一至五會平啲，一到星期六日或者房間緊張，價錢可以翻倍。阿陳住嗰間星期一大約 HK$400 一晚，星期五去到 HK$1,000，平均大約 HK$550。',
          '一晚睇落唔貴，但住成個月就係最大開支。阿陳自己都講：大家唔一定要住得咁貴。',
        ],
      },
      {
        heading: '遊學生活嘅一日',
        t: 129,
        body: [
          '朝早 6 點起身覆訊息、剪片，8 點落去攞早餐，之後做運動、沖涼，再溫習做功課。學校每日都有功課。',
          '下午班 2 點 10 分上堂，上 3 個鐘，佢 1 點 15 分出門。一來一回，晚餐大約 6 點先食到，所以早餐會食飽啲。',
        ],
      },
      {
        heading: '交通：IC 卡充值要用現金',
        t: 356,
        body: [
          '由酒店行去蒲田站大約 7 分鐘。車站嘅充值機一定要用現金，就算去職員位都係要俾現金。',
          '之前住府中，車費要 300 多日圓，轉車亦複雜啲。澀谷站出閘再行大約 8 分鐘就到學校。',
        ],
      },
      {
        heading: '學校文化活動：4,000 日圓一次',
        t: 413,
        body: [
          '阿陳參加咗兩次文化活動：書道，同埋茶道配自己整銅鑼燒，每次 4,000 日圓。',
          '活動入面會同唔同國家嘅同學交流，佢見到嘅同學有嚟自印尼等地。學校有休息空間，同學會早啲返嚟溫習。',
        ],
      },
      {
        heading: '放學去邊：下北澤',
        t: 767,
        body: [
          '阿陳每次嚟東京最鍾意去下北澤：好多嘢食、咖啡店、文青店、古著店。最後一個星期，佢同一班同學去下北澤排隊食咖喱。',
        ],
      },
      {
        heading: 'N5 程度去一個月，值唔值得？',
        t: 984,
        body: [
          '阿陳嘅答案好直接：以佢 N5 嘅程度，只係識好簡單嘅溝通，文法都未識，一個月未必學到好多。',
          '如果重新揀，佢會先喺香港學到起碼 N4，甚至 N3，再去日本體驗生活同深造。',
        ],
      },
    ],
    faq: [
      { q: '東京遊學一個月大概要幾錢?', a: '阿陳實際使咗約 60 萬日圓，包學費、住宿、膳食、交通同機票。住宿佔約 30 萬日圓，係最大開支。' },
      { q: '遊學住邊區比較平?', a: '府中好受留學生歡迎，住宿大約平三分一至一半，但離澀谷遠。阿陳最後揀蒲田，坐 JR 去澀谷單程 230 日圓。' },
      { q: '零基礎去日本遊學一個月值唔值得？', a: '阿陳自己係 N5 程度去，佢建議先喺香港學到 N4 或 N3 再去，收穫會大好多。' },
      { q: '東京車站 IC 卡充值可唔可以碌卡?', a: '阿陳實測，車站充值機要用現金，職員位都係收現金。' },
    ],
    affiliates: ['klook'],
    needsCheck: [
      '總花費嘅港幣金額：字幕寫「大概港幣」但冇講數字',
      '住宿：片中有「約 HK$500 一日」同「平均 HK$550」兩個講法，用邊個?',
      '字幕寫「莆田」，影片簡介寫「蒲田」，已統一用蒲田',
      '拍攝年份（影片 2026-04 發佈，片中講五月尾）',
      '下北澤咖喱店店名（片中冇講）',
    ],
  },
  {
    slug: 'fukuoka-solo-2-days-1-night',
    status: 'review',
    videoId: 'd5w9k--VGjA',
    videoTitle: '獨旅福岡2天1夜竟能塞滿10個景點⁉️ 市區懶人包公開',
    uploadDate: '2025-02-24',
    duration: 'PT17M2S',
    title: '一個人遊福岡 2 天 1 夜：唔使自駕嘅市區食買路線',
    description:
      '阿陳一個人喺福岡市區 24 小時：明太子法棍、大濠公園抹茶栗子甜品、博多一双拉麵、The BREAKFAST HOTEL 早餐、選物店同冬甩。附地址、營業時間、排隊同預約須知。',
    dataAsOf: '2025-02（營業時間來自影片簡介，出發前請再確認）',
    tags: ['福岡', '九州', '獨旅'],
    tldr: [
      '福岡市區唔使自駕：機場坐 shuttle bus 轉地鐵，9 分鐘到市區。',
      '路線：THE FULL FULL HAKATA 明太子法棍（444 日圓）→ 大濠公園 &LOCALS 抹茶栗子甜品（850 日圓）→ 大濠公園日落 → 博多一双拉麵 → 住 The BREAKFAST HOTEL → B.B.B POTTERS 選物店 → BON BON DONUTS。',
      'The BREAKFAST HOTEL 早餐一定要網上預約，非住客唔食得，時段可以全日爆滿。',
    ],
    places: [
      { name: 'THE FULL FULL HAKATA', what: '明太子法棍 444 日圓', address: '福岡県福岡市博多区祇園町 11-14（櫛田神社前駅）', hours: '10:00–19:00', closed: '星期二', t: 89 },
      { name: '&LOCALS 大濠公園', what: '抹茶栗子甜品 850 日圓', address: '福岡県福岡市中央区大濠公園 1-9 大濠テラス', hours: '09:00–18:30(L.O. 18:00)', closed: '星期一（假期順延翌日）', t: 247 },
      { name: '博多一双 中洲店', what: '豚骨拉麵', address: '福岡県福岡市博多区中洲 2-6-6', hours: '19:00–04:30', t: 359 },
      { name: 'The BREAKFAST HOTEL', what: '住宿+早餐', address: '福岡県福岡市博多区中洲 3 丁目 6-19', t: 527 },
      { name: 'B.B.B POTTERS', what: '選物店（杯具）', address: '藥院大通站附近', t: 845 },
      { name: 'BON BON DONUTS 博多店', what: '原味砂糖冬甩', address: '福岡県福岡市博多区上川端町 1-5 1F（櫛田神社前駅）', hours: '11:00–19:00', closed: '星期二、三', t: 887 },
    ],
    sections: [
      {
        heading: '機場去市區',
        t: 62,
        body: ['福岡機場同市區好近。出機場坐 shuttle bus 去地鐵站，再坐 9 分鐘地鐵，阿陳嘅酒店離車站行 4 分鐘就到。'],
      },
      {
        heading: '第一站：THE FULL FULL HAKATA 明太子法棍',
        t: 89,
        body: [
          '由酒店行大約 10 分鐘。明太子法棍 444 日圓，一條好大份，阿陳話「抵到爛」。',
          '要攞號碼牌等叫號：阿陳 2 點 30 分攞牌，2 點 55 分先有，平日都坐滿人。等嘅時候可以再揀其他包，佢揀咗朱古力包。',
          '堂食稅率 10%，外賣 8%。堂食可以即刻翻熱，阿陳寧願俾多少少食熱包。',
        ],
      },
      {
        heading: '大濠公園 + &LOCALS',
        t: 247,
        body: [
          '大濠公園人少、清靜，湖面好似鏡咁倒影藍天白雲，仲可以划船。',
          '&LOCALS 有兩間分店，賣嘅嘢唔同，大濠店有抹茶栗子甜品，850 日圓。栗子蓉又綿又濃，抹茶雪糕好滑。食完可以上二樓睇吓，出嚟啱好睇日落。',
          '提提你：阿陳 5 點先食抹茶，佢自己都擔心夜晚瞓唔著。',
        ],
      },
      {
        heading: '晚餐：博多一双 中洲店',
        t: 359,
        body: [
          '開店前 5 分鐘到，排第 8 位。門外已經聞到好濃嘅豚骨味，入去先買飛。',
          '湯好濃、有黏度，但飲咗好多都唔覺口渴；幼麵軟硬適中，掛湯。中途一定要加醃菜同蒜，鮮味提升好多。',
          '聽講博多本店要排隊，中洲店人少啲。兩間有冇分別，阿陳都想知，食過嘅朋友可以留言話佢知。',
        ],
      },
      {
        heading: '住 The BREAKFAST HOTEL：早餐係主角',
        t: 527,
        body: [
          '早餐好豐富：12 款自家醃製涼拌、海鮮丼、明太子，熱盤有肉丸、炒蛋、焗薯，仲有即叫嘅豚丼、法式焦糖燉蛋多士、鹽味冷麵。阿陳覺得成餐最好食係炭香豚肉飯。',
          '一定要網上預約早餐，非住客唔可以食。阿陳本來訂 7 點，想改遲啲，結果當日全部時段已經爆滿。',
          '晚上 9 點半至 11 點有宵夜茶漬飯。冇訂早餐嘅住客會免費送一杯 smoothie；有訂早餐但又想飲，要另付 500 日圓。',
          '房間就一般，有啲窄，兩張床已經佔晒空間。',
        ],
      },
      {
        heading: '第二日：選物店同冬甩',
        t: 845,
        body: [
          'B.B.B POTTERS 喺藥院大通站附近，杯具好靚，印第安風、磨砂手感，成間店好似魔法學校。',
          '福岡周圍都係冬甩店。阿陳本來想去嘅人氣店大排長龍，估計要排半個鐘以上，於是改去 BON BON DONUTS：法國鄉村復古風，原味砂糖冬甩好似香港沙翁，但仲鬆軟啲。',
        ],
      },
    ],
    faq: [
      { q: '福岡市區唔自駕玩唔玩到?', a: '玩到。阿陳成個 24 小時都唔使自駕，機場坐 shuttle bus 轉地鐵，9 分鐘到市區。' },
      { q: 'The BREAKFAST HOTEL 嘅早餐非住客食唔食到?', a: '唔得。住客都要網上預約，而且時段可能全日爆滿，建議訂房時一齊訂。' },
      { q: 'THE FULL FULL HAKATA 明太子法棍要等幾耐?', a: '阿陳平日下午去，攞號碼牌後等咗大約 25 分鐘。一條 444 日圓（2025-02）。' },
      { q: '博多一双去本店定中洲店?', a: '阿陳去中洲店，開店前 5 分鐘到排第 8。聽講本店要排隊。' },
    ],
    affiliates: ['tocoo', 'klook'],
    needsCheck: [
      '影片標題講「10 個景點」，字幕實際介紹 6 至 7 個地點，文章冇用「10 個」',
      '&LOCALS 大濠店：片中講「呢個嚟自八女市」，未確定係指抹茶定栗子，所以冇寫',
      '營業時間同定休日來自 2025-02 影片簡介，要唔要加「出發前再確認」以外嘅提示',
    ],
  },
  {
    slug: 'japan-self-drive-8-things',
    status: 'pending-transcript',
    videoId: 'yRdZnt3EcBk',
    videoTitle: '日本自駕遊必看🚘在日本開車必須知道的8件事情 教你省大錢',
    uploadDate: '2024-07-10',
    duration: 'PT10M25S',
    title: '日本自駕前必知 8 件事：高速收費、ETC、入油',
    description: '日本自駕前要知嘅 8 件事，包括高速公路收費、ETC、點樣入油，同埋點樣避開高速公路。',
    dataAsOf: '2024-07',
    tags: ['日本自駕'],
    tldr: [
      '呢篇文章仲整理緊，等阿陳提供字幕檔。',
      '影片簡介提到嘅內容：高速公路收費方式、ETC（電子收費）、點樣入油，同埋點樣避開高速公路。',
    ],
    sections: [],
    faq: [],
    affiliates: ['tocoo', 'klook'],
    needsCheck: ['等阿陳喺 YouTube Studio 匯出 SRT 字幕'],
  },
]

export const findGuide = (slug: string) => guides.find((g) => g.slug === slug)
export const publishedGuides = () => guides.filter((g) => g.status !== 'pending-transcript')
