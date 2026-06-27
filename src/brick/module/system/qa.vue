<template>
  <view>
    <c-page-header title="帮助中心" />
    <c-loading v-if="loading" page />
    <view v-else>
      <view class="pb-head-nav flex text-lg text-center bg-primary text-white truncate">
        <view
          v-for="(c, cIndex) in categoryTree"
          :key="c.id"
          class="item"
          :class="{ active: c.id === categoryId }"
          @click="doLoad(c.id)"
        >
          {{ c.title }}
        </view>
      </view>
      <view
        v-for="(c, cIndex) in categoryTree"
        v-if="categoryId === c.id"
        :key="c.id"
        class="bg-white rounded-2xl p-3 shadow-sm -mt-1 min-h-screen"
      >
        <view v-for="(cc, ccIndex) in c._child" :key="cc.id" class="px-2 py-2">
          <view class="font-bold text-lg">
            {{ cc.title }}
          </view>
          <view
            v-for="(r, rIndex) in records"
            v-if="r.categoryId === cc.id"
            :key="r.id"
            class="py-2 border-0 border-b border-dashed border-gray-100"
          >
            <view class="flex" @click="doToggleRecord(rIndex)">
              <view class="flex-grow">
                {{ r.title }}
              </view>
              <view>
                <icon-lucide-chevron-up v-if="r._show" class="text-muted" />
                <icon-lucide-chevron-down v-else class="text-muted" />
              </view>
            </view>
            <view v-if="r._show" class="text-sm leading-relaxed text-tertiary py-2 px-1 rounded bg-gray-100">
              <c-rich-html :value="r.content" />
            </view>
          </view>
        </view>
        <view class="h-20"></view>
      </view>
      <view class="fixed bottom-5 left-5 right-5">
        <view class="bg-white rounded-2xl p-3 shadow-sm flex bg-gray-100 text-center items-center font-bold shadow-lg">
          <view class="flex-grow" @tap="router.to('/brick/module/system/contact')">
            <icon-lucide-headphones class="mr-1" />
            联系客服
          </view>
          <view class="flex-grow" @tap="router.to('/brick/module/system/feedback')">
            <icon-lucide-message-square class="mr-1" />
            意见反馈
          </view>
        </view>
      </view>
    </view>
  </view>
</template>
<script setup lang="ts">
import { Starter } from '@/brick/BrickUni'
import { useUi } from '@/brick/composables/useBaseStore'
import { api } from '@/brick/lib/api'
import { router } from '@/brick/lib/router'
import { onReady } from '@dcloudio/uni-app'
import { reactive, toRefs } from 'vue'

const { ui, getPageDefaultTitle, autoSetNavigationBarColor, SystemConfig } = useUi()

const state = reactive({
  loading: true,
  categoryId: 0,
  categoryTree: [],
  records: [],
})
const { loading, categoryId, categoryTree, records } = toRefs(state)

function init() {
  doLoad()
}

function doToggleRecord(index) {
  state.records[index]._show = !state.records[index]._show
}

async function doLoad(categoryId?) {
  state.categoryId = categoryId || state.categoryId || 0
  try {
    const res = await api.post('cms_qa/records', { categoryId: state.categoryId })
    state.categoryTree = res.data.categoryTree
    state.records = res.data.records.map((o) => {
      o._show = false
      return o
    })
    if (!state.categoryId && state.categoryTree.length) {
      state.categoryId = state.categoryTree[0].id
    }
    state.loading = false
  } catch {
    state.loading = false
  }
}

onReady(() => {
  Starter.boot(() => {
    init()
  })
})
</script>

<style lang="less">
.pb-head-nav {
  padding: 0.5rem 0.3rem;
  overflow-x: auto;

  .item {
    flex-grow: 1;
    padding: 0 0.5rem;

    &.active {
      position: relative;

      &:after {
        content: '';
        position: absolute;
        bottom: -0.5rem;
        left: 50%;
        display: block;
        width: 0;
        height: 0;
        border: 0.5rem solid #fff;
        border-left-color: transparent;
        border-right-color: transparent;
        border-top-color: transparent;
        margin-left: -0.5rem;
      }
    }
  }
}
</style>
