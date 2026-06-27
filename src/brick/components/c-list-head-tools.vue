<template>
  <view>
    <view class="bg-white rounded-xl overflow-hidden" :style="{ top: headTop }">
      <slot></slot>
    </view>
    <view class="bg-white rounded-xl overflow-hidden invisible h-0"></view>
  </view>
</template>

<script setup lang="ts">
import { computed, provide, ref } from 'vue'

defineOptions({ name: 'CListHeadTools' })

const items = ref<Array<{ doHide: () => void }>>([])

function registerItem(item: { doHide: () => void }) {
  items.value.push(item)
}
function unregisterItem(item: { doHide: () => void }) {
  items.value = items.value.filter((i) => i !== item)
}
function hideAll() {
  items.value.forEach((i) => i.doHide())
}

provide('listHeadToolsApi', { registerItem, unregisterItem, hideAll })

const props = defineProps({
  top: {
    type: String,
    default: null,
  },
  topGap: {
    type: String,
    default: null,
  },
})

const headTop = computed(() => {
  // console.log('headTop', props.topGap, props.top)
  if (props.top === null || props.top === '') {
    if (!props.topGap) {
      return state.headerHeight
    }
    return `calc( ${state.headerHeight} + ${props.topGap} )`
  }
  if (null === props.topGap) {
    return props.top
  }
  if (null === props.top) {
    return props.topGap
  }
  return `calc( ${props.top} + ${props.topGap} )`
})
</script>

<style lang="less">
:deep(.bg-white.rounded-xl.overflow-hidden) {
  c-list-head-tools-item {
    display: flex;
    flex-grow: 1;
  }
}
</style>
