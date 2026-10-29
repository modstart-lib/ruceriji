<template>
  <view class="pin-pad">
    <!-- 进度点：未输入用描边圆，已输入用实心点（对比度 ≥ 3:1） -->
    <view class="pin-dots" :class="{ 'is-error': !!error }">
      <view v-for="(_, i) in 6" :key="i" class="pin-dot">
        <view v-if="i < pin.length" class="pin-dot-fill" />
      </view>
    </view>
    <view class="pin-error">{{ error || ' ' }}</view>

    <!-- 数字键盘 -->
    <view class="pin-keys">
      <view
        v-for="n in [1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'del']"
        :key="n"
        class="pin-key"
        :class="{ 'is-blank': n === '' }"
        :aria-label="n === 'del' ? '删除' : String(n)"
        @click="onKeyPress(n)"
      >
        <icon-lucide-delete v-if="n === 'del'" :size="22" color="var(--token-text)" />
        <template v-else>{{ n }}</template>
      </view>
    </view>

    <view v-if="showForgot" class="pin-forgot" @click="$emit('forgot')">
      <icon-lucide-circle-question-mark :size="14" class="mr-1" />
      忘记锁屏密码？
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineOptions({ name: 'PinPad' })

defineProps({
  error: { type: String, default: '' },
  showForgot: { type: Boolean, default: true },
})

const emit = defineEmits(['complete', 'forgot'])

const pin = ref('')

function onKeyPress(key) {
  if (key === '') return
  if (key === 'del') {
    pin.value = pin.value.slice(0, -1)
    return
  }
  if (pin.value.length >= 6) return
  pin.value += String(key)
  if (pin.value.length === 6) {
    emit('complete', pin.value)
  }
}

function reset() {
  pin.value = ''
}

defineExpose({ reset })
</script>

<style lang="scss" scoped>
.pin-pad {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.pin-dots {
  display: flex;
  gap: 14px;

  &.is-error {
    animation: pin-shake 0.4s ease;
  }
}

.pin-dot {
  width: 16px;
  height: 16px;
  border-radius: 999px;
  border: 1px solid #c4c4c4;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.pin-dot-fill {
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: var(--token-primary);
}

.pin-error {
  min-height: 20px;
  margin-top: 10px;
  font-size: 13px;
  color: var(--token-error);
}

.pin-keys {
  margin-top: 20px;
  width: 100%;
  max-width: 340px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.pin-key {
  height: 64px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: var(--shadow-card);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 700;
  color: var(--token-text);
  transition:
    transform 0.12s ease,
    background-color 0.12s ease;

  &:active {
    transform: scale(0.96);
    background: var(--token-body);
  }

  &.is-blank {
    background: transparent;
    border: none;
    box-shadow: none;
    pointer-events: none;
  }
}

@media (min-width: 600px) {
  .pin-keys {
    max-width: 380px;
  }

  .pin-key {
    height: 68px;
    font-size: 24px;
  }
}

/* 320×568（iPhone SE）下键盘 + 标题会超出首屏，压缩键位高度 */
@media (max-width: 359px) {
  .pin-keys {
    gap: 10px;
  }

  .pin-key {
    height: 54px;
    font-size: 20px;
  }
}

.pin-forgot {
  margin-top: 16px;
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 500;
  color: var(--token-text-secondary);
}

@keyframes pin-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-6px);
  }
  75% {
    transform: translateX(6px);
  }
}
</style>
