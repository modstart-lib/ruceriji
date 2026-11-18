<template>
  <view class="member-hero relative w-full overflow-hidden">
    <!-- 装饰性背景光效 -->
    <view
      class="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/60 blur-3xl pointer-events-none"
    ></view>
    <view
      class="member-hero-glow absolute top-20 left-0 -ml-16 w-48 h-48 rounded-full blur-3xl pointer-events-none"
    ></view>

    <!-- 顶部导航栏插槽 -->
    <view class="relative z-10 w-full pt-1 text-center">
      <slot></slot>
    </view>

    <!-- 用户信息区 -->
    <view class="relative z-10 px-6 mt-4 pb-10 flex flex-col items-center justify-center">
      <view v-if="user.id" class="flex flex-col items-center">
        <!-- 头像：DESIGN §6.9 顶部头像固定 88px，不随屏宽放大 -->
        <view
          class="w-[88px] h-[88px] rounded-full border-[4px] border-white/90 shadow-[0_4px_16px_rgba(0,0,0,0.06)] overflow-hidden bg-gray-100 flex items-center justify-center active:scale-95 transition-transform"
          @click="router.to('/brick/module/member/profile_avatar')"
        >
          <image class="w-full h-full block object-cover" :src="user.avatar || genderAvatar" mode="aspectFill" />
        </view>
        <!-- 信息 -->
        <view class="mt-3.5 flex flex-col items-center">
          <view
            class="text-xl font-bold text-token-text leading-tight active:opacity-70 transition-opacity text-center flex items-center justify-center"
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
          class="w-[88px] h-[88px] rounded-full border-[4px] border-white/90 shadow-[0_4px_16px_rgba(0,0,0,0.06)] overflow-hidden bg-gray-200/80 flex items-center justify-center"
        >
          <image class="w-full h-full block object-cover" :src="user.avatar || genderAvatar" mode="aspectFill" />
        </view>
        <view class="mt-3.5 flex flex-col items-center">
          <view class="text-xl font-bold text-token-text leading-tight mb-3 flex items-center justify-center">
            登录 / 注册
          </view>
          <view
            class="inline-flex items-center px-4 py-1.5 bg-white/60 backdrop-blur-md rounded-full text-xs text-[#555] border border-white/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
          >
            登录后同步记录与成就
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { showLoginDialog } from '@/brick/composables/useLoginDialog'
import { router } from '@/brick/lib/router'
import { useBizStore } from '@/store/app'
import { useUserStore } from '@/store/user'
import { onShow } from '@dcloudio/uni-app'
import { computed } from 'vue'

defineOptions({ name: 'MemberCenterTop' })

const user = computed(() => {
  return useUserStore().user
})

/** 没上传头像时按性别取娃娃，用户选过男/女就能在「我的」看到本人 */
const genderAvatar = computed(() => {
  const biz = useBizStore().biz
  return biz && biz.gender === 'female' ? '/static/image/female_avatar.png' : '/static/image/male_avatar.png'
})

function doLogin() {
  if (!showLoginDialog()) {
    router.to('/brick/module/member/login')
  }
}

onShow(() => {})
</script>

<style scoped>
.member-hero {
  /* 品牌黄渐变收尾到页面底色，避免使用第二个黄色 */
  background: linear-gradient(180deg, rgba(250, 224, 88, 0.2) 0%, rgba(250, 224, 88, 0.05) 45%, var(--token-body) 100%);
}

.member-hero-glow {
  position: absolute;
  top: -60px;
  left: 50%;
  width: 320px;
  height: 240px;
  transform: translateX(-50%);
  border-radius: 999px;
  background: rgba(250, 224, 88, 0.3);
  filter: blur(48px);
}
</style>
