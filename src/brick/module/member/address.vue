<template>
  <view>
    <c-page-header title="我的地址" :shadow="false"></c-page-header>
    <view v-if="!loading && records.length === 0">
      <c-empty text="暂无地址" />
    </view>
    <view class="p-2">
      <view
        v-for="(address, addressIndex) in records"
        :key="addressIndex"
        class="bg-white rounded-2xl p-3 shadow-sm mb-5"
      >
        <view class="flex items-center">
          <view class="flex-grow">
            <view @click="doSelect(address)">
              <text class="text-lg text-primary mr-4 font-bold">{{ address.name }}</text>
              <text class="text-lg">{{ address.phone }}</text>
            </view>
            <view class="mt-1" @click="doSelect(address)">
              {{ address.area }}
            </view>
            <view @click="doSelect(address)">
              {{ address.detail }}
            </view>
            <view v-if="address.isDefault" class="text-primary" @click="doSelect(address)">
              <icon-lucide-check class="mr-1" />
              默认地址
            </view>
          </view>
          <view class="w-10 text-right">
            <view @click="doEdit(address)">
              <icon-lucide-pen-line style="font-size: 1rem" />
            </view>
          </view>
        </view>
      </view>
    </view>
    <view class="h-20"></view>
    <view class="h-20 p-4 fixed bottom-0 left-0 right-0">
      <view
        class="flex w-full items-center justify-center py-2.5 px-5 text-base rounded-full bg-primary text-white cursor-pointer"
        @click="doAdd"
      >
        <icon-lucide-plus />
        新建地址
      </view>
    </view>
    <u-loading-page :loading="loading" />
  </view>
</template>

<script setup lang="ts">
import { Starter } from '@/brick/BrickUni'
import { onReady } from '@dcloudio/uni-app'

import { useUi } from '@/brick/composables/useBaseStore'
import { useRouterCallback } from '@/brick/composables/useRouterCallback'
import { api } from '@/brick/lib/api'
import { router } from '@/brick/lib/router'
import { reactive, toRefs } from 'vue'

defineOptions({ name: 'MemberAddress' })

const { _e_, isInit, config, value, isCallbackPage, callbackCancel, callbackConfirm } = useRouterCallback()
const { ui, getPageDefaultTitle, autoSetNavigationBarColor, SystemConfig } = useUi()

const state = reactive({
  loading: true,
  records: [],
})
const { loading, records } = toRefs(state)

async function init() {
  const res = await api.post('member_address/all', {})
  state.records = res.data
  state.loading = false
}

function doEdit(address) {
  router.startForCallback('/brick/module/member/address_edit', address, {}, (res) => {
    init()
  })
}

function doAdd() {
  router.startForCallback('/brick/module/member/address_edit', null, {}, (res) => {
    init()
  })
}

function doSelect(address) {
  if (isCallbackPage.value) {
    callbackConfirm(address)
  } else {
    doEdit(address)
  }
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
