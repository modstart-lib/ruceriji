<template>
  <view>
    <c-page-header title="通过手机找回密码"></c-page-header>
    <view class="px-8 pt-12 pb-8 bg-white min-h-screen">
      <view class="flex flex-col items-center mb-8">
        <view class="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mb-4">
          <icon-lucide-key-round :size="36" color="white" />
        </view>
        <text class="text-base font-medium text-gray-600">手机验证找回密码</text>
      </view>
      <c-steps :current="1" :steps="steps" />
      <form>
        <view class="mb-4">
          <view class="bg-gray-100 rounded-full my-2 px-5 py-3 text-base">
            <input v-model="data.phone" placeholder="输入手机" class="w-full text-base" />
          </view>
        </view>
        <view class="mb-4">
          <view class="bg-gray-100 rounded-full my-2 flex items-center px-4 py-2 text-base">
            <view class="flex-grow">
              <input v-model="data.captcha" placeholder="输入图片验证码" class="w-full text-base" />
            </view>
            <view class="flex-shrink-0">
              <c-smart-captcha ref="captchaRef" class="captcha" src="retrieve_captcha" />
            </view>
          </view>
        </view>
        <view class="mb-4">
          <view class="bg-gray-100 rounded-full my-2 flex items-center px-4 py-2 text-base">
            <view class="flex-grow">
              <input v-model="data.verify" placeholder="输入手机验证码" class="w-full text-base" />
            </view>
            <view class="flex-shrink-0">
              <c-smart-verify
                v-model:target="data.phone"
                v-model:captcha="data.captcha"
                class="verify"
                src="retrieve_phone_verify"
                @error="verifySendError"
              ></c-smart-verify>
            </view>
          </view>
        </view>
        <view class="mb-4">
          <button
            :loading="isSubmitting"
            class="flex w-full items-center justify-center py-2.5 px-5 text-base rounded-full bg-primary text-white cursor-pointer"
            @click="doSubmit()"
          >
            下一步
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
import { router } from '@/brick/lib/router'
import { onShow } from '@dcloudio/uni-app'
import { reactive, ref, toRefs } from 'vue'

const delay = (cb: () => void, ms = 100) => setTimeout(cb, ms)

const { ui, getPageDefaultTitle, autoSetNavigationBarColor, SystemConfig } = useUi()

const state = reactive({
  isSubmitting: false,
  data: {
    phone: '',
    captcha: '',
    verify: '',
  },
  steps: [{ title: '选择方式' }, { title: '验证身份' }, { title: '重置密码' }],
})
const { isSubmitting, data, steps } = toRefs(state)

const captchaRef = ref<any>(null)

function verifySendError() {
  captchaRef.value.refresh()
}

async function doSubmit() {
  state.isSubmitting = true
  delay(async () => {
    try {
      await api.post('retrieve_phone', state.data)
      router.to('/brick/module/member/retrieve_reset')
    } catch {
      state.isSubmitting = false
    }
  })
}

onShow(() => {
  Starter.boot()
})
</script>
<style lang="less" scoped>
@import './style/style';
</style>
