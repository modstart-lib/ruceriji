/**
 * useAppStore - 应用级别通用状态 Composition API
 * 替代 StoreMixin, UserMixin, ConfigMixin, BizMixin, ShareMixin from /src/mixins/common.ts
 */
import { computed } from 'vue'
import { useBizStore, useConfigStore } from '@/store/app'
import { useUserStore } from '@/store/user'
import { dialog } from '@/brick/lib/dialog'
import { router } from '@/brick/lib/router'
import { showLoginDialog } from './useLoginDialog'

export function useAppUser() {
  const userStore = useUserStore()

  const user = computed(() => userStore.user)
  const userInit = computed(() => userStore.userInit)
  const isLogin = computed(() => userStore.isLogin)

  function waitUserReady(cb: () => void) {
    userStore.waitUserReady(cb)
  }

  function requireUserLogin(cb?: () => void, redirect = false) {
    if (isLogin.value) {
      cb && cb()
      return
    }
    if (showLoginDialog(cb)) return
    dialog.confirm('请先登录', () => {
      router.to('/brick/module/member/login')
    })
  }

  function requireUserLoginRouteTo(path: string, query: Record<string, any> = {}, login = false) {
    if (!isLogin.value && login) {
      if (showLoginDialog(() => router.to(path, query))) return
      dialog.confirm('请先登录', () => {
        router.to('/brick/module/member/login')
      })
      return
    }
    router.to(path, query)
  }

  return { user, userInit, isLogin, waitUserReady, requireUserLogin, requireUserLoginRouteTo }
}

export function useAppConfig() {
  const configStore = useConfigStore()
  const config = computed(() => configStore.config)
  return { config }
}

export function useAppBiz() {
  const bizStore = useBizStore()
  const biz = computed(() => bizStore.biz)
  return { biz }
}
