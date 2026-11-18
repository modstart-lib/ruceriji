<template>
  <view class="min-h-screen bg-[var(--token-body)] flex flex-col">
    <c-page-header title="页面不存在" />
    <view class="flex-1 flex flex-col items-center justify-center px-8 pb-20">
      <view class="text-[80px] mb-6">🔍</view>
      <view class="text-2xl font-bold text-token-text mb-2">页面不存在</view>
      <view class="text-sm text-text-secondary text-center mb-10">你访问的页面已失效或地址有误</view>
      <view class="flex items-center gap-3">
        <view
          class="px-7 py-3 rounded-full text-sm font-semibold active:opacity-70"
          style="background: var(--token-action); color: var(--token-action-text)"
          @click="goHome"
          >回到首页</view
        >
        <view
          class="px-7 py-3 rounded-full text-sm font-semibold active:opacity-70"
          style="background: var(--token-surface); color: var(--token-text); border: 1px solid rgba(0, 0, 0, 0.1)"
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
import { AppSetting } from '@/config/setting'

defineOptions({ name: 'Page404' })

onReady(() => {
  Starter.boot()
})

function goBack() {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack()
  } else {
    uni.reLaunch({ url: AppSetting.route.home })
  }
}

function goHome() {
  uni.reLaunch({ url: AppSetting.route.home })
}
</script>
