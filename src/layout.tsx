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

const fonts =
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&family=Noto+Sans+TC:wght@400;500;700;900&family=Outfit:wght@500;700;800&display=swap'

export const Layout = (props: { meta: Meta; children: Child; bare?: boolean }) => {
  const m = props.meta
  const url = `${m.base}${m.path}`
  const fullTitle = m.path === '/' ? `${site.name} | ${site.tagline}` : `${m.title} | ${site.name}`
  const nav = [
    ['/guides', '攻略'],
    ['/about', '關於阿陳'],
  ]
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
        <meta name="theme-color" content="#F6F1E7" />
        <link rel="icon" href={site.avatar} />
        <link rel="alternate" type="application/rss+xml" title={site.name} href="/rss.xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
        <link rel="stylesheet" href={fonts} />
        <link rel="stylesheet" href="/style.css" />
        {(m.ld ?? []).map((o) => (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json(o) }} />
        ))}
      </head>
      <body>
        {m.preview && (
          <div class="demo-bar">
            Demo 預覽，內容未經阿陳審稿 <a href="?review=1">審稿模式</a>
          </div>
        )}
        {!props.bare && (
          <header class="site-head">
            <a class="brand" href="/">
              <img src={site.avatar} alt="" width="36" height="36" />
              <span>
                阿陳<b>AliLife</b>
              </span>
            </a>
            <nav aria-label="主選單">
              {nav.map(([href, label]) => (
                <a href={href} aria-current={m.path.startsWith(href) ? 'page' : undefined}>
                  {label}
                </a>
              ))}
              <a href="/work-with-me" class="nav-cta">
                品牌合作
              </a>
              <a href="/cms" class="nav-cms" aria-current={m.path === '/cms' ? 'page' : undefined} title="阿陳同 SS 嘅工作間">
                CMS
              </a>
            </nav>
          </header>
        )}
        <main>{props.children}</main>
        {!props.bare && (
          <footer class="site-foot">
            <div class="foot-brand">
              <img src={site.avatar} alt="" width="48" height="48" />
              <div>
                <strong>{site.name}</strong>
                <p>{site.tagline}</p>
              </div>
            </div>
            <nav class="foot-links" aria-label="社群">
              <a href={site.socials.youtube} rel="me">YouTube</a>
              <a href={site.socials.instagram} rel="me">Instagram</a>
              <a href={site.socials.threads} rel="me">Threads</a>
              <a href="/links">全部連結</a>
              <a href="/work-with-me">品牌合作</a>
            </nav>
          </footer>
        )}
        <script dangerouslySetInnerHTML={{ __html: clientJs }} />
      </body>
    </html>
  )
}

// 1. 影片外觀：點擊先載入 iframe  2. 優惠碼一鍵複製
const clientJs = `document.addEventListener('click',function(e){var b=e.target.closest('[data-yt]');if(b){e.preventDefault();b.outerHTML='<iframe class="yt-frame" src="https://www.youtube-nocookie.com/embed/'+b.dataset.yt+'?autoplay=1&start='+(b.dataset.t||0)+'" title="YouTube" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>';return}var c=e.target.closest('[data-copy]');if(c){e.preventDefault();var t=c.dataset.copy;var done=function(){var o=c.querySelector('.copy-label');if(!o)return;var p=o.textContent;o.textContent='已複製';c.classList.add('copied');setTimeout(function(){o.textContent=p;c.classList.remove('copied')},1600)};if(navigator.clipboard){navigator.clipboard.writeText(t).then(done,done)}else{done()}}})`
