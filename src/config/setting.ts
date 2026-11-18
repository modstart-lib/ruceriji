// 应用配置
const isDev = process.env.NODE_ENV === 'development'

interface ConfigItem {
  version?: string
  apiDebug?: boolean
  apiBase?: string
}

const Configs: Record<string, ConfigItem> = {
  default: {
    version: '1.0.0',
    apiDebug: false,
    // #ifdef H5
    // H5 一律使用相对路径，域名由 dev 时的 vite proxy / 生产时的 nginx 决定
    apiBase: '/api/',
    // #endif
  },
  development: {
    apiDebug: false,
    // #ifndef H5
    apiBase: import.meta.env.VITE_API_BASE || 'https://ruceriji.com/api/',
    // #endif
  },
  production: {
    // #ifndef H5
    apiBase: import.meta.env.VITE_API_BASE || 'https://ruceriji.com/api/',
    // #endif
  },
}

export const SystemSetting: ConfigItem = Object.assign(
  {},
  Configs.default,
  Configs[process.env.NODE_ENV as string] || {}
)

export const AppSetting = {
  softName: 'ruceriji',
  channel: 'default',
  tokenKey: 'api-token',
  primaryColor: '#111111',
  route: {
    home: '/pages/wc',
    member: '/pages/member',
    login: '/brick/module/member/login',
    tabBar: ['/pages/wc', '/pages/calendar', '/pages/member'],
    authIgnores: [
      '/pages/wc',
      '/pages/calendar',
      '/pages/edit',
      '/pages/detail',
      '/pages/password',
      '/pages/password_verify',
      '/pages/member',
    ],
  },
}
