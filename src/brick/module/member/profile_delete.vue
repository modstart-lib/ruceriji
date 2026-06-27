<template>
  <view>
    <c-page-header title="注销账号" />

    <view class="p-4 bg-white min-h-screen">
      <view class="rounded-xl overflow-hidden mb-2 bg-white shadow">
        <view
          class="px-4 py-3.5 flex items-center border-b border-gray-50 border-0 border-solid active:bg-gray-50 transition-colors"
        >
          <view class="flex-shrink-0 text-gray-500 flex items-center">
            <icon-lucide-smile :size="18" />
          </view>
          <view class="flex-1 ml-2 text-sm text-gray-700"> 账号 </view>
          <view class="flex-shrink-0 text-gray-500 text-[14px]">
            {{ user.username }}
          </view>
        </view>
        <view
          class="px-4 py-3.5 flex items-center border-b border-gray-50 border-0 border-solid active:bg-gray-50 transition-colors"
        >
          <view class="flex-shrink-0 text-gray-500 flex items-center">
            <icon-lucide-smile :size="18" />
          </view>
          <view class="flex-1 ml-2 text-sm text-gray-700"> 昵称 </view>
          <view class="flex-shrink-0 text-gray-500 text-[14px]">
            {{ user.nickname }}
          </view>
        </view>
        <view
          class="px-4 py-3.5 flex items-center border-b border-gray-50 border-0 border-solid active:bg-gray-50 transition-colors"
        >
          <view class="flex-shrink-0 text-gray-500 flex items-center">
            <icon-lucide-check :size="18" />
          </view>
          <view class="flex-1 ml-2 text-sm text-gray-700"> 注册时间 </view>
          <view class="flex-shrink-0 text-gray-500 text-[14px]">
            {{ registerTime }}
          </view>
        </view>
      </view>
      <view v-if="!deleteAtTime">
        <view>
          <view class="mb-2 p-2 rounded text-danger bg-[#fff5f5]">
            注销账号申请后30天内账号将会删除，删除后账号所有相关数据也会被删除
          </view>
        </view>
        <view class="py-3">
          <c-checkbox v-model="agree"> 我已知晓注销账号后数据将被删除 </c-checkbox>
        </view>
        <view>
          <button
            class="flex items-center justify-center py-2.5 px-5 text-base rounded-full cursor-pointer btn-danger"
            @click="doSubmit"
          >
            申请注销账号
          </button>
        </view>
      </view>
      <view v-else>
        <view class="text-center text-red-400 py-3"> 您的账号将于 {{ deleteAtTime }} 删除，期间您还可以继续使用 </view>
        <view>
          <button
            class="flex w-full items-center justify-center py-2.5 px-5 text-base rounded-full bg-primary text-white cursor-pointer"
            @click="doSubmitRevert"
          >
            撤销注销账号申请
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { Starter } from '@/brick/BrickUni'
import { useUi } from '@/brick/composables/useBaseStore'
import { useUser } from '@/brick/composables/useUser'
import { api } from '@/brick/lib/api'
import { dialog } from '@/brick/lib/dialog'
import { onShow } from '@dcloudio/uni-app'
import { reactive, toRefs } from 'vue'

const { ui, getPageDefaultTitle, autoSetNavigationBarColor, SystemConfig } = useUi()
const { user, userInit, requireUserLogin, requireUserLoginRouteTo } = useUser()

const state = reactive({
  loading: true,
  deleteAtTime: null,
  registerTime: null,
  agree: false,
})
const { loading, deleteAtTime, registerTime, agree } = toRefs(state)

async function doLoad() {
  state.loading = true
  try {
    const res = await api.post('member_profile/delete_info', {})
    state.loading = false
    state.deleteAtTime = res.data.deleteAtTime
    state.registerTime = res.data.registerTime
  } catch {
    state.loading = false
  }
}

function doSubmit() {
  if (!state.agree) {
    dialog.tipError('请先同意注销账号协议')
    return
  }
  dialog.confirm('确定要申请注销账号吗？', async () => {
    dialog.loadingOn()
    try {
      await api.post('member_profile/delete', { agree: 'yes' })
      dialog.loadingOff()
      doLoad()
    } catch {
      dialog.loadingOff()
    }
  })
}

async function doSubmitRevert() {
  dialog.loadingOn()
  try {
    await api.post('member_profile/delete_revert', {})
    dialog.loadingOff()
    doLoad()
  } catch {
    dialog.loadingOff()
  }
}

onShow(() => {
  Starter.boot(() => {
    doLoad()
  })
})
</script>
