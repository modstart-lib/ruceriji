<template>
  <u-popup
    :show="visible"
    mode="center"
    :round="10"
    :close-on-click-overlay="false"
    :safe-area-inset-bottom="false"
    :custom-style="{ width: width }"
  >
    <view class="bg-white rounded-xl relative">
      <view class="flex py-2 items-center justify-between mb-4">
        <view class="flex-1 text-center font-bold text-lg pl-8">
          {{ title }}
        </view>
      </view>
      <view class="absolute -top-2 -right-2">
        <view
          class="shadow w-8 h-8 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center"
          @tap="visible = false"
        >
          <icon-lucide-x :size="16" />
        </view>
      </view>
      <view class="p-4">
        <slot></slot>
      </view>
    </view>
  </u-popup>
</template>

<script setup lang="ts">
import { reactive, toRefs } from 'vue'

defineOptions({ name: 'CModal' })

const props = defineProps({
  title: {
    type: [String, Boolean],
    default: '提示',
  },
  width: {
    type: String,
    default: '100%',
  },
})

const state = reactive({
  visible: false,
})
const { visible } = toRefs(state)

function show() {
  state.visible = true
}

function close() {
  state.visible = false
}

defineExpose({ show, close })
</script>
