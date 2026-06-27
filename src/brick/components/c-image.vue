<template>
  <view>
    <view class="pb-image" :class="classList" :style="styleList" @click="doClick">
      <!-- #ifdef MP-WEIXIN -->
      <image class="image" lazy-load="true" fade-show mode="widthFix" :src="src" />
      <!-- #endif -->
      <!-- #ifdef H5 -->
      <img class="image" loading="lazy" :src="src" />
      <!-- #endif -->
      <!-- #ifdef APP-PLUS -->
      <image class="image" mode="widthFix" :src="src" />
      <!-- #endif -->
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'CImage' })

const props = defineProps({
  src: {
    type: String,
    default: '',
  },
  ratio: {
    type: String,
    default: '1-1',
  },
  borderRadius: {
    type: String,
    default: '0',
  },
  preview: {
    type: Boolean,
    default: false,
  },
  contain: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['on-preview'])

const classList = computed(() => {
  return ['ratio-' + props.ratio]
})

const styleList = computed(() => {
  const styles: Record<string, string> = {}
  if (props.borderRadius) {
    styles.borderRadius = props.borderRadius
  }
  return styles
})

function doClick() {
  if (props.preview) {
    uni.previewImage({ urls: [props.src] })
    emit('on-preview', props.src)
  }
}
</script>

<style lang="less" scoped>
.pb-image {
  overflow: hidden;
  position: relative;

  .image-holder {
    background-color: #f8f8f8;
  }

  &:after,
  .image-holder {
    content: '';
    display: block;
    margin-top: 100%;
    height: 0px;
  }

  .image {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }

  &.ratio-1-1 {
    &:after,
    .image-holder {
      margin-top: 100%;
    }
  }

  &.ratio-2-1 {
    &:after,
    .image-holder {
      margin-top: 50%;
    }
  }

  &.ratio-2-3 {
    &:after,
    .image-holder {
      margin-top: 150%;
    }
  }

  &.ratio-3-1 {
    &:after,
    .image-holder {
      margin-top: 33.3333%;
    }
  }

  &.ratio-3-2 {
    &:after,
    .image-holder {
      margin-top: 66.6667%;
    }
  }

  &.ratio-4-1 {
    &:after,
    .image-holder {
      margin-top: 25%;
    }
  }

  &.ratio-4-3 {
    &:after,
    .image-holder {
      margin-top: 75%;
    }
  }
}
</style>
