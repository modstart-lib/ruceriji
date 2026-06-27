/**
 * useEventBus - EventBus 数据更新监听的 Composition API
 * 替代 EventBusDataUpdateMixin
 */
import { onMounted, onBeforeUnmount } from 'vue'
import { EventBus as _EventBus } from '@/brick/lib/event-bus'

export function useEventBus() {
  const updateDataListeners: Record<string, ((...args: any[]) => void)[]> = {}

  let _handler: ((type: string, param: any) => void) | null = null

  onMounted(() => {
    _handler = (type: string, param: any) => {
      const listeners = updateDataListeners[type] || []
      for (const cb of listeners) {
        cb(param)
      }
    }
    _EventBus.$on('DataUpdate', _handler)
  })

  onBeforeUnmount(() => {
    if (_handler) {
      _EventBus.$off('DataUpdate', _handler)
    }
  })

  function addDataUpdateListener(type: string, cb: (...args: any[]) => void) {
    if (!updateDataListeners[type]) {
      updateDataListeners[type] = []
    }
    updateDataListeners[type].push(cb)
  }

  function emitDataUpdate(type: string, param?: any) {
    _EventBus.$emit('DataUpdate', type, param)
  }

  function emitDataUpdateDelay(type: string, param?: any, delay = 300) {
    setTimeout(() => {
      _EventBus.$emit('DataUpdate', type, param)
    }, delay)
  }

  return {
    addDataUpdateListener,
    emitDataUpdate,
    emitDataUpdateDelay,
  }
}
