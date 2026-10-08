import { Hono } from 'hono'
import { site, links } from './site.config'
import { guides, findGuide, publishedGuides } from './content/guides'
import { Layout, type Meta } from './layout'
import { Home, GuideList, GuidePage, Links, WorkWithMe, About, NotFound } from './pages'
import { guideLd, personLd, websiteLd, ytThumb } from './seo'
import { Cms, cmsTitle } from './cms/page'
import { StudyBudget } from './cms/tools'

type Env = { Bindings: { PREVIEW: string; SITE_URL: string } }
const app = new Hono<Env>()

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
  return c.html(<Layout meta={meta}><Cms /></Layout>)
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
