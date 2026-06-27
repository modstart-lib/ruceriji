<template>
  <view class="pb-ruceriji-data min-h-screen relative bg-[#F7F8FA]">
    <c-page-header title="数据分析" background-color="transparent" color="#111111" />

    <!-- 时间段选择 -->
    <view class="flex justify-center mt-4 mb-3">
      <view class="period-tabs flex bg-gray-200/50 border border-gray-200/50 shadow-inner rounded-full p-1">
        <view
          v-for="p in periods"
          :key="p.value"
          :class="[
            'period-tab px-4 py-1.5 rounded-full text-sm',
            period === p.value
              ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.05)] text-[#111111] font-medium'
              : 'text-gray-500',
          ]"
          @click="onPeriodChange(p.value)"
          >{{ p.label }}</view
        >
      </view>
    </view>

    <c-loading v-if="loading" page />

    <view v-else class="px-3">
      <!-- 核心统计卡片 -->
      <view
        class="bg-white border border-gray-100/50 rounded-[1.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.02)] mb-4 overflow-hidden"
      >
        <view class="flex items-center px-4 py-3.5">
          <view class="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 mr-3">
            <icon-lucide-activity :size="16" class="text-gray-400" />
          </view>
          <view class="text-sm text-gray-500 flex-1">总次数</view>
          <view class="text-xl font-bold" style="color: #111111">{{ stat.totalCount }}</view>
        </view>
        <view class="mx-4 h-px bg-gray-100" />
        <view class="flex items-center px-4 py-3.5">
          <view class="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 mr-3">
            <icon-lucide-clock :size="16" class="text-gray-400" />
          </view>
          <view class="text-sm text-gray-500 flex-1">平均时长</view>
          <view class="text-xl font-bold" style="color: #111111">{{ stat.avgDurationStr }}</view>
        </view>
        <view class="mx-4 h-px bg-gray-100" />
        <view class="flex items-center px-4 py-3.5">
          <view class="flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 mr-3">
            <icon-lucide-timer :size="16" class="text-gray-400" />
          </view>
          <view class="text-sm text-gray-500 flex-1">平均间隔</view>
          <view class="text-xl font-bold" style="color: #111111">{{ stat.sinceLastStr }}</view>
        </view>
      </view>

      <!-- 样式维度饼图 -->
      <view
        v-for="c in stat.charts"
        :key="c.name"
        class="bg-white border border-gray-100/50 rounded-[1.5rem] p-4 shadow-[0_4px_20px_rgb(0,0,0,0.02)] mb-4"
      >
        <view class="font-bold mb-2" style="color: #111111">{{ c.title }}分析</view>
        <c-echarts :option="buildPieOption(c.items)" :height="160" />
      </view>
    </view>

    <view class="h-10" />
  </view>
</template>

<script setup lang="ts">
import { useAppConfig, useAppUser } from '@/brick/composables/useAppStore'
import { api } from '@/brick/lib/api'
import { DateUtil } from '@/brick/lib/date-util'
import { useRecord } from '@/composables/useRuceriji'
import { useRucerijiStyle } from '@/composables/useRucerijiStyle'
import { onLoad } from '@dcloudio/uni-app'
import { reactive, toRefs } from 'vue'
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
      avgDurationStr: avgSec
        ? DateUtil.formatDuration(avgSec, { isMs: false, format: avgSec >= 3600 ? 'HH时mm分' : 'mm分ss秒' })
        : '--',
      sinceLastStr: formatInterval(sinceLastSec),
      charts: [],
    }
    await waitStyleReady()
    state.stat.charts = buildAllStyleCharts(data.styleChart || {})
    state.loading = false
  } catch {
    state.loading = false
  }
}

function formatInterval(sec) {
  if (!sec) return '--'
  const d = Math.floor(sec / 86400)
  const h = Math.floor((sec % 86400) / 3600)
  const m = Math.floor((sec % 3600) / 60)
  if (d > 0) return `${d}天${h ? h + '时' : ''}${m}分`
  if (h > 0) return DateUtil.formatDuration(sec, { isMs: false, format: 'HH时mm分' })
  return DateUtil.formatDuration(sec, { isMs: false, format: 'mm分' })
}

function buildPieOption(items: any[]) {
  return {
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        label: { show: true, formatter: '{b}\n{d}%', fontSize: 11 },
        data: items.map((i) => ({ value: i.value, name: i.name })),
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
      item.percent = total ? ((item.value / total) * 100).toFixed(2) : '0'
    }
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
    transition: all 0.2s;
  }
}
</style>
