<template>
  <view class="bg-white min-h-screen">
    <c-page-header title="积分" :shadow="false"></c-page-header>
    <view class="p-4">
      <view class="text-center pt-10">
        <icon-lucide-coins class="text-warning" style="font-size: 3rem; line-height: 3rem" />
      </view>
      <view class="text-center">
        <view class="text-warning mt-2">
          <text class="text-3xl">
            {{ total }}
          </text>
        </view>
        <view class="pt-2">
          <text class="text-muted">我的积分</text>
        </view>
      </view>
    </view>
    <view class="pt-20">
      <div v-if="hasModule('MemberCreditCharge')" class="p-4 px-20">
        <view
          class="flex w-full items-center justify-center py-2.5 px-5 text-base rounded-full cursor-pointer btn-warning gradient"
          @click="router.to('/brick/module/member_credit_charge/index')"
        >
          积分充值
        </view>
      </div>
      <div class="p-4 text-center">
        <view class="inline-block mx-4" @tap="router.to('/brick/module/member/credit_log')"> 积分明细 </view>
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

const { config, SystemConfig, hasModule } = useConfig()
const { ui, getPageDefaultTitle, autoSetNavigationBarColor } = useUi()

const state = reactive({
  total: '-',
})
const { total } = toRefs(state)

async function init() {
  const res = await api.postCached('member_credit/get', {})
  state.total = res.data.total
}

onReady(() => {
  Starter.boot(() => {
    init()
  })
})
</script>
