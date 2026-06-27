<template>
  <view class="min-h-screen relative pb-6 bg-[#f7f8fa]">
    <bui-member-center-top-b>
      <c-page-header-holder title="我的" background-color="transparent" color="#111111" />
    </bui-member-center-top-b>

    <!-- 用户数据统计卡片 -->
    <view
      class="page-motion-t1 bg-white/80 backdrop-blur-xl rounded-3xl px-2 py-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mx-3 flex text-center mb-4 relative z-20 border border-white/60 -mt-6 items-center justify-between"
      style="color: #111111"
    >
      <!-- 数据项 -->
      <view class="flex-grow flex justify-around items-center">
        <view class="py-1 flex flex-col justify-center min-w-[4rem]">
          <view class="text-xs text-[#111111] opacity-60">使用天数</view>
          <view class="text-xl font-bold pt-1.5 text-[#111111]">
            {{ biz && biz.totalDay ? biz.totalDay : '-' }}
            <text v-if="biz && biz.totalDay" class="text-[0.6rem] font-normal opacity-60 ml-0.5">天</text>
          </view>
        </view>

        <view class="w-px h-8 bg-gray-200/60"></view>

        <view class="py-1 flex flex-col justify-center min-w-[4rem]">
          <view class="text-xs text-[#111111] opacity-60">累计次数</view>
          <view class="text-xl font-bold pt-1.5 text-[#111111]">
            {{ biz && biz.totalRecord ? biz.totalRecord : '-' }}
            <text v-if="biz && biz.totalRecord" class="text-[0.6rem] font-normal opacity-60 ml-0.5">次</text>
          </view>
        </view>

        <view class="w-px h-8 bg-gray-200/60"></view>

        <view class="py-1 flex flex-col justify-center min-w-[4rem]">
          <view class="text-xs text-[#111111] opacity-60">累计重量</view>
          <view class="text-xl font-bold pt-1.5 text-[#111111]">
            <template v-if="biz && biz.totalWeight">
              {{ biz.totalWeight > 1000 ? (biz.totalWeight / 1000).toFixed(1) : biz.totalWeight }}
              <text class="text-[0.6rem] font-normal opacity-60 ml-0.5">{{ biz.totalWeight > 1000 ? 'kg' : 'g' }}</text>
            </template>
            <template v-else>-</template>
          </view>
        </view>
      </view>

      <!-- 卡通人物侧边 -->
      <view class="w-16 flex-shrink-0 flex items-center justify-center relative ml-1 mr-1">
        <view class="absolute inset-0 bg-yellow-100/50 rounded-full blur-md opacity-60"></view>
        <image
          :src="defaultAvatarImage"
          class="w-12 h-12 block relative z-10 drop-shadow-sm"
          mode="aspectFill"
          style="width: 3rem; height: 3rem"
        />
      </view>
    </view>

    <!-- 快捷功能网格 -->
    <view
      class="page-motion-t2 bg-white/80 backdrop-blur-xl border border-white/60 rounded-3xl p-2 shadow-[0_4px_20px_rgb(0,0,0,0.02)] mx-3 mb-4 relative z-20"
    >
      <view class="flex">
        <view
          class="flex-1 text-center py-3 rounded-2xl active:bg-gray-50/50 transition-colors"
          @click="doOpenMemberSetting"
        >
          <view class="flex justify-center items-center h-10 text-[#111111]"><icon-lucide-dumbbell :size="26" /></view>
          <view class="text-xs text-[#111111] opacity-70 mt-1.5">身高体重</view>
        </view>
        <view
          class="flex-1 text-center py-3 rounded-2xl active:bg-gray-50/50 transition-colors"
          @click="requireUserLoginRouteTo('/pages/calendar', {}, true)"
        >
          <view class="flex justify-center items-center h-10 text-[#111111]"
            ><icon-lucide-bar-chart-big :size="26"
          /></view>
          <view class="text-xs text-[#111111] opacity-70 mt-1.5">统计分析</view>
        </view>
        <view
          class="flex-1 text-center py-3 rounded-2xl active:bg-gray-50/50 transition-colors"
          @click="requireUserLoginRouteTo('/brick/module/member/message', {}, true)"
        >
          <view class="flex justify-center items-center h-10 text-[#111111]"
            ><icon-lucide-message-circle :size="26"
          /></view>
          <view class="text-xs text-[#111111] opacity-70 mt-1.5">消息通知</view>
        </view>
      </view>
    </view>

    <!-- 功能列表 -->
    <view class="page-motion-t3 px-3 relative z-20 pb-8">
      <view
        class="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_4px_20px_rgb(0,0,0,0.02)] mb-4 overflow-hidden"
      >
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
          @click="doShare"
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
    <c-no-more />
    <MemberInfoSettingDialog ref="memberInfoSettingDialog" />
  </view>
</template>

<script setup lang="ts">
import { Starter } from '@/brick/BrickUni'
import { useConfig, useUi } from '@/brick/composables/useBaseStore'
import { useShare } from '@/brick/composables/useShare'
import { useUser } from '@/brick/composables/useUser'
import { router } from '@/brick/lib/router'
import { useWcAsset } from '@/composables/useRuceriji'
import { onReady } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import MemberInfoSettingDialog from './components/MemberInfoSettingDialog.vue'

defineOptions({ name: 'MemberPage' })

const { user, userInit, requireUserLogin, requireUserLoginRouteTo } = useUser()
const { config, SystemConfig } = useConfig()
const { ui, getPageDefaultTitle, autoSetNavigationBarColor } = useUi()
const { shareConfig, setShareConfig, getShareAppMessage, getShareTimeline } = useShare()
const { biz, defaultWcImage, defaultAvatarImage } = useWcAsset()

const memberInfoSettingDialog = ref<any>(null)

const share = computed(() => {
  return {
    title: config.value && config.value.Ruceriji_ShareTitle,
    imageUrl: config.value && config.value.Ruceriji_ShareImage,
    path: '/pages/wc',
  }
})

function doOpenMemberSetting() {
  requireUserLogin(() => {
    memberInfoSettingDialog.value.show()
  }, true)
}

function onContact() {}

function doShare() {
  uni.showShareMenu({ menus: ['shareAppMessage', 'shareTimeline'] })
}

onReady(() => {
  Starter.boot()
})
</script>
