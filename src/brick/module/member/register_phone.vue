<template>
  <view>
    <c-page-header title="用户注册" :shadow="false"></c-page-header>
    <view class="px-8 pt-16 pb-8 bg-white min-h-screen">
      <view class="flex flex-col items-center mb-10">
        <view class="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mb-4">
          <icon-lucide-user-plus :size="36" color="white" />
        </view>
        <text class="text-2xl font-bold text-gray-800">创建账号</text>
        <text class="text-sm text-gray-400 mt-1">使用手机号快速注册</text>
      </view>
      <view class="mb-4">
        <view class="bg-gray-100 rounded-full my-2 px-5 py-3 text-base">
          <input v-model="data.phone" placeholder="输入手机" class="w-full text-base" />
        </view>
      </view>
      <view v-if="config.Member_RegisterCaptchaProvider === 'tecmz'" class="mb-4">
        <c-tecmz-captcha ref="captchaRef" @success="onCaptchaData" />
      </view>
      <view v-else class="mb-4">
        <view class="bg-gray-100 rounded-full my-2 flex items-center px-4 py-2 text-base">
          <view class="flex-grow">
            <input v-model="data.captcha" placeholder="输入验证码" class="w-full text-base" />
          </view>
          <view class="flex-shrink-0">
            <c-smart-captcha ref="captchaRef" class="captcha" src="register_captcha" />
          </view>
        </view>
      </view>
      <view class="mb-4">
        <view class="bg-gray-100 rounded-full my-2 flex items-center px-4 py-2 text-base">
          <view class="flex-grow">
            <input v-model="data.phoneVerify" placeholder="输入手机验证" class="w-full text-base" />
          </view>
          <view class="flex-shrink-0">
            <c-smart-verify
              v-model:target="data.phone"
              class="verify"
              src="register_phone_verify"
              :captcha="data.captcha"
              :captcha-data="captchaData"
              @error="verifySendError"
            ></c-smart-verify>
          </view>
        </view>
      </view>
      <view v-if="config.Member_RegisterPhonePasswordEnable" class="mb-4">
        <view class="bg-gray-100 rounded-full my-2 px-5 py-3 text-base">
          <input v-model="data.password" placeholder="设置登录密码" class="w-full text-base" />
        </view>
      </view>
      <view class="mb-4">
        <button
          :loading="isSubmitting"
          class="flex w-full items-center justify-center py-2.5 px-5 text-base rounded-full bg-primary text-white cursor-pointer"
          @click="doSubmit()"
        >
          注册并登录
        </button>
      </view>
      <view v-if="base.config.Member_AgreementEnable || base.config.Member_PrivacyEnable">
        <c-checkbox v-model="data.agreement" class="mr-2" />
        同意
        <c-smart-link
          v-if="base.config.Member_AgreementEnable"
          class="text-primary"
          to="/brick/module/member/doc?type=agreement"
        >
          《{{ base.config.Member_AgreementTitle }}》
        </c-smart-link>
        <c-smart-link
          v-if="base.config.Member_PrivacyEnable"
          class="text-primary"
          to="/brick/module/member/doc?type=privacy"
        >
          《{{ base.config.Member_PrivacyTitle }}》
        </c-smart-link>
      </view>
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
import { onShow } from '@dcloudio/uni-app'
import { reactive, ref, toRefs } from 'vue'

const delay = (cb: () => void, ms = 100) => setTimeout(cb, ms)

const { user, userInit, isLogin, waitUserReady, requireUserLogin, requireUserLoginRouteTo } = useAppUser()
const { config, SystemConfig } = useConfig()
const { ui, getPageDefaultTitle, autoSetNavigationBarColor } = useUi()

const state = reactive({
  isSubmitting: false,
  captchaData: null,
  captchaVerifying: false,
  captchaVerify: '',
  data: {
    phone: '',
    phoneVerify: '',
    captcha: '',
    password: '',
  },
})
const { isSubmitting, captchaData, captchaVerifying, captchaVerify, data } = toRefs(state)

const captchaRef = ref<any>(null)

function onCaptchaData(data) {
  state.captchaData = data
  blurCaptcha()
}

function blurCaptcha() {
  api
    .post(
      'register_captcha_verify',
      Object.assign(
        {
          captcha: state.data.captcha,
        },
        state.captchaData
      )
    )
    .then(() => {
      state.captchaVerify = 'pass'
      state.captchaVerifying = false
    })
    .catch(() => {
      state.captchaVerify = 'error'
      state.captchaVerifying = false
      captchaRef.value.refresh()
    })
}

function verifySendError() {
  captchaRef.value.refresh()
}

async function doSubmit() {
  state.isSubmitting = true
  const redirect = router.getQuery('redirect', '/pages/home')
  delay(async () => {
    try {
      await api.post('register_phone', Object.assign(state.data, state.captchaData))
      EventBus.$emitDelay('UpdateApp', () => {
        console.log('redirect', redirect)
        if (redirect) {
          router.replace(redirect)
        } else {
          router.relaunch()
        }
      })
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
