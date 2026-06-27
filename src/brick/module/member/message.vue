<template>
  <view>
    <c-page-header title="消息通知" has-action>
      <template #action>
        <block>
          <view v-if="list?.records?.length" @click="doClear">
            <icon-lucide-trash-2
              class="item text-gray-200"
              :class="{ 'text-danger': list?.records?.length > 0 }"
              style="font-size: 1rem"
            />
          </view>
          <view v-else class="item"></view>
        </block>
      </template>
    </c-page-header>
    <view class="overflow-hidden bg-transparent">
      <view v-for="(item, itemIndex) in list?.records" :key="item.id" class="item-message">
        <view class="content">
          <rich-text class="text-sm leading-relaxed" :nodes="item.content || ''" />
        </view>
        <view class="time">
          <icon-lucide-clock />
          {{ item.createTime }}
        </view>
        <view v-if="item.status === MemberMessageStatus.UNREAD.value" class="dot"></view>
      </view>
      <c-list-status
        ref="listStatusRef"
        :loading="listLoading"
        :records="list?.records"
        empty-text="还没有任何消息"
        empty-hint="重要通知与系统消息会出现在这里"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { useBrickBaseStore, useUi } from '@/brick/composables/useBaseStore'
import { useLister } from '@/brick/composables/useLister'
import { api } from '@/brick/lib/api'
import { dialog } from '@/brick/lib/dialog'
import { MemberMessageStatus } from '@/config/constant'
import { nextTick, onMounted, onUnmounted, reactive, watch } from 'vue'

defineOptions({ name: 'Message' })

const {
  listLoading,
  order,
  list,
  selectIds,
  filter,
  search,
  listStatusRef,
  doSearch,
  doNextPage,
  onSortChange,
  doListProcess,
  onTableSelectChange,
} = useLister()
const { ui, getPageDefaultTitle, autoSetNavigationBarColor, SystemConfig } = useUi()
const brickBase = useBrickBaseStore()

const state = reactive({
  search: {
    status: 0,
  },
})

/** 与 ListerMixin.init 一致：先标记列表已初始化（空态才显示），再拉取数据 */
function reloadList() {
  nextTick(() => {
    listStatusRef.value?.init()
    doList(1)
  })
}

function doList(page) {
  doListProcess('member_message', page, {}, (res) => {
    doMarkRead(res.data.records.filter((o) => o.status === MemberMessageStatus.UNREAD.value).map((o) => o.id))
  })
}

function doMarkRead(ids) {
  if (ids.length > 0) {
    api.post('member_message/read', { _id: ids.join(',') })
  }
}

function doClear() {
  dialog.confirm('确认清空？', async () => {
    await api.post('member_message/delete_all', {})
    reloadList()
  })
}

onMounted(() => {
  let fallbackTimer: ReturnType<typeof setTimeout> | undefined
  // immediate 会在 watch() 返回前同步跑回调，不能在此刻调用 stop（const 尚未赋值），用 nextTick 延后
  const stopWatch = watch(
    () => brickBase.init,
    (ready) => {
      if (!ready) return
      if (fallbackTimer !== undefined) clearTimeout(fallbackTimer)
      nextTick(() => stopWatch())
      reloadList()
    },
    { immediate: true }
  )
  fallbackTimer = setTimeout(() => {
    if (brickBase.init) return
    stopWatch()
    reloadList()
  }, 2000)
  onUnmounted(() => {
    clearTimeout(fallbackTimer)
    stopWatch()
  })
})
</script>

<style lang="less" scoped>
.item-message {
  background: #fff;
  border-radius: 0.1rem;
  margin: 0.5rem;
  padding: 0.25rem 0.5rem;
  position: relative;

  .dot {
    width: 0.5rem;
    height: 0.5rem;
    background: red;
    border-radius: 50%;
    position: absolute;
    top: 0.25rem;
    right: 0.25rem;
  }

  .time {
    color: var(--color-muted);
    line-height: 1rem;
    font-size: 0.5rem;

    .iconfont {
      margin-right: 0.25rem;
    }
  }

  .content {
    font-size: 0.6rem;
  }
}
</style>
