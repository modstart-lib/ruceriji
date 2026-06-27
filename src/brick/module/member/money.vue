<template>
  <view class="pb-module-member-money bg-white min-h-screen">
    <c-page-header title="钱包" :shadow="false"></c-page-header>
    <view class="p-4">
      <view class="text-center pt-10">
        <icon-lucide-credit-card class="text-danger" style="font-size: 3rem; line-height: 3rem" />
      </view>
      <view class="text-center">
        <view class="text-danger mt-2">
          <text v-if="!hide" class="text-3xl"> ￥{{ total }} </text>
          <text v-if="hide" class="text-3xl"> ￥****** </text>
        </view>
        <view class="pt-2">
          <text class="text-muted">账户余额</text>
          <icon-lucide-eye class="inline-block ml-2" @click="hide = !hide" />
        </view>
      </view>
    </view>
    <view class="pt-20">
      <div v-if="config.Member_MoneyChargeEnable" class="p-4 px-20">
        <view
          class="flex items-center justify-center py-2.5 px-5 text-base rounded-full cursor-pointer btn-danger gradient"
          @click="router.to('/brick/module/member/money_charge')"
        >
          充值
        </view>
      </div>
      <div class="p-4 text-center">
        <view class="inline-block mx-4" @tap="router.to('/brick/module/member/money_log')"> 资金明细 </view>
        <view
          v-if="config.Member_MoneyCashEnable"
          class="inline-block mx-4"
          @click="router.to('/brick/module/member/money_cash')"
        >
          钱包提现
        </view>
      </div>
    </view>
  </view>
</template>

<script setup lang="ts">
import { Starter } from '@/brick/BrickUni'
import { useConfig, useUi } from '@/brick/composables/useBaseStore'
import { api } from '@/brick/lib/api'
import { router } from '@/brick/lib/router'
import { onReady } from '@dcloudio/uni-app'
import { reactive, toRefs } from 'vue'

defineOptions({ name: 'Money' })

const { config, SystemConfig } = useConfig()
const { ui, getPageDefaultTitle, autoSetNavigationBarColor } = useUi()

const state = reactive({
  hide: false,
  total: '*****',
})
const { hide, total } = toRefs(state)

async function init() {
  const res = await api.post('member_money/get', {})
  state.total = res.data.total
}

onReady(() => {
  Starter.boot(() => {
    init()
  })
})
</script>
