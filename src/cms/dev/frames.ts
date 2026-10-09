// 每條片可用嘅畫面（秒數）；圖片 = /cms/kit/frames/{videoId}/{t}.jpg（1280×720）
// Demo：用 YouTube 自動生成嘅封面（0）+ 3 張影片畫面（約 25%、50%、75%）。
// 正式版：KOL 上載原片（或 owner 授權），按每段 section 嘅時間碼抽相。
export const frames: Record<string, number[]> = {
  'StNJHl-WkBA': [0, 266, 532, 798],
  'd5w9k--VGjA': [0, 256, 511, 766],
}
