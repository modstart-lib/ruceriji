import { SystemConfig } from '@/brick/BrickUni'
import { api } from '@/brick/lib/api'
import { dialog } from '@/brick/lib/dialog'
import { EventBus } from '@/brick/lib/event-bus'
import { useUserStore } from '@/store/user'
import { computed, ref } from 'vue'

export function useOauthLogin(options: {
  onSuccess: () => void
  beforeLogin?: () => boolean
  onWechatFallback?: () => void
}) {
  const { onSuccess, beforeLogin, onWechatFallback } = options

  const isIos = computed(() => {
    let result = false
    // #ifdef APP-PLUS
    if (SystemConfig.OSName === 'ios') result = true
    // #endif
    return result
  })

  // Detect WeChat installation via URL scheme / package name (not getServices which
  // only lists SDK-compiled capabilities regardless of whether WeChat is installed)
  const isWechatInstalled = ref(false)
  // #ifdef APP-PLUS
  ;(() => {
    const _plus: any = typeof plus !== 'undefined' ? plus : null
    if (!_plus?.runtime?.isApplicationExist) {
      // Fallback: assume installed if API unavailable
      isWechatInstalled.value = true
      return
    }
    // pname = Android package, action = iOS URL scheme
    const installed = _plus.runtime.isApplicationExist({ pname: 'com.tencent.mm', action: 'weixin://' })
    isWechatInstalled.value = !!installed
  })()
  // #endif

  function doWechatMiniProgramLoginProcess(cb: (res: any) => void) {
    // #ifdef MP-WEIXIN
    dialog.loadingOn()
    ;(wx as any).login({
      success: async (loginRes: any) => {
        try {
          const res = await api.post('oauth/login_wechat_mini_program', { code: loginRes.code })
          dialog.loadingOff()
          dialog.tipSuccess('登录成功')
          EventBus.$emitDelay('UpdateApp', () => cb && cb(res))
        } catch {
          dialog.loadingOff()
        }
      },
      fail: (loginRes: any) => {
        dialog.loadingOff()
        dialog.tipError('登录微信获取信息失败')
        console.error('doWechatMiniProgramLoginProcess.fail', loginRes)
      },
    })
    // #endif
  }

  function isAppleTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
      return !!payload.exp && payload.exp < Math.floor(Date.now() / 1000)
    } catch {
      return false
    }
  }

  function doAppleLoginRequest(retryCount: number) {
    // #ifdef APP-PLUS
    // Always logout first so iOS does NOT return a stale cached identityToken
    // (cause of "Apple 登录凭证已过期，请重试"). Mirrors the WeChat flow below.
    const _plus: any = typeof plus !== 'undefined' ? plus : null
    const startLogin = () => {
      uni.login({
        provider: 'apple',
        success: async (event: any) => {
          const identityToken = event.appleInfo?.identityToken || event.identityToken
          if (isAppleTokenExpired(identityToken)) {
            if (retryCount < 1) {
              doAppleLoginRequest(retryCount + 1)
              return
            }
            dialog.tipError('Apple 登录凭证已过期，请重试')
            return
          }
          dialog.loadingOn('登录中...')
          try {
            const res = await api.post('oauth/login_apple', { identityToken })
            const token = res.data?.token || res.data?.user?.token
            if (token) useUserStore().setToken(token)
            EventBus.$emitDelay('UpdateApp', () => {
              dialog.loadingOff()
              onSuccess()
            })
          } catch {
            dialog.loadingOff()
          }
        },
        fail: (err: any) => {
          dialog.tipError('Apple 登录失败:' + JSON.stringify(err))
        },
      })
    }
    if (_plus?.oauth) {
      _plus.oauth.getServices(
        (services: any[]) => {
          const apple = (services || []).find((s: any) => s.id === 'apple')
          if (apple && typeof apple.logout === 'function') {
            // logout() clears any cached Apple grant so we always get a fresh
            // identityToken; success/fail both proceed to the actual login
            apple.logout(startLogin, startLogin)
          } else {
            startLogin()
          }
        },
        () => startLogin(),
      )
    } else {
      startLogin()
    }
    // #endif
  }

  function doAppleLogin() {
    if (beforeLogin && !beforeLogin()) return
    doAppleLoginRequest(0)
  }

  // ─── WeChat: offer App Store install or fall back to account login ─────────
  function _offerWechatInstall() {
    // #ifdef APP-PLUS
    uni.showModal({
      title: '未检测到微信',
      content: '微信登录需要先安装微信 App，是否前往 App Store 安装？',
      confirmText: '去安装',
      cancelText: '账号登录',
      success: (res: any) => {
        if (res.confirm) {
          const _plus: any = typeof plus !== 'undefined' ? plus : null
          _plus?.runtime?.openURL('https://apps.apple.com/app/id414478124')
        } else {
          if (onWechatFallback) onWechatFallback()
        }
      },
    })
    // #endif
  }

  // ─── WeChat: native App OAuth ────────────────────────────────────────────────
  // Previous approach used wx.logout() + 1500 ms delay to prevent the "cached
  // grant returns via Universal Link before DCloud registers the authorize()
  // callback" race condition.  In newer WeChat / iOS SDK versions wx.logout()
  // itself triggers a Universal Link return that can corrupt the subsequent
  // authorize() registration, reproducing the same stuck-loading bug.
  // Fix: call wx.authorize() directly (no logout step).  DCloud registers the
  // Universal Link observer synchronously on the native side before WeChat has
  // a chance to respond, so the race condition does not occur.
  function doWechatLogin() {
    if (beforeLogin && !beforeLogin()) return
    // #ifdef APP-PLUS
    const _plus: any = typeof plus !== 'undefined' ? plus : null
    if (!_plus?.oauth) return

    _plus.oauth.getServices(
      (services: any[]) => {
        const wx = (services || []).find((s: any) => s.id === 'weixin')
        if (!wx) {
          _offerWechatInstall()
          return
        }

        let settled = false
        // 15 s watchdog — short enough to be noticed, long enough for slow networks
        const watchdog = setTimeout(() => {
          if (settled) return
          settled = true
          dialog.loadingOff()
          dialog.tipError('微信登录超时，请重试')
        }, 15000)

        dialog.loadingOn('微信登录中...')
        wx.authorize(
          async (res: any) => {
            if (settled) return
            settled = true
            clearTimeout(watchdog)
            const code: string = res?.code || res?.authResult?.code || ''
            if (!code) {
              dialog.loadingOff()
              dialog.tipError('微信登录失败，请重试')
              return
            }
            try {
              const loginRes = await api.post('oauth/login_wechat_app', { code })
              const token = loginRes.data?.token || loginRes.data?.user?.token
              if (token) useUserStore().setToken(token)
              EventBus.$emitDelay('UpdateApp', () => {
                dialog.loadingOff()
                onSuccess()
              })
            } catch {
              dialog.loadingOff()
              dialog.tipError('微信登录失败，请重试')
            }
          },
          (err: any) => {
            if (settled) return
            settled = true
            clearTimeout(watchdog)
            dialog.loadingOff()
            const msg: string = err?.errMsg
              ? String(err.errMsg)
              : (err ? JSON.stringify(err) : '')
            const notInstalled =
              msg.indexOf('未安装客户端') !== -1 ||
              msg.indexOf('not installed') !== -1 ||
              msg.indexOf('WXApi is not registe') !== -1
            if (notInstalled) {
              _offerWechatInstall()
            } else {
              dialog.tipError('微信登录失败，请重试')
              console.error('doWechatLogin.authorize', err)
            }
          },
        )
      },
      () => _offerWechatInstall(),
    )
    // #endif
  }

  return { isIos, isWechatInstalled, doWechatMiniProgramLoginProcess, doWechatLogin, doAppleLogin }
}
