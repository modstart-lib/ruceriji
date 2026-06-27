<template>
  <view>
    <view v-if="block > 0" class="p-4 bg-content-bg rounded-lg">
      <view v-for="i in block" :key="i" class="bg-gray-100 h-8 rounded" :class="i === 1 ? '' : 'mt-6'"></view>
    </view>
    <view v-else-if="page" class="p-4 bg-content-bg rounded-lg">
      <view style="min-height: 100vh">
        <view v-for="i in count" :key="i" class="bg-gray-100 h-8 rounded" :class="i === 1 ? '' : 'mt-6'"></view>
      </view>
    </view>
    <view v-else-if="mini" class="text-center text-muted py-10">
      <view class="inline-block mr-1" :class="spin ? 'animate-spin' : ''">
        <text :class="'text-center text-muted'"></text>
      </view>
      {{ text }}
    </view>
    <view v-else class="text-center text-muted py-10">
      <view class="text-center text-muted">
        <view :class="spin ? 'animate-spin inline-block' : ''">
          <text :class="'text-center text-muted'"></text>
        </view>
      </view>
      <view class="text-muted pt-4">{{ text }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineOptions({ name: 'CLoading' })

const props = defineProps({
  text: {
    type: String,
    default: '正在加载',
  },
  icon: {
    type: String,
    default: 'iconfont icon-refresh',
  },
  spin: {
    type: Boolean,
    default: true,
  },
  mini: {
    type: Boolean,
    default: false,
  },
  page: {
    type: Boolean,
    default: false,
  },
  count: {
    type: Number,
    default: 10,
  },
  block: {
    type: Number,
    default: 0,
  },
})
</script>
