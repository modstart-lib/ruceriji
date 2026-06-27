<template>
  <view>
    <c-page-header :title="!!user.phone ? '修改手机' : '绑定手机'" />

    <view v-if="!!user.phone && !change" class="p-4 bg-white min-h-screen">
      <view class="rounded-xl overflow-hidden mb-2 bg-white shadow">
        <view
          class="px-4 py-3.5 flex items-center border-b border-gray-50 border-0 border-solid active:bg-gray-50 transition-colors"
        >
          <view class="flex-shrink-0 text-gray-500 flex items-center">
            <icon-lucide-smartphone :size="18" />
          </view>
          <view class="flex-1 ml-2 text-sm text-gray-700"> 您已绑定手机 </view>
          <view class="flex-shrink-0 text-gray-500 text-[14px]">
            {{ user.phone }}
          </view>
        </view>
      </view>
      <view>
        <button
          class="flex w-full items-center justify-center py-2.5 px-5 text-base rounded-full bg-primary text-white cursor-pointer"
          @tap="change = true"
        >
          立即修改
        </button>
      </view>
    </view>
    <view v-if="!user.phone || change" class="p-8 bg-white min-h-screen">
      <view class="mb-4">
        <view class="bg-gray-100 rounded-full my-2 px-5 py-3 text-base">
          <input v-model="data.phone" placeholder="输入新手机" class="w-full text-base" />
        </view>
      </view>
      <view class="mb-4">
        <view class="bg-gray-100 rounded-full my-2 flex items-center px-4 py-2 text-base">
          <view class="flex-grow">
            <input v-model="data.captcha" placeholder="输入图片验证" class="w-full text-base" />
          </view>
          <view class="flex-shrink-0">
            <c-smart-captcha ref="captchaRef" class="captcha" src="member_profile/captcha" />
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
              src="member_profile/phone_verify"
              @error="onVerifyError"
            ></c-smart-verify>
          </view>
        </view>
      </view>
      <view class="mb-4">
        <button
          :loading="loading"
          class="flex w-full items-center justify-center py-2.5 px-5 text-base rounded-full bg-primary text-white cursor-pointer"
          @click="doSubmit()"
        >
          {{ !!user.phone ? '确认修改' : '确认绑定' }}
        </button>
        <button
          v-if="!user.phone"
          class="flex w-full items-center justify-center py-2.5 px-5 text-base rounded-full cursor-pointer mt-5"
          @click="$r.back()"
        >
          暂不绑定
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { Starter } from '@/brick/BrickUni'
import { useUi } from '@/brick/composables/useBaseStore'
import { api } from '@/brick/lib/api'
import { dialog } from '@/brick/lib/dialog'
import { EventBus } from '@/brick/lib/event-bus'
import { router } from '@/brick/lib/router'
import { useUserStore } from '@/store/user'
import { onShow } from '@dcloudio/uni-app'
import { computed, reactive, ref, toRefs } from 'vue'

const delay = (cb: () => void, ms = 100) => setTimeout(cb, ms)

const { ui, getPageDefaultTitle, autoSetNavigationBarColor, SystemConfig } = useUi()

const state = reactive({
  loading: false,
  change: false,
  data: {
    phone: '',
    verify: '',
    captcha: '',
  },
})
const { loading, change, data } = toRefs(state)

const captchaRef = ref<any>(null)

const user = computed(() => {
  return useUserStore().user
})

async function doSubmit() {
  state.loading = true
  delay(async () => {
    try {
      await api.post('member_profile/phone', state.data)
      state.loading = false
      state.change = false
      state.data.phone = ''
      state.data.verify = ''
      state.data.captcha = ''
      EventBus.$emitDelay('UpdateApp')
      dialog.tipSuccess('修改成功', () => {
        const redirect = router.getQuery('redirect')
        if (redirect) {
          router.to(redirect)
        } else {
          router.back()
        }
      })
    } catch {
      state.loading = false
    }
  })
}

function onVerifyError() {
  captchaRef.value.refresh()
}

onShow(() => {
  Starter.boot()
})
</script>
