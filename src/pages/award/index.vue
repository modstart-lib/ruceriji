<template>
  <view class="min-h-screen pb-safe bg-[#F7F8FA]">
    <c-page-header title="我的成就" background-color="transparent" color="#111111" />

    <c-loading v-if="loading" page />
    <view v-else>
      <!-- Tab 切换 -->
      <view class="flex bg-gray-200/50 mx-3 mt-4 rounded-full border border-gray-200/50 shadow-inner p-1">
        <view
          :class="
            tab === 'mine' ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.05)] text-[#111111] font-medium' : 'text-gray-500'
          "
          class="flex-1 text-center py-2 rounded-full text-[15px] transition-all"
          @click="tab = 'mine'"
          >已获得</view
        >
        <view
          :class="
            tab === 'all' ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.05)] text-[#111111] font-medium' : 'text-gray-500'
          "
          class="flex-1 text-center py-2 rounded-full text-[15px] transition-all"
          @click="tab = 'all'"
          >全部</view
        >
      </view>

      <!-- 成就列表 -->
      <view v-for="c in categoriesFilter" :key="c.id">
        <view
          v-if="c.children.length"
          class="bg-white border border-gray-100/50 shadow-[0_4px_20px_rgb(0,0,0,0.02)] rounded-[1.5rem] mx-3 my-4 overflow-hidden"
        >
          <view
            v-for="(a, index) in c.children"
            :key="a.id"
            class="p-4 relative active:bg-gray-50 transition-colors"
            :class="{ 'border-b border-gray-100/60': index !== c.children.length - 1 }"
            @click="detailDialogRef?.show(a)"
          >
            <view class="flex items-center">
              <view
                class="w-12 h-12 mr-4 rounded-xl flex items-center justify-center bg-gray-50 border border-gray-100"
                :class="{ 'opacity-30 grayscale': !a._getTime }"
              >
                <c-cover :src="a.cover" background-color="transparent" />
              </view>
              <view class="flex-grow">
                <view class="font-bold text-[#111111] mb-1">{{ a.title }}</view>
                <view class="text-xs font-medium" style="color: #111111; opacity: 0.5">{{ a.summary }}</view>
              </view>
              <icon-lucide-chevron-right :size="16" class="text-gray-300 ml-2" />
            </view>
          </view>
        </view>
      </view>
    </view>

    <AppAwardDetailDialog ref="detailDialogRef" />
  </view>
</template>

<script setup lang="ts">
import { useAppBiz, useAppConfig, useAppUser } from '@/brick/composables/useAppStore'
import { useShare } from '@/brick/composables/useShare'
import { api } from '@/brick/lib/api'
import { onReady } from '@dcloudio/uni-app'
import { computed, reactive, ref, toRefs } from 'vue'
import AppAwardDetailDialog from './components/AppAwardDetailDialog.vue'

defineOptions({ name: 'AwardIndex' })
const detailDialogRef = ref(null)

const { user, userInit, isLogin, waitUserReady, requireUserLogin, requireUserLoginRouteTo } = useAppUser()
const { config } = useAppConfig()
const { shareConfig, setShareConfig, getShareAppMessage, getShareTimeline } = useShare()
const { biz } = useAppBiz()

const state = reactive({
  loading: true,
  tab: 'mine',
  categories: [],
})
const { loading, tab, categories } = toRefs(state)

const categoriesFilter = computed(() => {
  return state.categories.map((c) => ({
    ...c,
    children: c.children.filter((a) => state.tab === 'all' || a._getTime),
  }))
})

async function doLoad() {
  try {
    const res = await api.post('app_award/all', {})
    state.loading = false
    state.categories = res.data.categories
  } catch {
    state.loading = false
  }
}

onReady(() => {
  doLoad()
})
</script>
