// Reel 企劃板資料（存 KV key `board`，阿陳同 SS 共用一份）
// 第一次冇資料時用示範：已出嘅係阿陳真實 Reels（標題由佢 IG caption 整理），日期係示範用嘅大概分佈。

export type Stage = 'idea' | 'shoot' | 'edit' | 'posted'
export type Item = { id: string; hook: string; shots: string[]; keyword?: string; caption?: string; stage: Stage; day?: string; postedAt?: string; createdAt: string }
export type Ref = { id: string; url: string; note: string; createdAt: string }
export type Board = { items: Item[]; refs: Ref[]; hooks: string[] }

const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString()
const dayFromNow = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10)

export const seedBoard = (): Board => {
  const posted: [string, string, string[], number][] = [
    ['三亞', '最近覺得好累？又唔想花大錢？', ['落機即刻影海', '酒店私人沙灘', '椰子雞火鍋', '西島日落'], 3],
    ['遊輪', '第一次坐遊輪終於明白：只有 0 次，同無數次', ['上船一刻', '房間開箱', '自助餐', '甲板日落'], 6],
    ['天后火鍋', '鍾意打邊爐多過 Fine Dining，但慶祝又想有儀式感？', ['海景', '專人幫你蒸', '海鮮上枱'], 9],
    ['太子泰菜', '各位食泰菜唔好淨係識去九龍城！', ['門口', '咖喱麵包', '大份海鮮'], 13],
    ['茨城', '秋天去東京，推介你去近郊呢度', ['掃帚草', '海上鳥居', '花火'], 16],
    ['手工意粉', '手工意粉控注意！中環 3 間', ['開麵', '三碟比較', 'Lunch 價'], 20],
    ['成田', '人生睇過最精彩嘅花火大會', ['人潮', '第一發', '高潮', '散場'], 24],
    ['水門', '泰國人自己都唔想你知嘅地方', ['市場入口', '試身', '掃貨戰利品'], 31],
    ['上環Cafe', '以為係食 Pasta，點知甜品先係主角', ['Pasta', '甜品特寫', '評語'], 38],
    ['中環意粉', '預約困難店，$198 Lunch 食到', ['訂位畫面', '上菜', '埋單'], 45],
  ]
  const items: Item[] = posted.map(([keyword, hook, shots, d], i) => ({
    id: `seed-p${i}`,
    hook,
    shots,
    keyword,
    stage: 'posted',
    postedAt: daysAgo(d),
    createdAt: daysAgo(d + 3),
  }))
  items.push(
    { id: 'seed-e', hook: '東京遊學一個月，我真係用咗 60 萬日圓', shots: ['帳單攤開', '學校門口', '蒲田酒店', '計數機'], keyword: '遊學', stage: 'edit', day: dayFromNow(1), createdAt: daysAgo(2) },
    { id: 'seed-s', hook: '福岡 24 小時，唔使自駕可以去幾多個位？', shots: ['機場地鐵', '明太子法棍', '大濠公園', '屋台'], keyword: '福岡', stage: 'shoot', day: dayFromNow(3), createdAt: daysAgo(1) },
    { id: 'seed-i', hook: '迪士尼金卡，計落真係抵？', shots: ['金卡價錢', '餐廳折扣', '同東京迪士尼比較'], keyword: '金卡', stage: 'idea', createdAt: daysAgo(0) },
  )
  return {
    items,
    refs: [],
    hooks: [
      '👇🏻 留言「關鍵字」我DM你完整行程＋地址清單！',
      '最近覺得好累？又唔想花大錢？',
      '各位食○○唔好淨係識去○○！',
      '○○人自己都唔想你知道嘅地方',
      '以為係為咗○○，點知○○先係主角',
      '第一次○○終於明白：',
      '○○控注意！',
      '花咗幾多錢？我將真實帳單攤晒出嚟',
      '去之前知道就好啦：踩過嘅坑全部講晒',
    ],
  }
}

export const reelIdeasPrompt = (what: string, place?: string) => `你係香港 IG 創作者「阿陳」(@__ali.c) 嘅 Reel 企劃助手。阿陳拍日本／泰國／台灣旅遊、香港美食、酒店開箱；招牌係真實花費同老實講踩雷。

佢 Reel 慣用開頭（廣東話）：
- 最近覺得好累？又唔想花大錢？
- 各位食泰菜唔好淨係識去九龍城！
- 泰國人自己都唔想你知道嘅地方——
- 以為係食 Pasta，點知甜品先係主角
caption 第一行一定係「👇🏻 留言「關鍵字」我DM你完整行程＋地址清單！」

今日阿陳影咗：${what}
${place ? `地點：${place}` : ''}

諗 3 條唔同角度嘅 Reel（例如：花費角度、踩雷角度、秘景角度）。規則：
- hook 係片頭 3 秒講嘅一句，廣東話口語，20 字內，要令人想睇落去
- shots 係 3–4 個鏡頭，每個 10 字內，只可以用佢講過影咗嘅嘢，唔好作冇提過嘅場景
- keyword 2–4 字，用嚟做「留言關鍵字」
- caption 兩行：第一行係留言關鍵字句，第二行【主題｜副題emoji】
- 唔好作價錢；唔好 AI 腔
只輸出 JSON：{"ideas":[{"hook":"","shots":[""],"keyword":"","caption":""}]}`
