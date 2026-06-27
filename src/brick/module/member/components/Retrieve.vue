<template>
  <view v-if="config.retrievePhoneEnable || config.retrieveEmailEnable">
    <view v-if="!config.retrieveDisable" class="retrieve">
      <text class="mr-2">忘记密码?</text>
      <c-smart-link to="/brick/module/member/retrieve" type="link">找回密码</c-smart-link>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBrickBaseStore } from '@/brick/composables/useBaseStore'

defineOptions({ name: 'Retrieve' })

const config = computed(() => {
  return useBrickBaseStore().config
})
</script>

<style lang="less" scoped>
.retrieve {
  margin-top: 40rpx;
  margin-bottom: 40rpx;
  text-align: center;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>
