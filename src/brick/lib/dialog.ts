let _loadingActive = false

export const Dialog = {
  loadingOn(msg: string = '加载中...') {
    _loadingActive = true
    uni.showLoading({ title: msg, mask: true })
  },

  loadingOff() {
    if (!_loadingActive) return
    _loadingActive = false
    uni.hideLoading()
  },

  getMsgDuration(msg: string): number {
    let ms = 2000
    if (msg && msg.length > 10) {
      ms = 1000 * Math.floor(msg.length / 5)
    }
    return ms
  },

  tip(msg: string, cb?: () => void) {
    const ms = Dialog.getMsgDuration(msg)
    uni.showToast({
      duration: ms,
      icon: 'none',
      title: msg,
      complete: () => {
        setTimeout(() => {
          cb && cb()
        }, ms)
      },
    } as any)
  },

  tipSuccess(msg: string, cb?: () => void) {
    _loadingActive = false
    uni.showToast({
      title: msg || '操作成功',
      icon: 'success',
      duration: 1500,
      complete: () => {
        cb && setTimeout(cb, 1500)
      },
    })
  },

  tipError(msg: string, cb?: () => void) {
    _loadingActive = false
    const ms = Dialog.getMsgDuration(msg)
    uni.showToast({
      duration: ms,
      icon: 'none',
      title: msg || '操作失败',
      complete: () => {
        setTimeout(() => {
          cb && cb()
        }, ms)
      },
    } as any)
  },

  tipInfo(msg: string) {
    _loadingActive = false
    uni.showToast({
      title: msg || '',
      icon: 'none',
      duration: 2000,
    })
  },

  confirm(msg: string, confirmCb?: () => void, cancelCb?: () => void): Promise<boolean> {
    return new Promise((resolve) => {
      uni.showModal({
        title: '提示',
        content: msg,
        success: (res: any) => {
          if (res.confirm) {
            confirmCb && confirmCb()
            resolve(true)
          } else {
            cancelCb && cancelCb()
            resolve(false)
          }
        },
      })
    })
  },

  alert(msg: string, cb?: () => void) {
    uni.showModal({
      title: '提示',
      content: msg,
      showCancel: false,
      success: () => {
        cb && cb()
      },
    })
  },

  alertSuccess(msg: string, cb?: () => void) {
    uni.showModal({
      title: '提示',
      content: msg,
      showCancel: false,
      success: () => {
        cb && cb()
      },
    })
  },

  alertError(msg: string, cb?: () => void) {
    uni.showModal({
      title: '提示',
      content: msg,
      showCancel: false,
      success: () => {
        cb && cb()
      },
    })
  },

  input(title: string, cb: (value: string) => void, defaultValue = '') {
    uni.showModal({
      title,
      content: defaultValue,
      showCancel: false,
      editable: true,
      success: (res: any) => {
        cb && cb(res.content)
      },
    } as any)
  },
}

export const dialog = Dialog
export default Dialog
