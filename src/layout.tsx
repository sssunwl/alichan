import type { Child } from 'hono/jsx'
import { site } from './site.config'

export type Meta = {
  base: string
  path: string
  title: string
  description: string
  image?: string
  type?: 'website' | 'article'
  ld?: object[]
  noindex?: boolean
  preview: boolean
}

const json = (o: object) => JSON.stringify(o).replace(/</g, '\\u003c')

export const Layout = (props: { meta: Meta; children: Child }) => {
  const m = props.meta
  const url = `${m.base}${m.path}`
  const fullTitle = m.path === '/' ? `${site.name} | ${site.tagline}` : `${m.title} | ${site.name}`
  return (
    <html lang={site.lang}>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{fullTitle}</title>
        <meta name="description" content={m.description} />
        <link rel="canonical" href={url} />
        {(m.preview || m.noindex) && <meta name="robots" content="noindex, nofollow" />}
        <meta property="og:type" content={m.type ?? 'website'} />
        <meta property="og:title" content={m.title} />
        <meta property="og:description" content={m.description} />
        <meta property="og:url" content={url} />
        <meta property="og:site_name" content={site.name} />
        <meta property="og:locale" content={site.locale} />
        {m.image && <meta property="og:image" content={m.image} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="theme-color" content="#FBF7F1" />
        <link rel="alternate" type="application/rss+xml" title={site.name} href="/rss.xml" />
        <link rel="stylesheet" href="/style.css" />
        {(m.ld ?? []).map((o) => (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json(o) }} />
        ))}
      </head>
      <body>
        {m.preview && (
          <div class="demo-bar">
            Demo 預覽 · 內容未經阿陳審稿 · <a href="?review=1">睇審稿模式</a>
          </div>
        )}
        <header class="site-head">
          <a class="brand" href="/">
            {site.name}
          </a>
          <nav>
            <a href="/guides">攻略</a>
            <a href="/about">關於</a>
            <a href="/work-with-me" class="nav-cta">
              品牌合作
            </a>
          </nav>
        </header>
        <main>{props.children}</main>
        <footer class="site-foot">
          <p>
            <a href={site.socials.youtube} rel="me">YouTube</a> ·{' '}
            <a href={site.socials.instagram} rel="me">Instagram</a> ·{' '}
            <a href={site.socials.threads} rel="me">Threads</a>
          </p>
          <p class="muted">© {site.name}</p>
        </footer>
        <script dangerouslySetInnerHTML={{ __html: liteYt }} />
      </body>
    </html>
  )
}

// 影片外觀：點擊先載入 iframe，唔拖慢頁面
const liteYt = `document.addEventListener('click',function(e){var b=e.target.closest('[data-yt]');if(!b)return;e.preventDefault();var t=b.getAttribute('data-t')||0;b.outerHTML='<iframe class="yt-frame" src="https://www.youtube-nocookie.com/embed/'+b.getAttribute('data-yt')+'?autoplay=1&start='+t+'" title="YouTube" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>'})`
