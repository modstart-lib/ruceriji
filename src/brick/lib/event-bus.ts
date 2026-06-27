type EventCallback = (...args: any[]) => void

const listeners: Record<string, EventCallback[]> = {}

let emitTimer: ReturnType<typeof setTimeout> | null = null

export const EventBus = {
  $on(event: string, callback: EventCallback) {
    if (!listeners[event]) {
      listeners[event] = []
    }
    listeners[event].push(callback)
  },

  $off(event: string, callback?: EventCallback) {
    if (!listeners[event]) return
    if (callback) {
      listeners[event] = listeners[event].filter((cb) => cb !== callback)
    } else {
      delete listeners[event]
    }
  },

  $emit(event: string, ...args: any[]) {
    if (!listeners[event]) return
    listeners[event].forEach((cb) => cb(...args))
  },

  $emitDelay(event: string, ...param: any[]) {
    if (emitTimer) {
      clearTimeout(emitTimer)
    }
    emitTimer = setTimeout(() => {
      EventBus.$emit(event, ...param)
      emitTimer = null
    }, 100)
  },

  $emitDelayDataChange(type: string, param?: any) {
    EventBus.$emitDelay('DataUpdate', type, param)
  },

  $onOnceListeners: {} as Record<string, string[]>,
  $onOnce(event: string, name: string, cb: (...args: any[]) => void) {
    if (!(event in EventBus.$onOnceListeners)) {
      EventBus.$onOnceListeners[event] = []
    }
    if (EventBus.$onOnceListeners[event].includes(name)) {
      return
    }
    EventBus.$onOnceListeners[event].push(name)
    EventBus.$on(event, cb)
  },
}

export default EventBus
