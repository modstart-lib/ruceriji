<template>
  <view class="pb-ruceriji-calendar">
    <!-- 顶部导航 + 月份切换 + 本月摘要 -->
    <view class="calendar-top-bar page-motion-t1">
      <c-page-header-trans title="记录" :has-back="false" color="#111111" :float="false" />

      <view class="calendar-month-row">
        <view class="month-nav">
          <view class="month-nav-btn" @click="goPrevMonth">
            <icon-lucide-chevron-left :size="18" color="#111111" />
          </view>
          <picker mode="date" fields="month" :value="monthPickerValue" @change="onMonthPick">
            <view class="month-label">{{ currentMonthLabel }}</view>
          </picker>
          <view class="month-nav-btn" @click="goNextMonth">
            <icon-lucide-chevron-right :size="18" color="#111111" />
          </view>
        </view>

        <view class="data-btn flex items-center" @click="requireUserLoginRouteTo('/pages_data/data', {}, true)">
          <icon-lucide-bar-chart-big :size="14" />
          <text class="ml-1">数据分析</text>
        </view>
      </view>

      <view class="calendar-month-meta">
        <text v-if="monthStats.total" class="month-digest">
          本月 <text class="month-digest-num">{{ monthStats.total }}</text> 次 · 有记录
          <text class="month-digest-num">{{ monthStats.days }}</text> 天
        </text>
        <text v-else class="month-digest">本月还没有记录</text>
        <view class="today-chip" @click="goToday">今天</view>
      </view>
    </view>

    <view class="calendar-page-body">
      <!-- 日历卡片 -->
      <view class="calendar-card-wrap page-motion-t2">
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

      <!-- 当天记录 -->
      <view class="records-card page-motion-t3">
        <view class="records-head">
          <text class="records-title">{{ selectedDateLabel }}</text>
          <text v-if="records.length" class="records-count">{{ records.length }} 条记录</text>
        </view>

        <view v-if="!records.length" class="records-empty">
          <icon-lucide-pen-line :size="15" color="#6b6b6b" />
          <text class="records-empty-text">这一天还没有记录</text>
        </view>
        <view v-else class="records-list">
          <view v-for="r in records" :key="r.id" class="record-row" @click="router.to('/pages/detail', { id: r.id })">
            <view
              class="record-thumb flex-shrink-0 rounded-xl overflow-hidden bg-white border border-[var(--token-border)]"
            >
              <c-image-static v-if="r._styleShape && r._styleShape.image" :src="r._styleShape.image" />
              <c-image-static v-else src="/static/image/shit.svg" />
            </view>
            <view class="flex-grow min-w-0">
              <view class="record-title truncate">{{ r._title }}</view>
              <view class="record-sub">耗时 {{ r._duration }}</view>
            </view>
            <view class="record-time flex-shrink-0">{{ r._time }}</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 补充记录：全页唯一主操作，位置固定 -->
    <view class="record-fab" @click="goAddCustomRecord">
      <icon-lucide-plus :size="26" color="var(--token-action-text)" />
    </view>

    <MemberInfoSettingDialog auto-show />
    <AppAwardDetectDialog />
    <bui-member-login-dialog ref="memberLoginDialog" />
  </view>
</template>

<script setup lang="ts">
import { useAppConfig, useAppUser } from '@/brick/composables/useAppStore'
import { useBranding } from '@/brick/composables/useBranding'
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
const branding = useBranding()
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
      // 接口只给 "2次" 文本，接口补 count 前先从前端兜底解析
      const count = Number(item.count) || parseInt(String(info), 10) || 0
      return { date: String(date).slice(0, 10), info, count }
    })
    .filter(Boolean)
})

const monthPickerValue = computed(() => `${state.year}-${String(state.month).padStart(2, '0')}`)

const monthStats = computed(() => {
  const list = Array.isArray(state.dateInfo) ? (state.dateInfo as any[]) : []
  const total = list.reduce(
    (sum, item) => sum + (Number(item && item.count) || parseInt(String((item && item.info) || ''), 10) || 0),
    0
  )
  return { total, days: list.length }
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
    title: (config.value && config.value.Ruceriji_ShareTitle) || branding.value.siteName,
    imageUrl: (config.value && config.value.Ruceriji_ShareImage) || branding.value.siteLogo,
  }
})

/** 月份左右切换、回到今天、月份选择都交给 uni-calendar 内部方法，保持状态唯一来源 */
function callCalendar(name: 'pre' | 'next' | 'backToday' | 'bindDateChange', arg?: any) {
  const inst = calendarRef.value as any
  if (inst && typeof inst[name] === 'function') inst[name](arg)
}

function goPrevMonth() {
  callCalendar('pre')
}

function goNextMonth() {
  callCalendar('next')
}

function goToday() {
  callCalendar('backToday')
}

function onMonthPick(e: any) {
  callCalendar('bindDateChange', e)
}

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
.pb-ruceriji-calendar {
  position: relative;
  min-height: 100vh;
  background: var(--token-body);

  :deep(.ub-header-mobile.no-shadow .header-container) {
    box-shadow: none;
  }

  /* 顶部只保留一层淡色渐变，渐变条交给日历卡片 */
  .calendar-top-bar {
    position: relative;
    overflow: hidden;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    background:
      radial-gradient(ellipse 130% 85% at 18% -25%, rgba(250, 224, 88, 0.18) 0%, transparent 52%),
      radial-gradient(ellipse 100% 70% at 88% 8%, rgba(255, 248, 220, 0.5) 0%, transparent 48%),
      linear-gradient(168deg, #fffef8 0%, #faf8f2 45%, #f5f4f0 100%);
  }

  .calendar-page-body {
    /* 底部给浮动按钮留出空间 */
    padding-bottom: calc(66px + 60px + constant(safe-area-inset-bottom));
    padding-bottom: calc(66px + 60px + env(safe-area-inset-bottom, 0px));
  }

  /* 折叠屏/双屏展开时限制内容宽度，避免日历和记录区被简单拉宽 */
  .calendar-card-wrap,
  .records-card {
    box-sizing: border-box;
    width: calc(100% - 24px);
    max-width: 640px;
    margin-left: auto;
    margin-right: auto;
  }

  .calendar-month-row,
  .calendar-month-meta {
    box-sizing: border-box;
    width: 100%;
    max-width: 664px;
    margin-left: auto;
    margin-right: auto;
    padding-left: 16px;
    padding-right: 16px;
  }

  .calendar-month-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .month-nav {
    display: flex;
    align-items: center;
    gap: 2px;
    min-width: 0;
  }

  .month-nav-btn {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(17, 17, 17, 0.05);
    transition: transform 0.15s ease;

    &:active {
      transform: scale(0.92);
      background: rgba(17, 17, 17, 0.09);
    }
  }

  .month-label {
    padding: 0 4px;
    font-size: 21px;
    font-weight: 700;
    line-height: 1.25;
    color: #111111;
    letter-spacing: -0.2px;
    white-space: nowrap;
  }

  /* 320px 窄屏：月份、箭头、数据分析三个元素会挤爆一行，整体收一档 */
  @media (max-width: 359px) {
    .month-nav-btn {
      width: 32px;
      height: 32px;
    }

    .month-label {
      font-size: 17px;
    }

    .data-btn {
      height: 32px;
      padding: 0 10px;
      font-size: 11px;
    }
  }

  /* 次要入口：白底描边，把黄色留给品牌点缀 */
  .data-btn {
    flex-shrink: 0;
    height: 36px;
    padding: 0 12px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    color: #111111;
    background: #ffffff;
    border: 1px solid rgba(0, 0, 0, 0.1);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
    transition: transform 0.15s ease;

    &:active {
      transform: scale(0.95);
    }
  }

  .calendar-month-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding-top: 4px;
    padding-bottom: 10px;
  }

  .month-digest {
    font-size: 11.5px;
    color: var(--token-text-secondary);
    font-variant-numeric: tabular-nums;
  }

  .month-digest-num {
    margin: 0 1px;
    font-weight: 700;
    font-size: 12.5px;
    color: #111111;
  }

  .today-chip {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    min-height: 36px;
    padding: 6px 16px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    line-height: 18px;
    color: #111111;
    background: #ffffff;
    border: 1px solid rgba(0, 0, 0, 0.1);
    transition: transform 0.15s ease;

    &:active {
      transform: scale(0.95);
      background: rgba(17, 17, 17, 0.06);
    }
  }

  .calendar-card-wrap {
    margin-top: 10px;
    background: #ffffff;
    border: 1px solid rgba(0, 0, 0, 0.055);
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 6px 22px -16px rgba(17, 17, 17, 0.28);
  }

  .calendar-top-accent {
    height: 3px;
    background: linear-gradient(90deg, #e8d050 0%, var(--color-rc-primary) 45%, #f5e8a0 100%);
  }

  .records-card {
    margin-top: 12px;
    padding: 12px;
    background: #ffffff;
    border: 1px solid rgba(0, 0, 0, 0.055);
    border-radius: 18px;
    box-shadow: 0 6px 22px -16px rgba(17, 17, 17, 0.28);
  }

  .records-head {
    display: flex;
    align-items: baseline;
    gap: 8px;
    padding: 0 2px 10px;
  }

  .records-title {
    font-size: 16px;
    font-weight: 700;
    line-height: 1.2;
    color: #111111;
  }

  .records-count {
    font-size: 12px;
    color: var(--token-text-secondary);
    font-variant-numeric: tabular-nums;
  }

  .records-empty {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 14px 2px 12px;
  }

  .records-empty-text {
    font-size: 13px;
    color: var(--token-text-secondary);
  }

  .record-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px;
    border-radius: 14px;
    background: #f5f6f8;
    transition: opacity 0.2s ease;

    & + .record-row {
      margin-top: 8px;
    }

    &:active {
      opacity: 0.8;
    }
  }

  .record-thumb {
    width: 40px;
    height: 40px;
  }

  .record-title {
    font-size: 14px;
    font-weight: 700;
    color: #111111;
  }

  .record-sub {
    margin-top: 2px;
    font-size: 11.5px;
    color: var(--token-text-secondary);
  }

  .record-time {
    font-size: 13px;
    font-weight: 500;
    color: var(--token-text-secondary);
    font-variant-numeric: tabular-nums;
  }

  .pb-calendar {
    padding: 2px 6px 8px;

    :deep(.uni-calendar__content) {
      background: transparent !important;
      box-shadow: none;
    }

    /* 月份标题/箭头/今日已由页面顶部统一承载，组件头整体隐藏 */
    :deep(.uni-calendar__header) {
      display: none;
    }

    :deep(.uni-calendar__weeks-day) {
      padding: 8px 0 4px;
    }

    :deep(.uni-calendar__weeks-day-text) {
      font-size: 12px;
      color: var(--token-text-secondary);
      font-weight: 500;
    }

    :deep(.uni-calendar__box) {
      background: transparent;
    }

    /* 非本月/不可选日期保持可读，但同时弱于本月日期 */
    :deep(.uni-calendar-item--disable) {
      background-color: transparent;
      color: #b0b0b0;
    }

    /* 日期格固定 px：rpx 在 600–960 会被放大、960 以上又缩小，宽屏会忽大忽小 */
    :deep(.uni-calendar-item__weeks-box-item) {
      width: 36px;
      height: 36px;
    }

    @media (min-width: 360px) {
      :deep(.uni-calendar-item__weeks-box-item) {
        width: 44px;
        height: 44px;
      }
    }

    @media (min-width: 600px) {
      :deep(.uni-calendar-item__weeks-box-item) {
        width: 46px;
        height: 46px;
      }
    }

    /* 高亮背景放在固定尺寸的内层方块上，避免宽屏被拉成椭圆 */
    :deep(.uni-calendar-item--isDay),
    :deep(.uni-calendar-item--checked) {
      background-color: transparent !important;
      border-radius: 0;
      /* 组件默认 opacity: .8，会把品牌黄压成灰黄，这里恢复不透明 */
      opacity: 1;
    }

    /* 选中（含今天被选中）：黄实心圆 + 深色数字，次数交给下方记录列表 */
    :deep(.uni-calendar-item--isDay .uni-calendar-item__weeks-box-item),
    :deep(.uni-calendar-item--checked .uni-calendar-item__weeks-box-item) {
      background-color: var(--token-action);
      border-radius: 50%;
      padding-bottom: 0;
    }

    :deep(.uni-calendar-item--isDay .uni-calendar-item__count),
    :deep(.uni-calendar-item--checked .uni-calendar-item__count) {
      display: none;
    }

    /* 今天但未选中：细描边 + 加粗，与选中态一眼可分 */
    :deep(.uni-calendar-item--today .uni-calendar-item__weeks-box-item) {
      border: 1.5px solid rgba(17, 17, 17, 0.35);
      border-radius: 50%;
    }

    :deep(.uni-calendar-item--today .uni-calendar-item__weeks-box-text) {
      font-weight: 700;
    }

    /* 今天不再是选中态时，数字保持深色（组件默认给的是蓝色） */
    :deep(.uni-calendar-item__weeks-box-text.uni-calendar-item--isDay-text) {
      color: #111111;
    }

    :deep(.uni-calendar-item__weeks-lunar-text.uni-calendar-item--isDay) {
      color: var(--token-text-secondary) !important;
    }

    /* 只有「选中」才用深字，避免今天未选中时白字消失 */
    :deep(.uni-calendar-item--isDay .uni-calendar-item__weeks-box-text),
    :deep(.uni-calendar-item--checked .uni-calendar-item__weeks-box-text) {
      color: var(--token-action-text) !important;
    }

    /* 圆点在窄屏会压住日期数字，记录次数改由下方点阵承载（不依赖颜色） */
    :deep(.uni-calendar-item__weeks-box-circle) {
      display: none;
    }

    /* 日期下方信息文字（无 count 时的旧文案兜底） */
    :deep(.uni-calendar-item__weeks-lunar-text) {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 1px;
      font-size: 10px !important;
      line-height: 1 !important;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--token-text-secondary) !important;
    }

    /* 数字略上移，给下方点阵留位置：
       必须用 border-box，否则 padding 会把 44×44 的内层方块撑成 44×50，
       高亮的 border-radius: 50% 就画成了竖椭圆 */
    :deep(.uni-calendar-item__weeks-box-item) {
      box-sizing: border-box;
      padding-bottom: 4px;
    }

    /* 今日/选中：圆形高亮 / 描边本身足够表达状态，隐藏旧文案避免贴边拥挤 */
    :deep(.uni-calendar-item--today .uni-calendar-item__weeks-lunar-text),
    :deep(.uni-calendar-item--isDay .uni-calendar-item__weeks-lunar-text),
    :deep(.uni-calendar-item--checked .uni-calendar-item__weeks-lunar-text) {
      display: none;
    }
  }

  .record-fab {
    position: fixed;
    right: 18px;
    bottom: calc(var(--window-bottom, 50px) + 18px);
    z-index: 20;
    width: 54px;
    height: 54px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--token-action);
    box-shadow: var(--token-action-shadow);
    transition: transform 0.15s ease;

    &:active {
      transform: scale(0.94);
    }
  }
}
</style>
