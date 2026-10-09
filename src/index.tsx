import { Hono } from 'hono'
import { site, links } from './site.config'
import { guides, findGuide, publishedGuides } from './content/guides'
import { Layout, type Meta } from './layout'
import { Home, GuideList, GuidePage, Links, WorkWithMe, About, NotFound } from './pages'
import { guideLd, personLd, websiteLd, ytThumb } from './seo'
import { Cms, cmsTitle } from './cms/page'
import { StudyBudget } from './cms/budget'
import { CarouselStudio } from './cms/dev/carousel'
import { frames } from './cms/dev/frames'
import { PostStudio } from './cms/dev/posts'
import { DevIndex } from './cms/dev/index'
import { generatePosts, type PostInput } from './cms/dev/generate'
import { QuoteStudio } from './cms/dev/quote'
import { TrendsStudio } from './cms/dev/trends'
import { RivalsStudio } from './cms/dev/rivals'
import { ThumbStudio, thumbIdeaPrompt } from './cms/dev/thumbs'
import { cached, fetchTrends, fetchRivals, geminiJson, trendIdeaPrompt, resolveChannel, RIVALS, WATCH, type Rival } from './cms/dev/feeds'
import { ToolsShell, ToolsHome, TOOLS, type ToolId } from './cms/tools/shell'
import { ReelStudio } from './cms/tools/reels'
import { seedBoard, reelIdeasPrompt, type Board } from './cms/tools/board'

type Env = { Bindings: { PREVIEW: string; SITE_URL: string; DEV_EMAILS: string; MEMBER_EMAILS: string; GEMINI_API_KEY?: string; KV: KVNamespace } }
const app = new Hono<Env>()

// /cms/dev/*：開發中工具，Cloudflare Access 另一個 app 只放 DEV_EMAILS（SS）入。
// Worker 再核一次 Access 傳落嚟嘅電郵（雙重保險，API 會用 Gemini key）；本機開發冇 Access 就放行。
const isDev = (c: { env: Env['Bindings']; req: { header: (k: string) => string | undefined } }) => {
  if (c.env.SITE_URL.includes('localhost')) return true
  const email = (c.req.header('cf-access-authenticated-user-email') ?? '').toLowerCase()
  return !!email && c.env.DEV_EMAILS.toLowerCase().split(',').includes(email)
}

// /cms/tools、/cms/api：阿陳 + SS（Access policy AliSS），Worker 再核一次
const isMember = (c: { env: Env['Bindings']; req: { header: (k: string) => string | undefined } }) => {
  if (c.env.SITE_URL.includes('localhost')) return true
  const email = (c.req.header('cf-access-authenticated-user-email') ?? '').toLowerCase()
  return !!email && c.env.MEMBER_EMAILS.toLowerCase().split(',').includes(email)
}

const kvGet = async <T,>(kv: KVNamespace, key: string, fallback: () => T): Promise<T> => ((await kv.get(key, 'json')) as T | null) ?? fallback()
const listKey = (xs: { toString(): string }[]) => [...xs.map(String)].join('|').length + '-' + [...xs.map(String)].join('|').slice(0, 60).replace(/[^\w]/g, '')

const ctx = (c: { env: Env['Bindings']; req: { path: string } }) => ({
  base: c.env.SITE_URL.replace(/\/$/, ''),
  path: c.req.path,
  preview: c.env.PREVIEW === 'true',
})

// 預覽站：HTTP header 都加 noindex（唔止 meta）
app.use('*', async (c, next) => {
  await next()
  if (c.env.PREVIEW === 'true') c.header('X-Robots-Tag', 'noindex, nofollow')
})

app.get('/', (c) => {
  const b = ctx(c)
  const meta: Meta = {
    ...b,
    title: site.name,
    description: `${site.tagline}。日本遊學花費、福岡、日本自駕等攻略，影片資訊整理成文字。`,
    ld: [websiteLd(b.base), personLd(b.base)],
  }
  return c.html(<Layout meta={meta}><Home /></Layout>)
})

app.get('/guides', (c) => {
  const b = ctx(c)
  const meta: Meta = { ...b, title: '全部攻略', description: `${site.name} 嘅全部旅遊、遊學攻略。` }
  return c.html(<Layout meta={meta}><GuideList title="全部攻略" items={guides} /></Layout>)
})

app.get('/guides/:slug', (c) => {
  const g = findGuide(c.req.param('slug'))
  if (!g) return c.notFound()
  const b = ctx(c)
  const meta: Meta = {
    ...b,
    title: g.title,
    description: g.description,
    image: ytThumb(g.videoId, 'maxresdefault'),
    type: 'article',
    ld: [guideLd(b.base, g), personLd(b.base)],
    noindex: g.status === 'pending-transcript',
  }
  const review = c.req.query('review') === '1'
  return c.html(<Layout meta={meta}><GuidePage g={g} review={review} /></Layout>)
})

app.get('/topics/:tag', (c) => {
  const tag = decodeURIComponent(c.req.param('tag'))
  if (!(site.topics as readonly string[]).includes(tag)) return c.notFound()
  const b = ctx(c)
  const items = guides.filter((g) => g.tags.includes(tag))
  const meta: Meta = { ...b, title: `${tag}攻略`, description: `${site.name} 嘅${tag}攻略。`, noindex: items.length === 0 }
  return c.html(<Layout meta={meta}><GuideList title={`${tag}攻略`} items={items} kicker="主題" /></Layout>)
})

app.get('/links', (c) => {
  const b = ctx(c)
  const meta: Meta = { ...b, title: '連結', description: `${site.name} 嘅最新攻略、優惠碼同社群帳號。` }
  return c.html(<Layout meta={meta} bare><Links /></Layout>)
})

app.get('/work-with-me', (c) => {
  const b = ctx(c)
  const meta: Meta = { ...b, title: '品牌合作', description: `同${site.name}合作：數據、熱門影片同查詢表單。` }
  return c.html(<Layout meta={meta}><WorkWithMe /></Layout>)
})

app.get('/about', (c) => {
  const b = ctx(c)
  const meta: Meta = { ...b, title: '關於阿陳', description: `${site.name}:${site.tagline}。`, ld: [personLd(b.base)] }
  return c.html(<Layout meta={meta}><About /></Layout>)
})

// SS 同阿陳嘅溝通位。正式版用 Cloudflare Access 鎖住（SPEC §9）；永遠 noindex、唔入 sitemap
app.get('/cms', (c) => {
  const b = ctx(c)
  const meta: Meta = { ...b, title: cmsTitle, description: '阿陳同 SS 嘅工作間。', noindex: true }
  c.header('X-Robots-Tag', 'noindex, nofollow')
  return c.html(<Layout meta={meta}><Cms dev={isDev(c)} /></Layout>)
})

// /cms/lab/*：試驗層，同 /cms 一齊由 Cloudflare Access 鎖住
app.get('/cms/lab/study-budget', (c) => {
  const b = ctx(c)
  const meta: Meta = { ...b, title: '東京遊學預算計算機', description: '用阿陳真實帳單做底嘅遊學預算計算機。', noindex: true }
  c.header('X-Robots-Tag', 'noindex, nofollow')
  return c.html(
    <Layout meta={meta}>
      <div class="wrap lab-wrap">
        <p class="lab-flag">試驗層 · 只有你同 SS 睇到 · <a href="/cms#future">返去 CMS</a></p>
        <StudyBudget />
      </div>
    </Layout>,
  )
})

app.use('/cms/dev/*', async (c, next) => {
  if (!isDev(c)) return c.notFound()
  await next()
  c.header('X-Robots-Tag', 'noindex, nofollow')
})
app.get('/cms/dev', (c) => {
  if (!isDev(c)) return c.notFound()
  const b = ctx(c)
  return c.html(<Layout meta={{ ...b, title: '開發中工具', description: '', noindex: true }}><DevIndex /></Layout>)
})
app.get('/cms/dev/carousel', (c) => {
  const b = ctx(c)
  return c.html(<Layout meta={{ ...b, title: '輪播圖生成器', description: '', noindex: true }}><CarouselStudio frames={frames} /></Layout>)
})
app.get('/cms/dev/posts', (c) => {
  const b = ctx(c)
  return c.html(<Layout meta={{ ...b, title: '帖文生成器', description: '', noindex: true }}><PostStudio /></Layout>)
})
app.use('/cms/api/*', async (c, next) => {
  if (!isMember(c)) return c.json({ error: '冇權限' }, 403)
  await next()
  c.header('cache-control', 'no-store')
})

app.post('/cms/api/posts', async (c) => {
  if (!c.env.GEMINI_API_KEY) return c.json({ error: '未設定 GEMINI_API_KEY' }, 500)
  const body = (await c.req.json().catch(() => null)) as PostInput | null
  if (!body?.transcript || typeof body.transcript !== 'string') return c.json({ error: '冇字幕' }, 400)
  if (body.transcript.length > 200_000) return c.json({ error: '字幕太長' }, 413)
  try {
    return c.json(await generatePosts(body, c.env.GEMINI_API_KEY))
  } catch (e) {
    return c.json({ error: String(e).slice(0, 300) }, 502)
  }
})

const devPage = (path: string, title: string, node: () => any) =>
  app.get(path, (c) => {
    const b = ctx(c)
    return c.html(<Layout meta={{ ...b, title, description: '', noindex: true }}>{node()}</Layout>)
  })
devPage('/cms/dev/thumbs', '縮圖 Prompt 生成器', () => <ThumbStudio />)
devPage('/cms/dev/trends', '熱門話題追蹤', () => <TrendsStudio />)
devPage('/cms/dev/rivals', '對手追蹤', () => <RivalsStudio />)
devPage('/cms/dev/quote', '報價單生成器', () => (
  <QuoteStudio
    stats={{ youtubeSubscribers: site.stats.youtubeSubscribers, instagramFollowers: site.stats.instagramFollowers, topReelViews: site.reels[0].views, asOf: site.stats.asOf }}
    email={site.email}
  />
))
app.post('/cms/api/thumb-ideas', async (c) => {
  if (!c.env.GEMINI_API_KEY) return c.json({ error: '未設定 GEMINI_API_KEY' }, 500)
  const b = (await c.req.json().catch(() => null)) as { topic?: string } | null
  if (!b?.topic) return c.json({ error: '冇主題' }, 400)
  try {
    return c.json(await geminiJson(c.env.GEMINI_API_KEY, thumbIdeaPrompt(b.topic.slice(0, 500))))
  } catch (e) {
    return c.json({ error: String(e).slice(0, 300) }, 502)
  }
})
app.get('/cms/api/trends', async (c) => {
  const watch = await kvGet<string[]>(c.env.KV, 'watch', () => WATCH)
  try {
    return c.json(await cached('trends-hk-' + listKey(watch), 3600, () => fetchTrends('HK', watch), c.req.query('fresh') === '1'))
  } catch (e) {
    return c.json({ error: String(e) }, 502)
  }
})
app.get('/cms/api/rivals', async (c) => {
  const list = await kvGet<Rival[]>(c.env.KV, 'rivals', () => RIVALS)
  return c.json(await cached('rivals-' + listKey(list.map((r) => r.id)), 3600, () => fetchRivals(list), c.req.query('fresh') === '1'))
})
app.get('/cms/api/watch', async (c) => c.json({ words: await kvGet<string[]>(c.env.KV, 'watch', () => WATCH) }))
app.put('/cms/api/watch', async (c) => {
  const b = (await c.req.json().catch(() => null)) as { words?: unknown } | null
  if (!Array.isArray(b?.words)) return c.json({ error: '格式唔啱' }, 400)
  const words = [...new Set(b.words.map((w) => String(w).trim()).filter((w) => w && w.length <= 20))].slice(0, 80)
  await c.env.KV.put('watch', JSON.stringify(words))
  return c.json({ words })
})
app.get('/cms/api/rivals-list', async (c) => c.json({ channels: await kvGet<Rival[]>(c.env.KV, 'rivals', () => RIVALS) }))
app.post('/cms/api/rivals-list', async (c) => {
  const b = (await c.req.json().catch(() => null)) as { input?: string; note?: string } | null
  if (!b?.input) return c.json({ error: '冇輸入' }, 400)
  const list = await kvGet<Rival[]>(c.env.KV, 'rivals', () => RIVALS)
  if (list.length >= 20) return c.json({ error: '最多追蹤 20 個頻道' }, 400)
  try {
    const ch = await resolveChannel(b.input)
    if (list.some((r) => r.id === ch.id)) return c.json({ error: `「${ch.name}」已經喺名單` }, 400)
    const channels = [...list, { id: ch.id, name: ch.name, note: (b.note ?? '').slice(0, 60) }]
    await c.env.KV.put('rivals', JSON.stringify(channels))
    return c.json({ channels })
  } catch (e) {
    return c.json({ error: e instanceof Error ? e.message : String(e) }, 400)
  }
})
app.delete('/cms/api/rivals-list', async (c) => {
  const id = c.req.query('id')
  const list = await kvGet<Rival[]>(c.env.KV, 'rivals', () => RIVALS)
  const channels = list.filter((r) => r.id !== id || r.note === '自己')
  await c.env.KV.put('rivals', JSON.stringify(channels))
  return c.json({ channels })
})
app.get('/cms/api/board', async (c) => c.json(await kvGet<Board>(c.env.KV, 'board', seedBoard)))
app.put('/cms/api/board', async (c) => {
  const b = (await c.req.json().catch(() => null)) as Board | null
  if (!b || !Array.isArray(b.items) || !Array.isArray(b.refs) || !Array.isArray(b.hooks)) return c.json({ error: '格式唔啱' }, 400)
  const raw = JSON.stringify(b)
  if (raw.length > 500_000) return c.json({ error: '資料太大' }, 413)
  await c.env.KV.put('board', raw)
  return c.json(b)
})
app.post('/cms/api/reel-ideas', async (c) => {
  if (!c.env.GEMINI_API_KEY) return c.json({ error: '未設定 GEMINI_API_KEY' }, 500)
  const b = (await c.req.json().catch(() => null)) as { what?: string; place?: string } | null
  if (!b?.what) return c.json({ error: '講吓今日影咗咩先' }, 400)
  try {
    return c.json(await geminiJson(c.env.GEMINI_API_KEY, reelIdeasPrompt(b.what.slice(0, 1000), b.place?.slice(0, 100))))
  } catch (e) {
    return c.json({ error: String(e).slice(0, 300) }, 502)
  }
})
app.post('/cms/api/trend-idea', async (c) => {
  if (!c.env.GEMINI_API_KEY) return c.json({ error: '未設定 GEMINI_API_KEY' }, 500)
  const b = (await c.req.json().catch(() => null)) as { trend?: string; news?: string[] } | null
  if (!b?.trend) return c.json({ error: '冇話題' }, 400)
  try {
    return c.json(await geminiJson(c.env.GEMINI_API_KEY, trendIdeaPrompt(b.trend, (b.news ?? []).slice(0, 3))))
  } catch (e) {
    return c.json({ error: String(e).slice(0, 300) }, 502)
  }
})

// /cms/tools：阿陳工具箱（網頁小程式），阿陳同 SS 都用得
app.use('/cms/tools/*', async (c, next) => {
  if (!isMember(c)) return c.notFound()
  await next()
  c.header('X-Robots-Tag', 'noindex, nofollow')
})
const toolBody = (id: ToolId, c: { env: Env['Bindings'] }) => {
  switch (id) {
    case 'reels': return <ReelStudio />
    case 'posts': return <PostStudio />
    case 'carousel': return <CarouselStudio frames={frames} />
    case 'thumbs': return <ThumbStudio />
    case 'trends': return <TrendsStudio />
    case 'rivals': return <RivalsStudio />
    case 'quote':
      return (
        <QuoteStudio
          stats={{ youtubeSubscribers: site.stats.youtubeSubscribers, instagramFollowers: site.stats.instagramFollowers, topReelViews: site.reels[0].views, asOf: site.stats.asOf }}
          email={site.email}
        />
      )
    case 'budget': return <div class="wrap lab-wrap"><StudyBudget /></div>
  }
}
app.get('/cms/tools', (c) => {
  if (!isMember(c)) return c.notFound()
  const b = ctx(c)
  return c.html(<Layout meta={{ ...b, title: '阿陳工具箱', description: '', noindex: true }} bare><ToolsHome /></Layout>)
})
app.get('/cms/tools/:tool', (c) => {
  const t = TOOLS.find((x) => x.id === c.req.param('tool'))
  if (!t) return c.notFound()
  const b = ctx(c)
  return c.html(
    <Layout meta={{ ...b, title: `${t.name} · 阿陳工具箱`, description: '', noindex: true }} bare>
      <ToolsShell active={t.id}>{toolBody(t.id, c)}</ToolsShell>
    </Layout>,
  )
})

// 聯盟轉址。P2 會喺呢度記點擊（D1）。
app.get('/go/:code', (c) => {
  const l = links[c.req.param('code')]
  if (!l) return c.notFound()
  console.log(JSON.stringify({ evt: 'go', code: c.req.param('code'), ref: c.req.header('referer') ?? null }))
  return c.redirect(l.url, 302)
})

app.get('/sitemap.xml', (c) => {
  const { base } = ctx(c)
  const paths = ['/', '/guides', '/about', '/work-with-me', ...publishedGuides().map((g) => `/guides/${g.slug}`)]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths
    .map((p) => `  <url><loc>${base}${p}</loc></url>`)
    .join('\n')}\n</urlset>`
  return c.body(xml, 200, { 'content-type': 'application/xml; charset=utf-8' })
})

app.get('/robots.txt', (c) => {
  const { base, preview } = ctx(c)
  const body = preview
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /go/\n\nSitemap: ${base}/sitemap.xml\n`
  return c.text(body)
})

app.get('/rss.xml', (c) => {
  const { base } = ctx(c)
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  const items = publishedGuides()
    .map(
      (g) =>
        `<item><title>${esc(g.title)}</title><link>${base}/guides/${g.slug}</link><guid>${base}/guides/${g.slug}</guid><description>${esc(g.description)}</description></item>`,
    )
    .join('')
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${esc(site.name)}</title><link>${base}</link><description>${esc(site.tagline)}</description>${items}</channel></rss>`
  return c.body(xml, 200, { 'content-type': 'application/rss+xml; charset=utf-8' })
})

// llms.txt：成本低所以做，唔當賣點（SPEC §4）
app.get('/llms.txt', (c) => {
  const { base } = ctx(c)
  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.tagline}。網站將阿陳 YouTube 影片入面嘅花費、地點、時間整理成文字。`,
    '',
    '## 攻略',
    ...publishedGuides().map((g) => `- [${g.title}](${base}/guides/${g.slug}): ${g.description}`),
    '',
    '## 關於',
    `- [關於阿陳](${base}/about)`,
    `- [品牌合作](${base}/work-with-me)`,
  ]
  return c.text(lines.join('\n'))
})

app.notFound((c) => {
  const b = ctx(c)
  return c.html(<Layout meta={{ ...b, title: '搵唔到', description: '', noindex: true }}><NotFound /></Layout>, 404)
})

export default app
