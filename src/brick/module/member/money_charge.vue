<template>
  <view class="pb-money-charge">
    <c-page-header title="钱包充值" />

    <view class="charge-card">
      <view class="charge-card__head">
        <text class="charge-card__label">充值金额</text>
        <text class="charge-card__balance">当前余额 ￥{{ total }}</text>
      </view>

      <view class="charge-input">
        <text class="charge-input__unit">￥</text>
        <input v-model="data.money" type="digit" class="charge-input__field" placeholder="0.00" />
      </view>

      <view class="charge-quick">
        <view
          v-for="amount in quickAmounts"
          :key="amount"
          class="charge-quick__item"
          :class="{ 'is-active': String(amount) === String(data.money) }"
          @tap="data.money = String(amount)"
        >
          {{ amount }} 元
        </view>
      </view>
    </view>

    <view class="charge-actions">
      <button
        :loading="isSubmitting"
        :disabled="!canSubmit"
        class="charge-actions__submit"
        :class="{ 'is-disabled': !canSubmit }"
        @click="doSubmit()"
      >
        去支付
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { Starter } from '@/brick/BrickUni'
import { useUi } from '@/brick/composables/useBaseStore'
import { api } from '@/brick/lib/api'
import { dialog } from '@/brick/lib/dialog'
import { router } from '@/brick/lib/router'
import { AppSetting } from '@/config/setting'
import { onReady } from '@dcloudio/uni-app'
import { computed, reactive, toRefs } from 'vue'

defineOptions({ name: 'MoneyCharge' })

const { ui, getPageDefaultTitle, autoSetNavigationBarColor, SystemConfig } = useUi()

const quickAmounts = [50, 100, 200, 500]

const state = reactive({
  isSubmitting: false,
  total: '0.00',
  data: {
    money: '',
  },
})
const { isSubmitting, total, data } = toRefs(state)

const canSubmit = computed(() => Number(state.data.money) > 0)

async function init() {
  const res = await api.post('member_money/get', {})
  state.total = res.data.total
}

async function doSubmit() {
  if (!canSubmit.value) {
    dialog.tipError('请输入充值金额')
    return
  }
  dialog.loadingOn()
  try {
    const res = await api.post('member_money/charge/submit', {
      money: state.data.money,
      redirect: router.pathToUrl(AppSetting.route.member),
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

<style lang="less" scoped>
.pb-money-charge {
  min-height: 100vh;
  background-color: var(--token-body);
}

.charge-card {
  margin: 0.75rem;
  padding: 1.25rem;
  border-radius: 1.25rem;
  background: var(--token-surface);
  border: 1px solid var(--token-border);
  box-shadow: var(--shadow-card);

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__label {
    font-size: 0.875rem;
    color: var(--token-text);
  }

  &__balance {
    font-size: 0.75rem;
    color: var(--token-text-tertiary);
  }
}

.charge-input {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  margin-top: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--token-divider);

  &__unit {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--token-text);
  }

  &__field {
    flex: 1;
    min-width: 0;
    height: 40px;
    font-size: 2rem;
    font-weight: 700;
    line-height: 40px;
    color: var(--token-text);
    font-variant-numeric: tabular-nums;
  }
}

.charge-quick {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;

  &__item {
    flex: 1;
    min-width: 70px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.75rem;
    font-size: 0.875rem;
    color: var(--token-text);
    background: var(--token-chip-bg);
    border: 1px solid transparent;

    &.is-active {
      background: var(--token-chip-active-bg);
      border-color: transparent;
      font-weight: 700;
    }
  }
}

.charge-actions {
  margin: 1.25rem 0.75rem;

  &__submit {
    width: 100%;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    font-size: 1rem;
    font-weight: 600;
    color: var(--token-text-inverse);
    background: var(--token-primary);

    &.is-disabled {
      opacity: 0.35;
    }
  }
}
</style>
