/**
 * 国际化工具 - 适配 Vue3 + vue-i18n@9 版本
 */
import { SprintfUtil } from '@/brick/lib/sprintf'
import { AppSetting } from '@/config/setting'
import { I18nList, I18nMessages } from '@/locales/messages'

// AppSetting 可能没有 i18nEnable 字段，安全读取
const isI18nEnabled = (): boolean => {
  return !!(AppSetting as any).i18nEnable
}

export const Lang = {
  getLocale(): string {
    if (!isI18nEnabled()) return 'zh'
    try {
      const locale = uni.getLocale()
      switch (locale) {
        case 'zh-Hans':
        case 'zh':
          return 'zh'
        default:
          return locale || 'zh'
      }
    } catch (e) {
      return 'zh'
    }
  },

  setLocale(locale: string) {
    try {
      uni.setLocale(locale)
    } catch (e) {}
    uni.reLaunch({ url: AppSetting.route.home })
    // #ifdef H5
    window.location.reload()
    // #endif
  },

  listLang() {
    return I18nList
  },

  L(key: string, ...param: any[]): string {
    const locale = Lang.getLocale()
    const messages = I18nMessages[locale] || I18nMessages['zh'] || {}
    const text = key in messages ? messages[key] : key
    if (param.length > 0) {
      return SprintfUtil.format(text, ...param)
    }
    return text
  },
}

export default Lang
