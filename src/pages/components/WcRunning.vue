<template>
  <view class="wc-stage flex min-h-0 flex-1 flex-col">
    <view
      class="wc-motion-blob pointer-events-none absolute -right-24 -top-32 z-0 h-72 w-72 rounded-full opacity-[0.18] blur-3xl"
      style="background: var(--color-rc-primary)"
    />
    <view
      class="wc-motion-blob wc-motion-blob--b pointer-events-none absolute -bottom-32 -left-20 z-0 h-40 w-40 rounded-full bg-stone-200/25 blur-3xl"
    />

    <view class="wc-scroll">
      <c-page-header-trans title="开始" :has-back="false" color="#111111" :float="false" />
      <view class="wc-body">
        <view class="wc-inner">
          <view class="wc-top-block wc-motion-t1">
            <view class="wc-top-status">
              <view class="wc-status-pill wc-status-pill--live">
                <view class="wc-status-dot h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <text>计时中</text>
              </view>
            </view>
            <view class="wc-top-headline" aria-hidden="true" />
            <view class="wc-top-card-wrap">
              <view
                class="inline-flex min-w-[280rpx] max-w-[92%] flex-col items-center rounded-2xl border border-white/80 bg-white/70 px-6 py-4 text-center shadow-[0_12rpx_40rpx_rgba(17,17,17,0.06)] backdrop-blur-sm"
              >
                <view class="mb-1 text-xs font-medium tracking-wide text-[var(--token-primary-400)]"> 本次用时 </view>
                <view class="text-lg font-semibold leading-snug text-[var(--token-text)]">
                  {{ time ? time : '正在准备...' }}
                </view>
              </view>
            </view>
          </view>
          <view class="image-main wc-motion-t2 wc-image-frame--running mt-8 shrink-0">
            <view class="wc-motion-image-inner wc-motion-image--running">
              <c-image-static :src="defaultWcImage" />
            </view>
          </view>
          <view class="wc-spacer" />
          <view class="wc-actions wc-motion-t3 flex flex-col items-center">
            <u-button
              type="primary"
              shape="circle"
              class="btn-main"
              :custom-style="{
                width: '560rpx',
                margin: '0 auto',
                background: '#111111',
                color: '#ffffff',
                border: 'none',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              }"
              @click="doSuccess"
            >
              <icon-lucide-check :size="20" color="#fff" />
              <text class="ml-2">拉完了</text>
            </u-button>
            <view class="wc-actions-second-row mt-4 w-full flex items-center justify-center">
              <u-button
                shape="circle"
                class="btn-main-same"
                :custom-style="{
                  width: '560rpx',
                  margin: '0 auto',
                  background: '#ffffff',
                  border: '1rpx solid rgba(0,0,0,0.08)',
                  boxShadow: '0 8rpx 24rpx rgba(0,0,0,0.04)',
                }"
                @click="openCancelPopup"
              >
                <icon-lucide-smile :size="20" />
                <text class="ml-2">我努力了，但没便出来</text>
              </u-button>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- u-popup 根节点在 uview 里写了 flex:1，与 wc-scroll 同列时会抢一半高度，需在 wc.vue 用 :deep 覆盖 -->
    <u-popup :show="cancelPopup" mode="center" :round="24" @close="cancelPopup = false">
      <view class="w-[300px] max-w-[86vw] overflow-hidden rounded-3xl bg-white">
        <view
          class="px-6 pt-8 pb-6 text-center"
          style="background: linear-gradient(165deg, #fff7e8 0%, #fffdfb 55%, #ffffff 100%)"
        >
          <view
            class="mx-auto mb-5 flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-full shadow-sm"
            style="background: linear-gradient(145deg, #ffe4b5 0%, #ffd699 100%)"
          >
            <icon-lucide-heart :size="30" class="text-amber-800/90" />
          </view>
          <view class="mb-2 text-[1.35rem] font-semibold tracking-tight text-gray-900"> 便便没出来 </view>
          <view class="text-sm leading-relaxed text-gray-600"> 没关系，下次有感觉了早点来！ </view>
        </view>
        <view class="border-t border-gray-100 px-5 pb-5 pt-4">
          <u-button type="primary" shape="circle" class="w-full" @click="cancelPopup = false">
            <icon-lucide-refresh-cw :size="18" color="#fff" />
            <text class="ml-2">我还想再试试</text>
          </u-button>
          <view class="mt-3 py-2 text-center text-sm text-gray-500 active:opacity-70" @click="doFail">
            好的，我下次再来
          </view>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script setup lang="ts">
import { useWcAsset } from '@/composables/useRuceriji'
import { onMounted, reactive, toRefs } from 'vue'

defineOptions({
  name: 'WcRunning',
  options: { virtualHost: true },
})

const props = defineProps({
  member: {
    type: Object,
    default: () => ({
      timestampDiff: 0,
      startTimestamp: 0,
    }),
  },
})

const emit = defineEmits(['fail', 'success'])

const { biz, defaultWcImage, defaultAvatarImage } = useWcAsset()

const state = reactive({
  timer: null,
  time: null,
  cancelPopup: false,
})
const { timer, time, cancelPopup } = toRefs(state)

function updateTime() {
  const now = new Date().getTime()
  const diff = now - props.member.startTimestamp * 1000 + props.member.timestampDiff * 1000
  const strings = []
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours > 0) strings.push(hours + '小时')
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  if (minutes > 0) strings.push(minutes + '分钟')
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)
  if (seconds > 0) strings.push(seconds + '秒')
  state.time = strings.join('')
}

function doFail() {
  state.cancelPopup = false
  emit('fail')
}

function doSuccess() {
  emit('success')
}

function openCancelPopup() {
  state.cancelPopup = true
}

onMounted(() => {
  updateTime()
  state.timer = setInterval(() => updateTime(), 1000)
})
</script>

<style lang="scss" scoped>
.wc-stage {
  position: relative;
}

.wc-scroll {
  flex: 1;
  min-height: 0;
}

.image-main {
  display: block;
  width: 400rpx;
  height: 400rpx;
  margin: 0 auto;
  box-sizing: border-box;
  padding: 32rpx;
  overflow: visible;
}

.btn-main,
.btn-main-same {
  width: 480rpx !important;
  height: 104rpx !important;
  min-height: 104rpx !important;
  font-size: 32rpx !important;
  margin: 0 auto;
}

.btn-main {
  background: #111111;
  color: #ffffff;
  border: none !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.btn-main-same {
  background: #ffffff !important;
  border: 1rpx solid rgba(0, 0, 0, 0.08) !important;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
}

@keyframes wc-status-breathe {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.45;
  }
}

.wc-status-dot {
  animation: wc-status-breathe 1.6s ease-in-out infinite;
}
</style>
