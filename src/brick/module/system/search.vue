<template>
  <view class="pb-module-system-search">
    <view class="search-header" :style="{ paddingTop: statusBarHeight }">
      <view class="search-row">
        <view class="search-box">
          <icon-lucide-search class="search-box__icon" :size="16" />
          <input
            type="text"
            class="search-box__input"
            :value="value"
            :placeholder="inputPlaceholder"
            confirm-type="search"
            placeholder-class="text-muted"
            @input="onInput"
            @confirm="doConfirmSearch"
          />
          <view v-if="!!value" class="search-box__clear" @tap="doClearSearch">
            <icon-lucide-x :size="16" />
          </view>
        </view>
        <view class="search-cancel" @tap="doCancel">取消</view>
      </view>
    </view>
    <view class="history-card">
      <view class="history-head">
        <view class="history-title">历史搜索</view>
        <view v-if="keywordsList.length > 0" class="history-actions">
          <view class="history-action" @tap="isDeleting = !isDeleting">
            <icon-lucide-settings :size="16" />
          </view>
          <view class="history-action" @tap="doClear">
            <icon-lucide-trash-2 :size="16" />
          </view>
        </view>
      </view>
      <view v-if="keywordsList.length > 0" class="history-tags">
        <view v-for="(k, kIndex) in keywordsList" :key="kIndex" class="history-tag" @tap="doSearch(k)">
          <text class="history-tag__text">{{ k ? k : '[空]' }}</text>
          <view v-if="isDeleting" class="history-tag__remove" @tap.stop="doDelete(kIndex)">
            <icon-lucide-x :size="12" />
          </view>
        </view>
      </view>
      <c-empty v-else small text="暂无搜索记录" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { onReady } from '@dcloudio/uni-app'

import { reactive, computed, nextTick, toRefs } from 'vue'
import { useRouterCallback } from '@/brick/composables/useRouterCallback'
import { useUi } from '@/brick/composables/useBaseStore'
import { dialog } from '@/brick/lib/dialog'
import { Storage } from '@/brick/lib/storage'

defineOptions({ name: 'Search' })

const { _e_, isInit, config, value, isCallbackPage, callbackCancel, callbackConfirm } = useRouterCallback()
const { ui, getPageDefaultTitle, autoSetNavigationBarColor, SystemConfig } = useUi()

const state = reactive({
  placeholder: '搜索关键词',
  keywordsList: [],
  isDeleting: false,
})
const { placeholder, keywordsList, isDeleting } = toRefs(state)

const inputPlaceholder = computed(() => {
  if (config.value && config.value.placeholder) {
    return config.value.placeholder
  }
  return state.placeholder
})

const statusBarHeight = computed(() => (SystemConfig.StatusHeight ?? 0) + 'px')

function init() {
  state.keywordsList = Storage.getArray('SearchKeywordHistory', [])
}

function doSaveKeywords() {
  Storage.set('SearchKeywordHistory', state.keywordsList)
}

function onInput(e) {
  value.value = e.detail.value
}

function doPutKeywords(value) {
  if (!value) {
    return
  }
  const index = state.keywordsList.indexOf(value)
  if (index >= 0) {
    state.keywordsList.splice(index, 1)
  }
  state.keywordsList.unshift(value)
  doSaveKeywords()
}

function doDelete(index) {
  state.keywordsList.splice(index, 1)
  doSaveKeywords()
}

function doConfirmSearch() {
  nextTick(() => {
    doConfirm()
  })
}

function doConfirm() {
  doPutKeywords(value.value ? value.value : '')
  callbackConfirm(value.value ? value.value : '')
}

function doCancel() {
  callbackCancel()
}

function doSearch(value) {
  if (state.isDeleting) {
    return
  }
  doPutKeywords(value)
  callbackConfirm(value)
}

function doClearSearch() {
  doSearch('')
}

function doClear() {
  dialog.confirm('确认清空搜索历史？', () => {
    state.keywordsList = []
    Storage.set('SearchKeywordHistory', state.keywordsList)
  })
}

onReady(() => {
  Starter.boot(() => {
    const _waitInit = () => {
      if (!isInit.value) {
        setTimeout(_waitInit, 10)
        return
      }
      init()
    }
    _waitInit()
  })
})
</script>

<style lang="less" scoped>
.pb-module-system-search {
  min-height: 100vh;
  background-color: var(--token-body);

  .search-header {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
    padding-bottom: 0.5rem;
    background-color: var(--token-surface);

    .search-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      height: 44px;
    }

    .search-box {
      display: flex;
      flex: 1;
      align-items: center;
      gap: 0.35rem;
      height: 36px;
      padding: 0 0.75rem;
      border-radius: 999px;
      background-color: var(--token-chip-bg);
      color: var(--token-text-secondary);

      &__icon {
        flex-shrink: 0;
      }

      &__input {
        flex: 1;
        min-width: 0;
        height: 100%;
        font-size: 0.875rem;
        color: var(--token-text);
      }

      &__clear {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0.06);
        color: var(--token-text-secondary);
      }
    }

    .search-cancel {
      flex-shrink: 0;
      padding: 0 0.25rem;
      font-size: 0.875rem;
      color: var(--token-text);

      &:active {
        opacity: 0.6;
      }
    }
  }

  .history-card {
    margin: 0.5rem 0.75rem;
    padding: 0.875rem 1rem 1rem;
    border-radius: 1rem;
    background-color: var(--token-surface);

    .history-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 24px;
    }

    .history-title {
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--token-text);
    }

    .history-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .history-action {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      color: var(--token-text-secondary);
    }

    .history-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 0.75rem;
    }

    .history-tag {
      position: relative;
      max-width: 100%;
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      background-color: var(--token-chip-bg);

      &__text {
        display: block;
        overflow: hidden;
        font-size: 0.8125rem;
        line-height: 1.25rem;
        color: var(--token-text);
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      &__remove {
        position: absolute;
        top: -4px;
        right: -4px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0.35);
        color: #ffffff;
      }
    }
  }
}
</style>
