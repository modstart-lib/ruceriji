import { defineStore } from 'pinia'

interface UserInfo {
  id: number
  nickname: string
  avatar: string
  mobile: string
  email: string
  token?: string
  [key: string]: any
}

// 用户状态管理
export const useUserStore = defineStore('user', {
  state: () => ({
    token: (uni.getStorageSync('api-token') as string) || '',
    user: {
      id: 0,
      nickname: '',
      avatar: '',
      mobile: '',
      email: '',
    } as UserInfo,
    userInit: false,
  }),
  getters: {
    isLogin: (state) => state.user.id > 0,
  },
  actions: {
    setToken(token: string) {
      this.token = token
      uni.setStorageSync('api-token', token)
    },
    setUser(user: UserInfo | null) {
      this.user = user || { id: 0, nickname: '', avatar: '', mobile: '', email: '' }
      this.userInit = true
    },
    logout() {
      this.token = ''
      this.user = { id: 0, nickname: '', avatar: '', mobile: '', email: '' }
      uni.removeStorageSync('api-token')
    },
    // 等待用户初始化完成
    waitUserReady(cb: () => void) {
      if (this.userInit) {
        cb()
        return
      }
      const timer = setInterval(() => {
        if (this.userInit) {
          clearInterval(timer)
          cb()
        }
      }, 50)
    },
  },
})
