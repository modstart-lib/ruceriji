<template>
  <view>
    <c-page-header title="用户注册" :shadow="false"></c-page-header>
    <view v-if="show" class="px-8 pt-16 pb-8 bg-white min-h-screen">
      <view class="flex flex-col items-center mb-10">
        <view class="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mb-4">
          <icon-lucide-user-plus :size="36" color="white" />
        </view>
        <text class="text-2xl font-bold text-gray-800">创建账号</text>
        <text class="text-sm text-gray-400 mt-1">注册您的新账号</text>
      </view>
      <form>
        <view class="mb-4">
          <view class="bg-gray-100 rounded-full my-2 px-5 py-3 text-base">
            <input v-model="data.username" placeholder="输入用户名" class="w-full text-base" />
          </view>
        </view>
        <view class="mb-4">
          <view class="bg-gray-100 rounded-full my-2 px-5 py-3 text-base">
            <input v-model="data.password" type="password" placeholder="输入密码" class="w-full text-base" />
          </view>
        </view>
        <view class="mb-4">
          <view class="bg-gray-100 rounded-full my-2 px-5 py-3 text-base">
            <input v-model="data.passwordRepeat" type="password" placeholder="重复确认密码" class="w-full text-base" />
          </view>
        </view>
        <view v-if="config.Member_RegisterCaptchaProvider === 'tecmz'" class="mb-4">
          <c-tecmz-captcha ref="captchaRef" @success="onCaptchaData" />
        </view>
        <view v-else class="mb-4">
          <view class="bg-gray-100 rounded-full my-2 flex items-center px-4 py-2 text-base">
            <view class="flex-grow">
              <input
                v-model="data.captcha"
                placeholder="输入图片验证码"
                class="w-full text-base"
                @blur="blurCaptcha"
                @focus="focusCaptcha"
              />
            </view>
            <view class="flex-shrink-0">
              <c-smart-captcha ref="captchaRef" class="captcha" src="register_captcha" />
            </view>
          </view>
          <div class="help">
            <view v-if="captchaVerify === ''" class="text-muted">
              <icon-lucide-triangle-alert class="mr-1" />
              输入图片验证码完成校验
            </view>
            <view v-if="captchaVerify === 'pass'" class="text-success">
              <icon-lucide-check class="mr-1" />
              图片验证码验证通过
            </view>
            <view v-if="captchaVerify === 'error'" class="text-danger">
              <icon-lucide-x class="mr-1" />
              图片验证码验证错误
            </view>
          </div>
        </view>
        <view v-if="config.registerPhoneEnable" class="mb-4">
          <view class="bg-gray-100 rounded-full my-2 px-5 py-3 text-base">
            <input v-model="data.phone" placeholder="输入手机号" class="w-full text-base" />
          </view>
        </view>
        <view v-if="config.registerPhoneEnable" class="mb-4">
          <view class="bg-gray-100 rounded-full my-2 flex items-center px-4 py-2 text-base">
            <view class="flex-grow">
              <input v-model="data.phoneVerify" placeholder="输入手机验证" class="w-full text-base" />
            </view>
            <view class="flex-shrink-0">
              <c-smart-verify
                v-model:target="data.phone"
                v-model:captcha="data.captcha"
                class="verify"
                src="register_phone_verify"
                @error="verifySendError"
              ></c-smart-verify>
            </view>
          </view>
        </view>
        <view v-if="config.registerEmailEnable" class="mb-4">
          <view class="bg-gray-100 rounded-full my-2 px-5 py-3 text-base">
            <input v-model="data.email" placeholder="输入邮箱" class="w-full text-base" />
          </view>
        </view>
        <view v-if="config.registerEmailEnable" class="mb-4">
          <view class="bg-gray-100 rounded-full my-2 flex items-center px-4 py-2 text-base">
            <view class="flex-grow">
              <input v-model="data.emailVerify" placeholder="输入邮箱验证" class="w-full text-base" />
            </view>
            <view class="flex-shrink-0">
              <c-smart-verify
                v-model:target="data.email"
                v-model:captcha="data.captcha"
                class="verify"
                src="register_email_verify"
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
            注册
          </button>
        </view>
        <view v-if="config.Member_AgreementEnable || config.Member_PrivacyEnable">
          <c-checkbox v-model="data.agreement" class="mr-2" />
          同意
          <c-smart-link
            v-if="config.Member_AgreementEnable"
            class="text-primary"
            to="/brick/module/member/doc?type=agreement"
          >
            《{{ config.Member_AgreementTitle }}》
          </c-smart-link>
          <c-smart-link
            v-if="config.Member_PrivacyEnable"
            class="text-primary"
            to="/brick/module/member/doc?type=privacy"
          >
            《{{ config.Member_PrivacyTitle }}》
          </c-smart-link>
        </view>
      </form>
      <Oauth v-if="!config.registerDisable || config.registerOauthEnable" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { Starter } from '@/brick/BrickUni'
import { useAppUser } from '@/brick/composables/useAppStore'
import { useConfig, useUi } from '@/brick/composables/useBaseStore'
import { api } from '@/brick/lib/api'
import { dialog } from '@/brick/lib/dialog'
import { router } from '@/brick/lib/router'
import { onShow } from '@dcloudio/uni-app'
import { reactive, ref, toRefs } from 'vue'
import { SystemSetting } from '../../../config/setting'
import Oauth from './components/Oauth'

const delay = (cb: () => void, ms = 100) => setTimeout(cb, ms)

const { user, userInit, isLogin, waitUserReady, requireUserLogin, requireUserLoginRouteTo } = useAppUser()
const { config, SystemConfig } = useConfig()
const { ui, getPageDefaultTitle, autoSetNavigationBarColor } = useUi()

const state = reactive({
  captchaData: null,
  isSubmitting: false,
  show: false,
  data: {
    agreement: false,
    username: '',
    captcha: '',
    phone: '',
    phoneVerify: '',
    email: '',
    emailVerify: '',
    password: '',
    passwordRepeat: '',
  },
  captchaVerifying: false,
  captchaVerify: '',
})
const { captchaData, isSubmitting, show, data, captchaVerifying, captchaVerify } = toRefs(state)

const captchaRef = ref<any>(null)

function onCaptchaData(data) {
  state.captchaData = data
  blurCaptcha()
}

function focusCaptcha() {
  state.captchaVerify = ''
  state.captchaVerifying = true
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
    .then((res) => {
      state.captchaVerify = 'pass'
      state.captchaVerifying = false
    })
    .catch((res) => {
      state.captchaVerify = 'error'
      state.captchaVerifying = false
      captchaRef.value.refresh()
      return true
    })
}

function verifySendError() {}

async function doSubmit() {
  if (state.captchaVerifying) {
    setTimeout(() => {
      doSubmit()
    }, 100)
    return
  }
  state.isSubmitting = true
  delay(async () => {
    try {
      await api.post('register', state.data)
      dialog.tipSuccess('注册成功，请登录', () => {
        router.replace(SystemSetting.route.login)
      })
    } catch {
      state.isSubmitting = false
    }
  })
}

onShow(() => {
  Starter.boot(() => {
    if (config.value.Member_RegisterPhoneEnable) {
      if (config.value.Member_RegisterDefault === 'phone') {
        router.replace('/brick/module/member/register_phone')
        return
      }
    }
    state.show = true
  })
})
</script>

<style lang="less" scoped>
@import './style/style';
</style>
