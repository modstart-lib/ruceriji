/**
 * useOperation - 视图/编辑页面通用操作的 Composition API
 * 替代 ViewMixin / EditMixin
 */
import { ref } from 'vue'
import { Starter } from '@/brick/BrickUni'
import { dialog } from '@/brick/lib/dialog'

export function useView(initFn?: () => void) {
  const isInit = ref(false)
  const dataLoading = ref(true)
  const data = ref<any>({ id: 0 })

  function initPrepare(...args: any[]) {
    for (let i = 0; i < args.length; i++) {
      if (i === args.length - 1) {
        if (isInit.value) return
        isInit.value = true
        args[i]()
      } else {
        if (!args[i]) {
          setTimeout(() => initFn?.(), 100)
          return
        }
      }
    }
  }

  function bootAndInit() {
    dialog.loadingOn?.()
    Starter.boot(() => {
      initFn && initFn()
    })
  }

  return { isInit, dataLoading, data, initPrepare, bootAndInit }
}

export function useEdit(initFn?: () => void) {
  const isInit = ref(false)
  const data = ref<any>({ id: 0 })

  function initPrepare(...args: any[]) {
    for (let i = 0; i < args.length; i++) {
      if (i === args.length - 1) {
        if (isInit.value) return
        isInit.value = true
        args[i]()
      } else {
        if (!args[i]) {
          setTimeout(() => initFn?.(), 100)
          return
        }
      }
    }
  }

  function bootAndInit() {
    dialog.loadingOn?.()
    Starter.boot(() => {
      initFn && initFn()
    })
  }

  return { isInit, data, initPrepare, bootAndInit }
}
