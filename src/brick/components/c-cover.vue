<template>
  <view style="width: 100%; display: block">
    <view :id="uid" class="pb-cover" :class="classList" :style="styleList">
      <!-- #ifdef MP-WEIXIN -->
      <image class="image" lazy-load="true" fade-show :mode="contain ? 'aspectFit' : 'aspectFill'" :src="src" />
      <!-- #endif -->
      <!-- #ifdef H5 -->
      <img class="image" loading="lazy" :src="src" :style="{ objectFit: contain ? 'contain' : 'cover' }" />
      <!-- #endif -->
      <!-- #ifdef APP-PLUS -->
      <image v-if="imageShow" class="image" fade-show :mode="contain ? 'aspectFit' : 'aspectFill'" :src="src" />
      <view v-else class="image-holder"></view>
      <!-- #endif -->
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, toRefs } from 'vue'

defineOptions({
  name: 'CCover',
  options: { virtualHost: true },
})

let _idCounter = 0

const props = defineProps({
  src: {
    type: String,
    default: '',
  },
  ratio: {
    type: String,
    default: '1-1',
  },
  contain: {
    type: Boolean,
    default: false,
  },
  round: {
    type: Boolean,
    default: false,
  },
  borderRadius: {
    type: String,
    default: '0',
  },
  backgroundColor: {
    type: String,
    default: '#F8F8F8',
  },
})

const state = reactive({
  observer: null,
  timer: null,
  uid: 'CCover' + _idCounter++,
  imageShow: false,
})
const { observer, timer, uid, imageShow } = toRefs(state)

const classList = computed(() => {
  let classList = ['ratio-' + props.ratio]
  if (props.contain) {
    classList.push('contain')
  }
  return classList
})

const styleList = computed(() => {
  let styleList = []
  if (props.backgroundColor) {
    styleList.push('background-color:' + props.backgroundColor)
  }
  if (props.round) {
    styleList.push('border-radius:50%')
  } else if (props.borderRadius) {
    styleList.push('border-radius:' + props.borderRadius)
  }
  return styleList.join(';')
})

onMounted(() => {
  // #ifdef APP-PLUS
  state.observer = uni.createIntersectionObserver(this)
  state.observer.relativeToViewport().observe('#' + state.uid, (res) => {
    if (state.imageShow) {
      return
    }
    if (res.boundingClientRect.top < state.SystemConfig.Height) {
      state.imageShow = true
      state.observer.disconnect()
      state.observer = null
    }
  })
  // #endif
})
</script>

<style lang="less" scoped>
.pb-cover {
  position: relative;
  overflow: hidden;

  &:after {
    content: '';
    display: block;
    padding-bottom: 100%;
  }

  &.contain {
    .image {
      object-fit: contain;
    }
  }

  &.ratio-1-1 {
    &:after {
      padding-bottom: 100%;
    }
  }

  &.ratio-2-1 {
    &:after {
      padding-bottom: 50%;
    }
  }

  &.ratio-3-1 {
    &:after {
      padding-bottom: 33.3333333333%;
    }
  }

  &.ratio-3-2 {
    &:after {
      padding-bottom: 66.6666666667%;
    }
  }

  &.ratio-2-3 {
    &:after {
      padding-bottom: 150%;
    }
  }

  &.ratio-3-4 {
    &:after {
      padding-bottom: 133.3333333333%;
    }
  }

  .image,
  .image-holder {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .image-holder {
    background-color: #ffffff;
  }
}
</style>
