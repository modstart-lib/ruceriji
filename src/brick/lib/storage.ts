export const Storage = {
  set(key: string, value: any) {
    try {
      uni.setStorageSync(key, JSON.stringify(value))
    } catch (e) {
      console.error('Storage.set error', e)
    }
  },

  get<T = any>(key: string, defaultValue: T | null = null): T | null {
    try {
      const val = uni.getStorageSync(key)
      if (val === null || val === undefined || val === '') {
        return defaultValue
      }
      return JSON.parse(val) as T
    } catch (e) {
      return defaultValue
    }
  },

  remove(key: string) {
    try {
      uni.removeStorageSync(key)
    } catch (e) {
      console.error('Storage.remove error', e)
    }
  },

  clear() {
    try {
      uni.clearStorageSync()
    } catch (e) {
      console.error('Storage.clear error', e)
    }
  },

  pull<T = any>(key: string, defaultValue: T | null = null): T | null {
    const value = this.get<T>(key, defaultValue)
    this.remove(key)
    return value
  },

  getArray<T = any>(key: string, defaultValue: T[] = []): T[] {
    const value = this.get(key)
    if (value === null || !Array.isArray(value)) {
      return defaultValue
    }
    return value as T[]
  },

  getObject<T = any>(key: string, defaultValue: T = {} as T): T {
    const value = this.get(key)
    if (value === null || Array.isArray(value)) {
      return defaultValue
    }
    if (typeof value === 'object') {
      return value as T
    }
    return defaultValue
  },
}

export default Storage
