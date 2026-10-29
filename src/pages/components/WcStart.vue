<template>
  <view class="wc-stage flex min-h-0 flex-1 flex-col">
    <view
      id="blob-right"
      class="wc-motion-blob pointer-events-none absolute -right-24 -top-32 z-0 h-72 w-72 rounded-full opacity-[0.22] blur-3xl"
      style="background: var(--color-rc-primary)"
    />
    <view
      id="blob-left"
      class="wc-motion-blob wc-motion-blob--b pointer-events-none absolute -bottom-28 -left-20 z-0 h-56 w-56 rounded-full bg-amber-100/50 blur-3xl"
    />

    <view class="wc-scroll">
      <c-page-header-trans title="开始" :has-back="false" color="#111111" :float="false" />
      <view class="wc-body">
        <view class="wc-inner">
          <view class="wc-top-block wc-motion-t1">
            <view class="wc-top-status">
              <view class="wc-status-pill wc-status-pill--muted"> 如厕日记 </view>
            </view>
            <view class="wc-top-headline">
              <view
                class="mb-2 w-full text-center text-4xl font-bold leading-tight tracking-tight text-[var(--token-text)]"
              >
                健康生活
              </view>
              <view class="w-full text-center text-xl leading-7 text-[var(--token-primary-400)]"> 从便便开始 </view>
            </view>
            <view class="wc-top-card-wrap flex-col">
              <view
                v-if="timeSinceLastString"
                class="wc-motion-banner inline-flex max-w-[92%] items-center rounded-full px-5 py-2 text-center text-sm font-medium shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
                style="
                  color: var(--color-rc-primary-text);
                  background: linear-gradient(120deg, var(--color-rc-primary) 0%, #f5d84a 100%);
                "
              >
                <text class="tabular-nums">距离上次便便已经 {{ timeSinceLastString }}</text>
              </view>
              <view v-if="biz && biz.totalRecord" class="wc-top-meta">
                <text class="tabular-nums">累计 {{ biz.totalRecord }} 次</text>
                <text class="wc-top-meta__dot">·</text>
                <text class="tabular-nums">使用 {{ biz.totalDay }} 天</text>
              </view>
            </view>
          </view>
          <view class="image-main wc-motion-t2 wc-image-frame--start mt-8 shrink-0">
            <view class="wc-motion-image-inner wc-motion-image--start">
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
              @click="$emit('start')"
            >
              <icon-lucide-play :size="20" color="#fff" />
              <text class="ml-2">开始便便</text>
            </u-button>
            <view class="wc-actions-second-placeholder" />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useAppUser } from '@/brick/composables/useAppStore'
import { useWcAsset } from '@/composables/useRuceriji'
import { onMounted, reactive, toRefs, watch } from 'vue'

defineOptions({
  name: 'WcStart',
  options: { virtualHost: true },
})

const props = defineProps({
  member: {
    type: Object,
    default: () => ({
      timestampDiff: 0,
      startTimestamp: 0,
      secondSinceLast: 0,
    }),
  },
})

const emit = defineEmits(['start'])

const { biz, defaultWcImage, defaultAvatarImage } = useWcAsset()
const { user, userInit, isLogin, waitUserReady, requireUserLogin, requireUserLoginRouteTo } = useAppUser()

const state = reactive({
  timer: null,
  timeSinceLast: 0,
  timeSinceLastString: null,
})
const { timer, timeSinceLast, timeSinceLastString } = toRefs(state)

watch(
  () => props.member.secondSinceLast,
  (val) => {
    state.timeSinceLast = val
  },
  { immediate: true }
)

/**
 * 倒计时按人读的粒度显示：48 秒 / 12 分 30 秒 / 2 小时 24 分
 * 不用 02时24分33秒 这类机器格式，秒级数字用 tabular-nums 防抖
 */
function getTimeSinceLast() {
  if (!user.value || !user.value.id) return null
  const total = state.timeSinceLast
  if (total <= 0) return null
  if (total < 60) return `${total} 秒`
  if (total < 3600) return `${Math.floor(total / 60)} 分 ${total % 60} 秒`
  return `${Math.floor(total / 3600)} 小时 ${Math.floor((total % 3600) / 60)} 分`
}

onMounted(() => {
  state.timer = setInterval(() => {
    state.timeSinceLast++
    state.timeSinceLastString = getTimeSinceLast()
  }, 1000)
})
</script>

<style lang="scss" scoped>
.wc-stage {
  position: relative;
  overflow: hidden;
}

/* 间隔胶囊下的一行累计信息，让首屏除了「距离上次」还有整体进度 */
.wc-top-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 10px;
  font-size: 12px;
  color: var(--token-text-tertiary);

  &__dot {
    opacity: 0.5;
  }
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
  height: 52px !important;
  min-height: 52px !important;
  font-size: 16px !important;
  margin: 0 auto;
}

.btn-main {
  background: #111111;
  color: #ffffff;
  border: none !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}
</style>
