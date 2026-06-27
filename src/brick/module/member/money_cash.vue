<template>
  <view>
    <c-page-header title="钱包提现"></c-page-header>
    <c-loading v-if="loading" page />
    <view v-else class="p-4 bg-content-bg">
      <view class="float-right">
        <view class="text-tertiary" @click="router.to('/brick/module/member/money_cash_log')">
          <icon-lucide-clock />
          提现记录
        </view>
      </view>
      <view>
        <view v-if="!info.canCash" class="text-muted">
          钱包余额 {{ info.total }} 元，最少 {{ info.min }} 元可提现
        </view>
      </view>
      <view v-if="info.canCash" class="text-sm"> 提现金额 </view>
      <view v-if="info.canCash" class="flex py-2">
        <view class="text-3xl align-bottom" style="line-height: 3rem">￥</view>
        <view class="flex-grow align-bottom">
          <input
            v-model="submit.money"
            type="number"
            style="font-size: 2rem; line-height: 2rem; border-bottom: 1px solid #eee; height: 100%"
            placeholder-class="text-muted"
          />
        </view>
      </view>
      <view v-if="info.canCash" class="text-muted">
        当前钱包余额 {{ info.total }} 元，
        <text class="text-primary" @click="submit.money = info.total">全部提现</text>
      </view>
      <view v-if="info.canCash" class="pt-2">
        <view class="">
          <view class="mb-3">
            <view class="block text-left mb-1">打款方式</view>
            <view class="field">
              <c-constant-tag-selector v-model="submit.type" :types="info.types"></c-constant-tag-selector>
            </view>
          </view>
          <view class="mb-3">
            <view class="block text-left mb-1">支付宝账号</view>
            <view class="field">
              <input v-model="submit.alipayAccount" placeholder-class="text-muted" placeholder="输入收款支付宝账号" />
            </view>
          </view>
          <view class="mb-3">
            <view class="block text-left mb-1">支付宝姓名</view>
            <view class="field">
              <input v-model="submit.alipayRealname" placeholder-class="text-muted" placeholder="输入收款支付宝姓名" />
            </view>
          </view>
          <view class="mb-3">
            <view class="block text-left mb-1">到账金额</view>
            <view class="field">
              <view> ￥{{ value }} </view>
              <view class="help"> 手续费{{ info.rate }}% </view>
            </view>
          </view>
          <view class="mb-3">
            <view class="field">
              <view
                class="flex w-full items-center justify-center py-2.5 px-5 text-base rounded-full bg-primary text-white cursor-pointer"
                @click="doSubmit"
                >提交</view
              >
            </view>
          </view>
        </view>
      </view>
    </view>
    <view v-if="!!info.desc" class="bg-white rounded-xl mb-2 mt-5">
      <view class="px-3 pt-3 pb-2">
        <view class="inline-block leading-4"> 提现说明 </view>
      </view>
      <view class="px-3 pb-3">
        <!-- eslint-disable-next-line vue/no-v-text-v-html-on-component -->
        <view class="text-sm leading-relaxed" v-html="info.desc"></view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { Starter } from '@/brick/BrickUni'
import { useConfig, useUi } from '@/brick/composables/useBaseStore'
import { api } from '@/brick/lib/api'
import { dialog } from '@/brick/lib/dialog'
import { router } from '@/brick/lib/router'
import { onReady } from '@dcloudio/uni-app'
import { reactive, toRefs, watch } from 'vue'

defineOptions({ name: 'Money' })

const { config, SystemConfig } = useConfig()
const { ui, getPageDefaultTitle, autoSetNavigationBarColor } = useUi()

const state = reactive({
  loading: true,
  info: {
    total: '-',
    desc: '',
    rate: '',
    min: '',
    canCash: false,
    types: {},
  },
  value: '-',
  lastValue: null,
  submit: {
    type: null,
    money: '',
    alipayRealname: '',
    alipayAccount: '',
  },
})
const { loading, info, value, lastValue, submit } = toRefs(state)

watch(
  () => submit,
  (n, o) => {
    if (n.money && n.money !== state.lastValue) {
      state.lastValue = n.money
      api.post('member_money/cash/calc', { money: state.lastValue }).then((res) => {
        state.value = res.data.value
      })
    }
  }
)

async function init() {
  const res = await api.post('member_money/cash/get', {})
  state.loading = false
  state.info = res.data
  state.submit.type = res.data.defaultType
}

async function doSubmit() {
  dialog.loadingOn()
  try {
    await api.post('member_money/cash/submit', state.submit)
    dialog.loadingOff()
    dialog.tipSuccess('提现申请提交成功', () => {
      router.back()
    })
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

<style></style>
