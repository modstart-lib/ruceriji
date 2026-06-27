<template>
  <view class="min-h-screen bg-[#F7F8FA] flex flex-col">
    <c-page-header title="页面不存在" />
    <view class="flex-1 flex flex-col items-center justify-center px-8 pb-20">
      <view class="text-[80px] mb-6">🔍</view>
      <view class="text-2xl font-bold text-[#111111] mb-2">页面不存在</view>
      <view class="text-sm text-[#111111]/50 text-center mb-10">你访问的页面已失效或地址有误</view>
      <view
        class="px-8 py-3 rounded-full text-white text-sm font-semibold active:opacity-70"
        style="background-color: #111111"
        @click="goBack"
        >返回上一页</view
      >
    </view>
  </view>
</template>

<script setup lang="ts">
import { onReady } from '@dcloudio/uni-app'
import { Starter } from '@/brick/BrickUni'

defineOptions({ name: 'Page404' })

onReady(() => {
  Starter.boot()
})

function goBack() {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.reLaunch({ url: '/pages/wc' })
  }
}
</script>
