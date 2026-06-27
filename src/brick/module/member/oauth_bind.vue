<template>
  <view>
    <c-page-header title="完成登录" :shadow="false"></c-page-header>
    <view class="p-4 bg-white min-h-screen">
      <view v-if="tryLogin">
        <view class="bg-white rounded-2xl p-3 shadow-sm mt-5 min-h-screen">
          <view class="py-20 flex">
            <view class="m-auto text-center">
              <view class="flex justify-center">
                <view class="flex items-center justify-center text-primary" style="width: 300rpx; height: 300rpx">
                  <icon-lucide-loader :size="120" class="animate-spin" />
                </view>
              </view>
              <view class="text-muted"> 正在获取... </view>
            </view>
          </view>
        </view>
      </view>
      <view v-else class="px-4">
        <view class="mt-5 text-center">
          <view class="h-24 mx-auto w-24 border border-solid border-body-line p-1 rounded-lg relative">
            <view
              class="rounded-lg block overflow-hidden bg-cover bg-center bg-no-repeat aspect-square"
              :style="{
                'background-image':
                  'url(' + (data.avatar ? data.avatar : avatarUpload ? avatarUpload : avatarEmpty) + ')',
              }"
            ></view>
            <!-- #ifdef MP-WEIXIN -->
            <view class="absolute bottom-0 left-0 right-0 rounded-b-lg leading-6 bg-black text-white bg-opacity-50">
              点击修改
            </view>
            <button open-type="chooseAvatar" class="absolute inset-0 opacity-0" @chooseavatar="onChooseAvatar"></button>
            <!-- #endif -->
          </view>
        </view>
        <view class="mb-4">
          <view class="input">
            <view class="control">
              <!-- #ifdef H5 -->
              <input v-model="data.username" placeholder="请输入用户名" class="w-full text-base" />
              <!-- #endif -->
              <!-- #ifdef MP-WEIXIN -->
              <input v-model="data.username" type="nickname" placeholder="请输入用户名" />
              <!-- #endif -->
            </view>
          </view>
        </view>
        <view class="mb-4">
          <view class="input with-action">
            <view class="control">
              <input
                v-model="data.captcha"
                placeholder="输入图片验证码"
                class="w-full text-base"
                @blur="blurCaptcha"
                @focus="focusCaptcha"
              />
            </view>
            <view class="action">
              <c-smart-captcha ref="captchaRef" class="captcha" src="oauth/bind_captcha" />
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
        <view v-if="config.Member_OauthBindPhoneEnable">
          <view class="mb-4">
            <view class="input">
              <input v-model="data.phone" placeholder="输入手机号" class="w-full text-base" />
            </view>
          </view>
          <view class="mb-4">
            <view class="input with-action">
              <view class="control">
                <input v-model="data.phoneVerify" placeholder="输入手机验证" class="w-full text-base" />
              </view>
              <view class="action">
                <c-smart-verify
                  v-model:target="data.phone"
                  v-model:captcha="data.captcha"
                  class="verify"
                  src="oauth/bind_phone_verify"
                  @error="verifySendError"
                ></c-smart-verify>
              </view>
            </view>
          </view>
        </view>
        <view v-if="config.Member_OauthBindEmailEnable">
          <view class="mb-4">
            <view class="input">
              <input v-model="data.email" placeholder="输入邮箱" class="w-full text-base" />
            </view>
          </view>
          <view class="mb-4">
            <view class="input with-action">
              <view class="control">
                <input v-model="data.emailVerify" placeholder="输入邮箱验证" class="w-full text-base" />
              </view>
              <view class="action">
                <c-smart-verify
                  v-model:target="data.email"
                  v-model:captcha="data.captcha"
                  class="verify"
                  src="oauth/bind_email_verify"
                  @error="verifySendError"
                ></c-smart-verify>
              </view>
            </view>
          </view>
        </view>

        <view class="submit">
          <button
            :loading="isSubmitting"
            class="flex w-full items-center justify-center py-2.5 px-5 text-base rounded-full bg-primary text-white cursor-pointer"
            @click="doSubmit()"
          >
            确定绑定
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { Starter } from '@/brick/BrickUni'
import { useAppUser } from '@/brick/composables/useAppStore'
import { useConfig, useUi } from '@/brick/composables/useBaseStore'
import { api } from '@/brick/lib/api'
import { dialog } from '@/brick/lib/dialog'
import { EntryProcessorUtil } from '@/brick/lib/entry-processor'
import { EventBus } from '@/brick/lib/event-bus'
import { router } from '@/brick/lib/router'
import { SystemSetting } from '@/config/setting'
import { onShow } from '@dcloudio/uni-app'
import { reactive, ref, toRefs } from 'vue'

const delay = (cb: () => void, ms = 100) => setTimeout(cb, ms)

defineOptions({ name: 'Avatar' })

const { user, userInit, isLogin, waitUserReady, requireUserLogin, requireUserLoginRouteTo } = useAppUser()
const { config, SystemConfig } = useConfig()
const { ui, getPageDefaultTitle, autoSetNavigationBarColor } = useUi()

const state = reactive({
  entryProcessorData: null,
  tryLogin: true,
  isSubmitting: false,
  captchaVerify: '',
  captchaVerifying: false,
  data: {
    type: '',
    avatar: '',
    username: '',
    captcha: '',
    phone: '',
    phoneVerify: '',
    email: '',
    emailVerify: '',
  },
  avatarEmpty: null,
  avatarUpload: null,
})
const { entryProcessorData, tryLogin, isSubmitting, captchaVerify, captchaVerifying, data, avatarEmpty, avatarUpload } =
  toRefs(state)

const captchaRef = ref<any>(null)

async function doOauthCallback() {
  state.entryProcessorData = EntryProcessorUtil.getEntryProcessorData()
  if (!state.entryProcessorData) {
    dialog.tipError('处理数据为空')
    return
  }
  state.data.type = state.entryProcessorData.param.type
  let code = router.getQuery('code')
  if (!code && state.entryProcessorData.query && state.entryProcessorData.query.code) {
    code = state.entryProcessorData.query.code
  }
  if (!code && state.entryProcessorData.nativeQuery && state.entryProcessorData.nativeQuery.code) {
    code = state.entryProcessorData.nativeQuery.code
  }
  if (!code && state.entryProcessorData.param.code) {
    code = state.entryProcessorData.param.code
  }
  dialog.loadingOn()
  try {
    const res = await api.post('oauth/callback', {
      code,
      type: state.data.type,
    })
    dialog.loadingOff()
    state.avatarEmpty = res.data.avatarEmpty
    state.data.avatar = res.data.user.avatar
    state.data.username = res.data.user.username
    doTryLogin()
  } catch {
    dialog.loadingOff()
  }
}

function doSuccess() {
  switch (state.entryProcessorData.param.successType) {
    case 'back':
      router.back(state.entryProcessorData.param.successBackDelta || 1)
      break
    case 'replace':
      router.replace(state.entryProcessorData.param.successRedirect || SystemSetting.route.home)
      break
  }
}

async function doTryLogin() {
  dialog.loadingOn()
  delay(async () => {
    try {
      const res = await api.post('oauth/try_login', { type: state.data.type })
      dialog.loadingOff()
      if (res.data.memberUserId) {
        state.isSubmitting = true
        dialog.tipSuccess('登录成功，正在跳转', () => {
          EventBus.$emitDelay('UpdateApp', () => {
            doSuccess()
          })
        })
      } else {
        state.tryLogin = false
      }
    } catch {
      dialog.loadingOff()
    }
  })
}

function doSubmit() {
  if (state.captchaVerifying) {
    setTimeout(() => {
      doSubmit()
    }, 100)
    return
  }
  state.isSubmitting = true
  dialog.loadingOn()
  delay(async () => {
    try {
      await api.post('oauth/bind', state.data)
      const callback = async () => {
        dialog.loadingOff()
        EventBus.$emitDelay('UpdateApp', () => {
          doSuccess()
        })
      }
      if (state.avatarUpload) {
        api.postUpload(
          'member_profile/avatar',
          {
            filePath: state.avatarUpload,
            name: 'avatar',
            formData: {
              type: 'file',
            },
          },
          (res) => {
            callback()
          },
          (res) => {
            dialog.loadingOff()
          }
        )
      } else {
        callback()
      }
    } catch {
      dialog.loadingOff()
      state.isSubmitting = false
    }
  })
}

function focusCaptcha() {
  state.captchaVerify = ''
  state.captchaVerifying = true
}

function verifySendError() {}

function blurCaptcha() {
  api
    .post('oauth/bind_captcha_verify', { captcha: state.data.captcha })
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

function onChooseAvatar(e) {
  state.avatarUpload = e.detail.avatarUrl
}

onShow(() => {
  Starter.boot(() => {
    doOauthCallback()
  })
})
</script>

<style lang="less" scoped>
@import './style/style';
</style>
