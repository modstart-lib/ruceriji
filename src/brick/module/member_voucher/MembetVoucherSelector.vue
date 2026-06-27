<template>
  <view>
    <view class="rounded block text-gray-700 leading-10 py-2 flex border-0">
      <view> 优惠券 </view>
      <view v-if="records.length > 0" class="text-right text-primary flex-grow" @click="visible = true">
        <view v-if="selectedRecords.length > 0">
          {{ selectedRecords.map((o) => o._voucher.title).join(',') }}
        </view>
        <view v-else> {{ records.filter((o) => o._usable).length }} 张可用 </view>
      </view>
      <view v-else class="text-right text-muted flex-grow"> 暂无 </view>
    </view>
    <u-popup :show="visible" mode="bottom" @close="visible = false">
      <view class="p-4 relative">
        <view class="absolute right-0 top-0 h-10 w-10 leading-10 text-center" @click="visible = false">
          <icon-lucide-x />
        </view>
        <view class="text-center text-lg"> 优惠券 </view>
        <view style="max-height: 60vh; overflow: auto">
          <view v-for="(record, recordIndex) in records" :key="recordIndex">
            <view
              class="flex items-center mb-2 rounded-lg relative text-left"
              :style="{ backgroundColor: record._usable ? '#FEF3F2' : '#F8F8F8' }"
            >
              <view class="w-10 text-center">
                <c-checkbox v-model="records[recordIndex]._checked" :disabled="!record._usable" />
              </view>
              <view class="text-primary text-2xl w-20" @click="doCheck(recordIndex)">
                {{ record._voucher.showTag }}
              </view>
              <view class="flex-grow py-2" @click="doCheck(recordIndex)">
                <view class="font-bold">
                  {{ record._voucher.title }}
                </view>
                <view class="text-sm text-muted">
                  {{ record._voucher.summary }}
                </view>
                <view class="text-sm text-muted">
                  {{ record.startTime }}
                  -
                  {{ record.expireTime }}
                </view>
              </view>
              <view v-if="!record._usable" class="absolute right-2 top-2 text-muted"> 不可用 </view>
            </view>
          </view>
        </view>
      </view>
      <view class="p-4">
        <view
          class="flex w-full items-center justify-center py-2.5 px-5 text-base rounded-full bg-primary text-white cursor-pointer"
          @click="doSubmit"
        >
          确定使用
        </view>
      </view>
      <view style="height: 100rpx"> </view>
    </u-popup>
  </view>
</template>

<script setup lang="ts">
import { reactive, toRefs } from 'vue'
import { api } from '@/brick/lib/api'
import { dialog } from '@/brick/lib/dialog'

defineOptions({ name: 'MemberVoucherSelector' })

const props = defineProps({
  limit: {
    type: Number,
    default: 1,
  },
})

const emit = defineEmits(['change'])

const state = reactive({
  visible: false,
  loading: true,
  records: [],
  selectedRecords: [],
})
const { visible, loading, records, selectedRecords } = toRefs(state)

function init() {
  state.loading = false
}

function doCheck(index) {
  const selectedCount = state.records.filter((o) => o._checked).length
  if (!state.records[index]._usable) {
    return
  }
  if (state.records[index]._checked) {
    state.records[index]._checked = false
  } else {
    if (selectedCount >= props.limit) {
      dialog.tipError('最多选择' + props.limit + '张优惠券')
      return
    }
    state.records[index]._checked = true
  }
}

function selectItem(id) {
  state.records.forEach((o) => {
    o._checked = o.id === id
  })
  state.selectedRecords = JSON.parse(JSON.stringify(state.records.filter((o) => o._checked)))
}

function setItems(biz, items) {
  state.selectedRecords = []
  state.records = items.map((o) => {
    o._checked = false
    return o
  })
}

async function updateItems(biz, data, cb) {
  state.selectedRecords = []
  const res = await api.post('voucher/list_valid_for_member', {
    biz: biz,
    data: JSON.stringify(data),
  })
  state.records = res.data.records.map((o) => {
    o._checked = false
    return o
  })
  cb && cb()
}

function doSubmit() {
  state.visible = false
  state.selectedRecords = JSON.parse(JSON.stringify(state.records.filter((o) => o._checked)))
  emit('change', state.selectedRecords)
}
</script>
