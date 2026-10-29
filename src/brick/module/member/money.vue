<template>
  <view class="pb-module-member-money">
    <c-page-header title="钱包" :shadow="false"></c-page-header>

    <view class="money-card">
      <view class="money-card__label">
        <text>账户余额</text>
        <icon-lucide-eye class="money-card__eye" :size="16" @click="hide = !hide" />
      </view>
      <view class="money-card__amount">
        <text class="money-card__unit">￥</text>
        <text class="money-card__value">{{ hide ? '******' : total }}</text>
      </view>
    </view>

    <view v-if="config.Member_MoneyChargeEnable || config.Member_MoneyCashEnable" class="money-actions">
      <view
        v-if="config.Member_MoneyChargeEnable"
        class="money-actions__primary"
        @click="router.to('/brick/module/member/money_charge')"
      >
        充值
      </view>
      <view
        v-if="config.Member_MoneyCashEnable"
        class="money-actions__secondary"
        @click="router.to('/brick/module/member/money_cash')"
      >
        提现
      </view>
    </view>

    <view class="money-list">
      <view class="money-list__row" @tap="router.to('/brick/module/member/money_log')">
        <text class="money-list__text">资金明细</text>
        <icon-lucide-chevron-right :size="16" class="money-list__arrow" />
      </view>
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
  total: '0.00',
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

<style lang="less" scoped>
.pb-module-member-money {
  min-height: 100vh;
  background-color: var(--token-body);
}

.money-card {
  margin: 0.75rem;
  padding: 1.5rem 1.25rem 1.75rem;
  border-radius: 1.25rem;
  background: linear-gradient(160deg, #fffdf2 0%, #ffffff 55%);
  border: 1px solid var(--token-border);
  box-shadow: var(--shadow-card);

  &__label {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.8125rem;
    color: var(--token-text-secondary);
  }

  &__eye {
    color: var(--token-text-tertiary);
  }

  &__amount {
    display: flex;
    align-items: baseline;
    gap: 0.25rem;
    margin-top: 0.5rem;
    color: var(--token-text);
  }

  &__unit {
    font-size: 1.125rem;
    font-weight: 600;
  }

  &__value {
    font-size: 2.25rem;
    font-weight: 700;
    line-height: 1.1;
    font-variant-numeric: tabular-nums;
  }
}

.money-actions {
  display: flex;
  gap: 0.75rem;
  margin: 0 0.75rem;

  &__primary,
  &__secondary {
    flex: 1;
    height: 46px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    font-size: 0.9375rem;
    font-weight: 600;
  }

  &__primary {
    color: var(--token-text-inverse);
    background: var(--token-primary);
  }

  &__secondary {
    color: var(--token-text);
    background: var(--token-surface);
    border: 1px solid var(--token-border);
  }
}

.money-list {
  margin: 0.75rem;
  border-radius: 1rem;
  background: var(--token-surface);
  overflow: hidden;

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 52px;
    padding: 0 1rem;
  }

  &__text {
    font-size: 0.9375rem;
    color: var(--token-text);
  }

  &__arrow {
    color: var(--token-text-tertiary);
  }
}
</style>
