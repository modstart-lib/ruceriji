<template>
  <view class="pb-ruceriji-data min-h-screen relative bg-[var(--token-body)]">
    <c-page-header title="数据分析" background-color="transparent" color="#111111" />

    <!-- 时间段选择 -->
    <view class="flex justify-center mt-4 mb-3">
      <view class="period-tabs flex rounded-full p-1" style="background: var(--token-chip-bg)">
        <view
          v-for="p in periods"
          :key="p.value"
          :class="['period-tab px-4 py-1.5 rounded-full text-[13px]', period === p.value ? 'is-active' : '']"
          @click="onPeriodChange(p.value)"
          >{{ p.label }}</view
        >
      </view>
    </view>

    <!-- 加载骨架与真实结构一致，避免首屏闪一下空白 -->
    <view v-if="loading" class="px-3">
      <view class="data-body">
        <view class="skeleton-card">
          <view v-for="i in 3" :key="i" class="skeleton-row">
            <view class="skeleton-dot" />
            <view class="skeleton-line skeleton-line--label" />
            <view class="skeleton-line skeleton-line--value" />
          </view>
        </view>
        <view class="skeleton-charts">
          <view v-for="i in 2" :key="i" class="skeleton-card skeleton-chart">
            <view class="skeleton-line skeleton-line--title" />
            <view class="skeleton-donut" />
            <view class="skeleton-line skeleton-line--legend" />
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态：没有记录时给出下一步，而不是一排 0 -->
    <view v-else-if="!stat.totalCount" class="data-body px-3">
      <view class="bg-white rounded-3xl border border-[var(--token-border)] shadow-card px-6 py-10 text-center">
        <view class="empty-icon mx-auto">
          <icon-lucide-bar-chart-big :size="30" color="#111111" />
        </view>
        <view class="mt-4 text-base font-bold text-[#111111]">{{ periodLabel }}还没有记录</view>
        <view class="mt-1.5 text-xs text-text-secondary">记录几次之后，这里会显示形状、颜色和分量的趋势</view>
        <view
          class="mt-5 mx-auto h-10 px-5 rounded-full inline-flex items-center justify-center text-sm font-semibold"
          style="background: var(--token-primary); color: var(--token-text-inverse)"
          @click="goRecord"
        >
          去记录一次
        </view>
      </view>
    </view>

    <view v-else class="data-body px-3">
      <!-- 核心统计卡片 -->
      <view class="bg-white border border-[var(--token-border)] rounded-3xl shadow-card mb-4 overflow-hidden">
        <view class="flex items-center px-4 py-3.5">
          <view class="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--token-body)] mr-3">
            <icon-lucide-activity :size="16" color="var(--token-text-secondary)" />
          </view>
          <view class="text-sm text-text-secondary flex-1">总次数</view>
          <view class="text-xl font-bold tabular-nums text-[#111111]">{{ stat.totalCount }}</view>
        </view>
        <view class="mx-4 h-px bg-[var(--token-divider)]" />
        <view class="flex items-center px-4 py-3.5">
          <view class="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--token-body)] mr-3">
            <icon-lucide-clock :size="16" color="var(--token-text-secondary)" />
          </view>
          <view class="text-sm text-text-secondary flex-1">平均时长</view>
          <view class="text-xl font-bold tabular-nums text-[#111111]">{{ stat.avgDurationStr }}</view>
        </view>
        <view class="mx-4 h-px bg-[var(--token-divider)]" />
        <view class="flex items-center px-4 py-3.5">
          <view class="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--token-body)] mr-3">
            <icon-lucide-timer :size="16" color="var(--token-text-secondary)" />
          </view>
          <view class="text-sm text-text-secondary flex-1">平均间隔</view>
          <view class="text-xl font-bold tabular-nums text-[#111111]">{{ stat.sinceLastStr }}</view>
        </view>
      </view>

      <!-- 样式维度饼图：≥900px 双列，避免单列超长行 -->
      <view class="charts-grid">
        <view
          v-for="c in stat.charts"
          :key="c.name"
          class="chart-card bg-white border border-[var(--token-border)] rounded-3xl p-4 shadow-card mb-4"
        >
          <view class="font-bold mb-1 text-[15px] text-[#111111]">{{ c.title }}分析</view>
          <view class="chart-donut">
            <c-echarts :option="buildPieOption(c.items)" :height="150" :autoresize="true" />
            <!-- 中心总数用 DOM 叠层：canvas 里的文字在小程序端居中和字号都不稳 -->
            <view class="donut-center">
              <text class="donut-center-total">{{ itemsTotal(c.items) }}</text>
              <text class="donut-center-label">次记录</text>
            </view>
          </view>
          <!-- 图例用 DOM 渲染：320px 下不会被裁切，也不依赖颜色区分（名称 + 百分比） -->
          <view class="chart-legend">
            <view v-for="(item, idx) in sortedItems(c.items)" :key="item.name" class="legend-row">
              <view class="legend-dot" :style="{ backgroundColor: chartColor(idx) }" />
              <text class="legend-name">{{ item.name }}</text>
              <text class="legend-value">{{ item.percent }}%</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="h-10" />
  </view>
</template>

<script setup lang="ts">
import { useAppConfig, useAppUser } from '@/brick/composables/useAppStore'
import { api } from '@/brick/lib/api'
import { DateUtil } from '@/brick/lib/date-util'
import { designTokens } from '@/config/tokens'
import { useRecord } from '@/composables/useRuceriji'
import { useRucerijiStyle } from '@/composables/useRucerijiStyle'
import { onLoad } from '@dcloudio/uni-app'
import { computed, reactive, toRefs } from 'vue'
import CEcharts from './components/c-echarts.vue'

defineOptions({ name: 'DataPage' })

const { user, userInit, isLogin, waitUserReady, requireUserLogin, requireUserLoginRouteTo } = useAppUser()
const { config } = useAppConfig()
const { waitStyleReady, processRecord } = useRecord()
const { styleData } = useRucerijiStyle()

const state = reactive({
  loading: true,
  period: '7',
  periods: [
    { label: '近7天', value: '7' },
    { label: '近30天', value: '30' },
    { label: '近90天', value: '90' },
  ],
  stat: {
    totalCount: 0,
    avgDurationStr: '--',
    sinceLastStr: '--',
    charts: [] as any[],
  },
})
const { loading, period, periods, stat } = toRefs(state)

const periodLabel = computed(() => {
  const item = state.periods.find((p) => p.value === state.period)
  return item ? item.label : ''
})

function goRecord() {
  uni.switchTab({ url: '/pages/wc' })
}

function onPeriodChange(val) {
  state.period = val
  loadData()
}

async function loadData() {
  state.loading = true
  const days = parseInt(state.period)
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - days + 1)
  const fmt = (d) => {
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${d.getFullYear()}-${mm}-${dd}`
  }
  try {
    const res = await api.post('ruceriji/record/report', {
      startTime: fmt(startDate),
      endTime: fmt(today),
    })
    const data = res.data || {}
    const avgSec = Math.round(data.durationAvg || 0)
    const sinceLastSec = Math.round(data.sinceLastAvg || 0)
    state.stat = {
      totalCount: data.totalCount || 0,
      avgDurationStr: avgSec ? DateUtil.formatDurationHuman(avgSec) : '--',
      sinceLastStr: sinceLastSec ? DateUtil.formatIntervalHuman(sinceLastSec) : '--',
      charts: [],
    }
    await waitStyleReady()
    state.stat.charts = buildAllStyleCharts(data.styleChart || {})
    state.loading = false
  } catch {
    state.loading = false
  }
}

/**
 * 图表统一使用 DESIGN 的 --chart-1..6 色板（与 tokens.ts 同源），
 * 标签只保留「名称 百分比」一行，320px 下也不会互相挤压。
 */
function sortedItems(items: any[]) {
  return items.slice().sort((a: any, b: any) => b.value - a.value)
}

function chartColor(index: number) {
  return designTokens.color.chart[index % designTokens.color.chart.length]
}

function itemsTotal(items: any[]) {
  return items.reduce((sum: number, item: any) => sum + (Number(item.value) || 0), 0)
}

function buildPieOption(items: any[]) {
  const sorted = sortedItems(items)
  return {
    color: designTokens.color.chart,
    // 首帧动画会让截图/弱网下的图表看起来"残缺"，饼图直接静态渲染
    animation: false,
    series: [
      {
        type: 'pie',
        radius: ['42%', '68%'],
        center: ['50%', '52%'],
        avoidLabelOverlap: true,
        minShowLabelAngle: 2,
        itemStyle: { borderColor: '#ffffff', borderWidth: 2 },
        label: { show: false },
        /* 按占比降序，最大的一块固定使用 chart-1（主色），保证图表与品牌色一致 */
        data: sorted.map((i) => ({ value: i.value, name: i.name })),
      },
    ],
  }
}

function buildAllStyleCharts(styleChart: Record<string, any>) {
  const style: any[] = styleData.value
  const result: any[] = []
  for (const s of style) {
    if (!styleChart[s.name]) continue
    const chartData = styleChart[s.name]
    let total = 0
    const items: any[] = []
    for (const o of s.options) {
      const count = chartData[o.value + 'x'] || 0
      if (count > 0) {
        total += count
        items.push({ value: count, name: o.label, percent: '0' })
      }
    }
    if (!items.length) continue
    for (const item of items) {
      // 样本量小，保留两位小数属于过度精确，统一取整
      item.percent = total ? Math.round((item.value / total) * 100) : 0
    }
    // 先降序再上色：图例的色点与环图扇区必须一一对应
    items.sort((a: any, b: any) => b.value - a.value)
    result.push({
      name: s.name,
      title: s.title,
      items,
    })
  }
  return result
}

onLoad(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.pb-ruceriji-data {
  .period-tab {
    color: var(--token-text-secondary);
    transition:
      background-color 0.15s ease,
      color 0.15s ease;

    &.is-active {
      background: var(--token-chip-active-bg);
      color: var(--token-text);
      font-weight: 700;
    }
  }

  .data-body {
    box-sizing: border-box;
    width: 100%;
    max-width: 664px;
    margin: 0 auto;
  }

  /* 折叠屏展开 / Duo：图表双列，统计卡仍保持单列可读宽度 */
  @media (min-width: 900px) {
    .data-body {
      max-width: 960px;
    }

    .stats-card {
      max-width: 640px;
      margin-left: auto;
      margin-right: auto;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
    }

    .charts-grid .chart-card {
      margin-bottom: 0;
    }
  }

  /* 环形图中心总数：叠层与饼图圆心 center: ['50%', '52%'] 对齐 */
  .chart-donut {
    position: relative;
    width: 100%;
  }

  .donut-center {
    position: absolute;
    left: 50%;
    top: 52%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    line-height: 1;
    pointer-events: none;
  }

  .donut-center-total {
    font-size: 18px;
    font-weight: 700;
    line-height: 1;
    color: #111111;
    font-variant-numeric: tabular-nums;
  }

  .donut-center-label {
    margin-top: 3px;
    font-size: 10px;
    line-height: 1;
    color: var(--token-text-secondary);
  }

  .chart-legend {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px 16px;
    /* 图例在图表下方居中，宽屏不会整块贴左 */
    max-width: 460px;
    margin: 4px auto 0;
  }

  .legend-row {
    display: flex;
    align-items: center;
    min-width: 0;
  }

  .legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    margin-right: 6px;
    flex-shrink: 0;
  }

  .legend-name {
    flex: 0 1 auto;
    min-width: 0;
    font-size: 12px;
    color: var(--token-text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .legend-value {
    margin-left: 6px;
    padding-left: 0;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    color: var(--token-text);
    font-weight: 600;
  }

  /* 骨架屏 */
  .skeleton-card {
    background: #ffffff;
    border: 1px solid var(--token-border);
    border-radius: 24px;
    box-shadow: var(--shadow-card);
    padding: 16px;
    margin-bottom: 16px;
  }

  .skeleton-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 0;

    & + & {
      border-top: 1px solid var(--token-divider);
    }
  }

  .skeleton-dot {
    width: 32px;
    height: 32px;
    border-radius: 999px;
    background: var(--token-panel);
  }

  .skeleton-line {
    height: 10px;
    border-radius: 999px;
    background: var(--token-panel);
  }

  .skeleton-line--label {
    width: 28%;
  }

  .skeleton-line--value {
    width: 22%;
    margin-left: auto;
  }

  .skeleton-line--title {
    width: 32%;
    height: 12px;
    margin-bottom: 16px;
  }

  .skeleton-line--legend {
    width: 70%;
    margin-top: 16px;
  }

  .skeleton-charts {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .skeleton-chart {
    margin-bottom: 0;
  }

  .skeleton-donut {
    width: 112px;
    height: 112px;
    border-radius: 999px;
    margin: 0 auto;
    border: 20px solid var(--token-panel);
    box-sizing: border-box;
  }

  @media (max-width: 599px) {
    .skeleton-charts {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  .empty-icon {
    width: 64px;
    height: 64px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--token-panel);
  }
}
</style>
