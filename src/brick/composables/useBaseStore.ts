import { Storage } from '@/brick/lib/storage'
import { SystemConfig } from '@/brick/lib/system-config'
import { defineStore } from 'pinia'
import { computed } from 'vue'

export const useBrickBaseStore = defineStore('brickBase', {
  state: () => ({
    config: {} as Record<string, any>,
    lazy: {} as Record<string, any>,
    hashLazyValue: null as string | null,
    init: false,
    biz: {} as Record<string, any>,
    ui: {
      darkMode: null as boolean | null,
      theme: 'auto',
      defaultPageTitle: null as string | null,
    },
    page: {
      title: '',
    },
  }),
  actions: {
    SET_CONFIG(data: Record<string, any>) {
      this.config = data
      this.init = true
    },
    SET_BIZ(data: Record<string, any>) {
      this.biz = data
    },
    SET_LAZY(kv: [string, any]) {
      this.lazy[kv[0]] = kv[1]
    },
    SET_LAZY_VALUE_HASH(hashLazyValue: string) {
      this.hashLazyValue = hashLazyValue
    },
    SET_PAGE_TITLE(value: string) {
      this.page.title = value
    },
    SET_UI_DEFAULT_PAGE_TITLE(value: string | null) {
      this.ui.defaultPageTitle = value
    },
    SET_DARK_MODE(value: boolean | null) {
      this.ui.darkMode = value
      if (this.ui.darkMode === null) {
        this.ui.darkMode = Storage.get('darkMode', false) as boolean
      }
      Storage.set('darkMode', this.ui.darkMode)
      const theme = this.ui.darkMode ? 'dark' : 'light'
      this.ui.theme = theme
      // #ifdef H5
      document.querySelector('html')?.setAttribute('data-theme', theme)
      // #endif
      // #ifdef APP-PLUS
      ;(plus as any).nativeUI?.setUIStyle(theme)
      // #endif
    },
  },
})

export function useConfig() {
  const store = useBrickBaseStore()
  const config = computed(() => {
    try {
      return store.config
    } catch (e) {
      return {}
    }
  })
  const hasModule = (m: string): boolean => {
    try {
      return store.config?.modules?.includes(m) ?? false
    } catch (e) {
      return false
    }
  }
  return { config, SystemConfig, hasModule }
}

export function useUi() {
  const store = useBrickBaseStore()
  const ui = computed(() => {
    try {
      return store.ui
    } catch (e) {
      return { darkMode: false, theme: 'light', defaultPageTitle: null }
    }
  })

  function getPageDefaultTitle(defaultValue?: string): string | null {
    try {
      if (!store.ui.defaultPageTitle) return defaultValue || null
      const value = store.ui.defaultPageTitle
      store.SET_UI_DEFAULT_PAGE_TITLE(null)
      return value
    } catch (e) {
      return defaultValue || null
    }
  }

  function autoSetNavigationBarColor(headerColor?: string) {
    // #ifdef APP-PLUS
    try {
      let style = 'dark'
      if (ui.value?.theme === 'dark') style = 'light'
      if (headerColor && headerColor !== 'var(--color-text)') {
        const rgb = headerColor.match(/\d+/g)
        if (rgb) {
          const luma = 0.2126 * Number(rgb[0]) + 0.7152 * Number(rgb[1]) + 0.0722 * Number(rgb[2])
          style = luma < 128 ? 'dark' : 'light'
        }
      }
      plus.navigator.setStatusBarStyle(style)
    } catch (e) {}
    // #endif
  }

  return { ui, getPageDefaultTitle, autoSetNavigationBarColor, SystemConfig }
}
