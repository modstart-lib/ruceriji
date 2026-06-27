<template>
  <view>
    <switch :checked="value" :disabled="disabled" color="var(--color-primary)" @change="onChange" />
  </view>
</template>

<script setup lang="ts">
defineOptions({ name: 'CSwitch' })

const props = defineProps({
  value: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['input', 'change'])

function onChange(e) {
  emit('input', e.detail.value)
  emit('change', e.detail.value)
}
</script>
