<template>
  <view class="lock-page">
    <c-page-header title="锁屏密码" background-color="transparent" color="#111111" />

    <view class="lock-body">
      <view class="lock-intro">
        <view class="lock-icon">
          <icon-lucide-lock :size="26" color="#111111" />
        </view>
        <view class="lock-title">{{ title }}</view>
        <view class="lock-subtitle">{{ subtitle }}</view>
      </view>

      <PinPad
        ref="padRef"
        :error="errorText"
        :show-forgot="mode === 'verify'"
        @complete="onComplete"
        @forgot="onForgot"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { Storage } from '@/brick/lib/storage'
import { router } from '@/brick/lib/router'
import { dialog } from '@/brick/lib/dialog'
import { onReady } from '@dcloudio/uni-app'
import { computed, reactive, ref, toRefs } from 'vue'
import PinPad from './components/PinPad.vue'

defineOptions({ name: 'PasswordPage' })

const PIN_KEY = 'rucerijiLockPin'

const state = reactive({
  /** set → 设置；confirm → 再次确认；verify → 校验原密码 */
  mode: 'set',
  firstPin: '',
  errorText: '',
})
const { mode, firstPin, errorText } = toRefs(state)

const padRef = ref<InstanceType<typeof PinPad> | null>(null)

const title = computed(() => {
  if (state.mode === 'verify') return '请输入原密码'
  if (state.mode === 'confirm') return '再次输入以确认'
  return '设置 6 位数字密码'
})

const subtitle = computed(() => {
  if (state.mode === 'verify') return '锁屏仅用于防止误触，数据仍保存在你的账号中'
  if (state.mode === 'confirm') return '两次输入需要一致'
  return '用于解锁 App，忘记可在验证页重置'
})

function fail(text: string) {
  state.errorText = text
  padRef.value?.reset()
}

function onComplete(pin: string) {
  state.errorText = ''

  if (state.mode === 'set') {
    state.firstPin = pin
    state.mode = 'confirm'
    padRef.value?.reset()
    return
  }

  if (state.mode === 'confirm') {
    if (pin !== state.firstPin) {
      state.mode = 'set'
      state.firstPin = ''
      fail('两次输入不一致，请重新设置')
      return
    }
    Storage.set(PIN_KEY, pin)
    dialog.tipSuccess('锁屏密码已设置', () => router.back())
    return
  }

  const saved = Storage.get<string>(PIN_KEY, '')
  if (pin !== saved) {
    fail('密码错误，请重试')
    return
  }
  dialog.tipSuccess('已解锁', () => router.back())
}

async function onForgot() {
  if (!(await dialog.confirm('忘记锁屏密码将清除当前设置，确定继续？'))) return
  Storage.remove(PIN_KEY)
  dialog.tipSuccess('锁屏密码已清除', () => router.back())
}

onReady(() => {
  const saved = Storage.get<string>(PIN_KEY, '')
  state.mode = saved ? 'verify' : 'set'
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
</style>
