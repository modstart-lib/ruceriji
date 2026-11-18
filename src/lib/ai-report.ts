/**
 * AI 分析结果的结构化解析
 *
 * 后端历史数据只有 `{ type: 'text', content: '<p>…</p>' }`，
 * 新数据可能直接返回 score / summary / points / advice 字段。
 * 这里先读结构化字段，读不到再从 HTML 正文里解析；都失败才退回原始 HTML 渲染。
 */

export interface AiReportPoint {
  label: string
  value: string
  note: string
}

export interface AiReport {
  /** 0–100，解析不到为 null */
  score: number | null
  /** 优秀 / 良好 / 一般 / 需关注，解析不到为空串 */
  level: string
  /** 评分后的一句总评 */
  summary: string
  /** 观察时间里的时长等附加信息（已去掉绝对时间） */
  meta: string
  /** 最近 7 天趋势，一句话 */
  trend: string
  points: AiReportPoint[]
  /** 建议条目：后端结构化输出多条；旧数据从一段建议里按句拆开 */
  advices: string[]
  /** 建议合并成一段，保留给旧调用方 */
  advice: string
  /** 解析失败时的原始正文，用于兜底渲染 */
  legacyHtml: string
  /** 是否来自后端结构化字段 */
  structured: boolean
}

const POINT_LABELS = [
  '形态',
  '形状',
  '颜色',
  '分量',
  '感觉',
  '气味',
  '厕纸情况',
  '粘黏情况',
  '肚子感觉',
  '心情',
  '地点',
]

const LEVELS: Array<{ min: number; label: string }> = [
  { min: 90, label: '优秀' },
  { min: 75, label: '良好' },
  { min: 60, label: '一般' },
  { min: 0, label: '需关注' },
]

function levelOf(score: number): string {
  const hit = LEVELS.find((item) => score >= item.min)
  return hit ? hit.label : ''
}

function decodeEntities(input: string): string {
  return input
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&ldquo;/gi, '“')
    .replace(/&rdquo;/gi, '”')
}

/** HTML → 按段落拆分的纯文本行（小程序端没有 DOMParser，统一用正则） */
export function htmlToLines(html: string): string[] {
  if (!html) return []
  return decodeEntities(
    String(html)
      .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, '\n')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
  )
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

function stripTrailingDot(text: string): string {
  return text.replace(/[。；;]\s*$/, '').trim()
}

/** 建议可能是一整段，也可能是多条：统一拆成条目 */
export function splitAdvices(text: string): string[] {
  if (!text) return []
  return text
    .split(/[。；;\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5)
}

/** "香肠柔软。肠道状态良好，是理想的形态。" → { value, note } */
function splitPointBody(body: string): { value: string; note: string } {
  const text = body.trim()
  const index = text.indexOf('。')
  if (index > 0) {
    const value = text.slice(0, index).trim()
    const note = text.slice(index + 1).trim()
    // 值太长时整段作为说明，避免把一句话塞进标签位
    if (value.length > 16) return { value: '', note: text }
    return { value, note }
  }
  // 没有句号时，AI 常写「白色 → 需要留意（正常应为棕黄色）」，箭头前是结果，后面是说明
  const arrow = text.indexOf('→')
  if (arrow > 0 && arrow <= 16) {
    return { value: text.slice(0, arrow).trim(), note: text.slice(arrow + 1).trim() }
  }
  return { value: stripTrailingDot(text), note: '' }
}

function normalizePoint(raw: any): AiReportPoint | null {
  if (!raw) return null
  if (typeof raw === 'string') {
    const match = raw.match(/^([^：:]{1,8})[：:]\s*(.+)$/)
    if (!match) return null
    const { value, note } = splitPointBody(match[2])
    return { label: match[1].trim(), value, note }
  }
  const label = String(raw.label || raw.name || raw.title || '').trim()
  const text = String(raw.text || raw.content || raw.desc || '').trim()
  if (!label && !text) return null
  if (raw.value || raw.note) {
    return {
      label,
      value: String(raw.value || '').trim(),
      note: String(raw.note || raw.desc || '').trim(),
    }
  }
  const { value, note } = splitPointBody(text)
  return { label, value, note }
}

/** 匹配一行里的评分，返回分数与分数之后的剩余文本（作为总评） */
const SCORE_PATTERNS: RegExp[] = [
  // 评分为 88 分 / 评分：88/100 / 综合得分 88 分
  /(?:评分|得分|分数|总分)\s*(?:为|是|[:：])?\s*(\d{1,3})\s*(?:分|\/\s*100)?/,
  // 88 / 100
  /(\d{1,3})\s*\/\s*100/,
  // 单独一行 "88 分"（AI 把分数写在 <strong> 里单独成行）
  /^(\d{1,3})\s*分$/,
]

function matchScore(line: string): { score: number; rest: string } | null {
  for (const pattern of SCORE_PATTERNS) {
    const hit = line.match(pattern)
    if (!hit || hit.index === undefined) continue
    const score = Number(hit[1])
    if (!Number.isFinite(score) || score < 0 || score > 100) continue
    const rest = line
      .slice(hit.index + hit[0].length)
      .replace(/^[，,、\s/]+/, '')
      .replace(/[。.]$/, '')
    return { score, rest }
  }
  return null
}

function parseFromHtml(html: string): Pick<AiReport, 'score' | 'summary' | 'meta' | 'trend' | 'points' | 'advice'> {
  const lines = htmlToLines(html)
  let score: number | null = null
  let summary = ''
  let meta = ''
  let trend = ''
  let advice = ''
  const points: AiReportPoint[] = []
  let adviceMode = false

  for (const line of lines) {
    // 建议段之后的内容都归入建议
    if (/^(今日建议|健康建议|建议|温馨提示)[：:]?$/.test(line)) {
      adviceMode = true
      continue
    }
    if (adviceMode) {
      advice = advice ? `${advice} ${line}` : line
      continue
    }

    const scoreHit = score === null ? matchScore(line) : null
    if (scoreHit) {
      score = scoreHit.score
      // 评分同段里“，整体状态良好。”作为总评；没有就保留前面的首段总述
      if (scoreHit.rest) summary = scoreHit.rest
      continue
    }

    const trendMatch = line.match(/^(?:近期趋势|最近趋势|趋势)[：:]\s*(.+)$/)
    if (trendMatch) {
      trend = stripTrailingDot(trendMatch[1].trim())
      continue
    }

    const metaMatch = line.match(/^(?:观察时间|记录时间|分析时间)[：:]\s*(.+)$/)
    if (metaMatch) {
      // 去掉绝对时间，只保留“如厕时长约 5 分钟”这类有效信息
      const rest = metaMatch[1]
        .replace(/\d{4}[-/年]\d{1,2}[-/月]\d{1,2}日?/g, '')
        .replace(/\d{1,2}:\d{2}(:\d{2})?/g, '')
        .replace(/^[，,、\s]+/, '')
        .trim()
      meta = stripTrailingDot(rest)
      continue
    }

    const labelMatch = line.match(/^([^：:]{1,8})[：:]\s*(.+)$/)
    if (labelMatch && POINT_LABELS.includes(labelMatch[1].trim())) {
      const { value, note } = splitPointBody(labelMatch[2])
      points.push({ label: labelMatch[1].trim(), value, note })
      continue
    }

    // 结构化前的过渡数据：首段总述，别丢
    if (!summary && !points.length) summary = stripTrailingDot(line)
  }

  return { score, summary, meta, trend, points, advice }
}

export function parseAiReport(response: any): AiReport {
  const payload = response || {}
  const legacyHtml = typeof payload.content === 'string' ? payload.content : ''

  const structuredPoints = Array.isArray(payload.points) ? payload.points.map(normalizePoint).filter(Boolean) : []
  const structuredScore =
    payload.score === 0 || payload.score ? Math.min(100, Math.max(0, Number(payload.score) || 0)) : null
  // advices 是新字段；advice 是旧字段，两者都兼容
  const structuredAdvices: string[] = Array.isArray(payload.advices)
    ? payload.advices
        .map((item: any) => String(item || '').trim())
        .filter(Boolean)
        .slice(0, 5)
    : []
  const advices = structuredAdvices.length ? structuredAdvices : splitAdvices(String(payload.advice || ''))

  if (structuredScore !== null || structuredPoints.length || advices.length) {
    return {
      score: structuredScore,
      level: structuredScore !== null ? levelOf(structuredScore) : '',
      summary: String(payload.summary || '').trim(),
      meta: String(payload.meta || '').trim(),
      trend: String(payload.trend || '').trim(),
      points: structuredPoints as AiReportPoint[],
      advices,
      advice: advices.join('；'),
      legacyHtml,
      structured: true,
    }
  }

  const parsed = parseFromHtml(legacyHtml)
  const parsedAdvices = splitAdvices(parsed.advice)
  // 只有评分 / 要点 / 建议三者之一解析出来才算结构化，否则整段退回 HTML，避免丢内容
  const usable = parsed.score !== null || parsed.points.length > 0 || parsedAdvices.length > 0

  return {
    score: parsed.score,
    level: parsed.score !== null ? levelOf(parsed.score) : '',
    summary: parsed.summary,
    meta: parsed.meta,
    trend: parsed.trend,
    points: parsed.points,
    advices: parsedAdvices,
    advice: parsedAdvices.join('；'),
    // 解析不出结构时保留原文，页面退回富文本渲染
    legacyHtml: usable ? '' : legacyHtml,
    structured: false,
  }
}
