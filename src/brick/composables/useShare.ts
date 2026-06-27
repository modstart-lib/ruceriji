/**
 * useShare - 分享配置的 Composition API
 * 替代 ShareMixin / ShareH5
 */
import { ref } from 'vue'

export interface ShareConfig {
  title?: string
  desc?: string
  link?: string
  imgUrl?: string
  path?: string
}

export function useShare() {
  const shareConfig = ref<ShareConfig>({})

  function setShareConfig(config: ShareConfig) {
    shareConfig.value = Object.assign({}, shareConfig.value, config)
  }

  function getShareAppMessage() {
    const config = shareConfig.value || {}
    return {
      title: config.title || '',
      path: config.path || '',
      imageUrl: config.imgUrl || '',
    }
  }

  function getShareTimeline() {
    const config = shareConfig.value || {}
    return {
      title: config.title || '',
      query: '',
      imageUrl: config.imgUrl || '',
    }
  }

  return { shareConfig, setShareConfig, getShareAppMessage, getShareTimeline }
}

export function useShareH5() {
  const shareH5Config = ref<ShareConfig>({})

  function setShareH5Config(config: ShareConfig) {
    shareH5Config.value = Object.assign({}, shareH5Config.value, config)
    applyH5Share()
  }

  function applyH5Share() {
    const config = shareH5Config.value || {}
    // #ifdef H5
    try {
      const wx = (window as any).wx
      if (!wx) return
      wx.ready(() => {
        wx.updateAppMessageShareData({
          title: config.title || '',
          desc: config.desc || '',
          link: config.link || location.href,
          imgUrl: config.imgUrl || '',
        })
        wx.updateTimelineShareData({
          title: config.title || '',
          link: config.link || location.href,
          imgUrl: config.imgUrl || '',
        })
      })
    } catch (e) {}
    // #endif
  }

  return { shareH5Config, setShareH5Config, applyH5Share }
}
