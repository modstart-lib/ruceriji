<template>
  <view class="c-page-header-trans" :style="float ? {} : { position: 'relative', width: '100%' }">
    <view class="c-page-header__status" :style="{ height: headerStatusHeight }"></view>
    <view class="c-page-header__inner" :style="{ color: color }">
      <view class="c-page-header__left" @click="doBack">
        <icon-lucide-chevron-left v-if="hasBack && pageCanBack" />
      </view>
      <view v-if="hasTitle" class="c-page-header__title">
        <slot name="title">{{ title }}</slot>
      </view>
      <view class="c-page-header__right">
        <slot v-if="hasAction" name="action"></slot>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { usePageHeader } from '@/brick/composables/usePageHeader'

defineOptions({ name: 'CPageHeaderTrans' })

const props = defineProps({
  title: { type: [String, null], default: '' },
  pageTitle: { type: [String, null], default: '' },
  color: { type: String, default: 'var(--color-text)' },
  hasTitle: { type: Boolean, default: true },
  hasBack: { type: Boolean, default: true },
  shadow: { type: Boolean, default: true },
  hasAction: { type: Boolean, default: false },
  customBackCallback: { type: Boolean, default: false },
  titleAlign: { type: String, default: 'center' },
  height: { type: [Number, String], default: 0 },
  absolute: { type: Boolean, default: false },
  float: { type: Boolean, default: true },
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
} = usePageHeader({ ...props, cName: 'c-page-header-trans' })
</script>

<style lang="scss" scoped>
.c-page-header-trans {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;

  .c-page-header__status {
    width: 100%;
  }

  .c-page-header__inner {
    display: flex;
    align-items: center;
    height: 44px;
    padding: 0 15px;
  }

  .c-page-header__left {
    width: 40px;
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  .c-page-header__title {
    flex: 1;
    text-align: center;
    font-size: 16px;
    font-weight: 600;
  }

  .c-page-header__right {
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
}
</style>
