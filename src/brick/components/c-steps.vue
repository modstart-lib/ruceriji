<template>
  <view class="c-steps">
    <view v-for="(s, i) in steps" :key="s.title" class="c-steps__item" :class="{ 'is-last': i === steps.length - 1 }">
      <view class="c-steps__line" :class="{ 'is-active': i < current }" />
      <view class="c-steps__dot" :class="{ 'is-active': i <= current }">{{ i + 1 }}</view>
      <view class="c-steps__title" :class="{ 'is-active': i <= current }">{{ s.title }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'CSteps' })

const props = defineProps({
  current: { type: Number, default: 0 },
  steps: { type: Array, default: () => [] },
})

const current = computed(() => props.current)
const steps = computed(() => props.steps as { title: string }[])
</script>

<style lang="less" scoped>
.c-steps {
  display: flex;
  align-items: flex-start;
  width: 100%;
}

.c-steps__item {
  position: relative;
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;

  &.is-last {
    flex-grow: 0;
    flex-basis: auto;
    padding-right: 0;
  }
}

/* 连接线：从当前圆点中心拉到下一个圆点中心 */
.c-steps__line {
  position: absolute;
  top: 11px;
  left: calc(50% + 14px);
  right: calc(-50% + 14px);
  height: 1px;
  background-color: var(--token-border);
}

.is-last .c-steps__line {
  display: none;
}

.c-steps__line.is-active {
  background-color: var(--token-primary);
}

.c-steps__dot {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: var(--token-text-tertiary);
  background-color: var(--token-surface);
  border: 1px solid var(--token-border);

  &.is-active {
    color: var(--token-text-inverse);
    background-color: var(--token-primary);
    border-color: var(--token-primary);
  }
}

.c-steps__title {
  margin-top: 6px;
  max-width: 100%;
  padding: 0 2px;
  font-size: 12px;
  line-height: 1.3;
  text-align: center;
  color: var(--token-text-tertiary);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  &.is-active {
    color: var(--token-text);
    font-weight: 500;
  }
}
</style>
