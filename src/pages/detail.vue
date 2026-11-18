<template>
  <view class="detail-page min-h-screen relative bg-[var(--token-body)]">
    <c-page-header title="记录详情" has-action :height="44" background-color="transparent" color="#111111">
      <template #action>
        <view class="pr-2 pt-1.5 flex items-center" @click="actionPopup = true">
          <icon-lucide-settings :size="20" color="#111111" style="opacity: 0.6" />
        </view>
      </template>
    </c-page-header>

    <c-loading v-if="loading" page />
    <view v-else class="detail-body relative z-10">
      <!-- 头部信息卡片 -->
      <view
        class="bg-white border-b border-[var(--token-border)] px-5 pt-7 pb-5 rounded-b-[32px] shadow-card relative z-10"
      >
        <view class="text-center font-bold text-2xl tracking-wide text-[#111111]">便便分析</view>
        <view
          class="flex items-center justify-center gap-1.5 mt-3 text-xs font-medium bg-[var(--token-panel)] rounded-full mx-auto w-fit h-7 px-3.5 text-[#111111]/70"
        >
          <icon-lucide-clock :size="12" />
          <text>{{ recordTimeText }}</text>
          <text class="opacity-40">·</text>
          <text>时长 {{ record._duration }}</text>
        </view>

        <view
          v-if="record.remark"
          class="relative mt-5 p-3.5 rounded-2xl border"
          style="background: rgba(250, 224, 88, 0.14); border-color: rgba(250, 224, 88, 0.42)"
        >
          <view
            class="absolute -top-2.5 left-3 px-2 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center"
            style="background: var(--color-rc-primary); color: var(--color-rc-primary-text)"
          >
            <icon-lucide-message-square :size="10" class="mr-1" />备注
          </view>
          <view class="text-[#111111] leading-relaxed text-sm pt-1">{{ record.remark }}</view>
        </view>
      </view>

      <!-- 分析指标列表 -->
      <view class="px-3 pt-4 space-y-4">
        <template v-for="(s, index) in recordStyles" :key="s.label">
          <view v-if="s.value" class="bg-white rounded-3xl p-5 shadow-card border border-[var(--token-border)]">
            <!-- 图标部分 -->
            <view v-if="s.value.image" class="relative w-20 h-20 mx-auto mb-4 flex justify-center items-center">
              <view
                class="absolute inset-0 rounded-full scale-110"
                style="background-color: var(--color-rc-primary); opacity: 0.16"
              ></view>
              <view
                class="absolute inset-0 rounded-full"
                style="background-color: var(--color-rc-primary); opacity: 0.22"
              ></view>
              <c-image-static :src="s.value.image" class="w-14 h-14 z-10 drop-shadow-md relative" />
            </view>

            <!-- 标题和值 -->
            <view class="flex justify-center items-baseline gap-2 mb-4">
              <view class="font-bold text-base text-[#111111]">{{ s.label }}</view>
              <view class="w-1 h-1 rounded-full bg-[#111111]/20"></view>
              <view class="text-sm font-medium text-[#111111]/70">{{ s.value.tooltip }}</view>
            </view>

            <!-- 结果分析 -->
            <view class="space-y-2.5">
              <view
                v-if="s.result && s.result.resolve"
                class="flex items-start rounded-2xl p-3.5 border"
                style="background: var(--token-info-bg); border-color: var(--token-info-border)"
              >
                <view class="mt-0.5 mr-2">
                  <icon-lucide-search :size="16" color="var(--token-info)" />
                </view>
                <view class="flex-1 min-w-0">
                  <view class="text-sm font-bold mb-1" style="color: var(--token-info)">原因分析</view>
                  <view class="text-[#111111]/75 text-sm leading-relaxed">{{ s.result.resolve }}</view>
                </view>
              </view>

              <view
                v-if="s.result && s.result.suggest"
                class="flex items-start rounded-2xl p-3.5 border"
                style="background: var(--token-warning-bg); border-color: var(--token-warning-border)"
              >
                <view class="mt-0.5 mr-2">
                  <icon-lucide-circle-alert :size="16" color="var(--token-warning)" />
                </view>
                <view class="flex-1 min-w-0">
                  <view class="text-sm font-bold mb-1" style="color: var(--token-warning-text)">健康建议</view>
                  <view class="text-[#111111]/75 text-sm leading-relaxed">{{ s.result.suggest }}</view>
                </view>
              </view>
            </view>
          </view>
        </template>
      </view>
    </view>

    <view class="bottom-bar fixed bottom-0 right-0 left-0 z-50">
      <view
        class="flex text-[#3f3200] h-12 px-4 rounded-full items-center justify-center shadow-cta active:scale-95 transition-transform font-bold text-base"
        style="background-color: var(--token-action); box-shadow: var(--token-action-shadow)"
        @click="resultScanRef?.start(record.id)"
      >
        <view
          class="mr-2.5 font-bold w-6 h-6 flex items-center justify-center rounded-full bg-white text-[11px]"
          style="color: var(--color-rc-ai)"
          >AI</view
        >
        <view class="font-bold tracking-wide">智能分析</view>
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
          <icon-lucide-trash-2 :size="22" color="var(--token-error)" />
          <view class="ml-4 text-base font-medium" style="color: var(--token-error)">删除</view>
        </view>
        <view class="px-4 pt-3 pb-4">
          <u-button
            shape="circle"
            :block="true"
            :custom-style="{
              color: '#111111',
              background: 'var(--token-chip-bg)',
              border: 'none',
              fontWeight: 'bold',
            }"
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
import { DateUtil } from '@/brick/lib/date-util'
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

const recordTimeText = computed(() => {
  return state.record.time ? DateUtil.formatRecordTime(state.record.time) : ''
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

<style lang="scss" scoped>
.detail-body {
  /* 固定底栏避让与 token 保持一致（DESIGN §2.5） */
  padding-bottom: calc(var(--bottom-bar-h) + 24px);
  box-sizing: border-box;
  width: 100%;
  max-width: 664px;
  margin: 0 auto;
}
</style>
