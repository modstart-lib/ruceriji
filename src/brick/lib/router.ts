/**
 * 路由工具 - 适配 Vue3 + UniApp 版本
 * 提供与源码兼容的 Router 接口 + 扩展方法
 */
import { AppSetting } from '@/config/setting'
import { StrUtil } from './util'

export const Router = {
  /** 替换当前页面（不可返回） */
  replace(path: string, param: Record<string, any> = {}) {
    if (AppSetting.route.tabBar.includes(path)) {
      uni.switchTab({ url: Router.pathBuild(path, param) })
    } else {
      uni.redirectTo({ url: Router.pathBuild(path, param) })
    }
  },

  /** 导航到指定页面 */
  to(path: string, param: Record<string, any> = {}, autoWeb = false) {
    // 提取标题参数
    if (param._title) {
      delete param._title
    }

    // 处理 module# 路径格式
    if (path.match(/^[a-zA-Z0-9_\/]+#(\/(pages|brick\/module)\/[a-zA-Z0-9_\/]+)/)) {
      path = path.split('#')[1]
    }

    if (path.startsWith('/pages') || path.startsWith('/brick/module')) {
      if (AppSetting.route.tabBar.includes(path)) {
        uni.switchTab({ url: Router.pathBuild(path, param) })
      } else {
        uni.navigateTo({ url: Router.pathBuild(path, param) })
      }
    } else if (path.startsWith('微信小程序://')) {
      const appId = path.split('://')[1].split('/')[0]
      const pagePath = path.split('://')[1].split('/').slice(1).join('/')
      // #ifdef MP-WEIXIN
      uni.navigateToMiniProgram({ appId, path: pagePath })
      // #endif
    } else {
      if (autoWeb) {
        uni.navigateTo({
          url: '/brick/module/system/web?url=' + encodeURIComponent(Router.urlBuild(path, param)),
        })
      } else {
        // #ifdef H5
        const urlInfo = Router.parseH5Url(path)
        const urlCurrent = Router.parseH5Url()
        if (
          urlInfo.protocol === urlCurrent.protocol &&
          urlInfo.host === urlCurrent.host &&
          urlInfo.pathname === urlCurrent.pathname
        ) {
          if (urlInfo.hash && (urlInfo.hash.startsWith('#/pages') || urlInfo.hash.startsWith('#/brick/module'))) {
            const url = urlInfo.hash.substring(1)
            const p = url.split('?')[0]
            if (AppSetting.route.tabBar.includes(p)) {
              uni.switchTab({ url })
            } else {
              uni.navigateTo({ url })
            }
            return
          }
        }
        // #endif
        uni.navigateTo({ url: Router.urlBuild(path, param) })
      }
    }
  },

  /** 带回调的页面跳转 */
  startForCallback(
    path: string,
    value: any,
    config: Record<string, any>,
    cbConfirm: ((data: any) => void) | null,
    cbCancel?: ((data: any) => void) | null,
    param: Record<string, any> = {}
  ) {
    value = value ?? null
    config = config || {}
    const eventKey = StrUtil.randomString(10)
    uni.setStorageSync(`Router.startForCallback.InitData.${eventKey}`, { value, config })
    uni.$once(`Router.startForCallback.${eventKey}`, (res: any) => {
      setTimeout(() => {
        switch (res.type) {
          case 'cancel':
            cbCancel && cbCancel(res.data)
            break
          case 'confirm':
            cbConfirm && cbConfirm(res.data)
            break
        }
      }, 100)
    })
    uni.navigateTo({ url: Router.pathBuild(path, Object.assign({ _e_: eventKey }, param)) })
  },

  /** 重启应用 */
  relaunch() {
    uni.reLaunch({ url: AppSetting.route.home })
  },

  /** 返回上一页 */
  back(delta = 1) {
    uni.navigateBack({ delta })
  },

  /** 触发事件并返回 */
  fireAndBack(path: string, event: string, param: Record<string, any> = {}) {
    Router.fire(path, event, param)
    Router.back()
  },

  /** 向指定页面发送事件 */
  fire(path: string, event: string, param: Record<string, any> = {}) {
    if (path.match(/^[a-zA-Z0-9_]+$/)) {
      path = '/' + path
    }
    const pages = getCurrentPages() as any[]
    pages.forEach((p) => {
      const pPath: string = p.route || ''
      if (pPath.endsWith(path)) {
        // #ifdef H5
        p['onRouterEvent'] && p['onRouterEvent'](event, param)
        // #endif
        // #ifdef APP-PLUS || MP-WEIXIN
        p.$vm && p.$vm['onRouterEvent'] && p.$vm['onRouterEvent'](event, param)
        // #endif
      }
    })
  },

  /** 构建外部 URL（含 query）*/
  urlBuild(url: string, param: Record<string, any> = {}) {
    const queryStr = Object.keys(param)
      .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(param[k])}`)
      .join('&')
    return queryStr ? `${url}?${queryStr}` : url
  },

  /** 获取当前页面实例 */
  getPage() {
    const pages = getCurrentPages()
    return pages[pages.length - 1] as any
  },

  /** 获取当前路径 + query 字符串 */
  pathWithQueries() {
    return Router.pathBuild(Router.path(), Router.getQueries())
  },

  /** 构建内部路径（以 / 开头，含 query）*/
  pathBuild(path: string, param: Record<string, any> = {}) {
    if (!path.startsWith('/')) path = '/' + path
    const queryStr = Object.keys(param)
      .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(param[k])}`)
      .join('&')
    return queryStr ? `${path}?${queryStr}` : path
  },

  /** 获取当前页面路径 */
  path(): string {
    const page = Router.getPage()
    let path = ''
    // #ifdef H5
    try {
      path = page.$route?.path || ''
    } catch (e) {}
    // #endif
    // #ifdef MP-WEIXIN
    path = page?.route || ''
    // #endif
    // #ifdef APP-PLUS
    path = page?.route || ''
    // #endif
    if (!path.startsWith('/')) path = '/' + path
    if (path === '/') path = AppSetting.route.home
    return path
  },

  /** 解析 H5 URL（仅 H5 端有效）*/
  parseH5Url(url?: string): any {
    // #ifdef H5
    url = url || window.location.href
    const parser = document.createElement('a')
    parser.href = url
    const param: Record<string, string> = {}
    const pairs = (parser.search || '?').substring(1).split('&')
    for (const pair of pairs) {
      const pos = pair.indexOf('=')
      if (pos === -1) continue
      param[pair.substring(0, pos)] = decodeURIComponent(pair.substring(pos + 1))
    }
    return {
      protocol: parser.protocol,
      host: parser.host,
      hostname: parser.hostname,
      port: parser.port,
      pathname: parser.pathname,
      hash: parser.hash,
      search: parser.search,
      origin: parser.origin,
      param,
    }
    // #endif
    return {}
  },

  /** 将路径转为完整 H5 URL */
  pathToUrl(url?: string): string {
    url = url || Router.pathWithQueries()
    // #ifdef H5
    const wl = window.location
    return `${wl.protocol}//${wl.host}${wl.pathname}#${url}`
    // #endif
    return url
  },

  /** 获取当前页 query 参数（对象格式） */
  getQueries(): Record<string, string> {
    const page = Router.getPage()
    const result: Record<string, string> = {}
    try {
      // #ifdef H5
      const vmQuery = (page as any)?.$vm?.$mp?.query || (page as any)?.$route?.query || {}
      Object.keys(vmQuery).forEach((k) => {
        result[decodeURIComponent(k)] = decodeURIComponent(vmQuery[k])
      })
      // #endif
      // #ifdef MP-WEIXIN
      const q = (page as any)?.$vm?.$mp?.query || (page as any)?.options || {}
      Object.keys(q).forEach((k) => {
        result[decodeURIComponent(k)] = decodeURIComponent(q[k])
      })
      // #endif
      // #ifdef APP-PLUS
      const opts = (page as any)?.$page?.options || (page as any)?.$vm?.$page?.options || (page as any)?.options || {}
      Object.keys(opts).forEach((k) => {
        result[decodeURIComponent(k)] = decodeURIComponent(opts[k])
      })
      // #endif
    } catch (e) {}
    return result
  },

  /** 获取指定 query 参数 */
  getQuery(name: string, defaultValue: string | null = null): string | null {
    const queries = Router.getQueries()
    return name in queries ? queries[name] : defaultValue
  },

  /** 获取整数类型的 query 参数 */
  getQueryInteger(name: string): number {
    const value = Router.getQuery(name, '0')
    const v = parseInt(value || '0')
    return isNaN(v) ? 0 : v
  },

  /** 获取 JSON 类型的 query 参数 */
  getQueryJson(name: string): any {
    const query = Router.getQuery(name, '{}')
    try {
      return JSON.parse(query || '{}')
    } catch (e) {
      try {
        return JSON.parse(decodeURIComponent(query || '{}'))
      } catch (e2) {}
      return {}
    }
  },

  /** 获取以分隔符分隔的整数数组参数 */
  getQueryStringSeperatedIntegers(name: string, defaultValue: number[] = [], seperator = ','): number[] {
    const value = Router.getQuery(name)
    if (value) return value.split(seperator).map((o) => parseInt(o))
    return defaultValue
  },

  /** 路由模式 */
  mode() {
    return Router.MODE_HASH
  },

  MODE_HISTORY: 'history',
  MODE_HASH: 'hash',
}

export const router = Router
export default Router
