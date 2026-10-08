// 後台小工具嘅資料來源（全部免 API key）：
// - Google Trends 香港每日熱搜 RSS
// - 各頻道 YouTube RSS（最新 15 條，有觀看數同描述）
// 用 Cache API 存 1 小時，唔好每次撳都去拉。

const decode = (s: string) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .trim()
const tag = (xml: string, name: string) => decode(xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`))?.[1] ?? '')
const blocks = (xml: string, name: string) => xml.match(new RegExp(`<${name}[\\s>][\\s\\S]*?</${name}>`, 'g')) ?? []

export const cached = async <T>(key: string, ttl: number, fn: () => Promise<T>, fresh = false): Promise<T> => {
  const cache = (globalThis as unknown as { caches?: { default: Cache } }).caches?.default
  const req = new Request(`https://cache.alichan.local/${key}`)
  if (cache && !fresh) {
    const hit = await cache.match(req)
    if (hit) return (await hit.json()) as T
  }
  const data = await fn()
  if (cache) await cache.put(req, new Response(JSON.stringify(data), { headers: { 'cache-control': `max-age=${ttl}` } }))
  return data
}

// ---------- 熱門話題 ----------
// 關注字：阿陳題材（日本／旅行／美食／遊學／泰國／台灣…）
export const WATCH = ['日本', '東京', '大阪', '京都', '福岡', '沖繩', '北海道', '九州', '旅行', '旅遊', '機票', '航空', '酒店', '日圓', '簽證', '泰國', '曼谷', '台灣', '台北', '韓國', '首爾', '深圳', '澳門', '美食', '餐廳', '放假', '假期', '遊學', '留學', '紅葉', '櫻花', '溫泉', '迪士尼', '演唱會', '颱風']

export type Trend = { title: string; traffic: string; pubDate: string; news: { title: string; url: string; source: string }[]; matched: string[] }

export const fetchTrends = async (geo = 'HK') => {
  const res = await fetch(`https://trends.google.com/trending/rss?geo=${geo}`, { headers: { 'user-agent': 'Mozilla/5.0' } })
  if (!res.ok) throw new Error(`Google Trends ${res.status}`)
  const xml = await res.text()
  const items: Trend[] = blocks(xml, 'item').map((it) => {
    const news = blocks(it, 'ht:news_item').map((n) => ({
      title: tag(n, 'ht:news_item_title'),
      url: tag(n, 'ht:news_item_url'),
      source: tag(n, 'ht:news_item_source'),
    }))
    const title = tag(it, 'title')
    const hay = [title, ...news.map((n) => n.title)].join(' ')
    return { title, traffic: tag(it, 'ht:approx_traffic'), pubDate: tag(it, 'pubDate'), news, matched: WATCH.filter((w) => hay.includes(w)) }
  })
  items.sort((a, b) => b.matched.length - a.matched.length)
  return { fetchedAt: new Date().toISOString(), geo, items, watch: WATCH }
}

// ---------- 對手追蹤 ----------
// 暫定名單（2026-10-08 由 YouTube 搜尋同阿陳題材重疊嘅香港／日本旅遊頻道），要同阿陳確認
export const RIVALS: { id: string; name: string; note: string }[] = [
  { id: 'UC70fVch6YT1ZeXLdvZLMoYg', name: '阿陳AliLife', note: '自己' },
  { id: 'UCbKEdTqBjyVftiR2TlhkBOA', name: '沖繩 Oki-Family', note: '日本在地香港人 · 約 6.9 萬訂閱' },
  { id: 'UC9tWQSPNhgVMr9BhKKyFoEw', name: 'Audrey In Japan', note: '香港人在日本 · 約 3.2 萬訂閱' },
  { id: 'UCSSFo-As_FJCubauoPYb0hw', name: 'PygarLiの日本日常', note: '廣東話日本 vlog · 約 4.2 萬訂閱' },
  { id: 'UCaea4kVPO4hTtus8t6PE3ig', name: '玩轉沖繩 Kokoni', note: '沖繩攻略 · 約 3.8 萬訂閱' },
  { id: 'UCgB1SocSZpaMlv_Uiz_5oyg', name: '親愛的路 Dear Road', note: '同「東京遊學」搜尋撞位 · 約 21.5 萬訂閱' },
  { id: 'UCP1pFY0CA9KZKpXcWjM74ng', name: 'Ki笑人生', note: '同「日本遊學」搜尋撞位 · 約 22.7 萬訂閱' },
  { id: 'UCN8HCR0cBgHtacP_inUsuCg', name: '老辣妹', note: '同「東京」搜尋撞位 · 約 27.7 萬訂閱' },
]

const SPONSOR = /(合作|贊助|業配|特別鳴謝|感謝.{0,12}邀請|sponsored|#ad\b|#pr\b|\bPR\b|優惠碼|折扣碼|promo ?code|discount ?code|使用.{0,6}code)/i
const AFFILIATE = /(klook|kkday|agoda|trip\.com|booking\.com|tocoo|rakuten|樂天|hotels\.com|airalo|esim)/gi

export type RivalVideo = { id: string; title: string; published: string; views: number; brands: string[]; isSponsored: boolean }

// 每條片簡介通常有固定模板（社交連結、長期優惠碼、合作電郵）。
// 喺 ≥40% 片都出現嘅行當係模板，偵測前剔走，先唔會條條片都當成合作。
const parseChannel = (xml: string): RivalVideo[] => {
  const entries = blocks(xml, 'entry').map((e) => ({
    id: tag(e, 'yt:videoId'),
    title: tag(e, 'title'),
    published: tag(e, 'published'),
    views: +(e.match(/<media:statistics views="(\d+)"/)?.[1] ?? 0),
    lines: tag(e, 'media:description').split(/\n+/).map((l) => l.trim()).filter(Boolean),
  }))
  const freq = new Map<string, number>()
  entries.forEach((e) => new Set(e.lines).forEach((l) => freq.set(l, (freq.get(l) ?? 0) + 1)))
  const isTemplate = (l: string) => entries.length >= 4 && (freq.get(l) ?? 0) / entries.length >= 0.4
  // 頻道自己嘅 handle：喺模板行出現過嘅 @xxx
  const own = new Set(entries.flatMap((e) => e.lines.filter(isTemplate).flatMap((l) => [...l.matchAll(/(?<![\w.])@([A-Za-z0-9_.]{3,30})/g)].map((m) => m[1].toLowerCase()))))
  return entries.map((e) => {
    const text = `${e.title}\n${e.lines.filter((l) => !isTemplate(l)).join('\n')}`
    const handles = [...text.matchAll(/(?<![\w.])@([A-Za-z0-9_.]{3,30})/g)].map((m) => m[1]).filter((h) => !own.has(h.toLowerCase()))
    const aff = [...text.matchAll(AFFILIATE)].map((m) => m[0])
    const brands = [...new Set([...aff.map((a) => a[0].toUpperCase() + a.slice(1).toLowerCase()), ...handles.map((h) => '@' + h)])].slice(0, 6)
    return { id: e.id, title: e.title, published: e.published, views: e.views, brands, isSponsored: SPONSOR.test(text) || handles.length > 0 }
  })
}

export const fetchRivals = async () => {
  const channels = await Promise.all(
    RIVALS.map(async (c) => {
      try {
        const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${c.id}`)
        if (!res.ok) throw new Error(`RSS ${res.status}`)
        return { ...c, videos: parseChannel(await res.text()) }
      } catch (e) {
        return { ...c, videos: [], error: String(e) }
      }
    }),
  )
  return { fetchedAt: new Date().toISOString(), channels }
}

// ---------- Gemini 小工具（熱話變題目、縮圖大字） ----------
export const geminiJson = async <T>(apiKey: string, prompt: string, models = ['gemini-3.5-flash', 'gemini-2.5-flash']): Promise<T> => {
  let last = ''
  for (const model of models) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: 'application/json', temperature: 0.9 } }),
    })
    if (res.ok) {
      const d = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] }
      return JSON.parse(d.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '{}') as T
    }
    last = `Gemini ${res.status}: ${(await res.text()).slice(0, 200)}`
    if (![429, 500, 503].includes(res.status)) break
  }
  throw new Error(last)
}

export const trendIdeaPrompt = (trend: string, news: string[]) => `你係香港 YouTuber／IG 創作者「阿陳 AliLife」嘅選題助手。阿陳拍：日本深度旅遊、日本遊學、泰國／台灣旅遊、香港美食、酒店開箱；招牌係「真實花費」同老實講踩雷。IG Reels 慣用「留言關鍵字 DM 你完整行程」。

今日香港熱搜：「${trend}」
相關新聞：${news.join('；') || '（冇）'}

諗 3 個阿陳可以拍嘅題目。如果呢個熱搜同佢題材完全拉唔上關係，就老實講「唔建議跟」並只俾 1 個最勉強嘅角度。唔好捏造事實。
只輸出 JSON：{"ideas":[{"title":"題目（廣東話，有數字或鉤）","angle":"點解觀眾會睇＋點樣扣返阿陳風格（1–2 句）","platform":"IG Reel 或 YouTube 或 Threads"}]}`
