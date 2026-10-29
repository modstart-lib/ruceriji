<template>
  <view class="lock-page">
    <c-page-header title="解锁屏幕" background-color="transparent" color="#111111" />

    <view class="lock-body">
      <view class="lock-intro">
        <view class="lock-icon">
          <icon-lucide-lock-open :size="26" color="#111111" />
        </view>
        <view class="lock-title">{{ hasPin ? '输入密码解锁' : '锁屏保护未开启' }}</view>
        <view class="lock-subtitle">{{
          hasPin ? '输入 6 位数字密码继续使用' : '设置一个 6 位数字密码，防止他人查看你的记录'
        }}</view>
      </view>

      <template v-if="hasPin">
        <PinPad ref="padRef" :error="errorText" @complete="onComplete" @forgot="onForgot" />
      </template>
      <view v-else class="setup-btn" @click="router.to('/pages/password')">去设置</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { Storage } from '@/brick/lib/storage'
import { router } from '@/brick/lib/router'
import { dialog } from '@/brick/lib/dialog'
import { onReady } from '@dcloudio/uni-app'
import { reactive, ref, toRefs } from 'vue'
import PinPad from './components/PinPad.vue'

defineOptions({ name: 'PasswordVerifyPage' })

const PIN_KEY = 'rucerijiLockPin'

const state = reactive({
  hasPin: false,
  errorText: '',
  savedPin: '',
})
const { hasPin, errorText } = toRefs(state)

const padRef = ref<InstanceType<typeof PinPad> | null>(null)

function onComplete(pin: string) {
  if (pin !== state.savedPin) {
    state.errorText = '密码错误，请重试'
    padRef.value?.reset()
    return
  }
  state.errorText = ''
  dialog.tipSuccess('已解锁', () => {
    if (getCurrentPages().length > 1) {
      router.back()
    } else {
      uni.switchTab({ url: '/pages/wc' })
    }
  })
}

async function onForgot() {
  if (!(await dialog.confirm('忘记锁屏密码将清除当前设置，确定继续？'))) return
  Storage.remove(PIN_KEY)
  state.hasPin = false
  state.savedPin = ''
  dialog.tipSuccess('锁屏密码已清除')
}

onReady(() => {
  const saved = Storage.get<string>(PIN_KEY, '')
  state.savedPin = saved || ''
  state.hasPin = !!saved
})
</script>

<style lang="scss" scoped>
.lock-page {
  min-height: 100vh;
  background: var(--token-body);
  display: flex;
  flex-direction: column;
}

.lock-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 24px calc(24px + env(safe-area-inset-bottom, 0px));
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  box-sizing: border-box;
}

.lock-intro {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0 20px;
}

.lock-icon {
  width: 56px;
  height: 56px;
  border-radius: 999px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: var(--shadow-card);
  display: flex;
  align-items: center;
  justify-content: center;
}

.lock-title {
  margin-top: 16px;
  font-size: 18px;
  font-weight: 700;
  color: var(--token-text);
}

.lock-subtitle {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.5;
  text-align: center;
  color: var(--token-text-secondary);
}

.setup-btn {
  margin-top: 28px;
  height: 44px;
  padding: 0 24px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: var(--token-text-inverse);
  background: var(--token-primary);
}
</style>
