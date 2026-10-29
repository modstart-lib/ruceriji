/// <reference types='@dcloudio/types' />
import 'vue'

declare module '@vue/runtime-core' {
  type Hooks = App.AppInstance & Page.PageInstance;

  interface ComponentCustomOptions extends Hooks {

  }
}

// 环境变量（.env.[mode].local），H5 的接口域名由 vite proxy 承担，小程序 / App 用 VITE_API_BASE
interface ImportMetaEnv {
  readonly VITE_API_BASE?: string
  readonly VITE_PROXY_TARGET?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
