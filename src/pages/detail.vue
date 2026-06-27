<template>
  <view class="min-h-screen relative pb-6 bg-[#F7F8FA]">
    <c-page-header :title="title" has-action :height="44" background-color="transparent" color="#111111">
      <template #action>
        <view class="pr-2 pt-1.5 flex items-center" @click="actionPopup = true">
          <icon-lucide-settings :size="20" color="#111111" style="opacity: 0.6" />
        </view>
      </template>
    </c-page-header>

    <c-loading v-if="loading" page />
    <view v-else class="min-h-screen pb-24 relative z-10">
      <!-- 头部信息卡片 -->
      <view
        class="bg-white border-b border-gray-100/50 px-5 pt-8 pb-6 rounded-b-[2rem] shadow-[0_4px_20px_rgb(0,0,0,0.02)] relative z-10"
      >
        <view class="text-center font-bold text-2xl tracking-wider" style="color: #111111">便便分析</view>
        <view
          class="flex items-center justify-center mt-3 text-sm font-medium bg-[#f0f2f5] border border-gray-200/50 py-1.5 px-4 rounded-full mx-auto w-fit"
          style="color: #111111; opacity: 0.6"
        >
          <icon-lucide-clock :size="14" class="mr-1" />
          {{ record.time }}<span class="mx-2 opacity-30">|</span>{{ record._duration }}
        </view>

        <view
          v-if="record.remark"
          class="mt-6 p-4 bg-yellow-50 rounded-2xl border border-yellow-100 relative shadow-sm"
        >
          <view
            class="absolute -top-3 left-4 bg-[#111111] text-white px-3 py-0.5 rounded-full text-xs font-bold shadow-sm flex items-center"
          >
            <icon-lucide-message-square :size="12" class="mr-1" />备注
          </view>
          <view class="text-gray-800 leading-relaxed text-[15px] pt-1 font-medium">{{ record.remark }}</view>
        </view>
      </view>

      <!-- 分析指标列表 -->
      <view class="px-4 pt-6 space-y-6">
        <template v-for="(s, index) in recordStyles" :key="s.label">
          <view
            v-if="s.value"
            class="bg-white rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-gray-100/50"
          >
            <!-- 图标部分 -->
            <view v-if="s.value.image" class="relative w-24 h-24 mx-auto mb-6 flex justify-center items-center">
              <view
                class="absolute inset-0 rounded-full opacity-50 scale-110"
                style="background-color: var(--color-rc-primary); opacity: 0.15"
              ></view>
              <view
                class="absolute inset-0 rounded-full"
                style="background-color: var(--color-rc-primary); opacity: 0.2"
              ></view>
              <c-image-static :src="s.value.image" class="w-16 h-16 z-10 drop-shadow-md relative" />
            </view>

            <!-- 标题和值 -->
            <view class="flex justify-center items-center mb-5">
              <view class="font-bold text-xl" style="color: #111111">{{ s.label }}</view>
              <view class="mx-3 w-1 h-1 rounded-full bg-gray-300"></view>
              <view class="text-[17px] font-medium" style="color: #111111; opacity: 0.6">{{ s.value.tooltip }}</view>
            </view>

            <!-- 结果分析 -->
            <view class="space-y-3">
              <view
                v-if="s.result && s.result.resolve"
                class="flex items-start bg-blue-50/40 backdrop-blur-md rounded-2xl p-4 border border-blue-200/50 shadow-sm transition-all"
              >
                <view class="mt-0.5 mr-2">
                  <icon-lucide-search :size="18" color="#3b82f6" />
                </view>
                <view class="flex-1">
                  <view class="text-blue-800 font-bold text-sm mb-1">原因分析</view>
                  <view class="text-gray-600 text-[15px] leading-relaxed">{{ s.result.resolve }}</view>
                </view>
              </view>

              <view
                v-if="s.result && s.result.suggest"
                class="flex items-start bg-red-50/40 backdrop-blur-md rounded-2xl p-4 border border-red-200/50 shadow-sm transition-all"
              >
                <view class="mt-0.5 mr-2">
                  <icon-lucide-circle-alert :size="18" color="#ef4444" />
                </view>
                <view class="flex-1">
                  <view class="text-red-800 font-bold text-sm mb-1">健康建议</view>
                  <view class="text-gray-600 text-[15px] leading-relaxed">{{ s.result.suggest }}</view>
                </view>
              </view>
            </view>
          </view>
        </template>
      </view>
    </view>

    <view class="h-24"></view>
    <view
      class="fixed bottom-0 right-0 left-0 z-50 p-4 bg-white/90 backdrop-blur-md box-border shadow-[0_-4px_20px_rgb(0,0,0,0.03)]"
      style="padding-bottom: calc(1rem + env(safe-area-inset-bottom))"
    >
      <view
        class="flex text-white py-3 px-4 rounded-full items-center justify-center shadow-[0_4px_12px_rgba(17,17,17,0.2)] active:scale-95 transition-transform font-bold text-[15px]"
        style="background-color: #111111"
        @click="resultScanRef?.start(record.id)"
      >
        <view
          class="animate-pulse mr-3 font-bold w-7 h-7 flex items-center justify-center rounded-full bg-white text-sm"
          style="color: #6d28d9"
          >AI</view
        >
        <view class="font-bold text-[16px] tracking-wide">智能分析（限时免费）</view>
      </view>
    </view>

    <RecordResultScan ref="resultScanRef" />

    <!-- 操作弹窗 -->
    <u-popup :show="actionPopup" mode="bottom" :round="10" @close="actionPopup = false">
      <view class="bg-white pb-safe">
        <view
          class="flex items-center px-5 py-4 border-b border-gray-100 active:bg-gray-50 transition-colors"
          @click="doEdit"
        >
          <icon-lucide-square-pen :size="22" color="#111111" />
          <view class="ml-4 text-base font-medium" style="color: #111111">修改</view>
        </view>
        <view
          class="flex items-center px-5 py-4 border-b border-gray-100 active:bg-gray-50 transition-colors"
          @click="doDelete"
        >
          <icon-lucide-trash-2 :size="22" color="#ef4444" />
          <view class="ml-4 text-base font-medium text-red-500">删除</view>
        </view>
        <view class="px-4 pt-3 pb-4">
          <u-button
            shape="circle"
            :block="true"
            :custom-style="{ color: '#111111', background: '#f5f5f5', border: 'none', fontWeight: 'bold' }"
            @click="actionPopup = false"
            >取消</u-button
          >
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script setup lang="ts">
import { EventBus } from '@/brick/lib/event-bus'
import { useRecord } from '@/composables/useRuceriji'
import { api } from '@/brick/lib/api'
import { dialog } from '@/brick/lib/dialog'
import { router } from '@/brick/lib/router'
import { onReady } from '@dcloudio/uni-app'
import { computed, reactive, ref, toRefs } from 'vue'
import { useRucerijiStore } from '../store/ruceriji'
import RecordResultScan from './components/RecordResultScan.vue'

defineOptions({ name: 'DetailPage' })
const resultScanRef = ref(null)

const { lazyStyle, waitStyleReady, processRecord } = useRecord()

const state = reactive({
  id: 0,
  loading: true,
  actionPopup: false,
  record: { id: 0 },
  recordStyles: [],
})
const { id, loading, actionPopup, record, recordStyles } = toRefs(state)

const title = computed(() => {
  return state.record._title || '便便详情'
})

async function doLoad() {
  const res = await api.post('ruceriji/record/get', { id: state.id })
  state.loading = false
  const record = await processRecord(res.data.record)
  state.record = record
  state.recordStyles = [
    { label: '形状', value: record._styleShape, result: record.__styleShape },
    { label: '颜色', value: record._styleColor, result: record.__styleColor },
    { label: '分量', value: record._styleWeight, result: record.__styleWeight },
    { label: '感觉', value: record._styleFeel, result: record.__styleFeel },
    { label: '气味', value: record._styleSmell, result: record.__styleSmell },
    { label: '厕纸情况', value: record._styleHasBlood, result: record.__styleHasBlood },
    { label: '粘黏情况', value: record._styleHasSticky, result: record.__styleHasSticky },
    { label: '肚子感觉', value: record._styleBellyFeel, result: record.__styleBellyFeel },
    { label: '心情', value: record._styleMood, result: record.__styleMood },
    { label: '地点', value: record._styleAddress, result: record.__styleAddress },
  ]
}

function doEdit() {
  state.actionPopup = false
  router.replace('/pages/edit', { id: state.id })
}

async function doDelete() {
  state.actionPopup = false
  if (!(await dialog.confirm('确认删除？'))) return
  await api.post('ruceriji/record/delete', { id: state.id })
  useRucerijiStore().setRecordChanged(true)
  EventBus.$emitDelay('UpdateApp')
  dialog.tipSuccess('删除成功', () => {
    router.back()
  })
}

onReady(() => {
  state.id = router.getQueryInteger('id')
  doLoad()
})
</script>
