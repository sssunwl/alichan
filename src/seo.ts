import { site } from './site.config'
import type { Guide } from './content/guides'

// JSON-LD 建構。Person 嘅 sameAs 係 GEO 重點:將分散嘅帳號歸做同一個實體。

export const personLd = (base: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${base}/about#person`,
  name: site.name,
  alternateName: [site.shortName, 'AliLife', 'Ali'],
  description: site.tagline,
  url: `${base}/about`,
  sameAs: Object.values(site.socials),
  knowsAbout: site.topics,
})

export const websiteLd = (base: string) => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: site.name,
  url: base,
  inLanguage: site.lang,
  publisher: { '@id': `${base}/about#person` },
})

export const ytThumb = (id: string, q: 'hqdefault' | 'maxresdefault' = 'hqdefault') =>
  `https://i.ytimg.com/vi/${id}/${q}.jpg`

export const ytAt = (id: string, t?: number) =>
  `https://www.youtube.com/watch?v=${id}${t ? `&t=${t}s` : ''}`

export const guideLd = (base: string, g: Guide) => {
  const url = `${base}/guides/${g.slug}`
  const graph: object[] = [
    {
      '@type': 'Article',
      '@id': `${url}#article`,
      headline: g.title,
      description: g.description,
      image: ytThumb(g.videoId, 'maxresdefault'),
      inLanguage: site.lang,
      author: { '@id': `${base}/about#person` },
      publisher: { '@id': `${base}/about#person` },
      mainEntityOfPage: url,
      about: g.tags,
      video: { '@id': `${url}#video` },
    },
    {
      '@type': 'VideoObject',
      '@id': `${url}#video`,
      name: g.videoTitle,
      description: g.description,
      thumbnailUrl: ytThumb(g.videoId, 'maxresdefault'),
      uploadDate: g.uploadDate,
      duration: g.duration,
      contentUrl: ytAt(g.videoId),
      embedUrl: `https://www.youtube-nocookie.com/embed/${g.videoId}`,
      ...(g.sections.length
        ? {
            hasPart: g.sections
              .filter((s) => s.t !== undefined)
              .map((s) => ({
                '@type': 'Clip',
                name: s.heading,
                startOffset: s.t,
                url: ytAt(g.videoId, s.t),
              })),
          }
        : {}),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: site.name, item: base },
        { '@type': 'ListItem', position: 2, name: '攻略', item: `${base}/guides` },
        { '@type': 'ListItem', position: 3, name: g.title, item: url },
      ],
    },
  ]
  // FAQ:Google 唔一定顯示 rich result,但 AI 好易擷取問答
  if (g.faq.length)
    graph.push({
      '@type': 'FAQPage',
      mainEntity: g.faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    })
  return { '@context': 'https://schema.org', '@graph': graph }
}
