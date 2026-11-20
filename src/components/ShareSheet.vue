<template>
  <u-popup :show="visible" mode="bottom" :round="20" @close="close">
    <view class="share-sheet">
      <view class="share-sheet__title">分享好友</view>
      <view class="share-sheet__grid" :class="{ 'share-sheet__grid--single': !showWechat }">
        <view v-if="showWechat" class="share-sheet__item" @tap="doShareWechat">
          <view class="share-sheet__icon"><icon-lucide-message-square :size="24" /></view>
          <text class="share-sheet__label">微信好友</text>
        </view>
        <view v-if="showWechat" class="share-sheet__item" @tap="doShareTimeline">
          <view class="share-sheet__icon"><icon-lucide-users :size="24" /></view>
          <text class="share-sheet__label">朋友圈</text>
        </view>
        <view class="share-sheet__item" @tap="doCopyLink">
          <view class="share-sheet__icon"><icon-lucide-link :size="24" /></view>
          <text class="share-sheet__label">复制链接</text>
          <view v-if="!showWechat" class="share-sheet__arrow"><icon-lucide-chevron-right :size="16" /></view>
        </view>
      </view>
      <view class="share-sheet__cancel" @tap="close">取消</view>
    </view>
  </u-popup>
</template>

<script setup lang="ts">
import { useConfig } from '@/brick/composables/useBaseStore'
import { useBranding } from '@/brick/composables/useBranding'
import { dialog } from '@/brick/lib/dialog'
import { getRuntimePlatform } from '@/brick/lib/platform'
import { computed, onMounted, ref } from 'vue'

defineOptions({ name: 'ShareSheet' })

const { config } = useConfig()
const branding = useBranding()

const visible = ref(false)
// App 旧包可能没编译 Share 模块，先用 getProvider 探测再决定是否展示微信项
const wechatAvailable = ref(true)

const shareLink = computed(() => {
  const base = String(config.value?.siteBase || '').replace(/\/+$/, '')
  return base ? `${base}/#/pages/wc` : ''
})

const shareTitle = computed(() => config.value?.Ruceriji_ShareTitle || branding.value.siteName)
const shareSummary = computed(() => branding.value.siteSlogan || '')
const shareImage = computed(() => config.value?.Ruceriji_ShareImage || branding.value.siteLogo || '')

const showWechat = computed(() => {
  let show = false
  // #ifdef APP-PLUS
  show = wechatAvailable.value
  // #endif
  // #ifdef H5
  // 模拟 App 时也展示微信项，便于 H5 里查看、截图与自动化测试
  show = getRuntimePlatform() === 'app'
  // #endif
  return show
})

onMounted(() => {
  // #ifdef APP-PLUS
  uni.getProvider({
    service: 'share',
    success: (res: any) => {
      wechatAvailable.value = (res?.provider || []).includes('weixin')
    },
    fail: () => {
      wechatAvailable.value = false
    },
  })
  // #endif
})

function doShareWechat() {
  doShareToScene('WXSceneSession')
}

function doShareTimeline() {
  doShareToScene('WXSceneTimeline')
}

function doShareToScene(scene: 'WXSceneSession' | 'WXSceneTimeline') {
  if (!shareLink.value) {
    dialog.tipError('分享链接暂不可用，请稍后重试')
    return
  }
  // #ifdef APP-PLUS
  uni.share({
    provider: 'weixin',
    scene,
    type: 0,
    href: shareLink.value,
    title: shareTitle.value,
    summary: shareSummary.value,
    imageUrl: shareImage.value,
    success: () => close(),
    fail: (err: any) => {
      // 用户主动取消也走 fail，不提示错误
      if (/cancel/i.test(String(err?.errMsg || ''))) return
      dialog.tipError('分享失败，可复制链接分享')
    },
  })
  // #endif
  // #ifdef H5
  dialog.tipError('模拟环境：微信分享需在真机验证')
  // #endif
}

function doCopyLink() {
  if (!shareLink.value) {
    dialog.tipError('分享链接暂不可用，请稍后重试')
    return
  }
  uni.setClipboardData({
    data: shareLink.value,
    success: () => {
      close()
      dialog.tipSuccess('已复制')
    },
  })
}

function show() {
  visible.value = true
}

function close() {
  visible.value = false
}

defineExpose({ show, close })
</script>

<style lang="scss" scoped>
:deep(.u-popup__content) {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  overflow: hidden;
}

.share-sheet {
  max-width: 480px;
  margin: 0 auto;
  padding: 20px 16px calc(12px + env(safe-area-inset-bottom, 0px));
  border-radius: 20px 20px 0 0;
  background-color: var(--token-surface);
}

.share-sheet__title {
  text-align: center;
  font-size: 15px;
  font-weight: 600;
  color: var(--token-text);
}

.share-sheet__grid {
  display: flex;
  justify-content: space-around;
  padding: 20px 0 12px;
}

.share-sheet__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 72px;
}

.share-sheet__icon {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background-color: var(--token-chip-bg);
  color: var(--token-text);
}

.share-sheet__label {
  font-size: 12px;
  color: var(--token-text-secondary);
}

.share-sheet__grid--single {
  flex-direction: column;
  padding: 8px 0;
}

.share-sheet__grid--single .share-sheet__item {
  flex-direction: row;
  justify-content: flex-start;
  width: 100%;
  padding: 8px 4px;
  gap: 12px;
}

.share-sheet__grid--single .share-sheet__icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
}

.share-sheet__grid--single .share-sheet__label {
  font-size: 15px;
  color: var(--token-text);
}

.share-sheet__arrow {
  margin-left: auto;
  display: flex;
  color: var(--token-text-disabled);
}

.share-sheet__cancel {
  margin-top: 8px;
  padding: 12px;
  border-top: 1px solid var(--token-divider);
  text-align: center;
  font-size: 15px;
  color: var(--token-text-secondary);
}
</style>
