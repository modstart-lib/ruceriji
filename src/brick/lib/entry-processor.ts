/**
 * 入口处理器 - 适配 Vue3 版本
 * 处理应用启动时的专项跳转逻辑（邀请码、分销、自定义入口等）
 */
import { Api } from '@/brick/lib/api'
import { Router } from '@/brick/lib/router'
import { Storage } from '@/brick/lib/storage'
import { Base64Util } from '@/brick/lib/util'
import { AppSetting } from '@/config/setting'

export const EntryProcessorUtil = {
  detectAndProcess(force = false): boolean {
    const path = Router.path()
    let entryProcessor: any = null

    if (force || path === AppSetting.route.home) {
      entryProcessor = Storage.pull('entryProcessor', null)
    }

    // 解析 _entry 参数
    if (!entryProcessor) {
      const _entry = Router.getQuery('_entry')
      if (_entry) {
        const decoded = Base64Util.base64UrlSafeDecode(_entry)
        if (decoded) {
          try {
            const parsed = JSON.parse(decoded)
            if (parsed && parsed.type && parsed.data) {
              entryProcessor = parsed
            }
          } catch (e) {}
        }
      }
    }

    // 用户邀请
    if (!entryProcessor) {
      const inviteCode = Router.getQuery('_invite')
      if (inviteCode) {
        entryProcessor = {
          type: 'biz',
          data: { name: 'MemberInvite', param: { inviteCode } },
        }
      }
    }

    // 用户分销
    if (!entryProcessor) {
      const distributorCode = Router.getQuery('_distributor')
      if (distributorCode) {
        entryProcessor = {
          type: 'biz',
          data: { name: 'MemberDistribution', param: { distributorCode } },
        }
      }
    }

    if (!entryProcessor || !entryProcessor.type || !entryProcessor.data) {
      return false
    }

    let nativeQuery: Record<string, any> | null = null
    // #ifdef H5
    const h5 = Router.parseH5Url(window.location.href)
    if (Object.keys(h5.param).length > 0) {
      nativeQuery = h5.param
    }
    // #endif

    if (entryProcessor.type === 'redirect') {
      const entryProcessorData = {
        page: entryProcessor.data.page,
        query: Router.getQueries(),
        nativeQuery,
        param: entryProcessor.data.param,
      }
      Storage.set('entryProcessorData', entryProcessorData)
      if (entryProcessorData.query && Object.keys(entryProcessorData.query).length > 0) {
        // #ifdef H5
        const wl = window.location
        window.location.href = `${wl.protocol}//${wl.host}${wl.pathname}#${entryProcessorData.page}`
        // #endif
        // #ifndef H5
        Router.replace(entryProcessorData.page, entryProcessorData.query)
        // #endif
      } else {
        Router.replace(entryProcessorData.page)
      }
      return true
    }

    if (entryProcessor.type === 'biz') {
      Api.post('entry/biz', entryProcessor.data)
      return false
    }

    return false
  },

  getEntryProcessorData(): any {
    return Storage.get('entryProcessorData', null)
  },

  setRedirectEntry(page: string, param?: Record<string, any>) {
    Storage.set('entryProcessor', { type: 'redirect', data: { page, param } })
  },

  setBizEntry(name: string, param?: Record<string, any>) {
    Storage.set('entryProcessor', { type: 'biz', data: { name, param } })
  },
}

export default EntryProcessorUtil
