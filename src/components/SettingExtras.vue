<template>
  <view
    class="px-4 py-3.5 flex items-center border-b border-gray-50 border-0 border-solid active:bg-gray-50 transition-colors"
    @tap="router.to('/pages/password')"
  >
    <view class="flex-shrink-0 text-gray-500 flex items-center"><icon-lucide-lock :size="18" /></view>
    <view class="flex-1 ml-2 text-sm text-gray-700"> 锁屏密码 </view>
    <view class="flex-shrink-0 text-gray-300 flex items-center"><icon-lucide-chevron-right :size="16" /></view>
  </view>
</template>

<script setup lang="ts">
import { router } from '@/brick/lib/router'

defineOptions({ name: 'SettingExtras' })
</script>
