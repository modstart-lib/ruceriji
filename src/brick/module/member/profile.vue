<template>
  <view>
    <c-page-header title="我的资料" />

    <view class="p-2">
      <view class="profile-head" @tap="router.to('/brick/module/member/profile_avatar')">
        <image v-if="user.avatar" class="profile-head__avatar" mode="aspectFill" :src="user.avatar" />
        <view v-else class="profile-head__avatar profile-head__avatar--empty">
          <icon-lucide-user :size="26" />
        </view>
        <view class="profile-head__main">
          <text class="profile-head__name">{{ user.nickname || user.username || '未设置昵称' }}</text>
          <text class="profile-head__hint">点击更换头像</text>
        </view>
        <icon-lucide-chevron-right :size="16" class="profile-head__arrow" />
      </view>

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
      <view class="logout-btn" @tap="doLogout"> 退出登录 </view>
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

.profile-head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  padding: 1rem;
  border-radius: 1rem;
  background: var(--token-surface);

  &__avatar {
    width: 56px;
    height: 56px;
    flex-shrink: 0;
    border-radius: 50%;
    background: var(--token-panel);
  }

  &__avatar--empty {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--token-text-tertiary);
  }

  &__main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  &__name {
    font-size: 1.0625rem;
    font-weight: 600;
    color: var(--token-text);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__hint {
    font-size: 0.75rem;
    color: var(--token-text-tertiary);
  }

  &__arrow {
    flex-shrink: 0;
    color: var(--token-text-tertiary);
  }
}

/* 危险操作改成描边文字按钮，避免红色大块压过页面里的主按钮 */
.logout-btn {
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--token-error);
  background: var(--token-surface);
  border: 1px solid var(--token-border);
}
</style>
