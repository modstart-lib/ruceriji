/**
 * 全局登录弹窗注册器（Map 模式）
 * bui-member-login-dialog 组件内部自动注册/销毁，页面只需放 <bui-member-login-dialog /> 即可。
 * 每个 tabBar 页面独立注册，showLoginDialog 根据当前页路由查找对应弹窗。
 */

type LoginDialogInstance = {
  support: boolean
  show: (ctx: any, cb?: () => void) => void
}

const dialogMap = new Map<string, LoginDialogInstance>()

export function registerLoginDialog(route: string, instance: LoginDialogInstance) {
  dialogMap.set(route, instance)
}

export function unregisterLoginDialog(route: string) {
  dialogMap.delete(route)
}

/**
 * 尝试弹出当前页面对应的登录弹窗。
 * 仅在当前页有注册弹窗且支持（MP-WEIXIN / APP-PLUS）时返回 true，否则降级到路由登录页。
 */
export function showLoginDialog(callback?: () => void): boolean {
  try {
    const pages = getCurrentPages()
    const currentRoute = (pages[pages.length - 1] as any)?.route || ''
    const instance = dialogMap.get(currentRoute)
    if (instance && instance.support) {
      instance.show(null, callback)
      return true
    }
  } catch (e) {
    /* ignore */
  }
  return false
}
