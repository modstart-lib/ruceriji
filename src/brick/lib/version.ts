/**
 * Version Manager - Vue3 版本
 */
import { SystemSetting } from '@/config/setting'
import { Api as api } from './api'
import { Dialog } from './dialog'

export const VersionManager = {
  version(): string {
    // #ifdef H5
    return '1.0.0'
    // #endif
    // #ifdef APP-PLUS
    // @ts-ignore
    return plus.runtime.version
    // #endif
    // #ifdef MP-WEIXIN
    return SystemSetting.version || '1.0.0'
    // #endif
  },

  compare(v1: string, v2: string, operator: '>' | '>=' | '<' | '<='): boolean {
    const v1s = v1.split('.')
    const v2s = v2.split('.')
    if (v1s.length !== 3 || v2s.length !== 3) return false
    const toNum = (s: string[]) => parseInt(s[0]) * 1000000 + parseInt(s[1]) * 1000 + parseInt(s[2])
    const n1 = toNum(v1s)
    const n2 = toNum(v2s)
    switch (operator) {
      case '>':
        return n1 > n2
      case '>=':
        return n1 >= n2
      case '<':
        return n1 < n2
      case '<=':
        return n1 <= n2
    }
    return false
  },

  async openDownloadUrl() {
    const res = await api.postWithLoading('app/download_url', {})
    Dialog.tipError('即将下载', () => {
      // #ifdef APP-PLUS
      // @ts-ignore
      plus.runtime.openURL(res.data.url)
      // #endif
    })
  },
}
