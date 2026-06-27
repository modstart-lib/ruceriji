/**
 * useUser - 用户状态与操作的 Composition API 替代 StoreUserMixin
 */
import { showLoginDialog } from '@/brick/composables/useLoginDialog'
import { Dialog } from '@/brick/lib/dialog'
import { Router } from '@/brick/lib/router'
import { AppSetting } from '@/config/setting'
import { useUserStore } from '@/store/user'
import { computed } from 'vue'

export function useUser() {
  const userStore = useUserStore()

  const user = computed(() => userStore.user)
  const userInit = computed(() => userStore.userInit)

  function waitUserReady(cb: () => void) {
    if (!userStore.userInit) {
      setTimeout(() => waitUserReady(cb), 10)
      return
    }
    cb()
  }

  function requireUserLogin(cb: () => void, quick = false) {
    if (userStore.user?.id) {
      cb()
      return
    }
    if (showLoginDialog(cb)) return
    if (quick) {
      Router.to(AppSetting.route.login, { redirect: Router.pathWithQueries() })
    } else {
      Dialog.confirm('需要登录后才能操作', () => {
        Router.to(AppSetting.route.login, { redirect: Router.pathWithQueries() })
      })
    }
  }

  function requireUserLoginRouteTo(url?: string, param: Record<string, any> = {}, quick = false) {
    url = url || Router.pathWithQueries()
    if (userStore.user?.id) {
      Router.to(url, param)
      return
    }
    if (showLoginDialog(() => Router.to(url!, param))) return
    if (quick) {
      Router.to(AppSetting.route.login, { redirect: Router.urlBuild(url, param) })
    } else {
      Dialog.confirm('需要登录后才能操作', () => {
        Router.to(AppSetting.route.login, { redirect: Router.pathBuild(url!, param) })
      })
    }
  }

  return {
    user,
    userInit,
    waitUserReady,
    requireUserLogin,
    requireUserLoginRouteTo,
  }
}
