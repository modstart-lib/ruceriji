<template>
  <view class="pb-module-member-credit">
    <c-page-header title="我的积分" :shadow="false"></c-page-header>

    <view class="credit-card">
      <view class="credit-card__label">当前积分</view>
      <view class="credit-card__amount">{{ total }}</view>
    </view>

    <view v-if="hasModule('MemberCreditCharge')" class="credit-actions">
      <view class="credit-actions__primary" @click="router.to('/brick/module/member_credit_charge/index')">
        积分充值
      </view>
    </view>

    <view class="credit-list">
      <view class="credit-list__row" @tap="router.to('/brick/module/member/credit_log')">
        <text class="credit-list__text">积分明细</text>
        <icon-lucide-chevron-right :size="16" class="credit-list__arrow" />
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

defineOptions({ name: 'Credit' })

const { config, SystemConfig, hasModule } = useConfig()
const { ui, getPageDefaultTitle, autoSetNavigationBarColor } = useUi()

const state = reactive({
  total: '0',
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

<style lang="less" scoped>
.pb-module-member-credit {
  min-height: 100vh;
  background-color: var(--token-body);
}

.credit-card {
  margin: 0.75rem;
  padding: 1.5rem 1.25rem 1.75rem;
  border-radius: 1.25rem;
  background: linear-gradient(160deg, #fffdf2 0%, #ffffff 55%);
  border: 1px solid var(--token-border);
  box-shadow: var(--shadow-card);

  &__label {
    font-size: 0.8125rem;
    color: var(--token-text-secondary);
  }

  &__amount {
    margin-top: 0.5rem;
    font-size: 2.25rem;
    font-weight: 700;
    line-height: 1.1;
    color: var(--token-text);
    font-variant-numeric: tabular-nums;
  }
}

.credit-actions {
  display: flex;
  margin: 0 0.75rem;

  &__primary {
    flex: 1;
    height: 46px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    font-size: 0.9375rem;
    font-weight: 600;
    color: var(--token-text-inverse);
    background: var(--token-primary);
  }
}

.credit-list {
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
