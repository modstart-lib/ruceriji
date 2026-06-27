/**
 * 日期工具 - 适配 Vue3 版本
 */
export const DateUtil = {
  year(d?: Date): number {
    return (d || new Date()).getFullYear()
  },

  month(d?: Date): number {
    return (d || new Date()).getMonth() + 1
  },

  day(d?: Date): number {
    return (d || new Date()).getDate()
  },

  date(d?: Date): string {
    const dt = d || new Date()
    const y = dt.getFullYear()
    const m = String(dt.getMonth() + 1).padStart(2, '0')
    const day = String(dt.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  },

  datetime(d?: Date): string {
    const dt = d || new Date()
    return DateUtil.date(dt) + ' ' + DateUtil.time(dt)
  },

  time(d?: Date): string {
    const dt = d || new Date()
    const h = String(dt.getHours()).padStart(2, '0')
    const m = String(dt.getMinutes()).padStart(2, '0')
    const s = String(dt.getSeconds()).padStart(2, '0')
    return `${h}:${m}:${s}`
  },

  timeHourMinute(d?: Date): string {
    const dt = d || new Date()
    const h = String(dt.getHours()).padStart(2, '0')
    const m = String(dt.getMinutes()).padStart(2, '0')
    return `${h}:${m}`
  },

  timestampInMs(): number {
    return new Date().getTime()
  },

  timestampInSec(): number {
    return Math.floor(new Date().getTime() / 1000)
  },

  stringDatetime(str: string): Date {
    // Handle China timezone string "YYYY-MM-DD HH:mm:ss"
    return new Date(str.replace(/-/g, '/'))
  },

  format(d: Date | string | number, fmt = 'YYYY-MM-DD HH:mm:ss'): string {
    const dt = typeof d === 'string' ? new Date(d.replace(/-/g, '/')) : typeof d === 'number' ? new Date(d) : d
    const map: Record<string, string> = {
      YYYY: String(dt.getFullYear()),
      MM: String(dt.getMonth() + 1).padStart(2, '0'),
      DD: String(dt.getDate()).padStart(2, '0'),
      HH: String(dt.getHours()).padStart(2, '0'),
      mm: String(dt.getMinutes()).padStart(2, '0'),
      ss: String(dt.getSeconds()).padStart(2, '0'),
    }
    return Object.keys(map).reduce((result, key) => result.replace(key, map[key]), fmt)
  },

  formatDuration(
    duration: number,
    option?: { hour?: boolean; minute?: boolean; second?: boolean; isMs?: boolean; format?: string }
  ): string {
    option = option || {}
    let totalSeconds = option.isMs ? Math.floor(duration / 1000) : duration
    if (totalSeconds < 0) totalSeconds = 0
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    const pad = (n: number) => String(n).padStart(2, '0')
    if (option.format) {
      return option.format.replace('HH', pad(h)).replace('mm', pad(m)).replace('ss', pad(s))
    }
    const parts: string[] = []
    if (option.hour !== false && h > 0) parts.push(`${h}小时`)
    if (option.minute !== false && (h > 0 || m > 0)) parts.push(`${m}分`)
    if (option.second !== false) parts.push(`${s}秒`)
    return parts.join('') || '0秒'
  },
}

export default DateUtil
