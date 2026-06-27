import { reactive } from 'vue'

// 全局 SystemConfig（屏幕尺寸等信息）
export interface SystemConfigType {
  OSName: string
  Platform: string | null
  Brand: string
  BrowserName?: string
  BrowserVersion?: string
  StatusHeightRaw: number
  StatusHeight: number
  HeadHeight: number
  HeadMenuWidth: number
  HeadHeightTotal: number
  FootHeight: number
  FootStatusHeight: number
  FootHeightTotal: number
  Width: number
  Height: number
}

// 默认 SystemConfig
export const defaultSystemConfig: SystemConfigType = {
  OSName: 'browser',
  Platform: 'browser',
  Brand: '',
  StatusHeightRaw: 0,
  StatusHeight: 0,
  HeadHeight: 50,
  HeadMenuWidth: 0,
  HeadHeightTotal: 50,
  FootHeight: 50,
  FootStatusHeight: 0,
  FootHeightTotal: 50,
  Width: 375,
  Height: 667,
}

// 全局 SystemConfig（launch() 中 Object.assign 更新；使用 reactive 以便异步写入后依赖它的 computed 能重算）
export const SystemConfig = reactive<SystemConfigType>({ ...defaultSystemConfig })
