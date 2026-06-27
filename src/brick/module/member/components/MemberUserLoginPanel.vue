<template>
  <view>
    <view v-if="userInit && user.id > 0" class="pb-member-user-login-panel relative">
      <view class="box">
        <view class="flex items-center">
          <view
            class="block overflow-hidden bg-cover bg-center bg-no-repeat aspect-square w-10 rounded-full mr-2 bg-gray-200"
            :style="{ backgroundImage: `url(${userInit ? user.avatar : ''})` }"
          ></view>
          <view>
            <view>
              {{ userInit ? user.viewName : '加载中...' }}
            </view>
            <view>
              <slot>
                <view class="profile">
                  <view v-if="userInit && !user.id" @click="requireUserLogin(() => {}, true)"> 点击登录 </view>
                  <view v-else @click="router.to('/pages/member')"> 会员中心 </view>
                </view>
              </slot>
            </view>
          </view>
        </view>
        <slot name="append"></slot>
      </view>
    </view>
    <view v-else-if="userInit && user.id <= 0" class="pb-member-user-login-panel px-0 pt-0 -mb-3">
      <view v-if="'phone' === config.Member_LoginDefault">
        <view class="mb-4">
          <view class="bg-gray-100 rounded-full my-2 px-5 py-3 text-base">
            <input v-model="dataPhone.phone" placeholder="输入手机" class="w-full text-base" />
          </view>
        </view>
        <view
          v-if="dataPhone.phone && dataPhone.phone.length >= 11 && config.loginCaptchaProvider === 'tecmz'"
          class="mb-4"
        >
          <c-tecmz-captcha ref="captchaRef" @success="onCaptchaData" />
        </view>
        <view v-else-if="dataPhone.phone && dataPhone.phone.length >= 11" class="mb-4">
          <view class="bg-gray-100 rounded-full my-2 flex items-center px-4 py-2 text-base">
            <view class="flex-grow">
              <input v-model="dataPhone.captcha" placeholder="输入验证码" class="w-full text-base" />
            </view>
            <view class="flex-shrink-0">
              <c-smart-captcha ref="captchaRef" class="captcha" src="login_phone_captcha" />
            </view>
          </view>
        </view>
        <view v-if="dataPhone.phone && dataPhone.phone.length >= 11" class="mb-4">
          <view class="bg-gray-100 rounded-full my-2 flex items-center px-4 py-2 text-base">
            <view class="flex-grow">
              <input v-model="dataPhone.verify" placeholder="输入手机验证" class="w-full text-base" />
            </view>
            <view class="flex-shrink-0">
              <c-smart-verify
                v-model:target="dataPhone.phone"
                class="verify"
                src="login_phone_verify"
                :captcha="dataPhone.captcha"
                :captcha-data="captchaData"
                @error="onCaptchaError"
              ></c-smart-verify>
            </view>
          </view>
        </view>
        <view class="mb-4">
          <view
            class="flex w-full items-center justify-center py-2.5 px-5 text-base rounded-full bg-primary text-white cursor-pointer"
            @click="doSubmitPhone()"
          >
            登录
          </view>
        </view>
      </view>
      <view v-else>
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
        <view class="mb-4">
          <view
            class="flex w-full items-center justify-center py-2.5 px-5 text-base rounded-full bg-primary text-white cursor-pointer"
            @click="doSubmit()"
          >
            登录
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useConfig } from '@/brick/composables/useBaseStore'
import { useUser } from '@/brick/composables/useUser'
import { api } from '@/brick/lib/api'
import { dialog } from '@/brick/lib/dialog'
import { EventBus } from '@/brick/lib/event-bus'
import { router } from '@/brick/lib/router'
import { useUserStore } from '@/store/user'
import { reactive, ref, toRefs } from 'vue'

const delay = (cb: () => void, ms = 100) => setTimeout(cb, ms)

defineOptions({ name: 'MemberUserLoginPanel' })

const emit = defineEmits(['update'])

const { config, SystemConfig } = useConfig()
const { user, userInit, requireUserLogin, requireUserLoginRouteTo } = useUser()

const state = reactive({
  pageLoading: false,
  isSubmitting: false,
  captchaData: null,
  data: {
    username: '',
    password: '',
    captcha: '',
  },
  dataPhone: {
    phone: '',
    verify: '',
    captcha: '',
  },
})
const { pageLoading, isSubmitting, captchaData, data, dataPhone } = toRefs(state)

const captchaRef = ref<any>(null)

function onCaptchaData(data) {
  state.captchaData = data
}

function onCaptchaError() {
  captchaRef.value.refresh()
}

function doLogout() {
  dialog.confirm('确认退出登录？', async () => {
    const redirect = router.getQuery('redirect')
    if (config.value.ssoClientEnable) {
      // window.__Dao.exec('sso/server_logout_prepare', {
      //     domainUrl: UrlUtil.domainUrl(),
      // }, res => {
      //     window.location.href = res.data.redirect
      // })
    } else {
      await api.post('logout', {})
      EventBus.$emitDelay('UpdateApp', () => {
        dialog.tipSuccess('退出成功')
        emit('update')
      })
    }
  })
}

async function doSubmit() {
  state.isSubmitting = true
  delay(async () => {
    try {
      const res = await api.post('login', Object.assign(state.data, state.captchaData))
      const token = res.data?.token || res.data?.user?.token
      if (token) {
        useUserStore().setToken(token)
      }
      EventBus.$emitDelay('UpdateApp', () => {
        dialog.tipSuccess('登录成功')
        state.isSubmitting = false
        emit('update')
      })
    } catch {
      state.isSubmitting = false
    }
  })
}

async function doSubmitPhone() {
  state.isSubmitting = true
  delay(async () => {
    try {
      const res = await api.post('login_phone', Object.assign(state.dataPhone, state.captchaData))
      const token = res.data?.token || res.data?.user?.token
      if (token) {
        useUserStore().setToken(token)
      }
      EventBus.$emitDelay('UpdateApp', () => {
        dialog.tipSuccess('登录成功')
        state.isSubmitting = false
        emit('update')
      })
    } catch {
      state.isSubmitting = false
    }
  })
}
</script>
