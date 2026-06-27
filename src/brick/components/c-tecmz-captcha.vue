<template>
  <view>
    <view v-if="loading" class="pb-captcha-item loading">
      <icon-lucide-refresh-cw />
      正在加载...
    </view>
    <view v-else>
      <view v-if="status === 'wait'" class="pb-captcha-item wait" @click="doVerify">
        <icon-lucide-shield-check />
        点击验证
      </view>
      <view v-if="status === 'success'" class="pb-captcha-item success" @click="doVerify">
        <icon-lucide-circle-check />
        验证成功
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, watch, onMounted, onUnmounted, toRefs } from 'vue'
import { api } from '@/brick/lib/api'
import { router } from '@/brick/lib/router'
import { EventBus } from '@/brick/lib/event-bus'

defineOptions({ name: 'CTecmzCaptcha' })

const emit = defineEmits(['success'])

const state = reactive({
  loading: true,
  appId: null,
  captchaData: {
    type: null,
    result: null,
    key: null,
  },
  status: 'wait',
})
const { loading, appId, captchaData, status } = toRefs(state)

watch(
  () => captchaData,
  (val, oldVal) => {
    if (val.type === 'verify') {
      if (val.result === 'success') {
        state.status = 'success'
        emit('success', {
          captchaKey: val.key,
        })
      }
    }
  }
)

function onCaptchaError(e) {
  refresh()
}

function doVerify() {
  refresh()
  router.startForCallback('/brick/module/tecmz/captcha', null, { appId: state.appId }, (res) => {
    state.captchaData = res
  })
}

async function load() {
  const res = await api.post('captcha_tecmz/info', {})
  state.loading = false
  state.appId = res.data.appId
}

function refresh() {
  state.captchaData = {
    type: null,
    result: null,
    key: null,
  }
  state.status = 'wait'
}

onMounted(() => {
  EventBus.$on('modstart:captcha.error', onCaptchaError)
  load()
})

onUnmounted(() => {
  EventBus.$off('modstart:captcha.error', onCaptchaError)
})
</script>

<style lang="less" scoped>
.pb-captcha-item {
  background: var(--color-content-bg);
  border-radius: 1rem;
  line-height: 2rem;
  padding: 0rem 1rem;

  .iconfont {
    margin-right: 0.2rem;
  }

  &.loading {
    color: var(--color-muted);
    background: var(--color-input-bg);
  }

  &.wait {
    color: var(--color-warning-dark);
    background: var(--color-warning-light);
  }

  &.success {
    color: var(--color-success-dark);
    background: var(--color-success-light);
  }
}
</style>
