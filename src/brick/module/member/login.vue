<template>
  <view>
    <c-page-header ref="header" title="用户登录" :shadow="false"></c-page-header>
    <view v-if="!pageLoading" class="px-8 pt-16 pb-8 bg-white min-h-screen">
      <view class="flex flex-col items-center mb-10">
        <view class="w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-4">
          <icon-lucide-sparkles :size="40" color="white" />
        </view>
        <text class="text-2xl font-bold text-gray-800">欢迎回来</text>
        <text class="text-sm text-gray-400 mt-1">请登录您的账号</text>
      </view>
      <view class="mb-4">
        <view class="bg-gray-100 rounded-full my-2 px-5 py-3 text-base">
          <input v-model="data.username" placeholder="输入用户" class="w-full text-base" />
        </view>
      </view>
      <view class="mb-4">
        <view class="bg-gray-100 rounded-full my-2 px-5 py-3 text-base">
          <input v-model="data.password" type="password" placeholder="输入密码" class="w-full text-base" />
        </view>
      </view>
      <view v-if="config.loginCaptchaEnable">
        <view v-if="config.loginCaptchaProvider === 'tecmz'" class="mb-4">
          <c-tecmz-captcha ref="captchaRef" @success="onCaptchaData" />
        </view>
        <view v-else class="mb-4">
          <view class="bg-gray-100 rounded-full my-2 flex items-center px-4 py-2 text-base">
            <view class="flex-grow">
              <input v-model="data.captcha" placeholder="输入验证码" class="w-full text-base" />
            </view>
            <view class="flex-shrink-0">
              <c-smart-captcha ref="captchaRef" class="captcha" src="login_captcha" />
            </view>
          </view>
        </view>
      </view>
      <view v-if="config.Member_AgreementEnable || config.Member_PrivacyEnable" class="mb-4">
        <c-checkbox v-model="agreement">
          <text>同意</text>
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
        </c-checkbox>
      </view>
      <view class="mb-4">
        <u-button :loading="isSubmitting" type="primary" shape="circle" :block="true" @click="doSubmit()">
          登录
        </u-button>
      </view>
      <view v-if="!config.registerDisable">
        还没有账号？
        <c-smart-link to="/brick/module/member/register" type="link">立即注册</c-smart-link>
      </view>
      <Oauth v-if="!config.registerDisable || config.registerOauthEnable" :before-login="checkOauthAgree" />
      <Retrieve v-if="!config.retrieveDisable" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { Starter } from '@/brick/BrickUni'
import { useAppUser } from '@/brick/composables/useAppStore'
import { useConfig, useUi } from '@/brick/composables/useBaseStore'
import { api } from '@/brick/lib/api'
import { dialog } from '@/brick/lib/dialog'
import { EventBus } from '@/brick/lib/event-bus'
import { router } from '@/brick/lib/router'
import { useUserStore } from '@/store/user'
import { onReady } from '@dcloudio/uni-app'
import { reactive, ref, toRefs } from 'vue'
import Oauth from './components/Oauth'
import Retrieve from './components/Retrieve'

const delay = (cb: () => void, ms = 100) => setTimeout(cb, ms)

const { user, userInit, isLogin, waitUserReady, requireUserLogin, requireUserLoginRouteTo } = useAppUser()
const { config, SystemConfig } = useConfig()
const { ui, getPageDefaultTitle, autoSetNavigationBarColor } = useUi()

const state = reactive({
  pageLoading: true,
  isSubmitting: false,
  captchaData: null,
  agreement: false,
  data: {
    username: '',
    password: '',
    captcha: '',
  },
})
const { pageLoading, isSubmitting, captchaData, agreement, data } = toRefs(state)

const captchaRef = ref<any>(null)

function onCaptchaData(data) {
  state.captchaData = data
}

function onCaptchaError() {
  captchaRef.value.refresh()
}

async function submitLogin() {
  state.isSubmitting = true
  delay(async () => {
    try {
      const res = await api.post('login', Object.assign(state.data, state.captchaData))
      // 立即存储 token，并尽量从登录响应直接设置 user（避免等 UpdateApp 回调的闪烁）
      const token = res.data?.token || res.data?.user?.token
      const user = res.data?.user
      if (token) useUserStore().setToken(token)
      if (user && user.id) useUserStore().setUser(user)
      // 刷新应用状态，并在回调里导航（确保最新状态已同步）
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

function checkOauthAgree(): boolean {
  const needAgreement = config.value.Member_AgreementEnable || config.value.Member_PrivacyEnable
  if (needAgreement && !state.agreement) {
    dialog.tipError('请先阅读并同意用户协议及隐私政策')
    return false
  }
  return true
}

function doSubmit() {
  const needAgreement = config.value.Member_AgreementEnable || config.value.Member_PrivacyEnable
  if (needAgreement && !state.agreement) {
    dialog.confirm('您尚未勾选同意用户协议与隐私政策。是否同意并继续登录？', () => {
      state.agreement = true
      submitLogin()
    })
    return
  }
  submitLogin()
}

onReady(() => {
  Starter.boot(() => {
    if (config.value.Member_LoginPhoneEnable) {
      if ('phone' === config.value.Member_LoginDefault) {
        router.replace('/brick/module/member/login_phone', router.getQueries())
        return
      }
    }
    state.pageLoading = false
  })
})
</script>

<style lang="less" scoped>
@import './style/style';
</style>
