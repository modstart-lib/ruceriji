<template>
  <view class="pb-module-system-search" style="min-height: 100vh">
    <c-page-header-holder title="搜索" />
    <view class="ub-search-mobile-bar page" :style="headStyle">
      <view class="left">
        <view class="item" @click="doCancel">
          <icon-lucide-chevron-left class="icon" />
        </view>
      </view>
      <view class="center">
        <view class="box">
          <icon-lucide-search class="icon" />
          <input
            type="text"
            class="input"
            :value="value"
            :placeholder="inputPlaceholder"
            confirm-type="search"
            placeholder-class="text-muted"
            @input="onInput"
            @confirm="doConfirmSearch"
          />
        </view>
      </view>
      <view v-if="!!value" class="right" @tap="doConfirm">
        <view class="item text-primary"> 确定 </view>
      </view>
      <view v-if="!value" class="right" @tap="doCancel">
        <view class="item"> 取消 </view>
      </view>
      <view v-if="!!value" class="right" @tap="doClearSearch">
        <view class="item"> 清除 </view>
      </view>
    </view>
    <view>
      <view class="bg-white rounded-xl mb-2">
        <view class="head">
          <view class="more">
            <view
              v-if="keywordsList.length > 0"
              class="text-tertiary w-10 h-8 text-right inline-block"
              @click="isDeleting = !isDeleting"
            >
              <icon-lucide-settings />
            </view>
            <view
              v-if="keywordsList.length > 0"
              class="text-tertiary w-10 h-8 text-right inline-block"
              @click="doClear"
            >
              <icon-lucide-trash-2 />
            </view>
          </view>
          <view class="flex-1 ml-2 text-sm text-gray-700"> 历史搜索 </view>
        </view>
        <view v-if="keywordsList.length > 0" class="body">
          <view
            v-for="(k, kIndex) in keywordsList"
            :key="kIndex"
            class="search-item bg-gray-100 inline-block px-3 rounded-2xl text-gray-800 mr-2 mb-1 max-w-full relative"
            @tap="doSearch(k)"
          >
            <view class="truncate leading-8">
              {{ k ? k : '[空]' }}
            </view>
            <view
              v-if="isDeleting"
              class="w-4 h-4 leading-4 text-white bg-gray-300 rounded text-center rounded-full absolute -right-1 -top-1"
              @tap="doDelete(kIndex)"
            >
              <icon-lucide-x />
            </view>
          </view>
        </view>
        <view v-else class="body">
          <c-empty text="暂无搜索记录" />
        </view>
      </view>
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

const headStyle = computed(() => {
  return ['padding-right: ' + SystemConfig.HeadMenuWidth + 'px'].join(';')
})

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
// #ifdef MP-WEIXIN
.ub-search-mobile-bar {
  .center .box .input {
    top: 0;
  }
}

// #endif
.pb-module-system-search {
  background-color: var(--color-body-bg);

  :deep(.bg-white.rounded-xl.mb-2) {
    background-color: var(--color-body-bg);

    .search-item {
      background: var(--color-content-bg);
      color: var(--color-text);
    }
  }
}
</style>
