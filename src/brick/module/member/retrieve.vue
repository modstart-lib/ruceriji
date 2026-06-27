<template>
  <view>
    <c-page-header title="找回密码"></c-page-header>
    <view class="p-8 bg-white min-h-screen">
      <u-steps :current="0" :active-color="activeColor">
        <u-steps-item v-for="s in steps" :key="s.title" :title="s.title" :desc="s.desc" />
      </u-steps>
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
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, computed, toRefs } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useUi } from '@/brick/composables/useBaseStore'
import { Starter } from '@/brick/BrickUni'
import { useBrickBaseStore } from '@/brick/composables/useBaseStore'
import { SystemSetting } from '../../../config/setting'
import Logo from './components/Logo'

const { ui, getPageDefaultTitle, autoSetNavigationBarColor, SystemConfig } = useUi()

const state = reactive({
  activeColor: SystemSetting.primaryColor,
  steps: [
    { title: '选择方式', desc: '找回密码方式' },
    { title: '验证身份', desc: '验证本人信息' },
    { title: '重置密码', desc: '重新设定新密码' },
  ],
})
const { activeColor, steps } = toRefs(state)

const config = computed(() => {
  return useBrickBaseStore().config
})

onShow(() => {
  Starter.boot()
})
</script>

<style lang="less" scoped>
@import './style/style';
</style>
