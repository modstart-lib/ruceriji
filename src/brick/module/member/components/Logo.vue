<template>
  <view class="logo">
    <view class="image">
      <image class="img" mode="aspectFit" :src="config.siteLogo" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBrickBaseStore } from '@/brick/composables/useBaseStore'

defineOptions({ name: 'Logo' })

const config = computed(() => {
  return useBrickBaseStore().config
})
</script>

<style lang="less" scoped>
.logo {
  text-align: center;
  .image {
    padding: 50rpx 0 0 0;
    height: 150rpx;
    .img {
      height: 100rpx;
      width: 400rpx;
    }
  }
}
</style>
