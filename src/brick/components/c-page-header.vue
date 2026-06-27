<template>
  <view class="ub-header-mobile" :class="shadow ? '' : 'no-shadow'">
    <view
      class="header-status"
      :style="{ backgroundColor: effectiveBackgroundColor, height: headerStatusHeight }"
    ></view>
    <view
      class="header-container"
      :style="{ backgroundColor: effectiveBackgroundColor, height: headerContainerHeight, top: headerStatusHeight }"
    >
      <view class="body" :style="{ paddingRight: headerBodyPaddingRight }">
        <view v-if="hasBack && pageCanBack" class="back" :style="{ color: color }" @click="doBack">
          <icon-lucide-chevron-left :size="26" />
        </view>
        <view
          class="title"
          :style="{
            color: color,
            paddingLeft: headerTitlePaddingLeft,
            paddingRight: headerTitlePaddingRight,
            textAlign: headerTitleTextAlign,
            justifyContent: headerTitleTextAlign === 'center' ? 'center' : 'flex-start',
          }"
        >
          <slot name="title">
            {{ title }}
          </slot>
        </view>
        <view v-if="hasAction" class="action" :style="{ color: color }">
          <slot name="action"></slot>
        </view>
      </view>
    </view>
    <view class="header-container-placeholder" :style="{ height: headerHeight }"></view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePageHeader } from '@/brick/composables/usePageHeader'

defineOptions({ name: 'CPageHeader' })

const props = defineProps({
  title: { type: [String, null], default: '' },
  pageTitle: { type: [String, null], default: '' },
  backgroundColor: { type: String, default: 'var(--color-content-bg)' },
  color: { type: String, default: 'var(--color-text)' },
  hasTitle: { type: Boolean, default: true },
  hasBack: { type: Boolean, default: true },
  shadow: { type: Boolean, default: true },
  hasAction: { type: Boolean, default: false },
  customBackCallback: { type: Boolean, default: false },
  titleAlign: { type: String, default: 'center' },
  height: { type: [Number, String], default: 0 },
})

const emit = defineEmits(['back'])

const {
  pageCanBack,
  headerStatusHeight,
  headerContainerHeight,
  headerHeight,
  headerBodyPaddingRight,
  headerTitlePaddingLeft,
  headerTitlePaddingRight,
  headerTitleTextAlign,
  doBack,
} = usePageHeader({ ...props, cName: 'c-page-header' })

const effectiveBackgroundColor = computed(() => {
  if (!props.backgroundColor || props.backgroundColor === 'transparent') {
    return 'var(--color-content-bg)'
  }
  return props.backgroundColor
})
</script>

<style lang="less">
.ub-header-mobile {
  .header-status {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 999;
  }
  .header-container {
    position: fixed;
    left: 0;
    right: 0;
    z-index: 999;
    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.08);
    display: flex;
    align-items: center;
    .body {
      display: flex;
      align-items: center;
      flex: 1;
      height: 100%;
      .back {
        flex-shrink: 0;
        width: 50px;
        padding-left: 4px;
        display: flex;
        align-items: center;
      }
      .title {
        flex: 1;
        overflow: hidden;
        font-size: 16px;
        font-weight: 600;
        display: flex;
        align-items: center;
      }
      .action {
        flex-shrink: 0;
        display: flex;
        align-items: center;
      }
    }
  }
  &.no-shadow .header-container {
    box-shadow: none;
  }
}
</style>
