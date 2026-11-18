/**
 * useSelector - 选择器通用模式的 Composition API
 * 替代 SelectorLabelNameMixin, SelectorIdNameMixin, SelectorIdNameDynamicMixin
 */
import { ref } from 'vue'
import { Router } from '@/brick/lib/router'
import { api } from '@/brick/lib/api'

export function useSelectorLabelName() {
  const selectorConfig = ref<any>(null)

  function doSelectProcess(url: string, config: any = {}, param: any = {}) {
    config = Object.assign({ selectedLabel: '', mode: 'single' }, config)
    selectorConfig.value = config
    Router.startForCallback(url, param, (res: any) => {
      onSelectResult(res)
    })
  }

  function onSelectResult(res: any) {
    console.log('useSelectorLabelName: implement onSelectResult', res)
  }

  return { selectorConfig, doSelectProcess, onSelectResult }
}

export function useSelectorIdName() {
  const selectorConfig = ref<any>(null)

  function doSelectProcess(url: string, config: any = {}, param: any = {}) {
    config = Object.assign({ selectedId: 0, mode: 'single' }, config)
    selectorConfig.value = config
    Router.startForCallback(url, param, (res: any) => {
      onSelectResult(res)
    })
  }

  function onSelectResult(res: any) {
    console.log('useSelectorIdName: implement onSelectResult', res)
  }

  return { selectorConfig, doSelectProcess, onSelectResult }
}

export function useSelectorIdNameDynamic() {
  const selectorConfig = ref<any>(null)
  const selectorOptions = ref<any[]>([])
  const selectorLoading = ref(false)

  function doSelectProcess(url: string, config: any = {}, param: any = {}) {
    config = Object.assign({ selectedId: 0, mode: 'single' }, config)
    selectorConfig.value = config
    Router.startForCallback(url, param, (res: any) => {
      onSelectResult(res)
    })
  }

  function onSelectResult(res: any) {
    console.log('useSelectorIdNameDynamic: implement onSelectResult', res)
  }

  function loadSelectorOptions(apiUrl: string, param: any = {}) {
    if (selectorLoading.value) return
    selectorLoading.value = true
    api
      .post(apiUrl, param)
      .then((res: any) => {
        selectorOptions.value = res.data || []
      })
      .finally(() => {
        selectorLoading.value = false
      })
  }

  return { selectorConfig, selectorOptions, selectorLoading, doSelectProcess, onSelectResult, loadSelectorOptions }
}
