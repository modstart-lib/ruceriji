<template>
  <view class="ai-page min-h-screen relative bg-[var(--token-body)]">
    <c-page-header title="AI 分析" background-color="transparent" color="#111111" />

    <c-loading v-if="loading" page />

    <view v-else class="ai-body px-3 pt-2 pb-8">
      <!-- 结论卡：AI 身份 + 生成时间 + 状态 -->
      <view class="ai-hero">
        <view class="flex items-center justify-between gap-3">
          <view class="flex items-center min-w-0">
            <view class="ai-badge flex items-center justify-center flex-shrink-0">
              <icon-lucide-sparkles :size="18" color="#ffffff" />
            </view>
            <view class="ml-2.5 min-w-0">
              <view class="text-base font-bold text-[#111111] leading-tight">AI 深度洞察</view>
              <view class="text-xs mt-1 flex items-center text-text-secondary">
                <icon-lucide-clock :size="11" class="mr-1" />
                <text class="truncate">{{ recordTimeText }}</text>
              </view>
            </view>
          </view>
          <view class="ai-status flex-shrink-0">
            <icon-lucide-circle-check :size="11" class="mr-1" />
            分析完成
          </view>
        </view>
      </view>

      <!-- 结构化结果（新数据 / 可从历史 HTML 解析时） -->
      <template v-if="hasStructure">
        <!-- 建议放在最前：打开只看懂怎么改进，评分与维度作为依据在后 -->
        <view v-if="adviceItems.length" class="advice-card">
          <view class="advice-title">
            <icon-lucide-lightbulb :size="14" class="mr-1.5" />
            AI 建议
          </view>
          <view v-if="adviceItems.length === 1" class="advice-text">{{ adviceItems[0] }}</view>
          <view v-else class="advice-list">
            <view v-for="(item, index) in adviceItems" :key="index" class="advice-item">
              <text class="advice-index">{{ index + 1 }}</text>
              <text class="advice-item-text">{{ item }}</text>
            </view>
          </view>
        </view>

        <view v-if="report.score !== null || report.summary || report.meta || report.trend" class="score-card">
          <template v-if="report.score !== null">
            <view class="score-head">
              <view class="flex items-end">
                <text class="score-num">{{ report.score }}</text>
                <text class="score-unit">/ 100</text>
                <view v-if="report.level" class="score-level">{{ report.level }}</view>
              </view>
              <view v-if="report.meta" class="score-meta flex items-center">
                <icon-lucide-timer :size="12" class="mr-1" />
                {{ report.meta }}
              </view>
            </view>
            <view class="score-track">
              <view class="score-fill" :style="{ width: `${report.score}%` }" />
            </view>
          </template>

          <view
            v-if="report.score === null && report.meta"
            class="score-meta flex items-center"
            :class="{ 'mb-2': report.summary }"
          >
            <icon-lucide-timer :size="12" class="mr-1" />
            {{ report.meta }}
          </view>

          <view v-if="report.summary" class="score-summary" :class="{ 'is-lead': report.score === null }">
            {{ report.summary }}
          </view>

          <!-- 最近 7 天趋势：数值对比，配合上方评分一起看 -->
          <view v-if="report.trend" class="score-trend">
            <icon-lucide-trending-up :size="12" class="mr-1 shrink-0" />
            <text class="min-w-0">{{ report.trend }}</text>
          </view>
        </view>

        <!-- 维度：AI 对本次记录的判读 -->
        <view v-if="report.points.length" class="points-card">
          <view
            v-for="(point, index) in report.points"
            :key="`${point.label}-${index}`"
            class="point-row"
            :class="{ 'is-last': index === report.points.length - 1 }"
          >
            <view class="point-label">{{ point.label }}</view>
            <view class="point-body">
              <view v-if="point.value" class="point-value">{{ point.value }}</view>
              <view v-if="point.note" class="point-note">{{ point.note }}</view>
            </view>
          </view>
        </view>
      </template>

      <!-- 兜底：解析不出结构的旧数据，保持原样渲染，内容不丢 -->
      <view
        v-else-if="report.legacyHtml"
        class="ai-content mt-3 bg-white rounded-3xl border border-[var(--token-border)] p-4 shadow-card"
      >
        <c-rich-html :value="report.legacyHtml" class="text-[#111111]/85 text-[14px]" />
      </view>

      <!-- 还没有分析结果 -->
      <view v-else class="empty-card">
        <view class="empty-icon">
          <icon-lucide-sparkles :size="28" color="#111111" />
        </view>
        <view class="empty-title">分析结果还没生成</view>
        <view class="empty-desc">返回记录详情，点「智能分析」重新生成一份报告</view>
      </view>

      <!-- 免责声明 -->
      <view
        class="mt-3 flex items-start gap-2 rounded-2xl p-3 border"
        style="background: var(--token-warning-bg); border-color: var(--token-warning-border)"
      >
        <icon-lucide-info :size="14" color="var(--token-warning)" class="mt-0.5 shrink-0" />
        <view class="text-xs leading-relaxed" style="color: var(--token-warning-text)">
          内容由 AI 大模型基于你的记录生成，仅供参考，不作为临床诊断依据；做出医疗决定前请咨询专业医生。
        </view>
      </view>

      <!-- 数据来源：默认收起 -->
      <view class="mt-3 rounded-2xl border border-[var(--token-border)] bg-white overflow-hidden">
        <view class="flex items-center px-4 py-3 active:bg-black/[0.02]" @click="sourcesOpen = !sourcesOpen">
          <icon-lucide-book-open :size="14" color="var(--token-text-secondary)" class="mr-2 shrink-0" />
          <view class="flex-1 text-[13px] font-semibold text-[#111111]/70">数据来源与参考文献</view>
          <icon-lucide-chevron-down
            :size="16"
            color="var(--token-text-tertiary)"
            :class="sourcesOpen ? 'rotate-180 transition-transform' : 'transition-transform'"
          />
        </view>
        <view v-if="sourcesOpen" class="px-4 pb-3.5 space-y-2 border-t border-[var(--token-border)] pt-3">
          <view class="flex items-start">
            <view class="text-xs mr-2 shrink-0 mt-0.5 text-text-tertiary">[1]</view>
            <view class="text-xs text-text-secondary leading-relaxed">
              中国营养学会.《中国居民膳食指南（2022）》. 人民卫生出版社, 2022.
            </view>
          </view>
          <view class="flex items-start">
            <view class="text-xs mr-2 shrink-0 mt-0.5 text-text-tertiary">[2]</view>
            <view class="text-xs leading-relaxed">
              <text class="text-text-secondary">中国营养学会膳食指南官方网站：</text>
              <text class="underline" style="color: var(--token-info)" @tap="openGuidelineUrl">dg.cnsoc.org</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { api } from '@/brick/lib/api'
import { DateUtil } from '@/brick/lib/date-util'
import { parseAiReport } from '@/lib/ai-report'
import { router } from '@/brick/lib/router'
import { useRecord } from '@/composables/useRuceriji'
import { onReady } from '@dcloudio/uni-app'
import { computed, reactive, ref, toRefs } from 'vue'

defineOptions({ name: 'DetailAiPage' })

const { processRecord } = useRecord()

const state = reactive({
  id: 0,
  loading: true,
  record: { id: 0 },
  response: { content: '' } as any,
})
const { id, loading, record, response } = toRefs(state)
const sourcesOpen = ref(false)

const report = computed(() => parseAiReport(state.response))
const hasStructure = computed(
  () => report.value.score !== null || report.value.points.length > 0 || report.value.advices.length > 0
)

const adviceItems = computed(() => report.value.advices)

const recordTimeText = computed(() => {
  return state.record.time ? DateUtil.formatRecordTime(state.record.time) : ''
})

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

<style lang="scss" scoped>
.ai-body {
  box-sizing: border-box;
  width: 100%;
  max-width: 664px;
  margin: 0 auto;
}

.ai-badge {
  width: 38px;
  height: 38px;
  border-radius: 999px;
  background: linear-gradient(140deg, var(--color-rc-ai) 0%, #6f3fb0 100%);
  box-shadow: 0 4px 12px rgba(143, 89, 207, 0.28);
}

.ai-status {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
  color: var(--token-info);
  background: var(--token-info-bg);
}

.ai-hero {
  border-radius: 24px;
  padding: 16px;
  border: 1px solid rgba(143, 89, 207, 0.16);
  background: linear-gradient(160deg, rgba(143, 89, 207, 0.08) 0%, rgba(143, 89, 207, 0.03) 45%, #ffffff 100%);
  box-shadow: var(--shadow-card);
}

/* 评分卡 */
.score-card {
  margin-top: 12px;
  padding: 18px 16px 16px;
  border-radius: 24px;
  background: #ffffff;
  border: 1px solid var(--token-border);
  box-shadow: var(--shadow-card);
}

.score-num {
  font-size: 40px;
  line-height: 1;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--token-text);
  letter-spacing: -1px;
}

.score-unit {
  margin-left: 4px;
  align-self: flex-end;
  padding-bottom: 2px;
  font-size: 13px;
  font-weight: 500;
  color: var(--token-text-secondary);
}

.score-level {
  margin-left: 8px;
  align-self: flex-end;
  margin-bottom: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-rc-primary-text);
  background: var(--color-rc-primary);
}

.score-meta {
  font-size: 12px;
  color: var(--token-text-secondary);
}

.score-track {
  margin-top: 14px;
  height: 4px;
  border-radius: 999px;
  background: rgba(17, 17, 17, 0.08);
  overflow: hidden;
}

.score-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #e8c93c 0%, var(--color-rc-primary) 70%);
  transition: width 0.4s ease;
}

.score-summary {
  margin-top: 12px;
  font-size: 14px;
  line-height: 1.7;
  color: var(--token-text);

  /* 没有评分时这一句就是卡片唯一内容，不再留上方间距 */
  &.is-lead {
    margin-top: 0;
  }
}

/* 近 7 天趋势：比总评低一级，读作「数据」而不是结论 */
.score-trend {
  display: flex;
  align-items: center;
  margin-top: 10px;
  padding: 7px 10px;
  border-radius: 12px;
  background: var(--token-panel);
  font-size: 12px;
  line-height: 1.5;
  color: var(--token-text-secondary);
}

/* 维度要点 */
.points-card {
  margin-top: 12px;
  border-radius: 24px;
  background: #ffffff;
  border: 1px solid var(--token-border);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.point-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--token-divider);

  &.is-last {
    border-bottom: none;
  }
}

.point-label {
  flex-shrink: 0;
  width: 56px;
  padding-top: 1px;
  font-size: 13px;
  font-weight: 500;
  color: var(--token-text-secondary);
}

.point-body {
  flex: 1;
  min-width: 0;
}

.point-value {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.5;
  color: var(--token-text);
}

.point-note {
  margin-top: 2px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--token-text-secondary);
}

/* 建议：整页最先读到的内容，黄色渐变底 + 条目化 */
.advice-card {
  margin-top: 12px;
  padding: 16px;
  border-radius: 24px;
  border: 1px solid rgba(250, 224, 88, 0.5);
  background: linear-gradient(160deg, rgba(250, 224, 88, 0.22) 0%, #ffffff 72%);
  box-shadow: var(--shadow-card);
}

.advice-title {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 700;
  color: var(--token-text);
}

.advice-text {
  margin-top: 8px;
  font-size: 15px;
  line-height: 1.75;
  color: rgba(17, 17, 17, 0.86);
}

.advice-list {
  margin-top: 8px;
}

.advice-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;

  & + .advice-item {
    margin-top: 8px;
  }
}

.advice-index {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  margin-top: 3px;
  border-radius: 999px;
  background: var(--token-action);
  color: var(--token-action-text);
  font-size: 11px;
  font-weight: 700;
  line-height: 18px;
  text-align: center;
}

.advice-item-text {
  flex: 1;
  min-width: 0;
  font-size: 15px;
  line-height: 1.7;
  color: rgba(17, 17, 17, 0.86);
}

/* 空状态 */
.empty-card {
  margin-top: 12px;
  padding: 32px 24px;
  border-radius: 24px;
  background: #ffffff;
  border: 1px solid var(--token-border);
  box-shadow: var(--shadow-card);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.empty-icon {
  width: 60px;
  height: 60px;
  border-radius: 999px;
  background: var(--token-panel);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-title {
  margin-top: 14px;
  font-size: 16px;
  font-weight: 700;
  color: var(--token-text);
}

.empty-desc {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--token-text-secondary);
}

/* 富文本正文（旧数据兜底） */
.ai-content :deep(.rich-html-content) {
  line-height: 1.8;
  word-break: break-word;
}

.ai-content :deep(.rich-html-content p) {
  margin: 0 0 10px;
}

.ai-content :deep(.rich-html-content p:last-child) {
  margin-bottom: 0;
}

.ai-content :deep(.rich-html-content h1),
.ai-content :deep(.rich-html-content h2),
.ai-content :deep(.rich-html-content h3),
.ai-content :deep(.rich-html-content h4) {
  margin: 14px 0 6px;
  font-size: 15px;
  font-weight: 700;
  color: var(--token-text);
}
</style>
