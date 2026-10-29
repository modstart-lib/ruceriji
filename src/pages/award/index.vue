<template>
  <view class="min-h-screen award-page bg-[var(--token-body)]">
    <c-page-header title="我的成就" background-color="transparent" color="#111111" />

    <c-loading v-if="loading" page />
    <view v-else>
      <!-- Tab 切换 -->
      <view class="award-tab flex rounded-full p-1" style="background: var(--token-chip-bg)">
        <view
          :class="tab === 'mine' ? 'is-active' : ''"
          class="flex-1 text-center py-2 rounded-full text-sm transition-all"
          @click="tab = 'mine'"
          >已获得</view
        >
        <view
          :class="tab === 'all' ? 'is-active' : ''"
          class="flex-1 text-center py-2 rounded-full text-sm transition-all"
          @click="tab = 'all'"
          >全部</view
        >
      </view>

      <!-- 空状态 -->
      <view v-if="!filteredTotal" class="award-empty">
        <view class="award-empty-icon">
          <icon-lucide-trophy :size="34" />
        </view>
        <view class="award-empty-title">{{ tab === 'mine' ? '还没有获得成就' : '暂无成就' }}</view>
        <view class="award-empty-desc">记录一次便便，开始解锁你的成就</view>
        <view class="award-empty-btn" @click="goStart">去记录</view>
      </view>

      <!-- 成就列表 -->
      <view v-else>
        <view v-for="c in categoriesFilter" :key="c.id" class="award-group">
          <view
            v-if="c.children.length"
            class="bg-white border border-[var(--token-border)] shadow-card rounded-3xl my-4 overflow-hidden"
          >
            <view
              v-for="(a, index) in c.children"
              :key="a.id"
              class="px-4 py-3.5 relative active:bg-black/[0.03] transition-colors"
              :class="{ 'border-b border-[var(--token-border)]': index !== c.children.length - 1 }"
              @click="detailDialogRef?.show(a)"
            >
              <view class="flex items-center">
                <view
                  class="award-badge w-12 h-12 mr-4 rounded-xl flex items-center justify-center bg-[var(--token-panel)] border border-[var(--token-border)]"
                  :class="{ 'is-locked': !a._getTime }"
                >
                  <c-cover :src="a.cover" background-color="transparent" />
                  <view v-if="!a._getTime" class="lock-badge">
                    <icon-lucide-lock :size="10" color="#ffffff" />
                  </view>
                </view>
                <view class="flex-grow min-w-0">
                  <view class="flex items-center gap-2 mb-1">
                    <view class="font-bold text-[#111111] text-[15px] truncate">{{ a.title }}</view>
                    <view v-if="a._getTime" class="status-chip is-earned">
                      <icon-lucide-circle-check :size="10" class="mr-0.5" />
                      已解锁
                    </view>
                    <view v-else class="status-chip is-locked">
                      <icon-lucide-lock :size="10" class="mr-0.5" />
                      未解锁
                    </view>
                  </view>
                  <view class="text-xs text-text-secondary truncate">{{ a.summary }}</view>
                </view>
                <icon-lucide-chevron-right :size="16" color="var(--token-text-disabled)" class="ml-2 shrink-0" />
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <AppAwardDetailDialog ref="detailDialogRef" />
  </view>
</template>

<script setup lang="ts">
import { useAppBiz, useAppConfig, useAppUser } from '@/brick/composables/useAppStore'
import { useShare } from '@/brick/composables/useShare'
import { api } from '@/brick/lib/api'
import { onReady } from '@dcloudio/uni-app'
import { computed, reactive, ref, toRefs } from 'vue'
import AppAwardDetailDialog from './components/AppAwardDetailDialog.vue'

defineOptions({ name: 'AwardIndex' })
const detailDialogRef = ref(null)

const { user, userInit, isLogin, waitUserReady, requireUserLogin, requireUserLoginRouteTo } = useAppUser()
const { config } = useAppConfig()
const { shareConfig, setShareConfig, getShareAppMessage, getShareTimeline } = useShare()
const { biz } = useAppBiz()

const state = reactive({
  loading: true,
  tab: 'mine',
  categories: [],
})
const { loading, tab, categories } = toRefs(state)

const categoriesFilter = computed(() => {
  return state.categories.map((c) => ({
    ...c,
    children: (c.children || []).filter((a) => state.tab === 'all' || a._getTime),
  }))
})

const filteredTotal = computed(() =>
  categoriesFilter.value.reduce((sum, category) => sum + category.children.length, 0)
)

async function doLoad() {
  try {
    const res = await api.post('app_award/all', {})
    state.loading = false
    state.categories = res.data.categories || []
    const hasEarned = state.categories.some((category) => (category.children || []).some((item) => item._getTime))
    if (!hasEarned) state.tab = 'all'
  } catch {
    state.loading = false
  }
}

function goStart() {
  uni.switchTab({ url: '/pages/wc' })
}

onReady(() => {
  doLoad()
})
</script>

<style lang="scss" scoped>
.award-page {
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
}

.award-tab {
  .is-active {
    background: #ffffff;
    color: var(--token-text);
    font-weight: 600;
    box-shadow: var(--shadow-chip);
  }

  box-sizing: border-box;
  width: calc(100% - 24px);
  max-width: 420px;
  margin-left: auto;
  margin-right: auto;
}

.award-group {
  box-sizing: border-box;
  width: calc(100% - 24px);
  max-width: 640px;
  margin-left: auto;
  margin-right: auto;
}

.award-empty {
  box-sizing: border-box;
  width: calc(100% - 24px);
  max-width: 640px;
  margin: 40px auto 0;
  padding: 40px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.03);
  border-radius: 24px;
  box-shadow: var(--shadow-card);
}

.award-badge {
  position: relative;
  overflow: hidden;

  /* 未解锁：降低饱和度 + 锁标 + 文字标签，不只靠灰度传达 */
  &.is-locked {
    opacity: 0.55;
    filter: grayscale(1);
  }
}

.lock-badge {
  position: absolute;
  right: 2px;
  bottom: 2px;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: rgba(17, 17, 17, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-chip {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 500;
  line-height: 1.6;

  &.is-earned {
    color: var(--token-success-text);
    background: var(--token-success-bg);
  }

  &.is-locked {
    color: var(--token-text-secondary);
    background: var(--token-chip-bg);
    border: 1px solid var(--token-primary-200);
  }
}

.award-empty-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #111111;
  background: #f7f8fa;
}

.award-empty-title {
  margin-top: 20px;
  font-size: 16px;
  font-weight: 700;
  color: #111111;
}

.award-empty-desc {
  margin-top: 8px;
  font-size: 12px;
  color: var(--token-text-secondary);
  text-align: center;
}

.award-empty-btn {
  margin-top: 20px;
  height: 40px;
  padding: 0 24px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  background: #111111;
}
</style>
