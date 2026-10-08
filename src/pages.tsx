import { site, links } from './site.config'
import { guides, publishedGuides, findGuide, type Guide } from './content/guides'
import { ytAt, ytThumb } from './seo'

const mmss = (t: number) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`
const isoMin = (d: string) => {
  const m = d.match(/PT(\d+)M/)
  return m ? `${m[1]} 分鐘` : ''
}
const pad2 = (n: number) => String(n).padStart(2, '0')

// ---------- 共用小元件 ----------

const TimeLink = (p: { id: string; t?: number }) =>
  p.t === undefined ? null : (
    <a class="ts" href={ytAt(p.id, p.t)} title="喺影片睇呢段">
      <svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 1l7 4-7 4z" /></svg>
      {mmss(p.t)}
    </a>
  )

const Video = (p: { id: string; title: string; t?: number }) => (
  <a class="yt" href={ytAt(p.id, p.t)} data-yt={p.id} data-t={p.t ?? 0} aria-label={`播放影片：${p.title}`}>
    <img src={ytThumb(p.id, 'maxresdefault')} alt={p.title} width="1280" height="720" loading="lazy" />
    <span class="yt-play" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
    </span>
    <span class="yt-label">睇返條片</span>
  </a>
)

const Copy = (p: { code: string; label?: string }) => (
  <button class="copy" type="button" data-copy={p.code}>
    <code>{p.code}</code>
    <span class="copy-label">{p.label ?? '複製'}</span>
  </button>
)

const NA = () => <span class="muted">待補</span>

const Thumb = (p: { g: Guide; size?: 'hq' | 'max' }) => (
  <img
    src={ytThumb(p.g.videoId, p.size === 'max' ? 'maxresdefault' : 'hqdefault')}
    alt=""
    width={p.size === 'max' ? 1280 : 480}
    height={p.size === 'max' ? 720 : 360}
    loading="lazy"
  />
)

const Tags = (p: { tags: string[] }) => (
  <span class="tags">
    {p.tags.map((t) => (
      <span>{t}</span>
    ))}
  </span>
)

// 小帳單：首頁同文章共用
const Receipt = (p: { g: Guide; limit?: number }) => {
  const rows = p.limit ? p.g.facts!.slice(0, p.limit) : p.g.facts!
  return (
    <div class="receipt">
      <div class="receipt-head">
        <span>阿陳的帳單</span>
        <span>{p.g.factsCaption}</span>
      </div>
      <dl>
        {rows.map((f) => (
          <div class="r-row">
            <dt>{f.label}</dt>
            <dd>
              <span class="r-val">{f.value}</span>
              {!p.limit && f.note && (
                <span class="r-note">
                  {f.note} <TimeLink id={p.g.videoId} t={f.t} />
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>
      {p.g.factsTotal && (
        <div class="r-total">
          <span>{p.g.factsTotal.label}</span>
          <strong>{p.g.factsTotal.value}</strong>
        </div>
      )}
      {!p.limit && p.g.factsTotal?.note && <p class="r-foot">{p.g.factsTotal.note}</p>}
    </div>
  )
}

// ---------- 首頁 ----------
export const Home = () => {
  const [lead, ...rest] = guides
  const tokyo = findGuide('tokyo-language-school-one-month-cost')!
  const stack = guides.slice(0, 3)
  return (
    <>
      <section class="hero wrap">
        <div class="hero-copy">
          <p class="kicker">香港 YouTuber · 日本深度遊</p>
          <h1>
            幫你搵<mark>日本秘景</mark>，
            <br />
            仲講埋<mark>真實花費</mark>。
          </h1>
          <p class="hero-lead">{site.heroLead}</p>
          <div class="hero-actions">
            <a class="btn" href="/guides">
              睇攻略
            </a>
            <a class="btn-ghost" href={site.socials.youtube}>
              YouTube 頻道
            </a>
          </div>
          <dl class="stats">
            <div>
              <dt>訂閱</dt>
              <dd>{site.stats.youtubeSubscribers}</dd>
            </div>
            <div>
              <dt>影片</dt>
              <dd>{site.stats.youtubeVideos}</dd>
            </div>
            <div>
              <dt>最高觀看</dt>
              <dd>{site.topVideos[0].views}</dd>
            </div>
          </dl>
        </div>
        <div class="hero-stack" aria-hidden="true">
          {stack.map((g, i) => (
            <a href={`/guides/${g.slug}`} class={`polaroid p${i}`} tabindex={-1}>
              <Thumb g={g} />
              <span>{g.tags[0]}</span>
            </a>
          ))}
          <img class="hero-avatar" src={site.avatar} alt="" width="96" height="96" />
        </div>
      </section>

      <div class="marquee" aria-hidden="true">
        <div class="marquee-track">
          {[0, 1].map(() => (
            <span>
              {site.topics.map((t) => (
                <>
                  <b>{t}</b>
                  <i>／</i>
                </>
              ))}
            </span>
          ))}
        </div>
      </div>

      <section class="wrap block">
        <header class="block-head">
          <h2>最新攻略</h2>
          <a href="/guides">全部攻略</a>
        </header>
        <div class="feature">
          <a class="feature-main" href={`/guides/${lead.slug}`}>
            <div class="feature-img">
              <Thumb g={lead} size="max" />
            </div>
            <div class="feature-text">
              <Tags tags={lead.tags} />
              <h3>{lead.title}</h3>
              <p>{lead.description}</p>
            </div>
          </a>
          <ol class="feature-list">
            {rest.map((g, i) => (
              <li>
                <a href={`/guides/${g.slug}`}>
                  <span class="num">{pad2(i + 2)}</span>
                  <Thumb g={g} />
                  <span class="fl-text">
                    <Tags tags={g.tags} />
                    <strong>{g.title}</strong>
                    {g.status === 'pending-transcript' && <em class="pill">整理中</em>}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section class="wrap block money">
        <div class="money-copy">
          <p class="kicker">真實花費系列</p>
          <h2>每一筆數，都係片入面講過嘅數。</h2>
          <p>
            遊學一個月使咗幾多、邊區住得平、邊間店要預約。阿陳將自己真金白銀俾嘅錢逐項拆開，每一項都可以撳返去片中嗰一秒核對。
          </p>
          <a class="btn" href={`/guides/${tokyo.slug}`}>
            睇東京遊學全條數
          </a>
        </div>
        <a class="money-receipt" href={`/guides/${tokyo.slug}`} aria-label="東京遊學帳單">
          <Receipt g={tokyo} limit={4} />
        </a>
      </section>

      <section class="block popular">
        <header class="block-head wrap">
          <h2>大家最多人睇</h2>
          <a href={site.socials.youtube}>去 YouTube 睇更多</a>
        </header>
        <div class="rail">
          {site.topVideos.map((v, i) => (
            <a class="rail-item" href={ytAt(v.id)}>
              <div class="rail-img">
                <img src={ytThumb(v.id)} alt="" width="480" height="360" loading="lazy" />
                <span class="rank">{pad2(i + 1)}</span>
              </div>
              <strong>{v.title}</strong>
              <span class="views">{v.views} 次觀看</span>
            </a>
          ))}
        </div>
      </section>

      <section class="wrap block">
        <header class="block-head">
          <h2>想去邊？</h2>
        </header>
        <div class="stamps">
          {site.topics.map((t, i) => (
            <a class={`stamp s${i % 4}`} href={`/topics/${encodeURIComponent(t)}`}>
              {t}
            </a>
          ))}
        </div>
      </section>

      <WorkBand />
    </>
  )
}

const WorkBand = () => (
  <section class="band">
    <div class="wrap band-inner">
      <div>
        <p class="kicker">品牌合作</p>
        <h2>觀眾係認真計劃緊行程嘅人。</h2>
        <p>佢哋睇花費、睇地址、睇值唔值得。如果你嘅產品幫到佢哋，我哋傾下。</p>
      </div>
      <a class="btn btn-light" href="/work-with-me">
        合作查詢
      </a>
    </div>
  </section>
)

// ---------- 攻略列表 / 主題 ----------
export const GuideList = (p: { title: string; items: Guide[]; kicker?: string }) => (
  <section class="wrap block list-page">
    <p class="kicker">{p.kicker ?? '攻略'}</p>
    <h1>{p.title}</h1>
    {p.items.length ? (
      <div class="list-grid">
        {p.items.map((g) => (
          <a class="list-card" href={`/guides/${g.slug}`}>
            <div class="list-img">
              <Thumb g={g} size="max" />
              {g.status === 'pending-transcript' && <em class="pill">整理中</em>}
            </div>
            <Tags tags={g.tags} />
            <h2>{g.title}</h2>
            <p>{g.description}</p>
          </a>
        ))}
      </div>
    ) : (
      <div class="empty">
        <p>呢個主題嘅文章整理緊。</p>
        <a href="/guides">睇其他攻略</a>
      </div>
    )}
  </section>
)

// ---------- 文章 ----------
export const GuidePage = (p: { g: Guide; review: boolean }) => {
  const g = p.g
  let n = 0
  return (
    <article class="guide">
      <header class="g-head wrap">
        <nav class="crumbs" aria-label="麵包屑">
          <a href="/">首頁</a>
          <span>/</span>
          <a href="/guides">攻略</a>
        </nav>
        <p class="g-tags">
          {g.tags.map((t) => (
            <a href={`/topics/${encodeURIComponent(t)}`}>{t}</a>
          ))}
        </p>
        <h1>{g.title}</h1>
        <div class="byline">
          <img src={site.avatar} alt="" width="40" height="40" />
          <div>
            <a href="/about">{site.name}</a>
            <span>
              資料時間：{g.dataAsOf} · 影片 {isoMin(g.duration)}
            </span>
          </div>
        </div>
      </header>

      <div class="g-body wrap">
        {p.review && g.needsCheck.length > 0 && (
          <aside class="review">
            <strong>審稿模式：待阿陳確認</strong>
            <ul>
              {g.needsCheck.map((x) => (
                <li>{x}</li>
              ))}
            </ul>
          </aside>
        )}

        {g.status === 'pending-transcript' && (
          <aside class="note">呢篇整理緊，完整內容稍後上載。下面係影片簡介提到嘅重點。</aside>
        )}

        <section class="tldr" aria-label="重點">
          <p class="tldr-tag">三秒睇晒</p>
          <ul>
            {g.tldr.map((t) => (
              <li>{t}</li>
            ))}
          </ul>
        </section>

        <Video id={g.videoId} title={g.videoTitle} />

        {g.facts && (
          <section>
            <h2 class="sec">
              <span>{pad2(++n)}</span>
              {g.factsCaption}
            </h2>
            <Receipt g={g} />
          </section>
        )}

        {g.places && (
          <section>
            <h2 class="sec">
              <span>{pad2(++n)}</span>
              路線同地點
            </h2>
            <ol class="route">
              {g.places.map((pl, i) => (
                <li>
                  <span class="stop">{i + 1}</span>
                  <div class="stop-body">
                    <h3>
                      {pl.name} <TimeLink id={g.videoId} t={pl.t} />
                    </h3>
                    <p class="stop-what">{pl.what}</p>
                    <dl>
                      <div>
                        <dt>地址</dt>
                        <dd>{pl.address ?? <NA />}</dd>
                      </div>
                      {pl.hours && (
                        <div>
                          <dt>營業</dt>
                          <dd>
                            {pl.hours}
                            {pl.closed && <span class="muted">（休：{pl.closed}）</span>}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </li>
              ))}
            </ol>
            <p class="fine">營業時間以影片發佈時為準，出發前請再確認。</p>
          </section>
        )}

        {g.sections.map((s, index) => (
          <>
          <section>
            <h2 class="sec">
              <span>{pad2(++n)}</span>
              {s.heading}
              <TimeLink id={g.videoId} t={s.t} />
            </h2>
            {s.body.map((b) => (
              <p>{b}</p>
            ))}
          </section>
          {g.inlineAffiliates?.filter((affiliate) => affiliate.afterSection === index).map((affiliate) => {
            const l = links[affiliate.code]
            if (!l) return null
            return (
              <aside class="inline-coupon" aria-label="阿陳優惠碼">
                <div class="inline-coupon-text">
                  <small class="inline-coupon-kicker">阿陳優惠碼</small>
                  <span>{affiliate.pitch} <a href={`/go/${affiliate.code}`} rel="sponsored nofollow">去 {l.label} 睇吓</a></span>
                </div>
                {l.code && <Copy code={l.code} />}
              </aside>
            )
          })}
          </>
        ))}

        {g.affiliates.length > 0 && (
          <section class="coupons" aria-label="優惠碼">
            <h2 class="sec plain">阿陳嘅優惠碼</h2>
            <div class="coupon-list">
              {g.affiliates.map((code) => {
                const l = links[code]
                return (
                  <div class="coupon">
                    <div>
                      <a href={`/go/${code}`} rel="sponsored nofollow">
                        {l.label}
                      </a>
                      {l.note && <p>{l.note}</p>}
                    </div>
                    {l.code && <Copy code={l.code} />}
                  </div>
                )
              })}
            </div>
            <p class="fine">經呢啲連結預訂，阿陳可能會收到佣金，你唔使多俾錢。</p>
          </section>
        )}

        {g.faq.length > 0 && (
          <section class="faq">
            <h2 class="sec plain">常見問題</h2>
            {g.faq.map((f) => (
              <details>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </section>
        )}

        <aside class="author">
          <img src={site.avatar} alt="" width="72" height="72" />
          <div>
            <strong>關於阿陳</strong>
            <p>{site.tagline}。每集都會講埋真實花費同踩過嘅坑。</p>
            <a href={site.socials.youtube} rel="me">
              訂閱 YouTube
            </a>
          </div>
        </aside>
      </div>

      <section class="wrap block">
        <header class="block-head">
          <h2>再睇多篇</h2>
        </header>
        <div class="more">
          {guides
            .filter((x) => x.slug !== g.slug)
            .map((x) => (
              <a href={`/guides/${x.slug}`}>
                <Thumb g={x} />
                <span>
                  <Tags tags={x.tags} />
                  <strong>{x.title}</strong>
                </span>
              </a>
            ))}
        </div>
      </section>
    </article>
  )
}

// ---------- /links：取代 Linktree ----------
export const Links = () => (
  <section class="links">
    <img class="links-avatar" src={site.avatar} alt={site.name} width="104" height="104" />
    <h1>{site.name}</h1>
    <p class="links-sub">{site.tagline}</p>
    <div class="links-social">
      <a href={site.socials.youtube} rel="me">YouTube</a>
      <a href={site.socials.instagram} rel="me">Instagram</a>
      <a href={site.socials.threads} rel="me">Threads</a>
    </div>

    <h2 class="links-h">最新攻略</h2>
    {publishedGuides().map((g) => (
      <a class="link-card" href={`/guides/${g.slug}`}>
        <Thumb g={g} />
        <span>{g.title}</span>
      </a>
    ))}

    <h2 class="links-h">優惠碼</h2>
    {Object.entries(links)
      .filter(([, l]) => l.code)
      .map(([code, l]) => (
        <div class="link-coupon">
          <a href={`/go/${code}`} rel="sponsored nofollow">
            {l.label}
            {l.note && <small>{l.note}</small>}
          </a>
          <Copy code={l.code!} />
        </div>
      ))}

    <h2 class="links-h">更多</h2>
    <a class="link-btn" href={links.chanpi.url}>
      {links.chanpi.label}
    </a>
    <a class="link-btn dark" href="/work-with-me">
      品牌合作查詢
    </a>
    <a class="links-home" href="/">
      alichan.sssuni.com
    </a>
  </section>
)

// ---------- 品牌合作 ----------
export const WorkWithMe = () => (
  <>
    <section class="work-hero">
      <div class="wrap work-grid">
        <div>
          <p class="kicker">品牌合作</p>
          <h1>同阿陳合作</h1>
          <p>日本深度旅遊、遊學、港深美食。觀眾係想認真計劃行程嘅人：睇花費、睇地址、睇值唔值得。</p>
        </div>
        <dl class="big-stats">
          <div>
            <dt>YouTube 訂閱</dt>
            <dd>{site.stats.youtubeSubscribers}</dd>
          </div>
          <div>
            <dt>影片</dt>
            <dd>{site.stats.youtubeVideos}</dd>
          </div>
          <div>
            <dt>Instagram</dt>
            <dd>{site.stats.instagramFollowers ?? <NA />}</dd>
          </div>
          <div>
            <dt>觀眾地區</dt>
            <dd>{site.stats.audienceRegions ?? <NA />}</dd>
          </div>
        </dl>
      </div>
      <p class="wrap fine light">資料時間：{site.stats.asOf}</p>
    </section>

    <section class="wrap block">
      <header class="block-head">
        <h2>代表作</h2>
      </header>
      <div class="work-videos">
        {site.topVideos.map((v) => (
          <a href={ytAt(v.id)}>
            <img src={ytThumb(v.id)} alt="" width="480" height="360" loading="lazy" />
            <strong>{v.title}</strong>
            <span>{v.views} 次觀看</span>
          </a>
        ))}
      </div>
    </section>

    <section class="wrap block work-form">
      <div>
        <h2>合作查詢</h2>
        <p>講低你嘅品牌同想點合作，阿陳會親自覆你。</p>
        <div class="stamps small">
          {site.topics.map((t, i) => (
            <span class={`stamp s${i % 4}`}>{t}</span>
          ))}
        </div>
      </div>
      <form class="inquiry" data-mail={site.email}>
        <label>
          品牌 / 公司
          <input name="brand" required />
        </label>
        <label>
          聯絡人電郵
          <input name="contact" type="email" required />
        </label>
        <label>
          合作類型
          <select name="type">
            <option>影片合作</option>
            <option>IG / Threads 貼文</option>
            <option>活動 / 體驗邀請</option>
            <option>其他</option>
          </select>
        </label>
        <label>
          內容
          <textarea name="message" rows={5} required></textarea>
        </label>
        <button class="btn" type="submit">
          寄出查詢
        </button>
        <p class="fine">Demo 版會開你嘅電郵程式寄出；正式版會直接通知阿陳。</p>
      </form>
    </section>
    <script
      dangerouslySetInnerHTML={{
        __html: `document.querySelector('.inquiry').addEventListener('submit',function(e){e.preventDefault();var f=new FormData(e.target);var s='合作查詢：'+f.get('brand')+'（'+f.get('type')+'）';var b='品牌：'+f.get('brand')+'\\n聯絡：'+f.get('contact')+'\\n類型：'+f.get('type')+'\\n\\n'+f.get('message');location.href='mailto:'+e.target.dataset.mail+'?subject='+encodeURIComponent(s)+'&body='+encodeURIComponent(b)})`,
      }}
    />
  </>
)

// ---------- 關於 ----------
export const About = () => (
  <>
    <section class="wrap block about">
      <img class="about-avatar" src={site.avatar} alt={site.name} width="200" height="200" />
      <div>
        <p class="kicker">關於</p>
        <h1>我係阿陳</h1>
        <p class="hero-lead">
          香港 YouTuber，頻道「{site.name}」分享日本深度旅遊資訊、秘景、特色活動同美食，亦拍遊學、港深食店同泰國旅遊。
        </p>
        <p>
          我鍾意將真實花費同踩過嘅坑講清楚：遊學一個月使咗幾多、邊區住得平、邊間店要預約。呢個網站將我片入面嘅資訊整理成文字，方便你計劃行程。
        </p>
        <div class="links-social left">
          <a href={site.socials.youtube} rel="me">YouTube @Alichan90s</a>
          <a href={site.socials.instagram} rel="me">Instagram @__ali.c</a>
          <a href={site.socials.threads} rel="me">Threads @__ali.c</a>
        </div>
        <p class="fine">（自我介紹係 Demo 草稿，等阿陳改寫。）</p>
      </div>
    </section>
    <WorkBand />
  </>
)

export const NotFound = () => (
  <section class="wrap block empty">
    <h1>搵唔到呢頁</h1>
    <a class="btn" href="/">
      返首頁
    </a>
  </section>
)
