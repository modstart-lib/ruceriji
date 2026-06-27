<template>
  <view @click.stop="onClick">
    <slot />
  </view>
  <uni-popup ref="popupRef" type="bottom" background-color="#fff" border-radius="16px 16px 0 0">
    <view class="p-4">
      <view class="flex items-center justify-between mb-3">
        <text style="color: #999999" @click="onCancel">取消</text>
        <text style="color: #111111; font-weight: bold">选择时长</text>
        <text style="color: #111111; font-weight: bold" @click="onConfirm">确定</text>
      </view>
      <picker-view style="height: 200rpx; width: 100%" :value="pickerIndex" @change="onPickerChange">
        <picker-view-column>
          <view v-for="m in 61" :key="m" style="line-height: 60rpx; text-align: center">{{ m - 1 }} 分</view>
        </picker-view-column>
        <picker-view-column>
          <view v-for="s in 60" :key="s" style="line-height: 60rpx; text-align: center">{{ s - 1 }} 秒</view>
        </picker-view-column>
      </picker-view>
    </view>
  </uni-popup>
</template>

<script setup lang="ts">
import UniPopup from '@/brick/uni/uni-popup/uni-popup.vue'
import { reactive, ref, toRefs, watch } from 'vue'

defineOptions({ name: 'CTimeDuration' })

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['update:modelValue'])

const popupRef = ref<InstanceType<typeof UniPopup> | null>(null)

const state = reactive({
  pickerIndex: [0, 0] as number[],
})
const { pickerIndex } = toRefs(state)

watch(
  () => props.modelValue,
  (val) => {
    state.pickerIndex = [Math.floor(val / 60), val % 60]
  },
  { immediate: true }
)

function onClick() {
  popupRef.value?.open()
}

function onPickerChange(e: any) {
  state.pickerIndex = e.detail.value
}

function onConfirm() {
  const [m, s] = state.pickerIndex
  emit('update:modelValue', m * 60 + s)
  popupRef.value?.close()
}

function onCancel() {
  state.pickerIndex = [Math.floor(props.modelValue / 60), props.modelValue % 60]
  popupRef.value?.close()
}
</script>
