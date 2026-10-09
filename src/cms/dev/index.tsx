// /cms/dev：開發中工具入口（只有 SS 睇到）
export const DevIndex = () => (
  <div class="wrap dev-index">
    <link rel="stylesheet" href="/cms/kit/dev.css" />
    <p class="dev-flag">開發中 · 只有 SS 睇到</p>
    <h1>開發中工具</h1>
    <p class="ps-lead">六個都係「後台小工具」嘅概念 demo。阿陳暫時睇唔到；OK 咗先搬去 CMS 俾佢睇。</p>
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
      <a href="/cms/dev/thumbs">
        <span>03</span>
        <strong>YouTube 縮圖 Prompt 生成器</strong>
        <p>睇晒 113 張舊縮圖歸納風格。填大字、鉤字、價錢標籤，出 ChatGPT 生圖 prompt，附埋樣貌參考同相似舊圖。新片自動加入。</p>
      </a>
      <a href="/cms/dev/trends">
        <span>04</span>
        <strong>熱門話題追蹤</strong>
        <p>Google Trends 香港每日熱搜，同阿陳題材有關嘅排頭；撳一下用 AI 諗點拍。</p>
      </a>
      <a href="/cms/dev/rivals">
        <span>05</span>
        <strong>對手追蹤</strong>
        <p>7 個同類頻道（暫定）最新片、觀看、出片頻率，同自動偵測嘅合作品牌。</p>
      </a>
      <a href="/cms/dev/quote">
        <span>06</span>
        <strong>報價單生成器</strong>
        <p>收費表 + 快速套餐 + A4 報價單，一鍵存 PDF 或複製文字版 WhatsApp 俾品牌。</p>
      </a>
    </div>
    <p class="fine">
      <a href="/cms">← 返 CMS</a>
    </p>
  </div>
)
