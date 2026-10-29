<template>
  <view>
    <view class="selector-head">
      <view class="selector-title">{{ title }}</view>
      <view v-if="tooltip" class="selector-tooltip">{{ tooltip }}</view>
    </view>
    <view class="selector">
      <view class="selector-scroll-container flex overflow-x-auto">
        <view
          v-for="o in options"
          :key="o.value"
          class="selector-item"
          :class="{ active: modelValue === o.value, 'has-image': !!o.image, 'has-text': !o.image }"
          :aria-pressed="modelValue === o.value"
          @click="doSelect(o.value)"
        >
          <view v-if="o.image" class="item-image">
            <c-image-static :src="o.image" />
          </view>
          <view v-else class="item-text">{{ o.label }}</view>
          <!-- 图片选项没有文字时，用户无法判断图标的含义，补一行短标签 -->
          <view v-if="o.image && o.label" class="item-caption">{{ o.label }}</view>
          <!-- 选中态不只靠底色：描边 + 勾选，色弱与灰度打印也能分辨 -->
          <view v-if="modelValue === o.value" class="item-check">
            <icon-lucide-check :size="10" color="#ffffff" />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'WcValueSelector' })

const props = defineProps({
  title: { type: String, default: '' },
  options: { type: Array, default: () => [] },
  modelValue: { type: [Number, String], default: '' },
})

const emit = defineEmits(['update:modelValue'])

const tooltip = computed(() => {
  const opt = props.options.find((o) => o.value === props.modelValue)
  return opt && opt.tooltip ? opt.tooltip : null
})

function doSelect(value) {
  emit('update:modelValue', value)
}
</script>

<style lang="scss" scoped>
.selector-head {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 10px;
  min-width: 0;
}

.selector-title {
  flex-shrink: 0;
  font-size: 17px;
  font-weight: 700;
  color: var(--token-text);
  line-height: 1.3;
}

.selector-tooltip {
  min-width: 0;
  font-size: 13px;
  line-height: 1.4;
  color: var(--token-text-secondary);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.selector {
  background-color: var(--token-chip-bg);
  border: 1px solid var(--token-chip-border);
  border-radius: 14px;
  padding: 3px;

  .selector-scroll-container {
    &::-webkit-scrollbar {
      display: none;
    }
  }
}

.selector-item {
  position: relative;
  box-sizing: border-box;
  flex-grow: 1;
  text-align: center;
  height: 44px;
  border-radius: 11px;
  flex-shrink: 0;
  min-width: 48px;
  padding: 0 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition:
    background-color 0.15s ease,
    box-shadow 0.15s ease;

  &.has-image {
    height: 58px;
    min-width: 56px;
  }

  .item-image {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    margin: 0 auto 1px;
    /* 白色色块在白色选中底上看不见，用跟随 alpha 的描边保证轮廓 */
    filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.3));
  }

  .item-caption {
    width: 100%;
    margin-top: 1px;
    font-size: 10px;
    line-height: 1.2;
    color: var(--token-text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-text {
    font-size: 13px;
    font-weight: 500;
    line-height: 1.2;
    color: var(--token-text-secondary);
    white-space: nowrap;
  }

  /* 选中：白底 + 2px 黑描边 + 右上角勾选 */
  &.active {
    background-color: var(--token-chip-active-bg);
    box-shadow:
      inset 0 0 0 2px var(--token-chip-active-border),
      var(--shadow-chip);

    .item-text {
      color: var(--token-text);
      font-weight: 600;
    }

    .item-caption {
      color: var(--token-text);
      font-weight: 600;
    }
  }

  .item-check {
    position: absolute;
    top: 3px;
    right: 3px;
    width: 14px;
    height: 14px;
    border-radius: 999px;
    background: var(--token-primary);
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
