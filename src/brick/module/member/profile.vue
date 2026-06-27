<template>
  <view>
    <c-page-header title="我的资料" />

    <view class="p-2">
      <view class="rounded-xl overflow-hidden mb-2 bg-white">
        <view
          class="px-4 py-3.5 flex items-center border-b border-gray-50 border-0 border-solid active:bg-gray-50 transition-colors"
          @tap="nicknameEditRef?.show()"
        >
          <view class="flex-shrink-0 text-gray-500 flex items-center">
            <icon-lucide-smile :size="18" />
          </view>
          <view class="flex-1 ml-2 text-sm text-gray-700"> 昵称 </view>
          <view class="value text-gray-500 text-[14px]">
            <text v-if="user.nickname">{{ user.nickname }}</text>
            <text v-else class="text-muted">未设置</text>
          </view>
        </view>
        <view
          class="px-4 py-3.5 flex items-center border-b border-gray-50 border-0 border-solid active:bg-gray-50 transition-colors"
        >
          <view class="flex-shrink-0 text-gray-500 flex items-center">
            <icon-lucide-info :size="18" />
          </view>
          <view class="flex-1 ml-2 text-sm text-gray-700"> 账号 </view>
          <view class="value text-gray-500 text-[14px]">
            <text v-if="user.username">{{ user.username }}</text>
            <text v-else class="text-muted">未设置</text>
          </view>
        </view>
      </view>

      <view class="rounded-xl overflow-hidden mb-2 bg-white">
        <view
          class="px-4 py-3.5 flex items-center border-b border-gray-50 border-0 border-solid active:bg-gray-50 transition-colors"
          @tap="router.to('/brick/module/member/profile_avatar')"
        >
          <view class="flex-shrink-0 text-gray-500 flex items-center">
            <icon-lucide-smile :size="18" />
          </view>
          <view class="flex-1 ml-2 text-sm text-gray-700"> 修改头像 </view>
          <view class="flex-shrink-0 text-gray-300 flex items-center"><icon-lucide-chevron-right :size="16" /></view>
        </view>
        <view
          class="px-4 py-3.5 flex items-center border-b border-gray-50 border-0 border-solid active:bg-gray-50 transition-colors"
          @tap="router.to('/brick/module/member/profile_password')"
        >
          <view class="flex-shrink-0 text-gray-500 flex items-center">
            <icon-lucide-key-round :size="18" />
          </view>
          <view class="flex-1 ml-2 text-sm text-gray-700"> 修改密码 </view>
          <view class="flex-shrink-0 text-gray-300 flex items-center"><icon-lucide-chevron-right :size="16" /></view>
        </view>
      </view>

      <view class="rounded-xl overflow-hidden mb-2 bg-white">
        <view
          v-if="config.Member_ProfilePhoneEnable"
          class="px-4 py-3.5 flex items-center border-b border-gray-50 border-0 border-solid active:bg-gray-50 transition-colors"
          @tap="router.to('/brick/module/member/profile_phone')"
        >
          <view class="flex-shrink-0 text-gray-500 flex items-center">
            <icon-lucide-smartphone :size="18" />
          </view>
          <view class="flex-1 ml-2 text-sm text-gray-700"> 手机 </view>
          <view class="value text-gray-500 text-[14px]">
            {{ user.phone ? user.phone : '' }}
          </view>
          <view class="flex-shrink-0 text-gray-300 flex items-center"><icon-lucide-chevron-right :size="16" /></view>
        </view>
        <view
          v-if="config.Member_ProfileEmailEnable"
          class="px-4 py-3.5 flex items-center border-b border-gray-50 border-0 border-solid active:bg-gray-50 transition-colors"
          @tap="router.to('/brick/module/member/profile_email')"
        >
          <view class="flex-shrink-0 text-gray-500 flex items-center">
            <icon-lucide-message-square :size="18" />
          </view>
          <view class="flex-1 ml-2 text-sm text-gray-700"> 邮箱 </view>
          <view class="value text-gray-500 text-[14px]">
            {{ user.email ? user.email : '' }}
          </view>
          <view class="flex-shrink-0 text-gray-300 flex items-center"><icon-lucide-chevron-right :size="16" /></view>
        </view>
      </view>
    </view>

    <view v-if="user.id > 0" class="px-2 pb-6 mt-4">
      <view
        class="rounded-full bg-red-500 text-white text-center py-3 active:bg-red-600 transition-colors"
        @tap="doLogout"
      >
        退出登录
      </view>
    </view>

    <NicknameEditDialog ref="nicknameEditRef"></NicknameEditDialog>
  </view>
</template>

<script setup lang="ts">
import { Starter } from '@/brick/BrickUni'
import { useBrickBaseStore, useUi } from '@/brick/composables/useBaseStore'
import { api } from '@/brick/lib/api'
import { dialog } from '@/brick/lib/dialog'
import { EventBus } from '@/brick/lib/event-bus'
import { router } from '@/brick/lib/router'
import { useUserStore } from '@/store/user'
import { onShow } from '@dcloudio/uni-app'
import { computed, reactive, ref } from 'vue'
import NicknameEditDialog from './components/NicknameEditDialog'
const nicknameEditRef = ref(null)

const { ui, getPageDefaultTitle, autoSetNavigationBarColor, SystemConfig } = useUi()

const state = reactive({})

const user = computed(() => {
  return useUserStore().user
})

const config = computed(() => {
  return useBrickBaseStore().config
})

function doLogout() {
  dialog.confirm('确认退出登录？', () => {
    const redirect = router.getQuery('redirect')
    if (config.value.ssoClientEnable) {
      // window.__Dao.exec('sso/server_logout_prepare', {
      //     domainUrl: UrlUtil.domainUrl(),
      // }, res => {
      //     window.location.href = res.data.redirect
      // })
    } else {
      api.post('logout', {}).then(() => {
        EventBus.$emitDelay('UpdateApp', () => {
          if (redirect) {
            router.replace(redirect)
          } else {
            router.back()
          }
        })
      })
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
