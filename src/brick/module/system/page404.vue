<template>
  <view class="min-h-screen bg-[#F7F8FA] flex flex-col">
    <c-page-header title="页面不存在" />
    <view class="flex-1 flex flex-col items-center justify-center px-8 pb-20">
      <view class="text-[80px] mb-6">🔍</view>
      <view class="text-2xl font-bold text-[#111111] mb-2">页面不存在</view>
      <view class="text-sm text-[#111111]/50 text-center mb-10">你访问的页面已失效或地址有误</view>
      <view class="flex items-center gap-3">
        <view
          class="px-7 py-3 rounded-full text-sm font-semibold active:opacity-70"
          style="background-color: #111111; color: #ffffff"
          @click="goHome"
          >回到首页</view
        >
        <view
          class="px-7 py-3 rounded-full text-sm font-semibold active:opacity-70"
          style="background: #ffffff; color: #111111; border: 1px solid rgba(0, 0, 0, 0.1)"
          @click="goBack"
          >返回上一页</view
        >
      </view>
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

function goHome() {
  uni.reLaunch({ url: '/pages/wc' })
}
</script>
