<template>
  <view>
    <c-page-header title="找回密码"></c-page-header>
    <view class="p-8 bg-white min-h-screen">
      <c-steps :current="0" :steps="steps" />
      <view v-if="config.retrievePhoneEnable" class="p-4 mt-5">
        <c-smart-link
          class="flex w-full items-center justify-center py-2.5 px-5 text-base rounded-full bg-primary text-white cursor-pointer"
          to="/brick/module/member/retrieve_phone"
        >
          通过手机找回
        </c-smart-link>
      </view>
      <view v-if="config.retrieveEmailEnable" class="p-4 mt-5">
        <c-smart-link
          class="flex w-full items-center justify-center py-2.5 px-5 text-base rounded-full bg-primary text-white cursor-pointer"
          to="/brick/module/member/retrieve_email"
        >
          通过邮箱找回
        </c-smart-link>
      </view>
      <view v-if="!config.retrievePhoneEnable && !config.retrieveEmailEnable" class="p-8 mt-8 text-center">
        <view class="text-sm leading-relaxed" style="color: var(--token-text-secondary)">
          暂未开通找回密码，请联系客服协助处理
        </view>
        <c-smart-link class="retrieve-fallback-btn" to="/brick/module/member/login"> 返回登录 </c-smart-link>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, computed, toRefs } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUi } from '@/brick/composables/useBaseStore'
import { Starter } from '@/brick/BrickUni'
import { useBrickBaseStore } from '@/brick/composables/useBaseStore'
import Logo from './components/Logo'

const { ui, getPageDefaultTitle, autoSetNavigationBarColor, SystemConfig } = useUi()

const state = reactive({
  steps: [{ title: '选择方式' }, { title: '验证身份' }, { title: '重置密码' }],
})
const { steps } = toRefs(state)

const config = computed(() => {
  return useBrickBaseStore().config
})

onShow(() => {
  Starter.boot()
})
</script>

<style lang="less" scoped>
@import './style/style';

.retrieve-fallback-btn {
  width: 140px;
  height: 42px;
  margin: 1.5rem auto 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 0.875rem;
  color: var(--token-text);
  background-color: var(--token-surface);
  border: 1px solid var(--token-border);
}
</style>
