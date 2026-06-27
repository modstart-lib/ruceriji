<template>
  <view class="min-h-screen relative pb-6 bg-[#f7f8fa]">
    <c-page-header title="便便记录" background-color="transparent" color="#111111" />
    <view class="p-3">
      <!-- 时间和时长 -->
      <view class="bg-white border border-gray-100/50 rounded-2xl p-3 shadow-[0_4px_20px_rgb(0,0,0,0.02)] mb-5">
        <view class="flex items-center">
          <view class="flex-grow flex items-center" @click="openCalendar">
            <icon-lucide-clock :size="18" class="mr-2 text-gray-500" />
            <view style="color: #111111; font-weight: 500">{{ startTimeShow }}</view>
            <icon-lucide-chevron-down :size="14" class="ml-1 text-gray-400" />
          </view>
          <view class="ml-4">
            <c-time-duration v-model="duration">
              <view class="flex items-center" style="color: #111111; font-weight: 500">
                耗时 {{ durationShow }}
                <icon-lucide-chevron-down :size="14" class="ml-1 text-gray-400" />
              </view>
            </c-time-duration>
          </view>
        </view>
      </view>
      <!-- 便便属性选择 -->
      <template v-if="lazyStyleInited">
        <view v-for="d in lazyStyleData" :key="d.name" class="mb-4">
          <WcValueSelector v-model="d.value" :title="d.title" :options="d.options" />
        </view>
      </template>
      <c-loading v-else />

      <!-- 备注 -->
      <view class="mb-4 bg-white border border-gray-100/50 rounded-xl p-2 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
        <u-textarea
          v-model="remark"
          placeholder="备注，随便写什么都可以"
          placeholder-style="color:rgba(17,17,17,0.3)"
          border="none"
          count
          :custom-style="{ color: '#111111' }"
        />
      </view>

      <view class="h-20"></view>
    </view>

    <!-- 日期+时间选择弹窗 -->
    <uni-popup ref="datePopupRef" type="bottom" background-color="#fff" border-radius="16px 16px 0 0">
      <view class="p-4">
        <view class="flex items-center justify-between mb-2">
          <text style="color: #999999; font-size: 14px" @click="closeDatePopup">取消</text>
          <text style="color: #111111; font-weight: bold; font-size: 14px">选择时间</text>
          <text style="color: #111111; font-weight: bold; font-size: 14px" @click="confirmDateTime">确定</text>
        </view>
        <uni-calendar :insert="true" :date="tempDate" :show-month="false" @change="onCalendarChange" />
        <picker-view style="height: 120rpx; width: 100%" :value="tempTimeValue" @change="onTimeChange">
          <picker-view-column>
            <view v-for="h in 24" :key="h" style="line-height: 60rpx; text-align: center">{{ h - 1 }} 时</view>
          </picker-view-column>
          <picker-view-column>
            <view v-for="m in 60" :key="m" style="line-height: 60rpx; text-align: center">{{ m - 1 }} 分</view>
          </picker-view-column>
        </picker-view>
      </view>
    </uni-popup>

    <!-- 底部保存按钮 -->
    <view
      class="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-gray-100 z-50 rounded-t-[2rem] shadow-[0_-4px_20px_rgb(0,0,0,0.03)] pb-safe"
    >
      <u-button
        type="primary"
        shape="circle"
        :block="true"
        :custom-style="{ background: '#111111', color: '#ffffff', border: 'none', fontWeight: 'bold' }"
        @click="doSubmit"
      >
        <icon-lucide-check :size="20" color="#fff" />
        <text class="ml-2">保存</text>
      </u-button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { api } from '@/brick/lib/api'
import { DateUtil } from '@/brick/lib/date-util'
import { EventBus } from '@/brick/lib/event-bus'
import { router } from '@/brick/lib/router'
import { Storage } from '@/brick/lib/storage'
import UniCalendar from '@/brick/uni/uni-calendar/uni-calendar.vue'
import UniPopup from '@/brick/uni/uni-popup/uni-popup.vue'
import { fetchStyle, useRucerijiStyle } from '@/composables/useRucerijiStyle'
import { onReady } from '@dcloudio/uni-app'
import { computed, reactive, ref, toRefs } from 'vue'
import { useRucerijiStore } from '../store/ruceriji'
import WcValueSelector from './components/WcValueSelector.vue'

defineOptions({ name: 'EditPage' })

const datePopupRef = ref<InstanceType<typeof UniPopup> | null>(null)

const state = reactive({
  lazyStyleData: [],
  id: 0,
  type: '',
  startTime: '',
  duration: 0,
  remark: '',
  tempDate: '',
  tempTimeValue: [0, 0] as number[],
})
const { lazyStyleData, id, type, startTime, duration, remark, tempDate, tempTimeValue } = toRefs(state)

const { styleReady } = useRucerijiStyle()
const lazyStyleInited = computed(() => styleReady.value && !!state.lazyStyleData.length)

const startTimeShow = computed(() => {
  if (!state.startTime) return '选择时间'
  return DateUtil.format(state.startTime, 'MM月DD日 HH:mm')
})

const durationShow = computed(() => {
  return DateUtil.formatDuration(state.duration, {
    isMs: false,
    format: state.duration >= 3600 ? 'HH时mm分ss秒' : 'mm分ss秒',
  })
})

const calendarDate = computed(() => {
  if (!state.startTime) return ''
  return state.startTime.slice(0, 10)
})

function openCalendar() {
  const dt = state.startTime ? new Date(state.startTime.replace(/-/g, '/')) : new Date()
  state.tempDate = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
  state.tempTimeValue = [dt.getHours(), dt.getMinutes()]
  datePopupRef.value?.open()
}

function closeDatePopup() {
  datePopupRef.value?.close()
}

function onCalendarChange(e: any) {
  state.tempDate = e.fulldate
}

function onTimeChange(e: any) {
  state.tempTimeValue = e.detail.value
}

function confirmDateTime() {
  const [h, m] = state.tempTimeValue
  state.startTime = `${state.tempDate} ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
  datePopupRef.value?.close()
}

async function initData() {
  if (state.type === 'custom') {
    if (!state.startTime) state.startTime = DateUtil.datetime()
    if (!state.duration) state.duration = 60 * 10
  }

  const style = await fetchStyle()
  // 深拷贝避免污染全局缓存
  state.lazyStyleData = style.map((s) => ({ ...s, options: [...s.options], value: s.value || '' }))

  // 恢复上次记录
  const lastData = Storage.get('rucerijiLastRecord')
  if (lastData) {
    for (const s of state.lazyStyleData) {
      if (lastData[s.name]) s.value = lastData[s.name]
    }
  }

  if (state.type === 'edit') {
    try {
      const res = await api.postWithLoading('ruceriji/record/get', { id: state.id })
      state.startTime = res.data.record.time
      state.duration = res.data.record.duration
      state.remark = res.data.record.remark
      for (const d of state.lazyStyleData) {
        d.value = res.data.record[d.name] || ''
      }
    } catch {}
  }
}

function getFormStyle() {
  const data = {}
  for (const d of state.lazyStyleData) {
    data[d.name] = d.value
  }
  return data
}

async function doSubmit() {
  const data = {
    id: state.id,
    startTime: state.startTime,
    duration: state.duration,
    remark: state.remark,
    ...getFormStyle(),
  }
  Storage.set('rucerijiLastRecord', data)
  let url = 'ruceriji/record/submit'
  if (state.type === 'custom') url = 'ruceriji/record/submit_custom'
  else if (state.type === 'edit') url = 'ruceriji/record/submit_edit'
  try {
    await api.postWithLoading(url, data)
    useRucerijiStore().setRecordChanged(true)
    EventBus.$emitDelay('UpdateApp')
    if (state.type) {
      router.back()
    } else {
      router.to('/pages/calendar')
    }
  } catch {}
}

onReady(() => {
  state.id = router.getQueryInteger('id')
  state.type = router.getQuery('type')
  if (state.id > 0) state.type = 'edit'
  state.startTime = router.getQuery('startTime')
  state.duration = router.getQueryInteger('duration')
  if (state.duration > 3600) state.duration = 3600
  initData()
})
</script>
