<template>
  <view class="pb-list-status-top">
    <!--
        {{loading ? 'loading' : '~loading'}}
        {{records.length}}
        {{isInit ? 'isInit' : '~isInit'}}
        {{isNoMore ? 'isNoMore' : '~isNoMore'}}
		-->
    <view v-if="records.length > 0" class="loading" :class="{ show: loading }" role="status" aria-live="polite">
      <view v-if="loading" class="loading__inner">
        <icon-lucide-loader class="loading__icon animate-spin" :size="18" aria-hidden="true" />
        <text class="loading__text">加载中</text>
      </view>
      <view v-if="!loading" class="loading__inner loading__inner--done">
        <icon-lucide-circle-check-big class="loading__icon loading__icon--done" :size="18" aria-hidden="true" />
        <text class="loading__text loading__text--done">加载完成</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

defineOptions({ name: 'CListStatusTop' })

const props = defineProps({
  records: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const state = reactive({})
</script>

<style lang="less" scoped>
@import './../../config/theme';

.pb-list-status-top {
  text-align: center;

  .success,
  .loading {
    text-align: center;
    line-height: 80rpx;
    height: 0rpx;
    overflow: hidden;
    transition: height 0.2s linear 0.5s;

    &.show {
      height: 80rpx;
      transition: height 0s linear 0s;
    }

    .loading__inner {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 12rpx;
      font-size: 26rpx;
    }

    .loading__icon {
      flex-shrink: 0;
      color: var(--token-primary-500);
      opacity: 0.92;
    }

    .loading__icon--done {
      color: var(--token-success);
      opacity: 1;
    }

    .loading__text {
      color: var(--token-primary-400);
      letter-spacing: 0.02em;
    }

    .loading__text--done {
      color: var(--token-primary-500);
    }
  }

  .success {
    .iconfont {
      margin-right: 10rpx;
    }
  }
}
</style>
