<template>
  <c-modal ref="modalRef" title="完善信息" width="90%">
    <view class="px-4 py-4">
      <!-- 性别选择：透明底娃娃，选中用黄描边光圈，不做整块发黄的方框 -->
      <view class="gender-row">
        <view class="gender-option" :class="{ active: gender === 'male' }" @click="gender = 'male'">
          <view class="gender-doll">
            <view class="gender-doll-inner">
              <c-image-static src="/static/image/male_nobg_640.png" />
            </view>
          </view>
          <view class="gender-label">男</view>
        </view>
        <view class="gender-option" :class="{ active: gender === 'female' }" @click="gender = 'female'">
          <view class="gender-doll">
            <view class="gender-doll-inner">
              <c-image-static src="/static/image/female_nobg_640.png" />
            </view>
          </view>
          <view class="gender-label">女</view>
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
        <icon-lucide-check :size="20" color="var(--token-action-text)" />
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

<style lang="scss" scoped>
.gender-row {
  display: flex;
  justify-content: center;
  gap: 28px;
  margin-bottom: 20px;
}

.gender-option {
  width: 104px;
  text-align: center;
  transition: opacity 0.15s ease;

  .gender-doll {
    width: 104px;
    height: 104px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--token-panel);
    transition:
      box-shadow 0.15s ease,
      background-color 0.15s ease;
  }

  /* 图是 640×640 透明底全身娃娃，内缩一圈让脚与圆环之间留白 */
  .gender-doll-inner {
    width: 92px;
    height: 92px;
  }

  .gender-label {
    margin-top: 6px;
    font-size: 13px;
    color: var(--token-text-secondary);
  }

  /* 未选中：降不透明 + 降饱和，靠“亮起来”表达选中 */
  &:not(.active) .gender-doll {
    opacity: 0.55;
    filter: grayscale(50%);
  }

  &.active .gender-doll {
    background: rgba(250, 224, 88, 0.18);
    box-shadow:
      0 0 0 2px var(--token-action),
      0 8px 20px rgba(250, 224, 88, 0.35);
  }

  &.active .gender-label {
    color: var(--token-text);
    font-weight: 700;
  }
}
</style>
