import { defineStore } from 'pinia'

// 如厕日记录状态管理
export const useRucerijiStore = defineStore('ruceriji', {
  state: () => ({
    recordChanged: true,
  }),
  actions: {
    setRecordChanged(value: boolean) {
      this.recordChanged = value
    },
  },
})
