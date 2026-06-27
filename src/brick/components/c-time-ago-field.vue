<template>
  <text>{{ time }}</text>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { format, render, cancel, register } from 'timeago.js'

defineOptions({ name: 'CTimeAgoField' })

const props = defineProps({
  value: null,
})

const time = computed(() => {
  if (!props.value) {
    return '-'
  }
  return format(props.value, 'zh_CN')
})
</script>
