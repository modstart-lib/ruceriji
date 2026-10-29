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

  /**
   * 时长的用户可读写法（不带前导零）：35秒 / 4分35秒 / 1小时5分
   * 详情、列表、统计统一使用，避免出现 04分35秒、15时03分 这类机器格式
   */
  formatDurationHuman(duration: number, option?: { isMs?: boolean }): string {
    let total = option?.isMs ? Math.floor(duration / 1000) : Math.floor(duration)
    if (!Number.isFinite(total) || total < 0) total = 0
    const h = Math.floor(total / 3600)
    const m = Math.floor((total % 3600) / 60)
    const s = total % 60
    if (h > 0) return `${h}小时${m}分`
    if (m > 0) return s > 0 ? `${m}分${s}秒` : `${m}分`
    return `${s}秒`
  },

  /**
   * 间隔写法：3小时12分 / 2天5小时
   */
  formatIntervalHuman(duration: number): string {
    const total = Math.max(0, Math.floor(duration))
    const d = Math.floor(total / 86400)
    const h = Math.floor((total % 86400) / 3600)
    const m = Math.floor((total % 3600) / 60)
    if (d > 0) return `${d}天${h > 0 ? h + '小时' : ''}`
    if (h > 0) return `${h}小时${m}分`
    return `${m}分`
  },

  /**
   * 记录时间：今天 14:44 / 昨天 14:44 / 10月28日 14:44（跨年补年份）
   */
  formatRecordTime(input: string | Date | number, now: Date = new Date()): string {
    const dt = typeof input === 'string' ? new Date(input.replace(/-/g, '/')) : new Date(input)
    if (Number.isNaN(dt.getTime())) return String(input)
    const hm = DateUtil.format(dt, 'HH:mm')
    const sameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
    if (sameDay(dt, now)) return `今天 ${hm}`
    const yesterday = new Date(now.getTime() - 86400000)
    if (sameDay(dt, yesterday)) return `昨天 ${hm}`
    const md = DateUtil.format(dt, 'MM月DD日').replace(/^0/, '')
    if (dt.getFullYear() === now.getFullYear()) return `${md} ${hm}`
    return `${dt.getFullYear()}年${md} ${hm}`
  },
}

export default DateUtil
