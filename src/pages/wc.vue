<template>
  <view class="pb-ruceriji-wc">
    <WcStart v-if="status === 'init' || status === 'start'" style="" :member="member" @start="doStart" />
    <WcRunning v-else-if="status === 'running'" style="" :member="member" @success="doSuccess" @fail="doFail" />
    <WcFail v-else-if="status === 'fail'" style="" :member="member" @back="onFailBack" />
    <MemberInfoSettingDialog ref="memberInfoDialog" auto-show />
    <AppAwardDetectDialog />
    <bui-member-login-dialog ref="memberLoginDialog" />
  </view>
</template>

<script setup lang="ts">
import { useAppBiz, useAppConfig, useAppUser } from '@/brick/composables/useAppStore'
import { useShare } from '@/brick/composables/useShare'
import { api } from '@/brick/lib/api'
import { router } from '@/brick/lib/router'
import { onShow } from '@dcloudio/uni-app'
import { computed, reactive, toRefs, watch } from 'vue'
import AppAwardDetectDialog from './award/components/AppAwardDetectDialog.vue'
import MemberInfoSettingDialog from './components/MemberInfoSettingDialog.vue'
import WcFail from './components/WcFail.vue'
import WcRunning from './components/WcRunning.vue'
import WcStart from './components/WcStart.vue'

defineOptions({ name: 'WcPage' })

const { user, userInit, isLogin, waitUserReady, requireUserLogin, requireUserLoginRouteTo } = useAppUser()
const { biz } = useAppBiz()
const { config } = useAppConfig()
const { shareConfig, setShareConfig, getShareAppMessage, getShareTimeline } = useShare()

const state = reactive({
  status: 'init',
  member: {
    timestampDiff: 0,
    startTime: '',
    startTimestamp: 0,
    secondSinceLast: 0,
  },
})
const { status, member } = toRefs(state)

const share = computed(() => {
  return {
    title: config.value && config.value.Ruceriji_ShareTitle,
    imageUrl: config.value && config.value.Ruceriji_ShareImage,
  }
})

async function doLoadStatus() {
  if (!userInit.value) {
    setTimeout(() => doLoadStatus(), 50)
    return
  }
  if (!user.value || !user.value.id) return
  const res = await api.post('ruceriji/member/status', { timestamp: Date.now() / 1000 })
  state.member.timestampDiff = res.data.timestampDiff
  state.member.startTime = res.data.startTime
  state.member.startTimestamp = res.data.startTimestamp
  state.member.secondSinceLast = res.data.secondSinceLast
  state.status = state.member.startTimestamp > 0 ? 'running' : 'start'
}

function onFailBack() {
  state.status = 'start'
}

function doStart() {
  requireUserLogin(async () => {
    if (state.status === 'init') {
      doLoadStatus()
      return
    }
    const res = await api.post('ruceriji/member/start', { timestamp: Date.now() / 1000 })
    state.member.timestampDiff = res.data.timestampDiff
    state.member.startTime = res.data.startTime
    state.member.startTimestamp = res.data.startTimestamp
    state.status = 'running'
  }, true)
}

function doSuccess() {
  const duration = Math.floor(Date.now() / 1000 - state.member.startTimestamp + state.member.timestampDiff)
  router.to('/pages/edit', {
    duration,
    startTime: state.member.startTime,
  })
}

async function doFail() {
  await api.post('ruceriji/member/fail', {})
  state.member.timestampDiff = 0
  state.member.startTime = ''
  state.member.startTimestamp = 0
  state.status = 'fail'
}

onShow(() => {
  doLoadStatus()
})

// 登录状态变化时（如弹窗登录后）刷新状态
watch(isLogin, (loggedIn) => {
  if (loggedIn && state.status === 'init') {
    doLoadStatus()
  }
})
</script>

<style lang="scss" scoped>
.pb-ruceriji-wc {
  position: relative;
  min-height: 100vh;
  background: #f7f8fa;
  display: flex;
  flex-direction: column;

  /* uview-plus u-popup 根节点默认 flex:1，与 wc-scroll 同在 flex 列时会各占约一半高度，仅「进行中」页有弹层 */
  :deep(.u-popup) {
    flex: none !important;
    flex-grow: 0 !important;
    flex-shrink: 0 !important;
  }

  .wc-home-bg {
    background: transparent;
    /* 微信小程序不支持 inset 简写，需显式写四个方向保证撑满全屏 */
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    /* 微信小程序 fixed+top/bottom 不能可靠撑高，必须显式 height */
    height: 100vh;
  }

  /* 让子页面 wc-stage / wc-scroll 获得确定高度，内部滚动，避免底部被裁切 */
  :deep(.wc-stage) {
    flex: 1 1 0%;
    min-height: 0;
    overflow-x: hidden;
  }

  /* 可滚动外层：不要用 relative+z，部分端上会和 overflow 组合导致内容不绘制 */
  :deep(.wc-scroll) {
    flex: 1 1 0%;
    min-height: 0;
    width: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  }

  :deep(.wc-scroll .c-page-header-trans) {
    flex-shrink: 0;
  }

  /* 占满标题栏以下区域，在大屏将整块主内容垂直居中；占位与双按钮区已统一高度，切换状态不跳动 */
  :deep(.wc-body) {
    flex: 1 1 0%;
    min-height: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
  }

  :deep(.wc-inner) {
    display: flex;
    width: 100%;
    flex-shrink: 0;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    box-sizing: border-box;
    padding-left: 2rem;
    padding-right: 2rem;
    padding-top: 8rpx;
    padding-bottom: 48rpx;
  }

  :deep(.btn-main),
  :deep(.btn-main-same) {
    width: 480rpx !important;
    height: 104rpx !important;
    min-height: 104rpx !important;
    font-size: 32rpx !important;
    margin: 0 auto;
  }

  :deep(.btn-main) {
    background: #111111;
    color: #ffffff;
    border: none !important;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  :deep(.btn-main-same) {
    background: #ffffff !important;
    border: 1rpx solid rgba(0, 0, 0, 0.08) !important;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
  }

  /* 三种状态共用：垂直居中布局 */
  :deep(.wc-top-block) {
    display: flex;
    width: 100%;
    flex-shrink: 0;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
    /* 三种状态顶部总占位一致，避免插图与按钮纵向错位 */
    min-height: 420rpx;
  }

  :deep(.wc-top-status) {
    display: flex;
    width: 100%;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    margin-bottom: 20rpx;
  }

  :deep(.wc-top-headline) {
    display: flex;
    width: 100%;
    flex-shrink: 0;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    text-align: center;
    /* 与「健康生活 / 本次未成功」等两行主副标题对齐 */
    min-height: 144rpx;
  }

  :deep(.wc-top-card-wrap) {
    display: flex;
    width: 100%;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    min-height: 160rpx;
    padding-left: 8rpx;
    padding-right: 8rpx;
    box-sizing: border-box;
  }

  :deep(.wc-spacer) {
    display: none;
  }

  :deep(.wc-actions) {
    width: 100%;
    flex-shrink: 0;
    margin-top: 80rpx;
    padding-bottom: env(safe-area-inset-bottom);
    /* 双按钮页与单按钮页同一锚点：主按钮位置固定，次行占位或真按钮 */
    min-height: 260rpx;
    justify-content: flex-start;
  }

  /* 与「我努力了…」次按钮同宽占位，避免仅单按钮时主按钮上移 */
  :deep(.wc-actions-second-placeholder) {
    width: 480rpx;
    /* 与长文案次按钮（可能两行）高度对齐 */
    min-height: 120rpx;
    margin-top: 32rpx;
    flex-shrink: 0;
    visibility: hidden;
    pointer-events: none;
  }

  :deep(.wc-actions-second-row) {
    min-height: 120rpx;
  }

  :deep(.image-main) {
    display: block;
    width: 400rpx;
    height: 400rpx;
    margin: 0 auto;
    box-sizing: border-box;
    padding: 32rpx;
    overflow: visible;
  }

  /* 三种状态共用的状态胶囊 */
  :deep(.wc-status-pill) {
    display: inline-flex;
    align-items: center;
    gap: 12rpx;
    border-radius: 9999px;
    border: 1rpx solid rgba(0, 0, 0, 0.06);
    background: rgba(255, 255, 255, 0.85);
    padding: 12rpx 28rpx;
    font-size: 24rpx;
    font-weight: 500;
    line-height: 1.25;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
    backdrop-filter: blur(8px);
  }

  :deep(.wc-status-pill--muted) {
    color: var(--token-primary-500);
  }

  :deep(.wc-status-pill--live) {
    color: var(--token-primary-500);
  }

  :deep(.wc-status-pill--soft) {
    color: #92400e;
    border-color: rgba(146, 64, 14, 0.12);
    background: rgba(255, 251, 235, 0.9);
  }

  /* 首页 / 记录 Tab：分层入场 + 插图微动 + 背景光晕漂移（标准 + -webkit- 双写，兼容小程序与 App WebView） */
  $wc-ease: cubic-bezier(0.22, 1, 0.36, 1);

  :deep(.wc-motion-t1) {
    -webkit-animation: wc-home-fade-up 0.58s $wc-ease both;
    animation: wc-home-fade-up 0.58s $wc-ease both;
  }

  :deep(.wc-motion-t2) {
    -webkit-animation: wc-home-fade-up 0.58s $wc-ease 0.1s both;
    animation: wc-home-fade-up 0.58s $wc-ease 0.1s both;
  }

  :deep(.wc-motion-t3) {
    -webkit-animation: wc-home-fade-up 0.58s $wc-ease 0.2s both;
    animation: wc-home-fade-up 0.58s $wc-ease 0.2s both;
  }

  :deep(.wc-motion-banner) {
    -webkit-animation: wc-home-fade-up 0.45s $wc-ease both;
    animation: wc-home-fade-up 0.45s $wc-ease both;
  }

  :deep(.wc-motion-image-inner) {
    display: block;
    width: 100%;
    height: 100%;
    will-change: transform;
  }

  /* 首页卡通：开始态 — 舒缓漂浮 + 轻微呼吸感 */
  :deep(.wc-motion-image-inner.wc-motion-image--start) {
    -webkit-animation: wc-mascot-start 5.5s ease-in-out 0.72s infinite;
    animation: wc-mascot-start 5.5s ease-in-out 0.72s infinite;
  }

  /* 计时中 — 活泼摆动 + 翠绿光晕脉冲（与「计时中」状态呼应） */
  :deep(.wc-motion-image-inner.wc-motion-image--running) {
    -webkit-animation: wc-mascot-running 1.15s ease-in-out infinite;
    animation: wc-mascot-running 1.15s ease-in-out infinite;
  }

  /* 未成功 — 低落轻晃 + 略收能量 */
  :deep(.wc-motion-image-inner.wc-motion-image--fail) {
    -webkit-animation: wc-mascot-fail 4s ease-in-out infinite;
    animation: wc-mascot-fail 4s ease-in-out infinite;
  }

  :deep(.wc-motion-blob) {
    will-change: transform;
    -webkit-animation: wc-home-blob-a 22s ease-in-out infinite;
    animation: wc-home-blob-a 22s ease-in-out infinite;
  }

  :deep(.wc-motion-blob--b) {
    -webkit-animation: wc-home-blob-b 26s ease-in-out -11s infinite;
    animation: wc-home-blob-b 26s ease-in-out -11s infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    :deep(.wc-motion-t1),
    :deep(.wc-motion-t2),
    :deep(.wc-motion-t3),
    :deep(.wc-motion-banner) {
      -webkit-animation: none !important;
      animation: none !important;
      opacity: 1;
      -webkit-transform: none;
      transform: none;
    }

    :deep(.wc-motion-image-inner.wc-motion-image--start),
    :deep(.wc-motion-image-inner.wc-motion-image--running),
    :deep(.wc-motion-image-inner.wc-motion-image--fail) {
      -webkit-animation: none !important;
      animation: none !important;
    }

    :deep(.wc-motion-blob) {
      -webkit-animation: none !important;
      animation: none !important;
    }
  }
}

@mixin wc-home-fade-up-body {
  from {
    opacity: 0;
    transform: translate3d(0, 28rpx, 0);
  }

  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@-webkit-keyframes wc-home-fade-up {
  @include wc-home-fade-up-body;
}

@keyframes wc-home-fade-up {
  @include wc-home-fade-up-body;
}

@mixin wc-mascot-start-body {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1) rotate(0deg);
  }

  50% {
    transform: translate3d(0, -12rpx, 0) scale(1.03) rotate(0.8deg);
  }
}

@-webkit-keyframes wc-mascot-start {
  @include wc-mascot-start-body;
}

@keyframes wc-mascot-start {
  @include wc-mascot-start-body;
}

@mixin wc-mascot-running-body {
  0%,
  100% {
    transform: translate3d(0, 0, 0) rotate(-1.2deg);
    -webkit-filter: drop-shadow(0 0 0 rgba(16, 185, 129, 0));
    filter: drop-shadow(0 0 0 rgba(16, 185, 129, 0));
  }

  25% {
    transform: translate3d(6rpx, -8rpx, 0) rotate(1.4deg);
    -webkit-filter: drop-shadow(0 10rpx 28rpx rgba(16, 185, 129, 0.35));
    filter: drop-shadow(0 10rpx 28rpx rgba(16, 185, 129, 0.35));
  }

  50% {
    transform: translate3d(-4rpx, -14rpx, 0) rotate(-0.6deg);
    -webkit-filter: drop-shadow(0 6rpx 36rpx rgba(52, 211, 153, 0.45));
    filter: drop-shadow(0 6rpx 36rpx rgba(52, 211, 153, 0.45));
  }

  75% {
    transform: translate3d(3rpx, -6rpx, 0) rotate(1deg);
    -webkit-filter: drop-shadow(0 8rpx 24rpx rgba(16, 185, 129, 0.3));
    filter: drop-shadow(0 8rpx 24rpx rgba(16, 185, 129, 0.3));
  }
}

@-webkit-keyframes wc-mascot-running {
  @include wc-mascot-running-body;
}

@keyframes wc-mascot-running {
  @include wc-mascot-running-body;
}

@mixin wc-mascot-fail-body {
  0%,
  100% {
    transform: translate3d(0, 6rpx, 0) rotate(-2.5deg) scale(0.98);
    opacity: 0.92;
    -webkit-filter: drop-shadow(0 4rpx 16rpx rgba(180, 83, 9, 0.12));
    filter: drop-shadow(0 4rpx 16rpx rgba(180, 83, 9, 0.12));
  }

  50% {
    transform: translate3d(0, 0, 0) rotate(-1.5deg) scale(1);
    opacity: 1;
    -webkit-filter: drop-shadow(0 2rpx 12rpx rgba(120, 113, 108, 0.15));
    filter: drop-shadow(0 2rpx 12rpx rgba(120, 113, 108, 0.15));
  }
}

@-webkit-keyframes wc-mascot-fail {
  @include wc-mascot-fail-body;
}

@keyframes wc-mascot-fail {
  @include wc-mascot-fail-body;
}

@mixin wc-home-blob-a-body {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }

  50% {
    transform: translate3d(20rpx, -18rpx, 0) scale(1.05);
  }
}

@-webkit-keyframes wc-home-blob-a {
  @include wc-home-blob-a-body;
}

@keyframes wc-home-blob-a {
  @include wc-home-blob-a-body;
}

@mixin wc-home-blob-b-body {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }

  50% {
    transform: translate3d(-16rpx, 14rpx, 0) scale(1.04);
  }
}

@-webkit-keyframes wc-home-blob-b {
  @include wc-home-blob-b-body;
}

@keyframes wc-home-blob-b {
  @include wc-home-blob-b-body;
}
</style>
