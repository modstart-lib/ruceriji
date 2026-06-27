import { AppSetting, SystemSetting } from '@/config/setting'
import { useUserStore } from '@/store/user'
import { Dialog } from './dialog'

interface RequestOptions {
  debug?: boolean
  silent?: boolean
}

function getApiBase(): string {
  // #ifdef H5
  if (typeof window !== 'undefined' && (window as any).__msApi) {
    return (window as any).__msApi
  }
  // #endif
  return SystemSetting.apiBase || '/api/'
}

function request(url: string, data: Record<string, any> = {}, options: RequestOptions = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    const userStore = useUserStore()
    const tokenKey = AppSetting.tokenKey || 'api-token'
    const token = userStore.token || uni.getStorageSync(tokenKey) || ''

    const baseUrl = getApiBase()
    const fullUrl = baseUrl + url

    if (options.debug || SystemSetting.apiDebug) {
      console.log('[API]', fullUrl, data)
    }

    uni.request({
      url: fullUrl,
      method: 'POST',
      data,
      header: {
        'Content-Type': 'application/json',
        [tokenKey]: token,
      },
      success: (res: any) => {
        if (options.debug || SystemSetting.apiDebug) {
          console.log('[API Response]', fullUrl, res.data)
        }
        if (res.header) {
          const newToken = res.header[tokenKey] || res.header[tokenKey.toLowerCase()]
          if (newToken) {
            const us = useUserStore()
            us.setToken(newToken)
          }
        }
        const resData = res.data
        if (resData && resData.code === 0) {
          resolve(resData)
        } else {
          const msg = resData && resData.msg ? resData.msg : '请求失败'
          if (!options.silent) {
            uni.showToast({ title: msg, icon: 'none', duration: 2000 })
          }
          reject(resData)
        }
      },
      fail: (err: any) => {
        if (!options.silent) {
          uni.showToast({ title: '网络错误，请稍后重试', icon: 'none', duration: 2000 })
        }
        reject(err)
      },
    })
  })
}

// 获取当前 store 状态
const getApiState = () => {
  try {
    const userStore = useUserStore()
    return {
      baseUrl: SystemSetting.apiBase || '/api/',
      tokenKey: AppSetting.tokenKey || 'api-token',
      token: userStore.token || uni.getStorageSync(AppSetting.tokenKey || 'api-token') || '',
      debug: SystemSetting.apiDebug || false,
    }
  } catch (e) {
    return {
      baseUrl: SystemSetting.apiBase || '/api/',
      tokenKey: AppSetting.tokenKey || 'api-token',
      token: uni.getStorageSync(AppSetting.tokenKey || 'api-token') || '',
      debug: false,
    }
  }
}

const buildUrl = (path: string, param: Record<string, any> = {}, withToken = false): string => {
  const state = getApiState()
  if (withToken) {
    const tokenKey = state.tokenKey.replace(/-/g, '_')
    param[tokenKey] = state.token
  }
  const queryStr = Object.keys(param)
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(param[k])}`)
    .join('&')
  const fullUrl = state.baseUrl + path
  return queryStr ? `${fullUrl}?${queryStr}` : fullUrl
}

const doUpload = (
  apiUrl: string,
  param: { filePath: string; name?: string; formData?: Record<string, any> },
  successCb?: ((res: any) => void) | null,
  failCb?: ((res: any) => void) | null,
  option?: any
) => {
  const state = getApiState()
  const header: Record<string, any> = { 'is-ajax': true }
  if (state.token) {
    header[state.tokenKey] = state.token
  }
  uni.uploadFile({
    url: state.baseUrl + apiUrl,
    filePath: param.filePath,
    name: param.name || 'file',
    header,
    formData: param.formData || {},
    success: (res: any) => {
      let data: any = null
      try {
        data = JSON.parse(res.data)
      } catch (e) {
        data = res.data
      }
      if (res.statusCode !== 200) {
        failCb && failCb({ code: -1, msg: '上传失败:' + res.data })
      } else if (data && data.code === 0) {
        successCb && successCb(data)
      } else {
        failCb && failCb(data || { code: -1, msg: '上传失败' })
      }
    },
    fail: (res: any) => {
      failCb && failCb({ code: -1, msg: '网络错误' })
    },
  })
}

const doEventSource = (
  apiUrl: string,
  param: Record<string, any>,
  successCallback: (data: any) => void,
  errorCallback: (msg: string) => void,
  endCallback?: () => void
) => {
  endCallback = endCallback || (() => {})
  const fullUrl = buildUrl(apiUrl, param, true)

  // #ifdef MP-WEIXIN
  class WxEventSource {
    private url: string
    private listeners: Record<string, ((...args: any[]) => any)[]> = {}
    private requestTask: any = null

    constructor(url: string) {
      this.url = url
      this.connect()
    }

    connect() {
      this.requestTask = wx.request({
        url: this.url,
        enableChunked: true,
        responseType: 'text',
        method: 'GET',
        timeout: 300e3,
        success: (res: any) => {
          this.emit('success', res)
        },
        fail: () => {},
      })
      this.requestTask.onHeadersReceived((res: any) => {
        this.emit('open', res)
      })
      this.requestTask.onChunkReceived((res: any) => {
        this.handleChunk(res)
      })
    }

    handleChunk(res: any) {
      const arrayBuffer = res.data
      const uint8Array = new Uint8Array(arrayBuffer)
      let data: any = uni.arrayBufferToBase64(uint8Array)
      data = atob(data)
      const lines = data.split('\n\n')
      lines.forEach((line: string) => {
        if (!line.trim()) return
        if (line.startsWith('data:')) {
          const jsonStr = line.substring(5).trim()
          try {
            const json = JSON.parse(jsonStr)
            this.emit('message', { data: JSON.stringify(json) })
          } catch (e) {
            this.emit('error', 'ParseError:' + e)
          }
        }
      })
    }

    addEventListener(event: string, callback: (...args: any[]) => any) {
      if (!this.listeners[event]) this.listeners[event] = []
      this.listeners[event].push(callback)
    }

    emit(event: string, data: any) {
      if (this.listeners[event]) {
        this.listeners[event].forEach((cb) => cb(data))
      }
    }

    close() {
      if (this.requestTask) this.requestTask.abort()
    }
  }
  const es = new WxEventSource(fullUrl) as any
  // #endif

  // #ifndef MP-WEIXIN
  const es = new EventSource(fullUrl) as any
  // #endif

  es.addEventListener('error', (error: any) => {
    errorCallback('ERROR:' + error)
    es.close()
  })
  es.addEventListener('message', (event: any) => {
    const json = JSON.parse(event.data)
    if (json && json.type) {
      switch (json.type) {
        case 'data':
          successCallback(json.data)
          break
        case 'error':
          errorCallback(json.data)
          es.close()
          break
        case 'end':
          endCallback && endCallback()
          es.close()
          break
      }
    } else {
      errorCallback('ERROR:' + JSON.stringify(json))
      es.close()
    }
  })

  return es
}

export const Api = {
  init(store?: any) {},

  post(
    url: string,
    param: Record<string, any>,
    successCb?: ((res: any) => void) | null,
    failCb?: ((err: any) => void) | null,
    option?: any
  ) {
    return request(url, param, option)
      .then((res: any) => {
        successCb && successCb(res)
        return res
      })
      .catch((err: any) => {
        failCb && failCb(err)
        return Promise.reject(err)
      })
  },

  postWithLoading(url: string, param: Record<string, any>, option?: any): Promise<any> {
    Dialog.loadingOn()
    return request(url, param, option)
      .then((res: any) => {
        Dialog.loadingOff()
        return res
      })
      .catch((err: any) => {
        Dialog.loadingOff()
        return Promise.reject(err)
      })
  },

  postCached(
    url: string,
    param: Record<string, any>,
    successCb?: ((res: any) => void) | null,
    failCb?: ((err: any) => void) | null,
    option?: any,
    cacheMinutes?: number
  ) {
    const cacheKey = `api_cache_${url}_${JSON.stringify(param)}`
    const cached = uni.getStorageSync(cacheKey)
    if (cached) {
      successCb && successCb(cached)
    }
    return request(url, param, option)
      .then((res: any) => {
        uni.setStorageSync(cacheKey, res)
        successCb && successCb(res)
        return res
      })
      .catch((err: any) => {
        failCb && failCb(err)
        return Promise.reject(err)
      })
  },

  postUpload: doUpload,
  url: buildUrl,
  eventSource: doEventSource,
}

export const api = Api
export default Api
