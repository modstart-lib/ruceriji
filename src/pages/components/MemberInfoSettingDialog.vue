<template>
  <c-modal ref="modalRef" title="完善信息" width="90%">
    <view class="px-4 py-4">
      <!-- 性别选择 -->
      <view class="flex justify-center gap-8 mb-5">
        <view class="text-center" @click="gender = 'male'">
          <view
            class="w-24 h-24 shadow rounded-xl flex items-center justify-center cursor-pointer"
            :class="{ 'bg-yellow-100': gender === 'male' }"
          >
            <view class="w-20 h-20">
              <c-image-static src="/static/image/male_avatar.png" />
            </view>
          </view>
          <view class="mt-1 text-sm">男</view>
        </view>
        <view class="text-center" @click="gender = 'female'">
          <view
            class="w-24 h-24 shadow rounded-xl flex items-center justify-center cursor-pointer"
            :class="{ 'bg-yellow-100': gender === 'female' }"
          >
            <view class="w-20 h-20">
              <c-image-static src="/static/image/female_avatar.png" />
            </view>
          </view>
          <view class="mt-1 text-sm">女</view>
        </view>
      </view>

      <!-- 身高 -->
      <view class="flex items-center mb-3">
        <view class="w-10 text-right font-medium text-sm mr-3 flex-shrink-0">身高</view>
        <view class="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-center text-sm">
          <picker :value="heightIndex" :range="heightRange" @change="onHeightChange">
            <view>{{ heightRange[heightIndex] }}</view>
          </picker>
        </view>
      </view>

      <!-- 体重 -->
      <view class="flex items-center mb-3">
        <view class="w-10 text-right font-medium text-sm mr-3 flex-shrink-0">体重</view>
        <view class="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-center text-sm">
          <picker :value="weightIndex" :range="weightRange" @change="onWeightChange">
            <view>{{ weightRange[weightIndex] }}</view>
          </picker>
        </view>
      </view>

      <!-- 出生日期 -->
      <view class="flex items-center mb-5">
        <view class="w-10 text-right font-medium text-sm mr-3 flex-shrink-0">出生</view>
        <view class="flex-1 bg-gray-100 rounded-lg px-3 py-2 text-center text-sm" @tap="showBirthdayPicker = true">
          {{ bodyBirthday ? bodyBirthday : '请选择' }}
        </view>
      </view>
      <u-datetime-picker
        :show="showBirthdayPicker"
        mode="date"
        :min-date="new Date(new Date().getFullYear() - 100, 0, 1).getTime()"
        @confirm="onBirthdayConfirm"
        @cancel="showBirthdayPicker = false"
        @close="showBirthdayPicker = false"
      />

      <u-button type="primary" shape="circle" :block="true" @click="doSubmit">
        <icon-lucide-check :size="20" color="#fff" />
        <text class="ml-2">保存</text>
      </u-button>
      <view class="mt-3 text-center text-tertiary text-xs flex items-center justify-center">
        <icon-lucide-info :size="12" class="mr-1" />
        为了更好的为您分析健康情况，请完善信息
      </view>
    </view>
  </c-modal>
</template>

<script setup lang="ts">
import { useAppBiz, useAppUser } from '@/brick/composables/useAppStore'
import { api } from '@/brick/lib/api'
import { DateUtil } from '@/brick/lib/date-util'
import { dialog } from '@/brick/lib/dialog'
import { EventBus } from '@/brick/lib/event-bus'
import { onMounted, reactive, ref, toRefs } from 'vue'

defineOptions({ name: 'MemberInfoSettingDialog' })

const props = defineProps({
  autoShow: {
    type: Boolean,
    default: false,
  },
})

const { user, userInit, isLogin, waitUserReady, requireUserLogin, requireUserLoginRouteTo } = useAppUser()
const { biz } = useAppBiz()

const state = reactive({
  heightRange: Array.from({ length: 250 }, (_, i) => i + 30 + ' cm'),
  heightIndex: 130, // 160 - 30
  weightRange: Array.from({ length: 146 }, (_, i) => i + 3 + ' kg'),
  weightIndex: 57, // 60 - 3
  gender: 'male',
  bodyBirthday: null,
})
const { heightRange, heightIndex, weightRange, weightIndex, gender, bodyBirthday } = toRefs(state)
const showBirthdayPicker = ref(false)

const modalRef = ref<any>(null)

function autoDetect() {
  waitUserReady(() => {
    if (!props.autoShow) return
    if (user.value && user.value.id > 0) {
      const currentBiz = biz.value
      if (
        !currentBiz ||
        !currentBiz.gender ||
        !currentBiz.bodyWeight ||
        !currentBiz.bodyHeight ||
        !currentBiz.bodyBirthday
      ) {
        modalRef.value && modalRef.value.show()
      } else {
        modalRef.value && modalRef.value.close()
      }
    }
  })
}

function show() {
  if (biz.value) {
    if (biz.value.gender) state.gender = biz.value.gender
    if (biz.value.bodyHeight) state.heightIndex = biz.value.bodyHeight - 30
    if (biz.value.bodyWeight) state.weightIndex = biz.value.bodyWeight - 3
    if (biz.value.bodyBirthday) state.bodyBirthday = biz.value.bodyBirthday
  }
  modalRef.value.show()
}

function onHeightChange(e) {
  state.heightIndex = e.detail.value
}

function onWeightChange(e) {
  state.weightIndex = e.detail.value
}

function onBirthdayConfirm(val) {
  state.bodyBirthday = DateUtil.format(val.value, 'YYYY-MM-DD')
  showBirthdayPicker.value = false
}

async function doSubmit() {
  try {
    await api.postWithLoading('ruceriji/member/setting', {
      gender: state.gender,
      bodyHeight: parseInt(state.heightIndex) + 30,
      bodyWeight: parseInt(state.weightIndex) + 3,
      bodyBirthday: state.bodyBirthday,
    })
    dialog.tipSuccess('保存成功')
    EventBus.$emitDelay('UpdateApp', () => {
      modalRef.value.close()
      EventBus.$emitDelayDataChange('MemberInfoSettingChange')
    })
  } catch {}
}

onMounted(() => {
  autoDetect()
  EventBus.$on('UserChange', () => autoDetect())
  EventBus.$on('MemberInfoSettingChange', () => autoDetect())
})

defineExpose({
  show,
})
</script>
