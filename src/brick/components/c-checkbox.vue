<template>
  <view
    class="inline-flex items-start flex-wrap cursor-pointer"
    :class="{ 'opacity-50 pointer-events-none': disabled }"
    @click="onRowClick"
  >
    <view class="pb-ui-checkbox text-primary flex-shrink-0 mr-2 flex items-center leading-none self-start">
      <icon-lucide-square v-if="!checked" />
      <icon-lucide-square-check v-else />
    </view>
    <view class="flex-1 min-w-0 leading-relaxed">
      <slot></slot>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'CCheckbox' })

const props = defineProps({
  /** Vue 3 v-model */
  modelValue: { type: Boolean, default: undefined },
  /** 兼容旧写法 / Vue 2 风格 */
  value: { type: [Boolean, null], default: false },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['input', 'update:modelValue'])

const checked = computed(() => (props.modelValue !== undefined ? props.modelValue : !!props.value))

function onInput(val: boolean) {
  if (props.disabled) {
    return
  }
  emit('input', val)
  emit('update:modelValue', val)
}

function onRowClick() {
  onInput(!checked.value)
}
</script>

<style lang="less" scoped>
.pb-ui-checkbox {
  font-size: 40rpx;
}
</style>
