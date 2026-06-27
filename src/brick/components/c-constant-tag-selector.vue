<template>
  <view class="pb-constant-tag-selector">
    <block v-for="(item, itemIndex) in values" :key="itemIndex">
      <text
        v-if="modelValue === item.value"
        class="inline-block rounded-full px-3 py-0.5 text-xs text-center whitespace-nowrap align-middle cursor-default bg-black/[.04] text-primary mr-1"
      >
        {{ item.name }}
      </text>
      <text
        v-else
        class="inline-block rounded-full px-3 py-0.5 text-xs text-center whitespace-nowrap align-middle cursor-default text-[#1677ff] bg-[#e6f4ff] mr-1"
        @tap="doTap(item)"
      >
        {{ item.name }}
      </text>
    </block>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'CConstantTagSelector' })

const props = defineProps({
  name: {
    type: String,
    default: '',
  },
  types: {
    type: Object,
    default: null,
  },
})

const values = computed(() => {
  if (null !== props.types) {
    return Object.values(props.types)
  }
  let vs = []
  if (props.name in Constants) {
    const v = Constants[props.name]
    Object.keys(v).forEach((k) => {
      vs.push({
        name: v[k].name,
        value: v[k].value,
        key: k,
      })
    })
  }
  return vs
})

function doTap(item) {
  state.onInput(item.value)
}
</script>

<style lang="less" scoped>
.pb-constant-tag-selector {
  display: flex;
  flex-wrap: wrap;
}
</style>
