import { AppSetting } from '@/config/setting'
import { useUserStore } from '@/store/user'
import { useBrickBaseStore } from './composables/useBaseStore'
import { EntryProcessorUtil } from './lib/entry-processor'
import { EventBus } from './lib/event-bus'
import { Router } from './lib/router'
import { Storage } from './lib/storage'
import type { SystemConfigType } from './lib/system-config'
import { SystemConfig, defaultSystemConfig } from './lib/system-config'
import { AgentUtil } from './lib/ui'
export { SystemConfig, defaultSystemConfig }
export type { SystemConfigType }

/**
 * Starter - 应用启动守卫
 * 提供 boot(cb) 方法，等待应用初始化后执行回调
 */
export const Starter = {
  boot(cb: () => void) {
    try {
      const baseStore = useBrickBaseStore()
      if (!baseStore.init) {
        setTimeout(() => Starter.boot(cb), 10)
        return
      }
    } catch (e) {
      setTimeout(() => Starter.boot(cb), 100)
      return
    }
    cb && cb()
  },
}

export const delay = (cb: () => void, ms = 100, validate?: () => boolean) => {
  const check = () => {
    if (!validate || validate()) {
      cb()
    } else {
      setTimeout(check, ms)
    }
  }
  setTimeout(check, ms)
}

export const hasModule = (m: string): boolean => {
  try {
    const baseStore = useBrickBaseStore()
    return baseStore.config?.modules?.includes(m) ?? false
  } catch (e) {
    return false
  }
}

const BEACON_URL = 'https://g.tecmz.com/grow/load.gif'
const DEVICE_ID_KEY = '__brick_did'

let _sessionId = ''
const _getSessionId = () => {
  if (!_sessionId) {
    _sessionId = `s${Date.now()}${Math.random().toString(36).slice(2, 8)}`
  }
  return _sessionId
}

const _getDeviceId = () => {
  try {
    let did = uni.getStorageSync(DEVICE_ID_KEY)
    if (!did) {
      did = `d${Date.now()}${Math.random().toString(36).slice(2, 10)}`
      uni.setStorageSync(DEVICE_ID_KEY, did)
    }
    return did as string
  } catch {
    return 'unknown'
  }
}

const _encodeEvents = (events: object[]): string => {
  const json = JSON.stringify(events)
  return encodeURIComponent(btoa(unescape(encodeURIComponent(json))))
}

const _sendBeacon = (appName: string, events: object[]) => {
  try {
    uni.request({
      url: `${BEACON_URL}?app=${encodeURIComponent(appName)}&data=${_encodeEvents(events)}`,
      method: 'GET',
      fail: () => {},
    })
  } catch {}
}

const _errorToProps = (error: unknown) => {
  let msg = ''
  let stack = ''
  if (error instanceof Error) {
    msg = error.message
    stack = error.stack || ''
  } else if (typeof error === 'string') {
    msg = error
  } else {
    try {
      msg = JSON.stringify(error)
    } catch {
      msg = String(error)
    }
  }
  return { msg, stack }
}

export const BrickUni = {
  /**
   * 初始化 - 在 createApp() 中调用
   */
  init() {},

  /**
   * 发送 crash 上报（返回 onError 回调函数）
   */
  sendCrash(appName: string): (error: unknown) => void {
    return (error: unknown) => {
      const storageKey = `__pending_crash_${appName}`
      const pages = getCurrentPages()
      const path = pages.length ? `/${pages[pages.length - 1].route || ''}` : ''
      const event = {
        et: 'crash',
        path,
        did: _getDeviceId(),
        sid: _getSessionId(),
        ts: Date.now(),
        props: _errorToProps(error),
      }
      try {
        uni.request({
          url: `${BEACON_URL}?app=${encodeURIComponent(appName)}&data=${_encodeEvents([event])}`,
          method: 'GET',
          fail: () => {
            try {
              uni.setStorageSync(storageKey, JSON.stringify({ appName, event }))
            } catch {}
          },
        })
      } catch {
        try {
          uni.setStorageSync(storageKey, JSON.stringify({ appName, event }))
        } catch {}
      }
    }
  },

  /**
   * 发送错误上报（返回 onError 回调函数）
   */
  sendError(appName: string): (error: unknown) => void {
    return (error: unknown) => {
      const pages = getCurrentPages()
      const path = pages.length ? `/${pages[pages.length - 1].route || ''}` : ''
      const event = {
        et: 'error',
        path,
        did: _getDeviceId(),
        sid: _getSessionId(),
        ts: Date.now(),
        props: _errorToProps(error),
      }
      _sendBeacon(appName, [event])
    }
  },

  /**
   * 重新发送上次未成功上报的 crash
   */
  flushPendingCrash(appName: string) {
    try {
      const storageKey = `__pending_crash_${appName}`
      const pending = uni.getStorageSync(storageKey)
      if (!pending) return
      uni.removeStorageSync(storageKey)
      const { appName: name, event } = JSON.parse(pending as string)
      _sendBeacon(name, [event])
    } catch {}
  },

  /**
   * 页面启动守卫 - 检查登录状态，未登录跳转到登录页
   */
  starter(cb: () => void) {
    try {
      const baseStore = useBrickBaseStore()
      if (!baseStore.init) {
        setTimeout(() => BrickUni.starter(cb), 10)
        return
      }
    } catch (e) {
      setTimeout(() => BrickUni.starter(cb), 100)
      return
    }

    const path = Router.path()
    const pathWithQueries = Router.pathWithQueries()

    if (EntryProcessorUtil.detectAndProcess()) {
      return
    }

    // H5 端自动 frame 处理
    // #ifdef H5
    if ((AppSetting as any).h5AutoFrame && !AgentUtil.isMobile() && !AgentUtil.isFrame()) {
      const frameRoute = (AppSetting as any).route?.frame
      if (frameRoute && !pathWithQueries.startsWith(frameRoute)) {
        const l = window.location
        const frameUrl = Router.pathBuild(frameRoute, { url: pathWithQueries })
        window.location.replace(`${l.protocol}//${l.host}${l.pathname}#${frameUrl}`)
        return
      }
    }
    // #endif

    if (AppSetting.route.authIgnores.includes(path)) {
      cb && cb()
      return
    }

    const checkUser = () => {
      try {
        const userStore = useUserStore()
        const apiToken = Storage.get(AppSetting.tokenKey, '')
        if (!apiToken || !userStore.user.id) {
          Router.replace(AppSetting.route.login, { redirect: pathWithQueries })
        } else {
          cb && cb()
        }
      } catch (e) {
        cb && cb()
      }
    }

    try {
      const userStore = useUserStore()
      if (!userStore.userInit) {
        EventBus.$emitDelay('UpdateApp', checkUser)
        return
      }
    } catch (e) {}

    checkUser()
  },

  /**
   * 组件启动守卫 - 等待应用配置加载完成
   */
  starterComponent(cb: () => void) {
    try {
      const baseStore = useBrickBaseStore()
      if (!baseStore.init) {
        setTimeout(() => BrickUni.starterComponent(cb), 100)
        return
      }
    } catch (e) {
      setTimeout(() => BrickUni.starterComponent(cb), 100)
      return
    }
    cb && cb()
  },

  /**
   * 应用启动（计算屏幕尺寸、自动更新等）
   */
  launch(cb?: () => void) {
    try {
      const baseStore = useBrickBaseStore()
      baseStore.SET_DARK_MODE((AppSetting as any).uiDefaultDarkMode ?? false)
    } catch (e) {}

    const calcSystemConfig = () => {
      uni.getSystemInfo({
        success: (e: any) => {
          const cfg: SystemConfigType = {
            OSName: e.osName || 'browser',
            Platform: null,
            Brand: e.deviceBrand || '',
            BrowserName: e.browserName,
            BrowserVersion: e.browserVersion,
            StatusHeightRaw: e.statusBarHeight || 0,
            StatusHeight: e.statusBarHeight || 0,
            HeadHeight: 50,
            HeadMenuWidth: 0,
            HeadHeightTotal: 50,
            FootHeight: 50,
            FootStatusHeight: (e.windowHeight || 0) - (e.safeArea?.bottom || e.windowHeight || 0),
            FootHeightTotal: 50,
            Width: e.windowWidth || 375,
            Height: e.windowHeight || 667,
          }

          // #ifdef H5
          cfg.Platform = 'browser'
          // #endif
          // #ifdef APP-PLUS
          if (e.osName === 'android') cfg.Platform = 'android'
          else if (e.osName === 'ios') cfg.Platform = 'ios'
          // #endif
          // #ifdef MP-WEIXIN
          try {
            const button = wx.getMenuButtonBoundingClientRect()
            const centerY = (button.top + button.bottom) / 2
            cfg.StatusHeight = centerY - cfg.HeadHeight / 2
            cfg.HeadMenuWidth = button.width + (cfg.Width - button.right) * 2
          } catch (ex) {}
          // #endif

          cfg.HeadHeightTotal = cfg.StatusHeight + cfg.HeadHeight
          cfg.FootHeightTotal = cfg.FootHeight + cfg.FootStatusHeight

          // 更新全局 SystemConfig
          Object.assign(SystemConfig, cfg)

          cb && cb()
        },
      })
    }

    const autoUpdate = () => {
      // #ifdef MP-WEIXIN
      try {
        const updateManager = wx.getUpdateManager()

        // Triggered when the update check result is returned
        updateManager.onCheckForUpdate((res: any) => {
          if (!res.hasUpdate) return

          // New version download completed, prompt user to restart
          updateManager.onUpdateReady(() => {
            wx.showModal({
              title: '发现新版本',
              content: '新版本已下载完成，重启即可使用，是否立即重启？',
              confirmText: '立即重启',
              cancelText: '稍后再说',
              success: (modalRes: any) => {
                if (modalRes.confirm) {
                  // User confirmed: apply update and restart
                  updateManager.applyUpdate()
                }
                // User cancelled: do nothing, continue using current version
              },
            })
          })

          // New version download failed, guide user to manually update
          updateManager.onUpdateFailed(() => {
            wx.showModal({
              title: '更新失败',
              content: '新版本下载失败，请删除小程序后重新搜索打开以获取最新版本',
              showCancel: false,
              confirmText: '我知道了',
            })
          })
        })
      } catch (e) {}
      // #endif
    }

    calcSystemConfig()
    autoUpdate()

    // #ifdef H5
    window.addEventListener('resize', () => {
      calcSystemConfig()
    })
    // #endif
  },

  /**
   * nvue 页面准备（APP-PLUS-NVUE 端）
   */
  nvuePrepare(cb?: () => void) {
    // #ifdef APP-PLUS-NVUE
    try {
      const domModule = uni.requireNativePlugin('dom')
      domModule.addRule('fontFace', {
        fontFamily: 'iconfont',
        src: "url('https://at.alicdn.com/t/c/font_2778046_0ohcvg48ojin.ttf')",
      })
    } catch (e) {}
    // #endif

    BrickUni.launch(() => {
      cb && cb()
    })
  },
}

export default BrickUni
