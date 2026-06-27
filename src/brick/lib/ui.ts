/**
 * UI 工具 - 适配 Vue3 版本
 * 移除 Vuex store 依赖，改用 app.config.globalProperties.SystemConfig
 */
import { AppSetting } from '@/config/setting'
import { useUserStore } from '@/store/user'
import { Dialog } from './dialog'
import { Router } from './router'

export const RouterTo = function (url: string, param?: Record<string, any>) {
  Router.to(url, param)
}

export const RouterWebUrl = function (url: string): string {
  if (url.startsWith('/pages')) return url
  return '/brick/module/system/web?url=' + encodeURI(url)
}

export const UserTipNotice = function (msg: string) {
  try {
    const userStore = useUserStore()
    if (userStore.user.id) {
      Dialog.tipError(msg)
    } else {
      Router.to(AppSetting.route.login, { redirect: AppSetting.route.home })
    }
  } catch (e) {
    Dialog.tipError(msg)
  }
}

// ua-parser-js 可选引入
let UAParser: any = null
try {
  UAParser = require('ua-parser-js')
} catch (e) {}

export const AgentUtil = {
  isMobile(ua?: string): boolean {
    try {
      ua = ua || window.navigator.userAgent
      if (UAParser) {
        const parser = new UAParser()
        const device = parser.setUA(ua).getDevice()
        return device.type === 'mobile'
      }
      return /mobile|android|iphone|ipad/i.test(ua)
    } catch (e) {
      return false
    }
  },

  isWechat(ua?: string): boolean {
    try {
      ua = ua || window.navigator.userAgent
      return /micromessenger/i.test(ua)
    } catch (e) {
      return false
    }
  },

  isFrame(): boolean {
    try {
      return window.parent !== window
    } catch (e) {
      return false
    }
  },
}

/** 获取 SystemConfig（从 globalProperties 或返回默认值）*/
const getSystemConfig = () => {
  try {
    // Vue 3 通过 globalProperties 访问
    const pages = getCurrentPages() as any[]
    if (pages.length > 0) {
      const page = pages[pages.length - 1]
      const vm = page.$vm || page
      if (vm && vm.SystemConfig) return vm.SystemConfig
    }
  } catch (e) {}
  return {
    OSName: 'browser',
    Platform: 'browser',
    StatusHeight: 0,
    StatusHeightRaw: 0,
    HeadHeight: 50,
    HeadMenuWidth: 0,
    HeadHeightTotal: 50,
    FootHeight: 50,
    FootStatusHeight: 0,
    FootHeightTotal: 50,
    Width: 375,
    Height: 667,
  }
}

export const UiScrollMixin = {
  data() {
    return { scrollTop: 0 }
  },
  onPageScroll(e: any) {
    ;(this as any).scrollTop = e.scrollTop
  },
  methods: {
    scrollIntoView(selector: string, duration = 300) {
      uni
        .createSelectorQuery()
        .select(selector)
        .boundingClientRect((data: any) => {
          if (data) {
            uni.pageScrollTo({ scrollTop: data.top + (this as any).scrollTop, duration })
          }
        })
        .exec()
    },
  },
}

export const UiMixin = {
  data() {
    return { lockBodyOverflowOldValue: null as string | null }
  },
  computed: {
    headHeightTotal(): string {
      return ((this as any).SystemConfig?.HeadHeightTotal ?? 50) + 'px'
    },
    footHeightTotal(): string {
      return ((this as any).SystemConfig?.FootHeightTotal ?? 50) + 'px'
    },
    headerStatusHeight(): string {
      return ((this as any).SystemConfig?.StatusHeight ?? 0) + 'px'
    },
    headerStatusHeightRaw(): string {
      return ((this as any).SystemConfig?.StatusHeightRaw ?? 0) + 'px'
    },
  },
  methods: {
    lockBodyScroll(enable: boolean) {
      // #ifdef H5
      if ((this as any).lockBodyOverflowOldValue === null) {
        ;(this as any).lockBodyOverflowOldValue = document.body.style.overflow
      }
      if (enable) {
        ;(this as any).lockBodyOverflowOldValue = document.body.style.overflow
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = (this as any).lockBodyOverflowOldValue || ''
      }
      // #endif
    },
  },
}

export const CustomPageStyleMixin = {
  data() {
    return { customPageStyle: null as string | null }
  },
  onHide() {
    ;(this as any).hidePageStyle()
  },
  onShow() {
    ;(this as any).showPageStyle()
  },
  methods: {
    setPageStyle(style: string) {
      ;(this as any).customPageStyle = style
      // #ifdef H5
      if (!style) return
      let dom = document.querySelector('#CustomPageStyle') as HTMLStyleElement
      if (!dom) {
        dom = document.createElement('style')
        dom.id = 'CustomPageStyle'
        document.head.appendChild(dom)
      }
      dom.innerHTML = style
      // #endif
    },
    showPageStyle() {
      // #ifdef H5
      const dom = document.querySelector('#CustomPageStyle') as HTMLStyleElement
      if (dom) dom.innerHTML = (this as any).customPageStyle || ''
      // #endif
    },
    hidePageStyle() {
      // #ifdef H5
      const dom = document.querySelector('#CustomPageStyle') as HTMLStyleElement
      if (dom) dom.innerHTML = ''
      // #endif
    },
  },
}
