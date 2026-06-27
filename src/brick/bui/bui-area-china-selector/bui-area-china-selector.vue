<template>
  <view>
    <view class="py-2" @click="visible = true">
      <icon-lucide-map-pin />
      {{ value ? value : '点击选择' }}
    </view>
    <u-picker
      :show="visible"
      :columns="pickerColumns"
      :default-index="defaultIndex"
      key-name="text"
      @confirm="onComplete"
      @cancel="visible = false"
      @close="visible = false"
      @change="onColumnChange"
    />
  </view>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted, toRefs, ref } from 'vue'
import { api } from '@/brick/lib/api'
import { Tree } from '../../lib/tree'

defineOptions({ name: 'BuiAreaChinaSelector' })

const props = defineProps({
  value: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['input', 'update:modelValue'])

const state = reactive({
  addressList: [],
  visible: false,
  // 3-column cascade data
  pickerColumns: [[], [], []],
  selectedIndexes: [0, 0, 0],
})
const { addressList, visible, pickerColumns, selectedIndexes } = toRefs(state)

const pickerRef = ref<any>(null)

const defaultIndex = computed(() => {
  return [0, 0, 0]
})

function getLevel1(list: any[]) {
  return list.map((o) => ({ text: o.text, value: o.value }))
}
function getLevel2(list: any[], idx0: number) {
  return (list[idx0]?.children || []).map((o) => ({ text: o.text, value: o.value }))
}
function getLevel3(list: any[], idx0: number, idx1: number) {
  return ((list[idx0]?.children || [])[idx1]?.children || []).map((o) => ({ text: o.text, value: o.value }))
}

async function init() {
  const res = await api.post('area/china', {})
  let nodes = res.data.map((o) => {
    o.text = o.title
    o.value = o.id
    return o
  })
  state.addressList = Tree.tree(nodes, 0, 'id', 'pid', 'sort', 'children')
  state.pickerColumns = [
    getLevel1(state.addressList),
    getLevel2(state.addressList, 0),
    getLevel3(state.addressList, 0, 0),
  ]
}

function onColumnChange(e: any) {
  const { columnIndex, index } = e
  if (columnIndex === 0) {
    state.selectedIndexes[0] = index
    state.selectedIndexes[1] = 0
    state.selectedIndexes[2] = 0
    const newCol1 = getLevel2(state.addressList, index)
    const newCol2 = getLevel3(state.addressList, index, 0)
    pickerRef.value?.setColumnValues(1, newCol1)
    pickerRef.value?.setColumnValues(2, newCol2)
  } else if (columnIndex === 1) {
    state.selectedIndexes[1] = index
    state.selectedIndexes[2] = 0
    const newCol2 = getLevel3(state.addressList, state.selectedIndexes[0], index)
    pickerRef.value?.setColumnValues(2, newCol2)
  } else {
    state.selectedIndexes[2] = index
  }
}

function onComplete(e: any) {
  state.visible = false
  const result = e.value
    .map((item: any) => item?.text || '')
    .filter(Boolean)
    .join(',')
  emit('input', result)
  emit('update:modelValue', result)
}

onMounted(() => {
  init()
})
</script>
