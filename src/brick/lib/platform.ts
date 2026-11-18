/**
 * 运行时平台判定 + 开发期平台模拟
 *
 * 真实平台由条件编译决定：微信小程序 / App 用 popup 登录弹窗，其余（H5）降级到登录页。
 * 为了让 H5 也能看到、断言并截图这套弹窗，开发期允许把平台「模拟」成原生端：
 *
 *   localStorage.setItem('sim-platform', 'mp-weixin')   // 或 'app'
 *   localStorage.setItem('sim-os', 'ios')               // App 模拟时伪造 iOS（出现 Apple 登录）
 *   或直接访问 http://localhost:21000/?sim-platform=app#/pages/calendar
 *
 * 模拟相关代码全部包在 `#ifdef H5` 里：小程序 / App 的包里不会出现 H5 的调试逻辑。
 * H5 也只在 dev（或打包时显式设置 VITE_SIMULATE_PLATFORM）生效，生产包不受影响。
 */

export type RuntimePlatform = 'h5' | 'mp-weixin' | 'mp' | 'app'
export type SimulatedPlatform = '' | 'mp-weixin' | 'app'

/** 编译期平台，不受模拟影响 */
function compiledPlatform(): RuntimePlatform {
  let platform: RuntimePlatform = 'h5'
  // #ifdef MP
  platform = 'mp'
  // #endif
  // #ifdef MP-WEIXIN
  platform = 'mp-weixin'
  // #endif
  // #ifdef APP-PLUS
  platform = 'app'
  // #endif
  return platform
}

// #ifdef H5
const SIM_PLATFORM_KEY = 'sim-platform'
const SIM_OS_KEY = 'sim-os'

/** 模拟开关是否可用：H5 开发服务器，或打包时显式打开 */
function simulationAllowed(): boolean {
  return process.env.NODE_ENV === 'development' || !!import.meta.env.VITE_SIMULATE_PLATFORM
}

/** 取值优先级：地址栏 > 本地存储 > 打包环境变量 */
function readSim(key: string, envValue?: string): string {
  if (!simulationAllowed()) return ''
  try {
    const fromUrl = new URLSearchParams(location.search).get(key) || ''
    if (fromUrl) return fromUrl
  } catch {}
  try {
    const stored = String(uni.getStorageSync(key) || '')
    if (stored) return stored
  } catch {}
  return envValue || ''
}
// #endif

/** 当前被模拟的平台（未模拟返回空字符串）；原生端恒为空 */
export function getSimulatedPlatform(): SimulatedPlatform {
  let value = ''
  // #ifdef H5
  value = readSim(SIM_PLATFORM_KEY, import.meta.env.VITE_SIMULATE_PLATFORM)
  // #endif
  return value === 'mp-weixin' || value === 'app' ? value : ''
}

/** 是否处于「H5 假扮原生端」的模拟状态 */
export function isPlatformSimulated(): boolean {
  return getSimulatedPlatform() !== ''
}

/** 模拟 App 时伪造的系统（仅 'ios' 有含义），用于查看/测试 iOS 专属按钮 */
export function getSimulatedOS(): string {
  let os = ''
  // #ifdef H5
  os = readSim(SIM_OS_KEY)
  // #endif
  return os === 'ios' ? 'ios' : ''
}

let cachedPlatform: RuntimePlatform | null = null

/** 当前运行平台（已合并模拟，进程内只解析一次） */
export function getRuntimePlatform(): RuntimePlatform {
  if (!cachedPlatform) {
    cachedPlatform = getSimulatedPlatform() || compiledPlatform()
  }
  return cachedPlatform
}

/** 该平台是否使用 popup 登录弹窗：微信小程序、App 支持，其余走登录页 */
export function useLoginDialogPlatform(): boolean {
  const platform = getRuntimePlatform()
  return platform === 'mp-weixin' || platform === 'app'
}
