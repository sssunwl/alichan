// 所有 KOL 專屬資料集中喺呢度。P3 抽模板時，換 KOL 只改呢個檔同 content/。
// 數字一律附「資料時間」；冇 KOL 確認嘅一律 null（畫面顯示「待補」），唔准估。

export const site = {
  name: '阿陳 AliLife',
  shortName: '阿陳',
  tagline: '香港 YouTuber，拍日本深度旅遊、遊學同美食',
  lang: 'zh-Hant',
  locale: 'zh_HK',
  avatar: 'https://yt3.googleusercontent.com/ZvnbNZ9IvywGhRAt6JqZzburarfV2UVspx_1GCb6LgrWmTOSvK5feSWiwfB486ISSJvIdkswIA=s240-c-k-c0x00ffffff-no-rj',
  // 首頁標語：「幫大家搵更多日本秘景」係阿陳每集開場白，「真實花費」係佢嘅招牌系列
  heroLead: '我係阿陳，香港 YouTuber。呢度係我啲片嘅文字版：價錢、地址、要唔要預約，一眼睇晒。',
  email: 'ching829520@gmail.com', // 影片簡介公開嘅合作邀約電郵
  socials: {
    youtube: 'https://www.youtube.com/@Alichan90s',
    instagram: 'https://www.instagram.com/__ali.c/',
    threads: 'https://www.threads.com/@__ali.c',
  },
  // 公開數字（2026-10-08 從 YouTube 頻道頁讀取）
  stats: {
    asOf: '2026-10-08',
    youtubeSubscribers: '1.71 萬',
    youtubeVideos: 143,
    instagramFollowers: '6.48 萬' as string | null, // IG 個人頁公開數字，2026-10-08
    threadsFollowers: null as string | null,
    audienceRegions: null as string | null,
  },
  // 公開觀看數（2026-10-08 頻道頁「熱門影片」）
  topVideos: [
    { title: '澳門狂食 24 小時', views: '23 萬', id: 'Rn9wWLHpQdk' },
    { title: '新家 Home Tour：8 萬裝修日系復古工業風', views: '10 萬', id: 'IpNfbDbw4d4' },
    { title: '獨旅福岡 2 天 1 夜', views: '7.7 萬', id: 'd5w9k--VGjA' },
    { title: '大阪 CHANEL 二手包+隱藏版壽司', views: '6.5 萬', id: 'KneeOM1WWvM' },
    { title: '日本自駕必知 8 件事', views: '5.9 萬', id: 'yRdZnt3EcBk' },
  ],
  // IG Reels（2026-10-08 由 @__ali.c 公開 Reels 頁讀取；封面存 public/ig/）
  // 正式版改用 Instagram API 自動更新（見 /cms「IG 可唔可以接」）
  instagramHandle: '__ali.c',
  instagramPosts: '2,038',
  reels: [
    { id: 'C7l_x7_So4g', views: '430 萬', caption: 'iPhone 隱藏「星夜模式」：3 個步驟拍出浪漫星空' },
    { id: 'DQbwoxkj0Dk', views: '20.2 萬', caption: '遊輪初體驗｜皇家加勒比「海洋贊禮號」' },
    { id: 'DZ5AY1DJipd', views: '11.6 萬', caption: '海南三亞 4 日 3 夜｜唔使 $3000，香港直飛 1 小時' },
    { id: 'DdobftvpiR_', views: '5.7 萬', caption: '上環爆紅 Cafe｜以為食 Pasta，點知甜品先係主角' },
    { id: 'DdwF5vKpzR0', views: '3.1 萬', caption: '曼谷水門批發市場｜穿搭＋美食一次過掃' },
    { id: 'DeHLf_WxEWe', views: '2.16 萬', caption: '東京近郊秋日秘境｜茨城掃帚草＋海上鳥居' },
    { id: 'DeCFbxUJCc6', views: '2.09 萬', caption: '中環 3 間手工意粉店｜預約困難店＋$198 Lunch' },
  ],
  topics: ['日本遊學', '東京', '福岡', '九州', '日本自駕', '獨旅', '沖繩', '四國', '港深美食', '泰國'],
} as const

// 聯盟/優惠連結。/go/:code 轉址（P2 開始記點擊）。
// 全部來自阿陳影片簡介公開嘅連結同優惠碼。
export const links: Record<string, { label: string; url: string; code?: string; note?: string }> = {
  tocoo: {
    label: 'Tocoo 日本租車',
    url: 'https://campaign-highway.tocoo.jp/cn?asp_id=1745&utm_source=1745&utm_medium=affiliate',
    code: 'KBY86Z',
    note: '訂單滿 10,000 円減 1,000 円；疊加碼 V7R2LL 滿 20,000 円減 3,000 円',
  },
  klook: {
    label: 'Klook',
    url: 'https://www.klook.com',
    code: 'ALICHANKLOOK',
    note: '5% 優惠碼',
  },
  chanpi: {
    label: '即飲濃縮八珍湯（阿陳品牌）',
    url: 'https://www.instagram.com/chanpi.store/',
  },
}
