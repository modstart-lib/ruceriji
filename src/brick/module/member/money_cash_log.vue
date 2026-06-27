<template>
  <view>
    <c-page-header title="提现申请" />
    <view>
      <c-list-status-top :loading="listLoading" :records="list.records" />
      <view v-for="(item, itemIndex) in list.records" :key="item.id" class="flex bg-white m-2 p-2 items-center rounded">
        <view class="w-10 flex-shrink-0">
          <view class="w-8 h-8 bg-primary rounded-full text-white text-center leading-8">
            <icon-lucide-gift />
          </view>
        </view>
        <view class="flex-grow">
          <view class="">{{ item.remark }}</view>
          <view class="text-muted text-sm">
            {{ item.created_at }}
          </view>
        </view>
        <view class="text-right">
          <view class="text-lg"> ￥{{ item.moneyAfterTax }} </view>
          <view class="text-xs">
            <text v-if="item.status === 1" class="text-warning">正在审核</text>
            <text v-if="item.status === 2" class="text-success">提现成功</text>
          </view>
        </view>
      </view>
      <c-list-status ref="listStatus" :loading="listLoading" :records="list.records" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { useUi } from '@/brick/composables/useBaseStore'
import { useLister } from '@/brick/composables/useLister'
import { reactive } from 'vue'

defineOptions({ name: 'MoneyCashLog' })

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
  search: {
    type: '',
  },
})

function doList(page) {
  doListProcess('member_money/cash/log', page)
}

function doSearchReset() {
  search.value.type = ''
  doSearch()
}
</script>
