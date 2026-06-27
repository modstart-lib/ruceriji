<template>
  <view>
    <c-page-header title="用户登录" :shadow="false"></c-page-header>
    <view class="px-8 pt-16 pb-8 bg-white min-h-screen">
      <view class="flex flex-col items-center mb-10">
        <view class="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mb-4">
          <icon-lucide-smartphone :size="36" color="white" />
        </view>
        <text class="text-2xl font-bold text-gray-800">欢迎回来</text>
        <text class="text-sm text-gray-400 mt-1">请使用手机号登录</text>
      </view>
      <view class="mb-4">
        <view class="bg-gray-100 rounded-full my-2 px-5 py-3 text-base">
          <input v-model="data.phone" placeholder="输入手机" class="w-full text-base" />
        </view>
      </view>
      <view v-if="data.phone && config.loginCaptchaProvider === 'tecmz'" class="mb-4">
        <c-tecmz-captcha ref="captchaRef" @success="onCaptchaData" />
      </view>
      <view v-else-if="data.phone" class="mb-4">
        <view class="bg-gray-100 rounded-full my-2 flex items-center px-4 py-2 text-base">
          <view class="flex-grow">
            <input v-model="data.captcha" placeholder="输入验证码" class="w-full text-base" />
          </view>
          <view class="flex-shrink-0">
            <c-smart-captcha ref="captchaRef" class="captcha" src="login_phone_captcha" />
          </view>
        </view>
      </view>
      <view v-if="data.phone" class="mb-4">
        <view class="bg-gray-100 rounded-full my-2 flex items-center px-4 py-2 text-base">
          <view class="flex-grow">
            <input v-model="data.verify" placeholder="输入手机验证" class="w-full text-base" />
          </view>
          <view class="flex-shrink-0">
            <c-smart-verify
              v-model:target="data.phone"
              class="verify"
              src="login_phone_verify"
              :captcha="data.captcha"
              :captcha-data="captchaData"
              @error="onCaptchaError"
            ></c-smart-verify>
          </view>
        </view>
      </view>
      <view class="mb-4">
        <view
          :loading="isSubmitting"
          class="flex w-full items-center justify-center py-2.5 px-5 text-base rounded-full bg-primary text-white cursor-pointer"
          @click="doSubmit()"
        >
          登录
        </view>
      </view>
      <view v-if="!config.registerDisable">
        还没有账号？
        <c-smart-link to="/brick/module/member/register" type="link">立即注册</c-smart-link>
      </view>
      <Oauth v-if="!config.registerDisable || config.registerOauthEnable" />
      <Retrieve />
    </view>
  </view>
</template>

<script setup lang="ts">
import { Starter } from '@/brick/BrickUni'
import { useAppUser } from '@/brick/composables/useAppStore'
import { useConfig, useUi } from '@/brick/composables/useBaseStore'
import { api } from '@/brick/lib/api'
import { EventBus } from '@/brick/lib/event-bus'
import { router } from '@/brick/lib/router'
import { onReady } from '@dcloudio/uni-app'
import { reactive, ref, toRefs } from 'vue'
import Oauth from './components/Oauth'
import Retrieve from './components/Retrieve'

const delay = (cb: () => void, ms = 100) => setTimeout(cb, ms)

const { user, userInit, isLogin, waitUserReady, requireUserLogin, requireUserLoginRouteTo } = useAppUser()
const { config, SystemConfig } = useConfig()
const { ui, getPageDefaultTitle, autoSetNavigationBarColor } = useUi()

const state = reactive({
  isSubmitting: false,
  captchaData: null,
  data: {
    phone: '',
    verify: '',
    captcha: '',
  },
})
const { isSubmitting, captchaData, data } = toRefs(state)

const captchaRef = ref<any>(null)

function onCaptchaData(data) {
  state.captchaData = data
}

function onCaptchaError() {
  captchaRef.value.refresh()
}

async function doSubmit() {
  state.isSubmitting = true
  delay(async () => {
    try {
      await api.post('login_phone', Object.assign(state.data, state.captchaData))
      EventBus.$emitDelay('UpdateApp', () => {
        const redirect = router.getQuery('redirect')
        if (redirect) {
          router.replace(redirect)
        } else {
          router.back()
        }
      })
    } catch {
      state.isSubmitting = false
    }
  })
}

onReady(() => {
  Starter.boot()
})
</script>

<style lang="less" scoped>
@import './style/style';
</style>
