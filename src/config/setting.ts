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
    apiBase: '/api/',
    // #endif
  },
  development: {
    apiDebug: false,
    // #ifndef H5
    apiBase: 'https://ruceriji.com/api/',
    // #endif
  },
  production: {
    // #ifndef H5
    apiBase: 'https://ruceriji.com/api/',
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
