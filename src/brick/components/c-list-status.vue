<template>
  <view class="pb-list-status">
    <view v-if="false">
      loading:{{ loading ? 'true' : 'false' }}, records.length:{{ records.length }}, isInit:{{
        isInit ? 'true' : 'false'
      }}, isNoMore:{{ isNoMore ? 'true' : 'false' }}
    </view>
    <view v-if="!simple && !loading && isInit && records.length === 0" class="empty">
      <view class="empty__inner">
        <view class="empty__img-wrap">
          <image class="empty__img" mode="aspectFit" :src="emptyImage" />
        </view>
        <view class="empty__title">{{ emptyText }}</view>
        <view v-if="emptyHint" class="empty__hint">{{ emptyHint }}</view>
      </view>
    </view>
    <view v-if="loading && page !== 1" class="loading" role="status" aria-live="polite">
      <icon-lucide-loader class="loading__icon animate-spin" :size="18" aria-hidden="true" />
      <text class="loading__text">加载中</text>
    </view>
    <view v-if="!loading && isNoMore && records.length > 0" class="no-more">
      <text v-if="total < 0">没有更多了</text>
      <text v-if="total >= 0">总共{{ total }}条记录</text>
    </view>
    <view
      v-if="!simple && !loading && !isNoMore && isInit && records.length > 0"
      class="pull-to-load"
      @tap.stop="doLoadMore"
    >
      <text class="pull-to-load__text">上拉加载更多</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, toRefs } from 'vue'

defineOptions({ name: 'CListStatus' })

const props = defineProps({
  records: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  total: {
    type: Number,
    default: -1,
  },
  page: {
    type: Number,
    default: -1,
  },
  simple: {
    type: Boolean,
    default: false,
  },
  emptyText: {
    type: String,
    default: '暂无记录',
  },
  /** 主标题下的说明文案，可选 */
  emptyHint: {
    type: String,
    default: '',
  },
  /** 空状态插图，默认使用全局「无记录」插画 */
  emptyImage: {
    type: String,
    default: '/static/image/no-record.svg',
  },
})

const emit = defineEmits(['on-load-more'])

const state = reactive({
  isInit: false,
  isNoMore: false,
})
const { isInit, isNoMore } = toRefs(state)

function reset() {
  state.isInit = false
  state.isNoMore = false
}

function noMore() {
  state.isNoMore = true
}

function init() {
  state.isInit = true
  state.isNoMore = false
}

function shouldNext() {
  return !(state.isNoMore || props.loading)
}

function doLoadMore() {
  emit('on-load-more')
}

defineExpose({
  init,
  reset,
  noMore,
  shouldNext,
})
</script>

<style lang="less" scoped>
@import './../../config/theme';

.pb-list-status {
  text-align: center;
  min-height: 3rem;
  background-color: transparent;

  .pull-to-load,
  .no-more,
  .loading {
    text-align: center;
    color: var(--token-primary-400);
    padding: 1rem 0;
    min-height: 1rem;
    line-height: 1rem;
  }

  .no-more {
    font-size: 0.72rem;
    letter-spacing: 0.02em;

    .iconfont {
      margin-right: 0.5rem;
    }
  }

  .pull-to-load {
    padding: 1.25rem 1rem 1.5rem;

    .pull-to-load__text {
      display: inline-block;
      padding: 0.35rem 0.9rem;
      font-size: 0.72rem;
      color: var(--token-primary-500);
      background: var(--token-panel);
      border-radius: 999px;
      border: 1px solid var(--token-glass-border);
    }
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    font-size: 0.72rem;
    letter-spacing: 0.02em;

    .loading__icon {
      flex-shrink: 0;
      color: var(--token-primary-500);
      opacity: 0.9;
    }

    .loading__text {
      color: var(--token-primary-400);
    }
  }

  .empty {
    padding: 2.5rem 1.25rem 3rem;
    text-align: center;

    .empty__inner {
      max-width: 17.5rem;
      margin: 0 auto;
      padding: 0 0.25rem;
    }

    .empty__img-wrap {
      position: relative;
      width: 5rem;
      height: 5rem;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: var(--token-primary-100);
    }

    .empty__img {
      width: 3.75rem;
      height: 3.75rem;
    }

    .empty__title {
      margin-top: 1rem;
      padding: 0 0.25rem;
      font-size: 0.88rem;
      font-weight: 500;
      line-height: 1.45;
      color: var(--token-text);
      letter-spacing: 0.02em;
    }

    .empty__hint {
      margin-top: 0.4rem;
      padding: 0 0.35rem;
      font-size: 0.72rem;
      line-height: 1.55;
      color: var(--token-primary-400);
    }
  }
}
</style>
