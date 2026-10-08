// 所有 KOL 專屬資料集中喺呢度。P3 抽模板時，換 KOL 只改呢個檔同 content/。
// 數字一律附「資料時間」；冇 KOL 確認嘅一律 null（畫面顯示「待補」），唔准估。

export const site = {
  name: '阿陳 AliLife',
  shortName: '阿陳',
  tagline: '香港 YouTuber，拍日本深度旅遊、遊學同美食',
  lang: 'zh-Hant',
  locale: 'zh_HK',
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
    instagramFollowers: null as string | null,
    threadsFollowers: null as string | null,
    audienceRegions: null as string | null,
  },
  // 公開觀看數（2026-10-08 頻道頁「熱門影片」）
  topVideos: [
    { title: '澳門狂食 24 小時', views: '23 萬', id: null },
    { title: '新家 Home Tour：8 萬裝修日系復古工業風', views: '10 萬', id: null },
    { title: '獨旅福岡 2 天 1 夜', views: '7.7 萬', id: 'd5w9k--VGjA' },
    { title: '大阪 CHANEL 二手包+隱藏版壽司', views: '6.5 萬', id: null },
    { title: '日本自駕必知 8 件事', views: '5.9 萬', id: 'yRdZnt3EcBk' },
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
