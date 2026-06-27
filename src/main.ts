import './config/theme.less'

import * as Pinia from 'pinia'
import uviewPlus from 'uview-plus'
import { createSSRApp } from 'vue'
import App from './App.vue'
import { BrickUni } from './brick/BrickUni'
import { Bootstrap } from './config/bootstrap'
import { i18n } from './locales'

// 全局组件

export function createApp() {
  const app = createSSRApp(App)
  const store = Pinia.createPinia()
  app.use(store)
  app.use(uviewPlus)
  app.use(i18n)

  // BrickUni 框架初始化
  BrickUni.init()

  Bootstrap.init()

  return { app, Pinia }
}
