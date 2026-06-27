<template>
  <view class="pb-ruceriji-calendar bg-[#F7F8FA]">
    <!-- 顶部导航 + 月份展示 -->
    <view class="calendar-top-bar page-motion-t1">
      <c-page-header-trans title="记录" :has-back="false" color="#111111" :float="false" />
      <view class="calendar-month-row px-4 pb-3 flex items-end justify-between">
        <view>
          <view class="text-xl font-bold text-[#111111] leading-tight">{{ currentMonthLabel }}</view>
          <view class="text-xs text-[#111111]/50 mt-0.5">如厕日历</view>
        </view>
        <view class="data-btn flex items-center" @click="requireUserLoginRouteTo('/pages_data/data', {}, true)">
          <icon-lucide-bar-chart-big :size="14" />
          <view class="ml-1 font-semibold">数据分析</view>
        </view>
      </view>
    </view>

    <view class="calendar-page-body">
      <!-- 日历卡片 -->
      <view class="calendar-card-wrap page-motion-t2 mx-3 mt-2 rounded-[20px] p-[1px] overflow-hidden">
        <view class="calendar-card-inner rounded-[19px] overflow-hidden">
          <view class="calendar-top-accent" />
          <view class="pb-calendar relative">
            <uni-calendar
              ref="calendarRef"
              :insert="true"
              :show-month="false"
              :start-date="CALENDAR_MIN_DATE"
              :end-date="CALENDAR_MAX_DATE"
              :date="day"
              :selected="calendarSelected"
              @month-switch="onMonthChange"
              @change="onChange"
            />
          </view>
        </view>
      </view>

      <!-- 记录区域 -->
      <view
        class="records-glass page-motion-t3 mx-3 mt-4 rounded-3xl p-3 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-gray-100/50"
      >
        <view class="flex items-start mb-3 gap-3">
          <view class="flex-grow min-w-0">
            <view class="text-lg font-bold text-[#111111] leading-tight">{{ selectedDateLabel }}</view>
            <view class="flex items-baseline mt-2">
              <text class="text-3xl font-bold tracking-tight text-[#111111]">{{ records.length }}</text>
              <text class="text-sm text-[#111111] opacity-50 ml-1.5">条记录</text>
            </view>
          </view>
          <view
            class="add-record-btn flex items-center flex-shrink-0 shadow-sm active:scale-95 transition-transform"
            style="background-color: #111111; color: #ffffff"
            @click="goAddCustomRecord"
          >
            <icon-lucide-plus :size="16" color="#ffffff" />
            <text class="ml-1 font-bold text-[13px]">补充记录</text>
          </view>
        </view>

        <view
          v-if="!records.length"
          class="empty-panel rounded-2xl py-12 px-6 flex flex-col items-center relative overflow-hidden"
        >
          <view class="empty-panel-glow" />
          <view
            class="w-[60px] h-[60px] rounded-full flex items-center justify-center relative z-[1] bg-[#F7F8FA] border border-gray-100 shadow-sm"
          >
            <icon-lucide-pen-line :size="22" class="opacity-60" color="#111111" />
          </view>
          <view class="text-base font-bold text-[#111111] mt-6 relative z-[1]">这一天还没有记录哦～</view>
        </view>
        <view v-else class="space-y-3">
          <view
            v-for="r in records"
            :key="r.id"
            class="record-row rounded-2xl p-3 flex items-center bg-[#F7F8FA] active:bg-gray-100 transition-colors border border-gray-100/50"
            @click="router.to('/pages/detail', { id: r.id })"
          >
            <view class="record-row-accent" />
            <view
              class="w-11 h-11 mr-3 flex-shrink-0 rounded-xl overflow-hidden bg-white shadow-sm border border-gray-50"
            >
              <c-image-static v-if="r._styleShape && r._styleShape.image" :src="r._styleShape.image" />
              <c-image-static v-else src="/static/image/shit.svg" />
            </view>
            <view class="flex-grow min-w-0">
              <view class="font-bold text-[#111111] truncate">{{ r._title }}</view>
              <view class="text-[#111111] opacity-50 text-xs mt-0.5">耗时 {{ r._duration }}</view>
            </view>
            <view class="text-sm text-[#111111] opacity-60 ml-2 flex-shrink-0 tabular-nums font-medium">{{
              r._time
            }}</view>
          </view>
        </view>
      </view>
    </view>

    <MemberInfoSettingDialog auto-show />
    <AppAwardDetectDialog />
    <bui-member-login-dialog ref="memberLoginDialog" />
  </view>
</template>

<script setup lang="ts">
import { useAppConfig, useAppUser } from '@/brick/composables/useAppStore'
import { useShare } from '@/brick/composables/useShare'
import { api } from '@/brick/lib/api'
import { DateUtil } from '@/brick/lib/date-util'
import { EventBus } from '@/brick/lib/event-bus'
import { router } from '@/brick/lib/router'
import UniCalendar from '@/brick/uni/uni-calendar/uni-calendar.vue'
import { useRecord, useRuceriji } from '@/composables/useRuceriji'
import { onReady, onShow } from '@dcloudio/uni-app'
import { computed, reactive, ref, toRefs } from 'vue'
import { useRucerijiStore } from '../store/ruceriji'
import AppAwardDetectDialog from './award/components/AppAwardDetectDialog.vue'
import MemberInfoSettingDialog from './components/MemberInfoSettingDialog.vue'

const WEEKDAY_LABELS = ['日', '一', '二', '三', '四', '五', '六']

/** u-calendar 未传 minDate 时内部默认从今天起算，导致无法选历史日期 */
const CALENDAR_MIN_DATE = '2000-01-01'
const _now = new Date()
const CALENDAR_MAX_DATE = `${_now.getFullYear() + 1}-12-31`

defineOptions({ name: 'CalendarPage' })

const { user, userInit, isLogin, waitUserReady, requireUserLogin, requireUserLoginRouteTo } = useAppUser()

function goAddCustomRecord() {
  requireUserLoginRouteTo('/pages/edit', { type: 'custom' }, true)
}
const { config } = useAppConfig()
const { shareConfig, setShareConfig, getShareAppMessage, getShareTimeline } = useShare()
const { recordChanged, setRecordChanged } = useRuceriji()
const { lazyStyle, waitStyleReady, processRecord } = useRecord()

const state = reactive({
  year: DateUtil.year(),
  month: DateUtil.month(),
  day: DateUtil.date(),
  dateInfo: [],
  records: [],
})
const { year, month, day, dateInfo, records } = toRefs(state)

const calendarRef = ref<InstanceType<typeof UniCalendar> | null>(null)

const calendarSelected = computed(() => {
  const raw = state.dateInfo as any
  if (!raw || !Array.isArray(raw)) return []
  return raw
    .map((item: any) => {
      if (!item || typeof item !== 'object') return null
      const date = item.date || item.day
      if (!date) return null
      const info = item.info || (typeof item.count === 'number' && item.count > 0 ? `${item.count}次` : '')
      return { date: String(date).slice(0, 10), info }
    })
    .filter(Boolean)
})

const selectedDateLabel = computed(() => {
  const s = day.value
  if (!s) return ''
  const d = new Date(String(s).replace(/-/g, '/'))
  if (isNaN(d.getTime())) return String(s)
  return `${d.getMonth() + 1}月${d.getDate()}日 周${WEEKDAY_LABELS[d.getDay()]}`
})

const currentMonthLabel = computed(() => `${state.year}年${state.month}月`)

const share = computed(() => {
  return {
    title: config.value && config.value.Ruceriji_ShareTitle,
    imageUrl: config.value && config.value.Ruceriji_ShareImage,
  }
})

async function onChange(value?: any) {
  if (value) {
    const first = Array.isArray(value) ? value[0] : value
    if (first && typeof first === 'object' && 'fulldate' in first) {
      state.day = (first as { fulldate: string }).fulldate
    } else if (typeof first === 'string') {
      state.day = first.slice(0, 10)
    } else {
      state.day = String(value).slice(0, 10)
    }
  }
  if (user.value && user.value.id > 0) {
    const res = await api.post('ruceriji/record/list', { day: state.day })
    state.records = await processRecord(res.data.records)
  }
}

async function onMonthChange(value?: any) {
  if (value) {
    state.year = value.year
    state.month = value.month
  }
  if (user.value && user.value.id > 0) {
    const res = await api.post('ruceriji/record/summary', {
      type: 'month',
      year: state.year,
      month: state.month,
    })
    state.dateInfo = res.data.dateInfo
  }
}

onReady(() => {
  EventBus.$on('UserChange', () => {
    useRucerijiStore().setRecordChanged(true)
  })
  waitUserReady(() => {
    if (user.value && user.value.id > 0) {
      onMonthChange({ year: state.year, month: state.month })
      onChange({ fulldate: state.day })
    }
  })
})

onShow(() => {
  waitUserReady(() => {
    if (recordChanged.value) {
      useRucerijiStore().setRecordChanged(false)
      EventBus.$emitDelayDataChange('RecordChange')
      onChange()
      onMonthChange()
    }
  })
})
</script>

<style lang="scss" scoped>
@mixin glass-panel {
  background: var(--token-glass);
  backdrop-filter: saturate(180%) blur(22px);
  -webkit-backdrop-filter: saturate(180%) blur(22px);
  border: 1px solid var(--token-glass-border);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.65) inset,
    0 12px 40px -24px rgba(17, 17, 17, 0.14);
}

@mixin glass-dark {
  background: rgba(17, 17, 17, 0.58);
  backdrop-filter: saturate(140%) blur(18px);
  -webkit-backdrop-filter: saturate(140%) blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow:
    0 10rpx 28rpx -12rpx rgba(0, 0, 0, 0.35),
    inset 0 1rpx 0 rgba(255, 255, 255, 0.1);
}

.pb-ruceriji-calendar {
  position: relative;
  min-height: 100vh;
  background: #f7f8fa;

  :deep(.ub-header-mobile.no-shadow .header-container) {
    box-shadow: none;
  }

  .calendar-top-bar {
    position: relative;
    overflow: hidden;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    box-shadow:
      0 2px 12px rgba(0, 0, 0, 0.04),
      inset 0 1px 0 rgba(255, 255, 255, 0.65);
    background:
      radial-gradient(ellipse 130% 85% at 18% -25%, rgba(250, 224, 88, 0.22) 0%, transparent 52%),
      radial-gradient(ellipse 100% 70% at 88% 8%, rgba(255, 248, 220, 0.55) 0%, transparent 48%),
      linear-gradient(168deg, #fffef8 0%, #faf8f2 32%, #f5f4f0 68%, #f0f1f4 100%);

    &::before {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      height: 4px;
      background: linear-gradient(90deg, #e8d050 0%, var(--color-rc-primary) 42%, #f5e8a0 100%);
      opacity: 0.98;
      pointer-events: none;
    }
  }

  .calendar-page-body {
    padding-bottom: calc(48px + constant(safe-area-inset-bottom));
    padding-bottom: calc(48px + env(safe-area-inset-bottom, 0px));
  }

  .data-btn {
    font-size: 12px;
    color: var(--color-rc-primary-text);
    padding: 5px 12px;
    border-radius: 20px;
    background: var(--color-rc-primary);
    box-shadow: 0 2px 8px rgba(250, 224, 88, 0.45);
  }

  .calendar-card-wrap {
    background: #ffffff;
    box-shadow: 0 4px 20px rgb(0, 0, 0, 0.02);
    border: 1px solid rgba(0, 0, 0, 0.03);
  }

  .calendar-card-inner {
    background: transparent;
  }

  .calendar-top-accent {
    height: 5rpx;
    background: linear-gradient(90deg, #e8d050 0%, var(--color-rc-primary) 45%, #f5e8a0 100%);
    opacity: 0.95;
  }

  .records-glass {
    background: #ffffff;
    box-shadow: 0 4px 20px rgb(0, 0, 0, 0.02);
    border: 1px solid rgba(0, 0, 0, 0.03);
  }

  .empty-panel {
    background: #fcfcfd;
    border: 1px dashed rgba(0, 0, 0, 0.08);
    border-radius: 16px;
  }

  .empty-panel-glow {
    position: absolute;
    inset: -40%;
    background: var(--list-empty-glow);
    pointer-events: none;
    opacity: 0.85;
  }

  .record-row {
    position: relative;
    transition: box-shadow 0.2s ease;
    background: #f7f8fa;
    border: 1px solid rgba(0, 0, 0, 0.03);
  }

  .record-row-accent {
    position: absolute;
    left: 0;
    top: 12rpx;
    bottom: 12rpx;
    width: 6rpx;
    border-radius: 0 6rpx 6rpx 0;
    background: linear-gradient(180deg, #dccf45 0%, var(--color-rc-primary) 55%, #f0e090 100%);
    opacity: 0.88;
  }

  .pb-calendar {
    padding: 10rpx 4rpx 20rpx;
    transform: scale(0.95);

    :deep(.uni-calendar__content) {
      background: transparent !important;
      box-shadow: none;
    }

    :deep(.uni-calendar__header) {
      background: #ffffff;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      padding: 0 8rpx;
    }

    :deep(.uni-calendar__header-text) {
      font-size: 30rpx;
      font-weight: 700;
      color: #111111;
      letter-spacing: 0.5rpx;
    }

    :deep(.uni-calendar__header-btn) {
      border-color: #111111;
    }

    :deep(.uni-calendar__backtoday) {
      font-size: 22rpx;
      color: rgba(17, 17, 17, 0.5);
    }

    :deep(.uni-calendar__weeks-day) {
      padding: 8rpx 0;
    }

    :deep(.uni-calendar__weeks-day-text) {
      font-size: 22rpx;
      color: rgba(17, 17, 17, 0.4);
      font-weight: 500;
    }

    :deep(.uni-calendar__box) {
      background: transparent;
    }

    /* 今日高亮 */
    :deep(.uni-calendar-item--isDay) {
      background-color: #111111 !important;
      border-radius: 50%;
    }

    /* 选中日期高亮 */
    :deep(.uni-calendar-item--checked) {
      background-color: var(--token-primary) !important;
      border-radius: 50%;
    }

    /* 圆点指示器 */
    :deep(.uni-calendar-item__weeks-box-circle) {
      position: absolute;
      top: 4rpx;
      right: 4rpx;
      width: 10rpx;
      height: 10rpx;
      border-radius: 50%;
      background-color: #ea7507;
    }

    /* 日期下方信息文字（记录次数） */
    :deep(.uni-calendar-item__weeks-lunar-text) {
      font-size: 20rpx !important;
      line-height: 1.1 !important;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: #ea7507 !important;
    }

    /* 今日/选中状态下信息文字变白 */
    :deep(.uni-calendar-item--isDay .uni-calendar-item__weeks-lunar-text),
    :deep(.uni-calendar-item--isDay-text.uni-calendar-item--isDay + .uni-calendar-item__weeks-lunar-text) {
      color: rgba(255, 255, 255, 0.92) !important;
    }
  }

  .add-record-btn {
    font-size: 28rpx;
    font-weight: 500;
    color: #ffffff;
    background: #111111;
    border-radius: 32rpx;
    height: 64rpx;
    padding: 0 28rpx;
  }

  .empty-record-now-btn {
    min-width: 200rpx;
  }
}
</style>
