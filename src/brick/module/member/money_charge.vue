<template>
  <view class="bg-white min-h-screen">
    <c-page-header title="钱包充值" />
    <view class="p-4">
      <view class="mb-4">
        <view class="bg-gray-100 rounded-full my-2 px-5 py-3 text-base">
          <input v-model="data.money" type="number" placeholder="填写充值金额" />
        </view>
        <view class="help">
          当前余额：
          <text class="text-primary">￥{{ total }}</text>
        </view>
      </view>
      <view class="mb-4">
        <button
          :loading="isSubmitting"
          class="flex w-full items-center justify-center py-2.5 px-5 text-base rounded-full bg-primary text-white cursor-pointer"
          @click="doSubmit()"
        >
          提交充值
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { Starter } from '@/brick/BrickUni'
import { useUi } from '@/brick/composables/useBaseStore'
import { api } from '@/brick/lib/api'
import { dialog } from '@/brick/lib/dialog'
import { router } from '@/brick/lib/router'
import { onReady } from '@dcloudio/uni-app'
import { reactive, toRefs } from 'vue'

defineOptions({ name: 'MoneyCharge' })

const { ui, getPageDefaultTitle, autoSetNavigationBarColor, SystemConfig } = useUi()

const state = reactive({
  isSubmitting: false,
  total: '-',
  data: {
    money: '',
  },
})
const { isSubmitting, total, data } = toRefs(state)

async function init() {
  const res = await api.post('member_money/get', {})
  state.total = res.data.total
}

async function doSubmit() {
  dialog.loadingOn()
  try {
    const res = await api.post('member_money/charge/submit', {
      money: state.data.money,
      redirect: router.pathToUrl('/pages/member'),
    })
    dialog.loadingOff()
    router.to(`/brick/module/pay_center/pay?order=${res.data.orderSecretId}`)
  } catch {
    dialog.loadingOff()
  }
}

onReady(() => {
  Starter.boot(() => {
    init()
  })
})
</script>
