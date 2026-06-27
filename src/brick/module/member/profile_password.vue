<template>
  <view>
    <c-page-header title="修改密码" />
    <view class="p-8 bg-white min-h-screen">
      <view class="mb-4">
        <view class="bg-gray-100 rounded-full my-2 px-5 py-3 text-base">
          <input v-model="data.passwordOld" type="password" placeholder="输入原密码" class="w-full text-base" />
        </view>
      </view>
      <view class="mb-4">
        <view class="bg-gray-100 rounded-full my-2 px-5 py-3 text-base">
          <input v-model="data.passwordNew" type="password" placeholder="输入新密码" class="w-full text-base" />
        </view>
      </view>
      <view class="mb-4">
        <view class="bg-gray-100 rounded-full my-2 px-5 py-3 text-base">
          <input v-model="data.passwordRepeat" type="password" placeholder="确认新密码" class="w-full text-base" />
        </view>
      </view>
      <view class="mb-4">
        <button
          :loading="loading"
          class="flex w-full items-center justify-center py-2.5 px-5 text-base rounded-full bg-primary text-white cursor-pointer"
          @click="doSubmit()"
        >
          登录
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
import { AppSetting } from '@/config/setting'
import { onShow } from '@dcloudio/uni-app'
import { reactive, toRefs } from 'vue'

const { ui, getPageDefaultTitle, autoSetNavigationBarColor, SystemConfig } = useUi()

const state = reactive({
  loading: false,
  data: {
    passwordOld: '',
    passwordNew: '',
    passwordRepeat: '',
  },
})
const { loading, data } = toRefs(state)

async function doSubmit() {
  state.loading = true
  try {
    await api.post('member_profile/password', state.data)
    state.loading = false
    dialog.tipSuccess('修改成功，请重新登录', async () => {
      await api.post('logout', {})
      EventBus.$emitDelay('UpdateApp', () => {
        router.to(AppSetting.route.home)
      })
    })
  } catch {
    state.loading = false
  }
}

onShow(() => {
  Starter.boot()
})
</script>
