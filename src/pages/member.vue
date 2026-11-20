<template>
  <view class="min-h-screen relative pb-6 bg-[var(--token-body)]">
    <MemberCenterTop>
      <c-page-header-trans title="我的" :has-back="false" :float="false" color="#111111" />
    </MemberCenterTop>

    <!-- 用户数据统计卡片（未登录时数据无意义，不展示占位 "-"） -->
    <view
      v-if="user.id"
      class="member-card page-motion-t1 bg-white/80 backdrop-blur-xl rounded-3xl px-2 py-4 shadow-float mx-3 flex text-center mb-4 relative z-20 border border-white/60 -mt-6 items-center justify-between"
      style="color: #111111"
    >
      <!-- 数据项 -->
      <view class="flex-grow flex justify-around items-center">
        <view class="py-1 flex flex-col justify-center min-w-[4rem]">
          <view class="text-xs text-[#111111] opacity-70">使用天数</view>
          <view class="text-xl font-bold pt-1.5 text-[#111111] flex items-baseline justify-center">
            <text class="tabular-nums">{{ biz && biz.totalDay ? biz.totalDay : '-' }}</text>
            <text v-if="biz && biz.totalDay" class="text-[0.6rem] font-normal opacity-60 ml-0.5">天</text>
          </view>
        </view>

        <view class="w-px h-6 bg-gray-200/60"></view>

        <view class="py-1 flex flex-col justify-center min-w-[4rem]">
          <view class="text-xs text-[#111111] opacity-70">累计次数</view>
          <view class="text-xl font-bold pt-1.5 text-[#111111] flex items-baseline justify-center">
            <text class="tabular-nums">{{ biz && biz.totalRecord ? biz.totalRecord : '-' }}</text>
            <text v-if="biz && biz.totalRecord" class="text-[0.6rem] font-normal opacity-60 ml-0.5">次</text>
          </view>
        </view>

        <view class="w-px h-6 bg-gray-200/60"></view>

        <view class="py-1 flex flex-col justify-center min-w-[4rem]">
          <view class="text-xs text-[#111111] opacity-70">累计重量</view>
          <view class="text-xl font-bold pt-1.5 text-[#111111] flex items-baseline justify-center">
            <template v-if="biz && biz.totalWeight">
              <text class="tabular-nums">
                {{ biz.totalWeight > 1000 ? (biz.totalWeight / 1000).toFixed(1) : biz.totalWeight }}
              </text>
              <text class="text-[0.6rem] font-normal opacity-60 ml-0.5">{{ biz.totalWeight > 1000 ? 'kg' : 'g' }}</text>
            </template>
            <template v-else>-</template>
          </view>
        </view>
      </view>
    </view>

    <!-- 快捷功能网格 -->
    <view
      class="member-card page-motion-t2 bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl p-2 shadow-card mx-3 mb-4 relative z-20"
    >
      <view class="flex">
        <view
          class="flex-1 text-center py-3 rounded-2xl active:bg-gray-50/50 transition-colors"
          @click="doOpenMemberSetting"
        >
          <view class="flex justify-center items-center h-10 text-[#111111]"><icon-lucide-dumbbell :size="24" /></view>
          <view class="text-xs text-[#111111] opacity-70 mt-1.5">身高体重</view>
        </view>
        <view
          class="flex-1 text-center py-3 rounded-2xl active:bg-gray-50/50 transition-colors"
          @click="requireUserLoginRouteTo('/pages_data/data', {}, true)"
        >
          <view class="flex justify-center items-center h-10 text-[#111111]"
            ><icon-lucide-bar-chart-big :size="24"
          /></view>
          <view class="text-xs text-[#111111] opacity-70 mt-1.5">数据分析</view>
        </view>
        <view
          class="flex-1 text-center py-3 rounded-2xl active:bg-gray-50/50 transition-colors"
          @click="requireUserLoginRouteTo('/brick/module/member/message', {}, true)"
        >
          <view class="flex justify-center items-center h-10 text-[#111111]"
            ><icon-lucide-message-circle :size="24"
          /></view>
          <view class="text-xs text-[#111111] opacity-70 mt-1.5">消息通知</view>
        </view>
      </view>
    </view>

    <!-- 功能列表 -->
    <view class="member-list page-motion-t3 px-3 relative z-20 member-list-bottom">
      <view class="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-card mb-4 overflow-hidden">
        <view
          class="px-4 py-3.5 flex items-center border-b border-gray-100/30 active:bg-gray-50/50 transition-colors"
          @click="requireUserLoginRouteTo('/pages/award/index', {}, true)"
        >
          <view class="w-6 flex-shrink-0 text-[#111111] opacity-70"><icon-lucide-trophy :size="20" /></view>
          <view class="flex-1 ml-2.5 text-sm text-[#111111] font-medium">我的成就</view>
          <view class="flex-shrink-0 text-gray-300"><icon-lucide-chevron-right :size="16" /></view>
        </view>
        <view
          class="px-4 py-3.5 flex items-center border-b border-gray-100/30 active:bg-gray-50/50 transition-colors"
          @click="router.to('/brick/module/system/feedback')"
        >
          <view class="w-6 flex-shrink-0 text-[#111111] opacity-70"><icon-lucide-message-circle :size="20" /></view>
          <view class="flex-1 ml-2.5 text-sm text-[#111111] font-medium">意见反馈</view>
          <view class="flex-shrink-0 text-gray-300"><icon-lucide-chevron-right :size="16" /></view>
        </view>
        <!-- #ifdef MP-WEIXIN -->
        <button
          open-type="contact"
          class="px-4 py-3.5 flex items-center bg-transparent text-left m-0 rounded-none border-b border-gray-100/30 active:bg-gray-50/50 transition-colors after:border-none"
          style="line-height: inherit; color: inherit"
          @contact="onContact"
        >
          <view class="w-6 flex-shrink-0 text-[#111111] opacity-70 flex items-center"
            ><icon-lucide-headphones :size="20"
          /></view>
          <view class="flex-1 ml-2.5 text-sm text-[#111111] font-medium">联系客服</view>
          <view class="flex-shrink-0 text-gray-300"><icon-lucide-chevron-right :size="16" /></view>
        </button>
        <button
          open-type="share"
          class="px-4 py-3.5 flex items-center bg-transparent text-left m-0 rounded-none border-b border-gray-100/30 active:bg-gray-50/50 transition-colors after:border-none"
          style="line-height: inherit; color: inherit"
        >
          <view class="w-6 flex-shrink-0 text-[#111111] opacity-70 flex items-center"
            ><icon-lucide-share-2 :size="20"
          /></view>
          <view class="flex-1 ml-2.5 text-sm text-[#111111] font-medium">分享好友</view>
          <view class="flex-shrink-0 text-gray-300"><icon-lucide-chevron-right :size="16" /></view>
        </button>
        <!-- #endif -->
        <!-- #ifndef MP-WEIXIN -->
        <view
          class="px-4 py-3.5 flex items-center border-b border-gray-100/30 active:bg-gray-50/50 transition-colors"
          @click="router.to('/brick/module/system/contact')"
        >
          <view class="w-6 flex-shrink-0 text-[#111111] opacity-70"><icon-lucide-headphones :size="20" /></view>
          <view class="flex-1 ml-2.5 text-sm text-[#111111] font-medium">联系客服</view>
          <view class="flex-shrink-0 text-gray-300"><icon-lucide-chevron-right :size="16" /></view>
        </view>
        <!-- #endif -->
        <!-- #ifdef APP-PLUS || H5 -->
        <ShareEntry @tap="openShare" />
        <!-- #endif -->
        <view
          class="px-4 py-3.5 flex items-center active:bg-gray-50/50 transition-colors"
          @click="router.to('/brick/module/system/setting')"
        >
          <view class="w-6 flex-shrink-0 text-[#111111] opacity-70"><icon-lucide-settings :size="20" /></view>
          <view class="flex-1 ml-2.5 text-sm text-[#111111] font-medium">系统设置</view>
          <view class="flex-shrink-0 text-gray-300"><icon-lucide-chevron-right :size="16" /></view>
        </view>
      </view>
    </view>

    <bui-member-login-dialog ref="memberLoginDialog" />
    <MemberInfoSettingDialog ref="memberInfoSettingDialog" />
    <!-- #ifdef APP-PLUS || H5 -->
    <ShareSheet ref="shareSheet" />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { Starter } from '@/brick/BrickUni'
import { useBranding } from '@/brick/composables/useBranding'
import { useConfig, useUi } from '@/brick/composables/useBaseStore'
import { useUser } from '@/brick/composables/useUser'
import { router } from '@/brick/lib/router'
import { useWcAsset } from '@/composables/useRuceriji'
import { onReady } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import MemberInfoSettingDialog from './components/MemberInfoSettingDialog.vue'
import MemberCenterTop from '@/components/MemberCenterTop.vue'
// #ifdef MP-WEIXIN
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
// #endif
// #ifdef APP-PLUS || H5
import ShareEntry from '@/components/ShareEntry.vue'
import ShareSheet from '@/components/ShareSheet.vue'
// #endif

defineOptions({ name: 'MemberPage' })

const { user, userInit, requireUserLogin, requireUserLoginRouteTo } = useUser()
const { config, SystemConfig } = useConfig()
const branding = useBranding()
const { ui, getPageDefaultTitle, autoSetNavigationBarColor } = useUi()
const { biz } = useWcAsset()

const memberInfoSettingDialog = ref<any>(null)
const shareSheet = ref<any>(null)

const share = computed(() => {
  return {
    title: (config.value && config.value.Ruceriji_ShareTitle) || branding.value.siteName,
    imageUrl: (config.value && config.value.Ruceriji_ShareImage) || branding.value.siteLogo,
    path: '/pages/wc',
  }
})

function doOpenMemberSetting() {
  requireUserLogin(() => {
    memberInfoSettingDialog.value.show()
  }, true)
}

function onContact() {}

function openShare() {
  shareSheet.value?.show()
}

// #ifdef MP-WEIXIN
onShareAppMessage(() => ({
  title: share.value.title,
  path: share.value.path,
  imageUrl: share.value.imageUrl,
}))

onShareTimeline(() => ({
  title: share.value.title,
  imageUrl: share.value.imageUrl,
}))
// #endif

onReady(() => {
  Starter.boot()
})
</script>

<style lang="scss" scoped>
.member-card {
  box-sizing: border-box;
  width: calc(100% - 24px);
  max-width: 640px;
  margin-left: auto;
  margin-right: auto;
}

.member-list {
  box-sizing: border-box;
  width: 100%;
  max-width: 664px;
  margin-left: auto;
  margin-right: auto;
}

.member-list-bottom {
  padding-bottom: calc(var(--tabbar-h) + env(safe-area-inset-bottom, 0px) + 16px);
}
</style>
