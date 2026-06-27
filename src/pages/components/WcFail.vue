<template>
  <view class="wc-stage flex min-h-0 flex-1 flex-col">
    <view
      class="wc-motion-blob pointer-events-none absolute -right-20 top-1/4 z-0 h-64 w-64 rounded-full bg-amber-100/35 blur-3xl"
    />
    <view
      class="wc-motion-blob wc-motion-blob--b pointer-events-none absolute -bottom-24 -left-16 z-0 h-52 w-52 rounded-full opacity-[0.15] blur-3xl"
      style="background: var(--color-rc-primary)"
    />

    <view class="wc-scroll">
      <c-page-header-trans title="开始" :has-back="false" color="#111111" :float="false" />
      <view class="wc-body">
        <view class="wc-inner">
          <view class="wc-top-block wc-motion-t1">
            <view class="wc-top-status">
              <view class="wc-status-pill wc-status-pill--soft"> 别灰心 </view>
            </view>
            <view class="wc-top-headline">
              <view
                class="mb-2 w-full text-center text-4xl font-bold leading-tight tracking-tight text-[var(--token-text)]"
              >
                本次未成功
              </view>
              <view class="w-full text-center text-xl leading-7 text-[var(--token-primary-400)]"> 休息一下也好 </view>
            </view>
            <view class="wc-top-card-wrap">
              <view
                class="line-clamp-2 max-w-[92%] text-center text-sm leading-relaxed text-[var(--token-primary-400)]"
              >
                没关系，下次有感觉了早点来！
              </view>
            </view>
          </view>
          <view class="image-main wc-motion-t2 wc-image-frame--fail mt-8 shrink-0">
            <view class="wc-motion-image-inner wc-motion-image--fail">
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
              }"
            >
              {{ countdown }} 秒后返回
            </u-button>
            <view class="wc-actions-second-placeholder" />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useWcAsset } from '@/composables/useRuceriji'
import { onMounted, reactive, toRefs } from 'vue'

defineOptions({
  name: 'WcFail',
  options: { virtualHost: true },
})

const props = defineProps({
  member: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['back'])

const { biz, defaultWcImage, defaultAvatarImage } = useWcAsset()

const state = reactive({
  countdown: 3,
  timer: null,
})
const { countdown, timer } = toRefs(state)

onMounted(() => {
  state.countdown = 3
  state.timer = setInterval(() => {
    state.countdown--
    if (state.countdown <= 0) {
      clearInterval(state.timer)
      emit('back')
    }
  }, 1000)
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
</style>
