// 帖文生成：字幕 → Gemini（文字 API）→ 各平台帖文 JSON。
// 模型集中喺呢度，要換（Claude／Codex）只改呢個檔。
import { VOICE } from './voice'

export type PostInput = {
  transcript: string
  videoTitle?: string
  keyword?: string
  coupons?: string[] // 例如「Klook 5% 優惠碼：ALICHANKLOOK」
  articleUrl?: string
  notes?: string // 補充資料：影片簡介、店名地址等
}

export type PostOutput = {
  titles: string[]
  youtube_description: string
  instagram: string
  facebook: string
  threads: string
  keyword: string
  needs_check: string[]
}

const schema = {
  type: 'OBJECT',
  properties: {
    titles: { type: 'ARRAY', items: { type: 'STRING' }, description: '5 個 YouTube 標題建議，書面中文' },
    youtube_description: { type: 'STRING', description: 'YouTube 簡介，書面中文，含章節時間碼' },
    instagram: { type: 'STRING', description: 'IG caption，廣東話' },
    facebook: { type: 'STRING', description: 'Facebook 帖文，廣東話' },
    threads: { type: 'STRING', description: 'Threads 帖文，廣東話，500 字內' },
    keyword: { type: 'STRING', description: '用咗嘅留言關鍵字' },
    needs_check: { type: 'ARRAY', items: { type: 'STRING' }, description: '要阿陳確認嘅事實或字幕疑似錯字' },
  },
  required: ['titles', 'youtube_description', 'instagram', 'facebook', 'threads', 'keyword', 'needs_check'],
}

// 繁忙（503）時順序試下一個
export const MODELS = ['gemini-3.5-flash', 'gemini-2.5-flash', 'gemini-flash-latest']

// 將 .srt 轉成「m:ss 文字」，慳 token 兼保留時間碼做章節
export const srtToLines = (raw: string) => {
  if (!/-->/.test(raw)) return raw.trim()
  const out: string[] = []
  for (const block of raw.replace(/\r/g, '').split(/\n\n+/)) {
    const lines = block.split('\n').filter(Boolean)
    const ti = lines.findIndex((l) => l.includes('-->'))
    if (ti < 0) continue
    const m = lines[ti].match(/(\d+):(\d+):(\d+)/)
    if (!m) continue
    const sec = +m[1] * 3600 + +m[2] * 60 + +m[3]
    const text = lines.slice(ti + 1).join(' ').replace(/<[^>]+>/g, '').trim()
    if (text) out.push(`${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')} ${text}`)
  }
  return out.join('\n')
}

export const generatePosts = async (input: PostInput, apiKey: string): Promise<PostOutput & { model: string }> => {
  let last = ''
  for (const model of MODELS) {
    try {
      return { ...(await generateWith(model, input, apiKey)), model }
    } catch (e) {
      last = String(e)
      if (!/ 503| 429| 500/.test(last)) throw e
    }
  }
  throw new Error(last)
}

const generateWith = async (model: string, input: PostInput, apiKey: string): Promise<PostOutput> => {
  const transcript = srtToLines(input.transcript).slice(0, 60000)
  const user = [
    input.videoTitle && `影片原標題：${input.videoTitle}`,
    input.keyword ? `留言關鍵字：${input.keyword}` : '留言關鍵字：（未提供，你揀）',
    input.coupons?.length ? `可用優惠碼：\n${input.coupons.join('\n')}` : '可用優惠碼：（冇，唔好寫任何優惠碼）',
    input.articleUrl && `網站完整攻略：${input.articleUrl}`,
    input.notes && `=== 補充資料（阿陳自己寫，店名地址以呢度為準）===\n${input.notes.slice(0, 8000)}`,
    `=== 字幕（m:ss 文字）===\n${transcript}`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: VOICE }] },
      contents: [{ role: 'user', parts: [{ text: user }] }],
      generationConfig: { responseMimeType: 'application/json', responseSchema: schema, temperature: 0.8 },
    }),
  })
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] }
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? ''
  const out = JSON.parse(text) as PostOutput
  // 模型間中會將換行寫成字面 "\n"
  const fix = (v: string) => (v.includes('\\n') && !v.includes('\n') ? v.replace(/\\n/g, '\n') : v)
  for (const k of ['youtube_description', 'instagram', 'facebook', 'threads'] as const) out[k] = fix(out[k])
  return out
}
