<template>
  <view class="min-h-screen relative pb-[80rpx] bg-[#f8fafc]">
    <c-page-header title="结果智能分析" background-color="transparent" color="#0f172a" />

    <c-loading v-if="loading" page />

    <view v-else class="px-4 mt-2 mb-6">
      <view
        class="bg-gradient-to-br from-indigo-50 to-blue-50/50 rounded-3xl p-6 shadow-sm border border-indigo-100/50 relative overflow-hidden"
      >
        <!-- AI 装饰背景 -->
        <view class="absolute -right-6 -top-6 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl"></view>
        <view class="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-400/10 rounded-full blur-2xl"></view>

        <!-- 头部信息区 -->
        <view class="relative z-10 flex justify-between items-center mb-6 pb-4 border-b border-indigo-100/60">
          <view class="flex items-center">
            <view
              class="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center shadow-md shadow-indigo-200"
            >
              <icon-lucide-sparkles :size="20" color="#ffffff" />
            </view>
            <view class="ml-3">
              <view class="text-[30rpx] font-bold text-gray-800 tracking-wide">AI 深度洞察</view>
              <view class="text-[22rpx] text-gray-500 mt-1 flex items-center">
                <icon-lucide-calendar :size="12" class="mr-1 opacity-70" />
                {{ record.time }}
              </view>
            </view>
          </view>
          <view
            class="bg-indigo-100/80 text-indigo-600 px-3 py-1 rounded-full text-[22rpx] font-medium flex items-center"
          >
            <icon-lucide-circle-check :size="12" class="mr-1" />
            分析完成
          </view>
        </view>

        <!-- 内容区域 -->
        <view
          class="relative z-10 bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white/50 shadow-sm"
          style="min-height: 50vh"
        >
          <c-rich-html :value="response.content" class="text-gray-700 leading-relaxed text-[28rpx]" />
        </view>

        <!-- 底部提示 -->
        <view
          class="relative z-10 mt-6 flex py-3 px-4 bg-amber-50/80 rounded-xl border border-amber-100/50 items-start"
        >
          <icon-lucide-info :size="16" color="#d97706" class="mr-2 mt-0.5 shrink-0" />
          <view class="text-[24rpx] text-amber-700/80 leading-snug">
            以上内容由 AI 大模型基于您的记录智能生成，本报告仅供参考，不作为临床诊断依据，请在做出任何医疗决定前咨询专业医生。
          </view>
        </view>

        <!-- 参考文献 -->
        <view class="relative z-10 mt-4 py-4 px-4 bg-gray-50/80 rounded-xl border border-gray-100/60">
          <view class="flex items-center mb-3">
            <icon-lucide-book-open :size="14" color="#64748b" class="mr-2 shrink-0" />
            <view class="text-[24rpx] font-semibold text-gray-600">数据来源与参考文献</view>
          </view>
          <view class="space-y-2">
            <view class="flex items-start">
              <view class="text-[22rpx] text-gray-400 mr-2 shrink-0 mt-0.5">[1]</view>
              <view class="text-[22rpx] text-gray-500 leading-snug">
                中国营养学会.《中国居民膳食指南（2022）》. 人民卫生出版社, 2022.
              </view>
            </view>
            <view class="flex items-start">
              <view class="text-[22rpx] text-gray-400 mr-2 shrink-0 mt-0.5">[2]</view>
              <view class="text-[22rpx] leading-snug">
                <text class="text-gray-500">中国营养学会膳食指南官方网站：</text>
                <text
                  class="text-indigo-500 underline"
                  @tap="openGuidelineUrl"
                >dg.cnsoc.org</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { useRecord } from '@/composables/useRuceriji'
import { api } from '@/brick/lib/api'
import { router } from '@/brick/lib/router'
import { onReady } from '@dcloudio/uni-app'
import { reactive, toRefs } from 'vue'

defineOptions({ name: 'DetailAiPage' })

const { lazyStyle, waitStyleReady, processRecord } = useRecord()

const state = reactive({
  id: 0,
  loading: true,
  record: { id: 0 },
  response: { content: '' },
})
const { id, loading, record, response } = toRefs(state)

async function doLoad() {
  try {
    const res = await api.post('ruceriji/record_result/get', { id: state.id })
    state.loading = false
    state.record = await processRecord(res.data.record)
    state.response = res.data.response || { content: '' }
  } catch {
    state.loading = false
  }
}

function openGuidelineUrl() {
  uni.setClipboardData({
    data: 'http://dg.cnsoc.org/',
    success: () => {
      uni.showToast({ title: '网址已复制，请在浏览器中打开', icon: 'none', duration: 2500 })
    },
  })
}

onReady(() => {
  state.id = router.getQueryInteger('id')
  doLoad()
})
</script>
