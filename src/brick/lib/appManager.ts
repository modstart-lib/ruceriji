import { api } from '@/brick/lib/api'
import { Storage } from './storage'
import { VersionManager } from './version'

const UUID_KEY = 'app_manager_uuid'

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16).toUpperCase()
  })
}

function getOrCreateUUID(): string {
  // #ifdef APP-PLUS
  try {
    // @ts-ignore
    const deviceUUID = plus.device.uuid
    if (deviceUUID) return deviceUUID
  } catch (e) {}
  // #endif
  let uuid = Storage.get<string>(UUID_KEY)
  if (!uuid) {
    uuid = generateUUID()
    Storage.set(UUID_KEY, uuid)
  }
  return uuid
}

function getPlatformInfo(): { name: string; arch: string; version: string } {
  let name = ''
  let arch = ''
  let version = ''
  // #ifdef H5
  name = 'h5'
  if (typeof navigator !== 'undefined') {
    const ua = navigator.userAgent.toLowerCase()
    arch = ua.includes('win') ? 'windows' : ua.includes('mac') ? 'macos' : ua.includes('linux') ? 'linux' : ''
  }
  // #endif
  // #ifdef MP-WEIXIN
  try {
    const sys = uni.getSystemInfoSync()
    name = 'mp_weixin'
    arch = sys.platform || ''
    version = sys.system || ''
  } catch (e) {}
  // #endif
  // #ifdef APP-PLUS
  try {
    // @ts-ignore
    name = (plus.os.name || '').toLowerCase()
    // @ts-ignore
    arch = plus.os.arch || ''
    // @ts-ignore
    version = plus.os.version || ''
  } catch (e) {}
  // #endif
  return { name, arch, version }
}

export const AppManager = {
  collect() {
    const uuid = getOrCreateUUID()
    const version = VersionManager.version()
    const platform = getPlatformInfo()
    const data = [{ name: 'visit', data: { time: Date.now() } }]
    api.post('app_manager/collector', { uuid, version, data, platform }, null, null, { silent: true })
  },
}
