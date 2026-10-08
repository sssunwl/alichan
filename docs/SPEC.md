# Alichan — KOL 自有內容站(第一個客人:阿陳 AliLife)

> 狀態:2026-10-08 P0 demo 上線 https://alichan.sssuni.com (noindex),等阿陳審稿。本檔是唯一真相來源,SPEC 沒寫的不要自行發明,回報 SS 決定。

## 0. 一句話

把 KOL 鎖在影片裡的「有人會搜」的資訊,自動變成 Google 和 AI 都讀得到的文章,並把流量導向 KOL 自己的生意(品牌合作、聯盟佣金)。

**不是**在做:個人主頁、IG feed 牆、Linktree 複製品。

## 1. 為什麼是阿陳

- YouTube @Alichan90s 約 1.7 萬訂閱、143 部片,主題是日本遊學、旅遊、港深飲食
- 熱門片多是**搜尋型題目**(真實花費、避坑指南、自駕必知、X 天行程),正是文章化最有價值的類型
- 阿陳本人同意當 demo,之後幫 SS 介紹其他 KOL(策略見 `_private/PITCH.md`)

## 2. 整體架構

```
 ┌─────────────── 來源 ───────────────┐
 │ YouTube Data API(公開:片單/標題/數據) │
 │ YouTube captions(KOL 本人 OAuth 授權)  │
 │ IG / Threads:v1 只放連結,不抓取        │
 └──────────────┬─────────────────────┘
                │ Worker Cron(每日)
                ▼
 ┌──────────── 加工 pipeline ───────────┐
 │ 1. 新片 → 分類:攻略/實測/vlog          │
 │ 2. 攻略/實測 → 抓字幕                   │
 │ 3. LLM → 文章草稿 JSON(結構見 §5)      │
 │ 4. 存 D1,status = draft,TG 通知       │
 └──────────────┬─────────────────────┘
                ▼
 ┌──────────── 後台 /admin ─────────────┐   Cloudflare Access 保護
 │ 審稿(價錢/日期/店名必須人手確認)→ 發布  │   (照 Knowledge SOP:
 │ 合作查詢、聯盟連結、數據月報            │    Cloudflare客戶帳號開設與後台Access設定)
 └──────────────┬─────────────────────┘
                ▼
 ┌──────────── 前台(Worker SSR)────────┐
 │ 伺服器直接輸出完整 HTML(不是 SPA)     │
 │ /  /guides/:slug  /topics/:tag        │
 │ /links  /work-with-me  /about         │
 │ JSON-LD、sitemap、RSS、/go/:code 轉址   │
 └───────────────────────────────────────┘
```

### 技術選型

| 層 | 選擇 | 理由 |
|---|---|---|
| 前台 | Cloudflare Worker + Hono,伺服器端輸出 HTML | SEO 要完整 HTML;發布即時生效,不用 rebuild;沿用 ryukyusurfbase 的「前台+API 同一個 Worker」模式 |
| 後台 | `/admin` 下的 React SPA | 後台不需要 SEO,用 SS 熟悉的 Vite+React |
| 資料 | D1 | 文章、片單、連結、點擊、查詢 |
| 圖片 | v1 用 YouTube 縮圖(i.ytimg.com);v2 用 R2 | SS 帳號 R2 尚未開通;正式站開在 KOL 自己帳號,屆時一併開 |
| LLM | 文字 API(輸入是字幕文字,不是影片) | Gemini 免費層只能用文字,剛好夠;模型可替換,寫在單一模組 |
| 影片嵌入 | lite-youtube 外觀(點了才載入 iframe) | 一篇文 1 支 iframe 就拖慢速度分數 |

## 3. 頁面

| 路徑 | 用途 | 重點 |
|---|---|---|
| `/` | 總覽 | 我是誰(一句)、精選攻略、最新、主題入口 |
| `/guides/:slug` | 每部片一篇文章 | 開頭直接答案(TL;DR)→ 花費/資料表 → 分段 → FAQ → 影片嵌入+章節時間碼 → 相關文 |
| `/topics/:tag` | 主題頁 | 日本遊學、東京、福岡、日本自駕、香港美食…(由實際內容決定,不預先編) |
| `/links` | **取代 Linktree 的 bio link 頁** | KOL 把 IG/YT bio 改成這一頁 = 每個點擊都在自己網域、有數據 |
| `/work-with-me` | 品牌合作 | 受眾數據(YouTube 自動、IG 手填)、過往合作、查詢表單 |
| `/about` | 實體頁 | 給 Google / AI 認得「阿陳 = 這個人 = 這些帳號」 |
| `/go/:code` | 聯盟連結轉址 | 記點擊後 302 轉去 Klook/Agoda 等 |

## 4. SEO / AEO / GEO 做法

只做有根據的,不承諾排名或被 AI 引用。

- **完整 HTML、快**:SSR,無多餘 JS,圖片指定尺寸
- **結構化資料(JSON-LD)**:`Person`(`sameAs` 連 IG/YT/Threads,把分散的帳號歸成同一實體)、`Article`、`VideoObject`、`BreadcrumbList`
- **FAQ 區塊照做,但不靠它拿 rich result**:Google 2023 年起只對少數權威網站顯示 FAQ rich result;FAQ 的價值在於讓 AI 好擷取問答
- **答案先行**:每篇第一段直接回答標題問題,AI 摘要最常引用這一段
- **表格化事實**:花費、時間、地點用 `<table>`,並標「資料時間 YYYY-MM」(價錢會過期,過期資訊反而傷信任)
- **作者與日期**:每篇有作者(連到 `/about`)、發布日、更新日
- sitemap.xml、RSS、canonical、IndexNow(Bing)
- `llms.txt`:成本極低所以做,但目前沒有證據主流 AI 會讀,不當賣點

## 5. 文章草稿結構(LLM 輸出)

```json
{
  "video_id": "",
  "type": "攻略 | 實測 | vlog",
  "title": "",
  "slug": "",
  "tldr": "第一段直接答案,2–3 句",
  "facts": [{ "label": "學費", "value": "", "source_timestamp": "03:12" }],
  "sections": [{ "heading": "", "body": "", "timestamp": "05:40" }],
  "faq": [{ "q": "", "a": "" }],
  "places": [{ "name": "", "area": "", "note": "" }],
  "tags": [],
  "affiliate_slots": ["住宿", "交通", "活動"],
  "needs_check": ["所有金額", "店名拼寫", "營業資訊"]
}
```

硬規則:
- 只能用字幕裡講過的內容,**不准補充影片沒有的事實**(價錢、地址、營業時間)
- 每個 fact 必須帶來源時間碼,審稿時可以點過去核對
- 語氣保留 KOL 本人的說法,不要改成 AI 腔(見 SS 文案規範)
- `needs_check` 非空時不能一鍵發布

## 6. 資料表(D1)

| 表 | 主要欄位 |
|---|---|
| `videos` | yt_id, title, published_at, duration, views, type, captions_status, article_id |
| `articles` | id, video_id, slug, status(draft/review/published), title, tldr, body_json, faq_json, facts_checked_at, published_at, updated_at |
| `links` | code, url, label, partner, article_id |
| `clicks` | code, ts, referrer, country(不存 IP) |
| `inquiries` | id, brand, contact, type, budget_range, message, created_at, status |
| `stats_snapshots` | date, platform, followers, views(每日一筆,做媒體資料和月報) |

## 7. 字幕來源

| 方法 | 用在 | 備註 |
|---|---|---|
| KOL 在 YouTube Studio 匯出 SRT | **P0 demo** | 零開發,阿陳手動匯出 3 部即可;放 `_transcripts/`(已 gitignore) |
| YouTube Data API `captions.download` + KOL OAuth | P1 正式 | 只有頻道擁有者授權才能下載,這是正規做法;每次 200 quota |
| 第三方抓自動字幕 | **不用** | 條款灰色地帶 |

## 8. 分期

| 期 | 內容 | 驗收 |
|---|---|---|
| **P0 Demo** | 3 篇人工審過的文章 + `/links` + `/work-with-me` + `/about` + JSON-LD。暫放預覽網址,加 noindex | 阿陳看完願意換 bio link |
| **P1 阿陳正式上線** | 阿陳自己的網域與 Cloudflare 帳號、後台、自動 pipeline、Search Console;補 20–30 部常青片(不是全部 143 部) | 網站被 Google 收錄,bio link 換成 `/links` |
| **P2 變現** | 聯盟連結+點擊統計、查詢表單+TG 通知、每月自動月報 | 第一個透過網站來的品牌查詢或聯盟點擊 |
| **P3 產品化** | 抽出模板(`site.config` 換名字/帳號/顏色),交第 2–3 個 KOL | 新 KOL 一星期內上線 |

P1 開始寫程式時,就把 KOL 相關的東西集中在 `site.config`,不要散在元件裡,這樣 P3 才抽得出模板。

## 9. 硬性規則

1. **repo 是 public**:字幕、KOL 未公開資料、合作報價、查詢內容、金鑰一律不進 repo。憑證放 `~/.config/alichan/`,雲端放 Cloudflare secrets
2. 正式站開在 **KOL 自己的 Cloudflare 帳號與網域**,SS 當 member(照 Knowledge SOP)
3. 不做 IG feed 牆;不代 KOL 發任何社群貼文
4. 沒有 KOL 確認的數字(訂閱數以外的受眾資料、合作價錢)一律 `TBD`,不准編
5. 中文標題 `line-height ≥ 1.05`、`letter-spacing ≥ -0.01em`

## 10. 待 SS / 阿陳決定

- [x] P0 三部片(2026-10-08 SS 定):東京遊學一個月真實花費 `StNJHl-WkBA`、福岡 2 天 1 夜 `d5w9k--VGjA`、日本自駕必知 8 件事 `yRdZnt3EcBk`(等字幕)
- [ ] 阿陳有沒有自己的網域?沒有的話要取什麼名
- [ ] 阿陳現在有沒有在用聯盟計劃(Klook/Agoda/遊學代辦轉介)
- [ ] 產品對外名稱(repo 叫 alichan,是阿陳的站;產品本身要另外命名)
- [ ] 網站語言:書面繁中,港台讀者都看得懂;要不要另外處理粵語口語
