import { defineStore } from 'pinia'

// 应用配置状态管理（后端下发的配置项）
export const useConfigStore = defineStore('config', {
  state: () => ({
    config: {} as Record<string, any>,
  }),
  actions: {
    setConfig(config: Record<string, any>) {
      this.config = config || {}
    },
  },
})

// 业务数据状态（biz：用户业务数据，如 totalRecord, totalDay 等）
export const useBizStore = defineStore('biz', {
  state: () => ({
    biz: null as Record<string, any> | null,
  }),
  actions: {
    setBiz(biz: Record<string, any> | null) {
      this.biz = biz || null
    },
  },
})
