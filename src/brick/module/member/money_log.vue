<template>
  <view>
    <c-page-header title="资金明细" />
    <c-list-head-tools @submit="doSearch" @reset="doSearchReset">
      <c-list-head-tools-item title="筛选">
        <view class="">
          <view class="mb-3">
            <view class="block text-left mb-1"> 类型 </view>
            <view class="field">
              <c-single-id-name-selector
                v-model="search.type"
                :options="[
                  { id: '', name: '全部' },
                  { id: 'income', name: '收入' },
                  { id: 'payout', name: '支出' },
                ]"
              ></c-single-id-name-selector>
            </view>
          </view>
        </view>
      </c-list-head-tools-item>
    </c-list-head-tools>
    <view>
      <c-list-status-top :loading="listLoading" :records="list.records" />
      <view v-for="(item, itemIndex) in list.records" :key="item.id" class="bg-white m-2 items-center flex p-3">
        <view class="w-10 flex-shrink-0">
          <view class="w-8 h-8 bg-primary rounded-full text-white text-center leading-8">
            <icon-lucide-gift />
          </view>
        </view>
        <view class="flex-grow">
          <view class="leading-tight pb-2">{{ item.remark }}</view>
          <view class="text-muted text-sm">
            {{ item.created_at }}
          </view>
        </view>
        <view class="text-lg">
          <text v-if="item.change > 0" class="text-success">+{{ item.change }}</text>
          <text v-else class="text-danger">{{ item.change }}</text>
        </view>
      </view>
      <c-list-status ref="listStatus" :loading="listLoading" :records="list.records" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useLister } from '@/brick/composables/useLister'
import { useUi } from '@/brick/composables/useBaseStore'

defineOptions({ name: 'Message' })

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
  doListProcess('member_money/log', page)
}

function doSearchReset() {
  search.value.type = ''
  doSearch()
}
</script>
