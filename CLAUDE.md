# Alichan — KOL 自有內容站

第一個客人是 KOL 阿陳 AliLife(SS 的朋友,同意當 demo 並幫忙介紹其他 KOL)。目標是做成可以複製給其他 KOL 的模板產品。

- **唯一真相來源**:`docs/SPEC.md`。SPEC 沒寫的不要發明,回報 SS
- **說服策略/報價**:`_private/PITCH.md`(已 gitignore,絕不 commit)
- **repo `sssunwl/alichan` 是 public**:字幕(`_transcripts/`)、`_private/`、金鑰、合作報價、查詢內容一律不進 repo。憑證放 `~/.config/alichan/`
- 正式站開在 KOL 自己的 Cloudflare 帳號,照 `Knowledge/30_方法與SOP/Cloudflare客戶帳號開設與後台Access設定.md`
- 狀態(2026-10-08):**P0 demo 已上線** https://alichan.sssuni.com (全站 noindex,`?review=1` 睇待確認清單)。東京遊學、福岡 2 篇已整理待阿陳審稿;日本自駕 1 篇等字幕(YouTube 轉錄稿面板對呢條片回 400,唔好硬繞,等阿陳由 YouTube Studio 匯出 SRT)
- 結構:Hono SSR Worker(`src/index.tsx`),KOL 資料集中 `src/site.config.ts`,文章 `src/content/guides.ts`。本機:workspace launch.json 嘅 `alichan`(port 8791);部署 `npx wrangler deploy`
- P0 字幕係喺 YouTube 頁面自帶「轉錄稿」面板讀取(阿陳已同意用佢內容做 demo),冇存檔入 repo
