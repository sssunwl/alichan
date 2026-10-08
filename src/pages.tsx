import { site, links } from './site.config'
import { guides, publishedGuides, type Guide } from './content/guides'
import { ytAt, ytThumb } from './seo'

const mmss = (t: number) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`

const TimeLink = (p: { id: string; t?: number }) =>
  p.t === undefined ? null : (
    <a class="ts" href={ytAt(p.id, p.t)} title="喺影片睇呢段">
      ▶ {mmss(p.t)}
    </a>
  )

const Video = (p: { id: string; title: string; t?: number }) => (
  <a class="yt" href={ytAt(p.id, p.t)} data-yt={p.id} data-t={p.t ?? 0} aria-label={`播放影片：${p.title}`}>
    <img src={ytThumb(p.id)} alt={p.title} width="480" height="360" loading="lazy" />
    <span class="yt-play" aria-hidden="true">▶</span>
  </a>
)

const GuideCard = (p: { g: Guide }) => (
  <a class="card" href={`/guides/${p.g.slug}`}>
    <img src={ytThumb(p.g.videoId)} alt="" width="480" height="360" loading="lazy" />
    <div class="card-body">
      <p class="eyebrow">{p.g.tags.join(' · ')}</p>
      <h3>{p.g.title}</h3>
      {p.g.status === 'pending-transcript' && <p class="pill">整理中</p>}
    </div>
  </a>
)

const NA = () => <span class="muted">待補</span>

// ---------- 首頁 ----------
export const Home = () => (
  <>
    <section class="hero">
      <p class="eyebrow">YouTube {site.stats.youtubeSubscribers} 訂閱 · {site.stats.youtubeVideos} 部影片</p>
      <h1>{site.name}</h1>
      <p class="lede">{site.tagline}。呢度係影片嘅文字版：花費、地址、時間一眼睇晒，唔使逐格搵。</p>
      <p class="hero-actions">
        <a class="btn" href="/guides">睇攻略</a>
        <a class="text-link" href="/work-with-me">品牌合作 →</a>
      </p>
    </section>
    <section>
      <h2>精選攻略</h2>
      <div class="grid">
        {guides.map((g) => (
          <GuideCard g={g} />
        ))}
      </div>
    </section>
    <section>
      <h2>主題</h2>
      <p class="chips">
        {site.topics.map((t) => (
          <a class="chip" href={`/topics/${encodeURIComponent(t)}`}>
            {t}
          </a>
        ))}
      </p>
    </section>
  </>
)

// ---------- 攻略列表 / 主題 ----------
export const GuideList = (p: { title: string; items: Guide[]; intro?: string }) => (
  <section>
    <h1>{p.title}</h1>
    {p.intro && <p class="lede">{p.intro}</p>}
    {p.items.length ? (
      <div class="grid">
        {p.items.map((g) => (
          <GuideCard g={g} />
        ))}
      </div>
    ) : (
      <p class="muted">呢個主題嘅文章整理緊。</p>
    )}
  </section>
)

// ---------- 文章 ----------
export const GuidePage = (p: { g: Guide; review: boolean }) => {
  const g = p.g
  return (
    <article class="guide">
      <nav class="crumbs">
        <a href="/">首頁</a> / <a href="/guides">攻略</a>
      </nav>
      <p class="eyebrow">
        {g.tags.map((t, i) => (
          <>
            {i > 0 && ' · '}
            <a href={`/topics/${encodeURIComponent(t)}`}>{t}</a>
          </>
        ))}
      </p>
      <h1>{g.title}</h1>
      <p class="byline">
        <a href="/about">{site.name}</a> · 資料時間：{g.dataAsOf}
      </p>

      {p.review && g.needsCheck.length > 0 && (
        <aside class="review">
          <strong>審稿模式：待阿陳確認</strong>
          <ul>
            {g.needsCheck.map((n) => (
              <li>{n}</li>
            ))}
          </ul>
        </aside>
      )}

      {g.status === 'pending-transcript' && (
        <aside class="note">呢篇整理緊，完整內容稍後上載。下面係影片簡介提到嘅重點。</aside>
      )}

      <section class="tldr" aria-label="重點">
        <h2>重點</h2>
        <ul>
          {g.tldr.map((t) => (
            <li>{t}</li>
          ))}
        </ul>
      </section>

      <Video id={g.videoId} title={g.videoTitle} />

      {g.facts && (
        <section>
          <h2>{g.factsCaption}</h2>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">項目</th>
                  <th scope="col">金額</th>
                  <th scope="col">備註</th>
                </tr>
              </thead>
              <tbody>
                {g.facts.map((f) => (
                  <tr>
                    <th scope="row">{f.label}</th>
                    <td>{f.value}</td>
                    <td>
                      {f.note} <TimeLink id={g.videoId} t={f.t} />
                    </td>
                  </tr>
                ))}
              </tbody>
              {g.factsTotal && (
                <tfoot>
                  <tr>
                    <th scope="row">{g.factsTotal.label}</th>
                    <td colspan={2}>
                      <strong>{g.factsTotal.value}</strong> <TimeLink id={g.videoId} t={g.factsTotal.t} />
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </section>
      )}

      {g.places && (
        <section>
          <h2>地點一覽</h2>
          <div class="table-wrap">
            <table class="stack">
              <thead>
                <tr>
                  <th scope="col">地點</th>
                  <th scope="col">食/買咩</th>
                  <th scope="col">地址</th>
                  <th scope="col">營業時間</th>
                </tr>
              </thead>
              <tbody>
                {g.places.map((pl) => (
                  <tr>
                    <th scope="row">
                      {pl.name} <TimeLink id={g.videoId} t={pl.t} />
                    </th>
                    <td data-label="食/買咩">{pl.what}</td>
                    <td data-label="地址">{pl.address ?? <NA />}</td>
                    <td data-label="營業時間">
                      {pl.hours ?? '—'}
                      {pl.closed && <span class="muted">（休：{pl.closed}）</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p class="muted small">營業時間以影片發佈時為準，出發前請再確認。</p>
        </section>
      )}

      {g.sections.map((s) => (
        <section>
          <h2>
            {s.heading} <TimeLink id={g.videoId} t={s.t} />
          </h2>
          {s.body.map((b) => (
            <p>{b}</p>
          ))}
        </section>
      ))}

      {g.affiliates.length > 0 && (
        <aside class="deals">
          <h2>阿陳嘅優惠碼</h2>
          <ul>
            {g.affiliates.map((code) => {
              const l = links[code]
              return (
                <li>
                  <a href={`/go/${code}`} rel="sponsored nofollow">
                    {l.label}
                  </a>
                  {l.code && (
                    <>
                      {' '}
                      · 優惠碼 <code>{l.code}</code>
                    </>
                  )}
                  {l.note && <span class="muted">({l.note})</span>}
                </li>
              )
            })}
          </ul>
          <p class="muted small">經呢啲連結預訂，阿陳可能會收到佣金，你唔使多俾錢。</p>
        </aside>
      )}

      {g.faq.length > 0 && (
        <section class="faq">
          <h2>常見問題</h2>
          {g.faq.map((f) => (
            <details>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>
      )}

      <section>
        <h2>相關攻略</h2>
        <div class="grid">
          {publishedGuides()
            .filter((x) => x.slug !== g.slug)
            .map((x) => (
              <GuideCard g={x} />
            ))}
        </div>
      </section>
    </article>
  )
}

// ---------- /links：取代 Linktree ----------
export const Links = () => (
  <section class="links">
    <div class="avatar" aria-hidden="true">{site.shortName}</div>
    <h1>{site.name}</h1>
    <p class="lede">{site.tagline}</p>
    <h2 class="sr">最新攻略</h2>
    {publishedGuides().map((g) => (
      <a class="link-btn" href={`/guides/${g.slug}`}>
        {g.title}
      </a>
    ))}
    <h2 class="sr">優惠</h2>
    {Object.entries(links).map(([code, l]) => (
      <a class="link-btn alt" href={`/go/${code}`} rel={l.code ? 'sponsored nofollow' : undefined}>
        {l.label}
        {l.code && <small> · 優惠碼 {l.code}</small>}
      </a>
    ))}
    <a class="link-btn alt" href={site.socials.youtube} rel="me">YouTube</a>
    <a class="link-btn alt" href={site.socials.instagram} rel="me">Instagram</a>
    <a class="link-btn alt" href={site.socials.threads} rel="me">Threads</a>
    <a class="link-btn" href="/work-with-me">品牌合作</a>
  </section>
)

// ---------- 品牌合作 ----------
export const WorkWithMe = () => (
  <section class="work">
    <h1>同阿陳合作</h1>
    <p class="lede">
      日本深度旅遊、遊學、港深美食。觀眾係想認真計劃行程嘅人：睇花費、睇地址、睇值唔值得。
    </p>
    <h2>數據</h2>
    <div class="table-wrap">
      <table>
        <tbody>
          <tr><th scope="row">YouTube 訂閱</th><td>{site.stats.youtubeSubscribers}</td></tr>
          <tr><th scope="row">YouTube 影片</th><td>{site.stats.youtubeVideos} 部</td></tr>
          <tr><th scope="row">Instagram</th><td>{site.stats.instagramFollowers ?? <NA />}</td></tr>
          <tr><th scope="row">Threads</th><td>{site.stats.threadsFollowers ?? <NA />}</td></tr>
          <tr><th scope="row">觀眾地區</th><td>{site.stats.audienceRegions ?? <NA />}</td></tr>
        </tbody>
      </table>
    </div>
    <p class="muted small">資料時間：{site.stats.asOf}</p>
    <h2>熱門影片</h2>
    <ul class="plain">
      {site.topVideos.map((v) => (
        <li>
          {v.id ? <a href={ytAt(v.id)}>{v.title}</a> : v.title} · <span class="muted">{v.views} 次觀看</span>
        </li>
      ))}
    </ul>
    <h2>主題</h2>
    <p class="chips">
      {site.topics.map((t) => (
        <span class="chip">{t}</span>
      ))}
    </p>
    <h2>合作查詢</h2>
    <form class="inquiry" data-mail={site.email}>
      <label>品牌 / 公司<input name="brand" required /></label>
      <label>聯絡人電郵<input name="contact" type="email" required /></label>
      <label>
        合作類型
        <select name="type">
          <option>影片合作</option>
          <option>IG / Threads 貼文</option>
          <option>活動 / 體驗邀請</option>
          <option>其他</option>
        </select>
      </label>
      <label>內容<textarea name="message" rows={5} required></textarea></label>
      <button class="btn" type="submit">寄出查詢</button>
      <p class="muted small">Demo 版會開你嘅電郵程式寄出；正式版會直接通知阿陳。</p>
    </form>
    <script
      dangerouslySetInnerHTML={{
        __html: `document.querySelector('.inquiry').addEventListener('submit',function(e){e.preventDefault();var f=new FormData(e.target);var s='合作查詢：'+f.get('brand')+'('+f.get('type')+')';var b='品牌：'+f.get('brand')+'\\n聯絡：'+f.get('contact')+'\\n類型：'+f.get('type')+'\\n\\n'+f.get('message');location.href='mailto:'+e.target.dataset.mail+'?subject='+encodeURIComponent(s)+'&body='+encodeURIComponent(b)})`,
      }}
    />
  </section>
)

// ---------- 關於 ----------
export const About = () => (
  <section class="about">
    <h1>關於阿陳</h1>
    <p class="lede">
      阿陳（Ali）係香港 YouTuber，頻道「{site.name}」分享日本深度旅遊資訊、秘景、特色活動同美食，亦拍遊學、港深食店同泰國旅遊。
    </p>
    <p>
      佢鍾意將真實花費同踩過嘅坑講清楚：遊學一個月使咗幾多、邊區住得平、邊間店要預約。呢個網站將影片入面嘅資訊整理成文字，方便你計劃行程。
    </p>
    <h2>喺邊度搵到阿陳</h2>
    <ul class="plain">
      <li><a href={site.socials.youtube} rel="me">YouTube @Alichan90s</a></li>
      <li><a href={site.socials.instagram} rel="me">Instagram @__ali.c</a></li>
      <li><a href={site.socials.threads} rel="me">Threads @__ali.c</a></li>
    </ul>
    <p class="muted small">（自我介紹係 Demo 草稿，等阿陳改寫。）</p>
  </section>
)

export const NotFound = () => (
  <section>
    <h1>搵唔到呢頁</h1>
    <p>
      <a href="/">返首頁</a>
    </p>
  </section>
)
