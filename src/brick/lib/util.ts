/**
 * 通用工具函数 - 适配 Vue3 + TypeScript 版本
 * 移除 jQuery、md5、js-base64 等外部依赖，使用原生实现
 */

export const StrUtil = {
  randomString(len = 32): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < len; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  },

  matchWildcard(text: string, pattern: string): boolean {
    const escapeRegex = (str: string) => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1')
    const regPattern = '^' + pattern.split('*').map(escapeRegex).join('.*') + '$'
    return new RegExp(regPattern).test(text)
  },

  keywordsMatchWildcard(text: string, pattern: string): boolean {
    const escapeRegex = (str: string) => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1')
    const regPattern = pattern.split('*').map(escapeRegex).join('.*')
    return new RegExp(regPattern).test(text)
  },

  urlencode(str: string): string {
    return encodeURIComponent(str)
  },

  urldecode(str: string): string {
    return decodeURIComponent(str)
  },

  uuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  },
}

export const BeanUtil = {
  /** @deprecated */
  assign(bean: Record<string, any>, valueMap: Record<string, any>) {
    Object.keys(bean).forEach((k) => {
      bean[k] = valueMap[k]
    })
  },

  update(bean: Record<string, any>, valueMap: Record<string, any>) {
    Object.keys(valueMap).forEach((k) => {
      bean[k] = valueMap[k]
    })
  },

  equal(o1: any, o2: any): boolean {
    return JSON.stringify(o1) === JSON.stringify(o2)
  },

  clone<T = any>(obj: T): T {
    return JSON.parse(JSON.stringify(obj))
  },
}

export const JsonUtil = {
  clone<T = any>(obj: T): T {
    return JSON.parse(JSON.stringify(obj))
  },

  equal(o1: any, o2: any): boolean {
    return JSON.stringify(o1) === JSON.stringify(o2)
  },

  notEqual(o1: any, o2: any): boolean {
    return !JsonUtil.equal(o1, o2)
  },

  clearObject(obj: Record<string, any>) {
    for (const k in obj) {
      const type = typeof obj[k]
      if (type === 'string') obj[k] = ''
      else if (type === 'number') obj[k] = 0
    }
  },
}

export const ConstUtil = {
  constToIdNameList(constObject: Record<string, { value: any; name: string }>) {
    return Object.keys(constObject).map((k) => ({
      id: constObject[k].value,
      name: constObject[k].name,
    }))
  },
}

export const ScriptUtil = {
  loadScript(url: string, cb?: (res: { isNew: boolean }) => void) {
    // #ifdef H5
    const id = 's_' + url.replace(/[^a-zA-Z0-9]/g, '_')
    let script = document.getElementById(id) as HTMLScriptElement | null
    if (script) {
      cb && cb({ isNew: false })
      return
    }
    script = document.createElement('script')
    script.id = id
    script.src = url
    script.onload = () => {
      cb && cb({ isNew: true })
    }
    document.getElementsByTagName('head')[0].appendChild(script)
    // #endif
  },

  loadScriptsInOrder(urls: string[], cb?: () => void) {
    let i = 0
    const load = () => {
      if (i >= urls.length) {
        cb && cb()
        return
      }
      ScriptUtil.loadScript(urls[i], () => {
        i++
        load()
      })
    }
    load()
  },
}

// Base64 工具（使用内置 atob/btoa + TextEncoder）
export const Base64Util = {
  encode(str: string): string {
    try {
      // #ifdef H5
      return btoa(
        encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_match, p1) => String.fromCharCode(parseInt(p1, 16)))
      )
      // #endif
    } catch (e) {
      return ''
    }
  },

  decode(str: string): string {
    try {
      // #ifdef H5
      return decodeURIComponent(
        atob(str)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      // #endif
    } catch (e) {
      return ''
    }
  },

  base64UrlSafeEncode(str: string): string {
    return Base64Util.encode(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  },

  base64UrlSafeDecode(str: string): string {
    return Base64Util.decode(str.replace(/-/g, '+').replace(/_/g, '/').replace(/ /g, '+'))
  },
}
