/**
 * useRouterCallback - 路由回调页面模式的 Composition API
 * 替代 RouterStartForCallbackMixin, RouterCallbackIdSelectorMixin, RouterCallbackIdsSelectorMixin
 */
import { ref, computed, watch, onMounted } from 'vue'
import { Starter } from '@/brick/BrickUni'
import { Router } from '@/brick/lib/router'

export function useRouterCallback(initFn?: () => void) {
  const _e_ = ref<string | null>(null)
  const isInit = ref(false)
  const config = ref<Record<string, any>>({})
  const value = ref<any>(null)

  const isCallbackPage = computed(() => !!_e_.value)

  onMounted(() => {
    _e_.value = Router.getQuery('_e_')
    const initDataKey = `Router.startForCallback.InitData.${_e_.value}`
    let initData: any = uni.getStorageSync(initDataKey)
    initData = initData || { value: null, config: {} }
    uni.removeStorageSync(initDataKey)
    config.value = initData.config || {}
    value.value = initData.value ?? null
    isInit.value = true
  })

  // onReady equivalent - boot then call init
  const _bootAndInit = () => {
    Starter.boot(() => {
      const tryInit = () => {
        if (!isInit.value) {
          setTimeout(tryInit, 10)
          return
        }
        initFn && initFn()
      }
      tryInit()
    })
  }

  onMounted(() => {
    // Delay to ensure Starter can boot
  })

  function callbackCancel(data?: any) {
    uni.$emit(`Router.startForCallback.${_e_.value}`, { type: 'cancel', data })
    Router.back()
  }

  function callbackConfirm(data?: any, backIgnore = false) {
    uni.$emit(`Router.startForCallback.${_e_.value}`, { type: 'confirm', data })
    if (!backIgnore) Router.back()
  }

  return {
    _e_,
    isInit,
    config,
    value,
    isCallbackPage,
    callbackCancel,
    callbackConfirm,
    bootAndInit: _bootAndInit,
  }
}

export function useRouterCallbackIdSelector(valueRef?: any) {
  const selectId = ref(0)

  if (valueRef) {
    watch(
      valueRef,
      (n: any) => {
        if (n !== selectId.value) {
          selectId.value = n
        }
      },
      { immediate: true }
    )
  }

  function isId(id: any): boolean {
    return selectId.value === id
  }

  function doSelect(id: any) {
    selectId.value = id
  }

  return { selectId, isId, doSelect }
}

export function useRouterCallbackIdsSelector(valueRef?: any) {
  const selectIds = ref<any[]>([])

  if (valueRef) {
    watch(
      valueRef,
      (n: any) => {
        if (Array.isArray(n) && JSON.stringify(n) !== JSON.stringify(selectIds.value)) {
          selectIds.value = n
        }
      },
      { immediate: true }
    )
  }

  function hasId(id: any): boolean {
    return selectIds.value?.includes(id)
  }

  function doSelect(id: any, config?: any) {
    const ids = selectIds.value
    if (ids.includes(id)) {
      ids.splice(ids.indexOf(id), 1)
    } else {
      if (config?.max && config.max > 0 && config.max <= ids.length) {
        return false // signal max exceeded
      }
      ids.push(id)
    }
    return true
  }

  return { selectIds, hasId, doSelect }
}
