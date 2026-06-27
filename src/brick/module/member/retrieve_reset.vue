<template>
  <view>
    <c-page-header title="重置密码"></c-page-header>
    <view class="px-8 pt-12 pb-8 bg-white min-h-screen">
      <view class="flex flex-col items-center mb-8">
        <view class="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mb-4">
          <icon-lucide-lock-open :size="36" color="white" />
        </view>
        <text class="text-2xl font-bold text-gray-800">重置密码</text>
        <text class="text-sm text-gray-400 mt-1">设置您的新密码</text>
      </view>
      <u-steps :current="2" :active-color="activeColor">
        <u-steps-item v-for="s in steps" :key="s.title" :title="s.title" :desc="s.desc" />
      </u-steps>

      <form>
        <view class="mb-4">
          <view class="bg-gray-100 rounded-full my-2 px-5 py-3 text-base">
            <input v-model="data.username" :disabled="true" />
          </view>
        </view>
        <view class="mb-4">
          <view class="bg-gray-100 rounded-full my-2 px-5 py-3 text-base">
            <input v-model="data.password" type="password" placeholder="输入新密码" class="w-full text-base" />
          </view>
        </view>
        <view class="mb-4">
          <view class="bg-gray-100 rounded-full my-2 px-5 py-3 text-base">
            <input v-model="data.passwordRepeat" type="password" placeholder="确认新密码" class="w-full text-base" />
          </view>
        </view>
        <view class="mb-4">
          <button
            :loading="isSubmitting"
            :disabled="isSubmitting"
            class="flex w-full items-center justify-center py-2.5 px-5 text-base rounded-full bg-primary text-white cursor-pointer"
            @click="doSubmit()"
          >
            设置新密码
          </button>
        </view>
      </form>
    </view>
  </view>
</template>

<script setup lang="ts">
import { Starter } from '@/brick/BrickUni'
import { useUi } from '@/brick/composables/useBaseStore'
import { api } from '@/brick/lib/api'
import { dialog } from '@/brick/lib/dialog'
import { router } from '@/brick/lib/router'
import { onShow } from '@dcloudio/uni-app'
import { reactive, toRefs } from 'vue'
import { SystemSetting } from '../../../config/setting'

const { ui, getPageDefaultTitle, autoSetNavigationBarColor, SystemConfig } = useUi()

const state = reactive({
  isSubmitting: false,
  data: {
    username: '',
    password: '',
    passwordRepeat: '',
  },
  activeColor: SystemSetting.primaryColor,
  steps: [
    { title: '选择方式', desc: '找回密码方式' },
    { title: '验证身份', desc: '验证本人信息' },
    { title: '重置密码', desc: '重新设定新密码' },
  ],
})
const { isSubmitting, data, activeColor, steps } = toRefs(state)

async function doSubmit() {
  state.isSubmitting = true
  try {
    await api.post('retrieve_reset', state.data)
    dialog.tipSuccess('重置密码成功，请您登录', () => {
      router.replace('/brick/module/member/login')
    })
  } catch {
    state.isSubmitting = false
  }
}

onShow(() => {
  Starter.boot(async () => {
    dialog.loadingOn()
    const res = await api.post('retrieve_reset_info', {})
    dialog.loadingOff()
    state.data.username = res.data.memberUser.username
  })
})
</script>
<style lang="less" scoped>
@import './style/style';
</style>
