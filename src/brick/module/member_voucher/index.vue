<template>
  <view>
    <c-page-header title="优惠券" />
    <view class="mt-1">
      <c-list-status-top :loading="listLoading" :records="list.records" />
      <view v-for="(item, itemIndex) in list.records" :key="item.bizId" class="p-2 py-1">
        <view class="bg-white shadow rounded-lg p-2 h-24 box-border">
          <view class="flex">
            <view class="flex-grow overflow-hidden">
              <view class="text-red-600 text-lg">
                {{ item._voucher['showTag'] }}
              </view>
              <view class="mt-1 truncate overflow-hidden">
                {{ item._voucher['summary'] }}
              </view>
              <view class="text-muted text-sm"> {{ item.startTime }}~{{ item.expireTime }} </view>
            </view>
            <view class="relative w-20 flex-shrink-0">
              <view
                :class="{
                  'bg-red-400': item.status === VoucherItemStatus.VALID.value,
                  'bg-gray-300': item.status !== VoucherItemStatus.VALID.value,
                }"
                class="text-white hover:text-white absolute -top-2 -right-2 h-24 w-24 flex flex-col justify-center rounded-lg"
              >
                <view class="whitespace-nowrap text-center">
                  <view v-if="item.status === VoucherItemStatus.VALID.value" @click="doSubmit(item)">
                    <view>立即</view>
                    <view>使用</view>
                  </view>
                  <view v-else-if="item.status === VoucherItemStatus.EXPIRED.value"> 已过期 </view>
                  <view v-else-if="item.status === VoucherItemStatus.USED.value"> 已使用 </view>
                  <view v-else-if="item.status === VoucherItemStatus.DISABLED.value"> 已禁用 </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
      <c-list-status ref="listStatus" :loading="listLoading" :records="list.records" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { onReady } from '@dcloudio/uni-app'
import { Starter } from '@/brick/BrickUni'

import { reactive } from 'vue'
import { useLister } from '@/brick/composables/useLister'
import { useUi } from '@/brick/composables/useBaseStore'
import { api } from '@/brick/lib/api'
import { dialog } from '@/brick/lib/dialog'
import { VoucherItemStatus } from './constant'

defineOptions({ name: 'MemberVoucher' })

const {
  listLoading,
  order,
  list,
  selectIds,
  filter,
  search,
  listStatusRef,
  doSearch,
  doNextPage,
  onSortChange,
  doListProcess,
  onTableSelectChange,
} = useLister()
const { ui, getPageDefaultTitle, autoSetNavigationBarColor, SystemConfig } = useUi()

const state = reactive({
  VoucherItemStatus,
})

function init() {
  doSearch()
}

function doList(page) {
  doListProcess('member_voucher/paginate', page)
}

async function doSubmit(item) {
  dialog.loadingOn()
  try {
    await api.post('member_voucher/submit', { id: item.id })
    dialog.loadingOff()
  } catch {
    dialog.loadingOff()
  }
}

onReady(() => {
  Starter.boot(() => init())
})
</script>
