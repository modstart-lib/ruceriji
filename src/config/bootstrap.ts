import { useBrickBaseStore } from '../brick/composables/useBaseStore'
import { AppManager } from '../brick/lib/appManager'
import { useBizStore, useConfigStore } from '../store/app'
import { useUserStore } from '../store/user'
import { api } from '@/brick/lib/api'
import { EventBus } from '@/brick/lib/event-bus'

export const Bootstrap = {
  init() {
    // 应用挂载后获取初始配置
    EventBus.$on('AppMounted', async () => {
      try {
        const res = await api.post('ruceriji_mobile/config', {}, null, null, { silent: true })
        const configStore = useConfigStore()
        const bizStore = useBizStore()
        const userStore = useUserStore()
        const brickBaseStore = useBrickBaseStore()

        const configApp = res.data.configApp
        delete res.data.configApp
        configStore.setConfig(res.data)
        brickBaseStore.SET_CONFIG(res.data)

        if (configApp) {
          bizStore.setBiz(configApp.biz)
          userStore.setUser(configApp.user)
          if (configApp.user && configApp.user.token) {
            userStore.setToken(configApp.user.token)
          }
        } else {
          EventBus.$emitDelay('UpdateApp')
        }

        // 每30秒刷新一次应用数据
        setInterval(() => {
          EventBus.$emitDelay('UpdateApp')
        }, 30 * 1000)
      } catch {}
    })

    EventBus.$on('UpdateApp', async (cb?: () => void) => {
      try {
        const res = await api.post('ruceriji_mobile/config_app', {}, null, null, { silent: true })
        const bizStore = useBizStore()
        const userStore = useUserStore()

        bizStore.setBiz(res.data.biz)
        userStore.setUser(res.data.user)
        if (res.data.user && res.data.user.token) {
          userStore.setToken(res.data.user.token)
        }
        cb && cb()
      } catch {}
    })
  },

  mounted() {
    // 发送 AppMounted 事件
    EventBus.$emit('AppMounted')
    AppManager.collect()
  },
}
