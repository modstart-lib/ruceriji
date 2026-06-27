<template>
  <view class="relative w-full bg-gradient-to-b from-[#ffd339]/20 via-[#ffd339]/5 to-[#f7f8fa] overflow-hidden">
    <!-- 装饰性背景光效 -->
    <view
      class="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/60 blur-3xl pointer-events-none"
    ></view>
    <view
      class="absolute top-20 left-0 -ml-16 w-48 h-48 rounded-full bg-[#ffd339]/20 blur-3xl pointer-events-none"
    ></view>

    <!-- 顶部导航栏插槽 -->
    <view class="relative z-10 w-full pt-1 text-center">
      <slot></slot>
    </view>

    <!-- 用户信息区 -->
    <view class="relative z-10 px-6 mt-4 pb-10 flex flex-col items-center justify-center">
      <view v-if="user.id" class="flex flex-col items-center">
        <!-- 头像 -->
        <view
          class="w-[5.5rem] h-[5.5rem] rounded-full border-[4px] border-white/90 shadow-[0_4px_16px_rgba(0,0,0,0.06)] overflow-hidden bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
          @click="router.to('/brick/module/member/profile_avatar')"
        >
          <image
            class="w-full h-full block object-cover"
            :src="user.avatar || '/static/image/male_avatar.png'"
            mode="aspectFill"
          />
        </view>
        <!-- 信息 -->
        <view class="mt-3.5 flex flex-col items-center">
          <view
            class="text-[1.5rem] font-bold text-[#111111] leading-tight active:opacity-70 transition-opacity text-center flex items-center justify-center"
            @click="router.to('/brick/module/member/profile')"
          >
            {{ user.nickname || user.username || '用户' }}
          </view>
          <view class="mt-3 flex items-center justify-center">
            <slot name="addition">
              <slot name="right">
                <c-smart-link
                  to="/brick/module/member/profile"
                  class="inline-flex items-center px-4 py-1.5 bg-white/60 backdrop-blur-md rounded-full text-xs text-[#333] shadow-[0_2px_10px_rgba(0,0,0,0.02)] active:scale-95 transition-all outline-none border border-white/80"
                >
                  <text class="font-medium mr-0.5">我的资料</text>
                  <icon-lucide-chevron-right :size="14" class="opacity-70" />
                </c-smart-link>
              </slot>
            </slot>
          </view>
        </view>
      </view>

      <view v-else class="flex flex-col items-center active:opacity-70 transition-opacity" @click="doLogin">
        <view
          class="w-[5.5rem] h-[5.5rem] rounded-full border-[4px] border-white/90 shadow-[0_4px_16px_rgba(0,0,0,0.06)] overflow-hidden bg-gray-200/80 flex items-center justify-center"
        >
          <image class="w-full h-full block object-cover" :src="user.avatar" mode="aspectFill" />
        </view>
        <view class="mt-3.5 flex flex-col items-center">
          <view class="text-[1.5rem] font-bold text-[#111111] leading-tight mb-3 flex items-center justify-center">
            点我登录
          </view>
          <view
            class="inline-flex items-center px-4 py-1.5 bg-white/60 backdrop-blur-md rounded-full text-xs text-[#555] border border-white/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
          >
            登录享受更多权益
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { showLoginDialog } from '@/brick/composables/useLoginDialog'
import { router } from '@/brick/lib/router'
import { useUserStore } from '@/store/user'
import { onShow } from '@dcloudio/uni-app'
import { computed } from 'vue'

defineOptions({ name: 'MemberCenterTop' })

const user = computed(() => {
  return useUserStore().user
})

function doLogin() {
  if (!showLoginDialog()) {
    router.to('/brick/module/member/login')
  }
}

onShow(() => {})
</script>

<style scoped></style>
