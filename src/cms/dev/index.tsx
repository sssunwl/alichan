// /cms/dev：開發中工具入口（只有 SS 睇到）
export const DevIndex = () => (
  <div class="wrap dev-index">
    <link rel="stylesheet" href="/cms/dev/dev.css" />
    <p class="dev-flag">開發中 · 只有 SS 睇到</p>
    <h1>開發中工具</h1>
    <p class="ps-lead">兩個都係「後台小工具」嘅概念 demo。阿陳暫時睇唔到；OK 咗先搬去 CMS 俾佢睇。</p>
    <div class="dev-cards">
      <a href="/cms/dev/carousel">
        <span>01</span>
        <strong>輪播圖生成器</strong>
        <p>揀文章 → 揀款式 → 下載。4 款跟網站主題嘅設計，相片由影片自動配，撳相可以換，撳字可以改，一鍵下載 ZIP。</p>
      </a>
      <a href="/cms/dev/posts">
        <span>02</span>
        <strong>帖文生成器</strong>
        <p>放字幕／.srt，一次出 YouTube 標題、簡介、IG、Facebook、Threads，用阿陳語氣。YouTube 書面中文，IG／FB／Threads 廣東話。</p>
      </a>
    </div>
    <p class="fine">
      <a href="/cms">← 返 CMS</a>
    </p>
  </div>
)
