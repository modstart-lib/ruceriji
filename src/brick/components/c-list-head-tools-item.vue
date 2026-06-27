<template>
  <view class="item" :class="{ open: open }">
    <view class="item-drawer">
      <view class="item-drawer-title" @tap="doOpen()">
        <view class="text">{{ title }}</view>
        <icon-lucide-chevron-down class="icon" />
      </view>
      <view class="item-drawer-mask">
        <view class="item-drawer-content">
          <view class="item-drawer-content-body" :style="{ maxHeight: maxHeightCalc }">
            <slot></slot>
          </view>
          <view v-if="hasReset || hasSubmit" class="item-drawer-content-foot">
            <button
              v-if="hasReset"
              class="inline-flex items-center justify-center py-2.5 px-5 text-base rounded-full cursor-pointer"
              @tap="doReset"
            >
              重置
            </button>
            <button
              v-if="hasSubmit"
              class="inline-flex items-center justify-center py-2.5 px-5 text-base rounded-full bg-primary text-white cursor-pointer"
              @tap="doSubmit"
            >
              确认
            </button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, computed, inject, onMounted, onUnmounted, toRefs } from 'vue'

defineOptions({ name: 'CListHeadToolsItem' })

const props = defineProps({
  title: {
    type: String,
    default: 'title',
  },
  hasReset: {
    type: Boolean,
    default: true,
  },
  hasSubmit: {
    type: Boolean,
    default: true,
  },
  maxHeight: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['reset', 'submit'])

const listHeadToolsApi = inject<any>('listHeadToolsApi', null)

const state = reactive({
  open: false,
})
const { open } = toRefs(state)

const maxHeightCalc = computed(() => {
  if (!props.maxHeight) {
    return 'calc(100vh - 2.0rem - 3.0rem)'
  }
  return props.maxHeight
})

function doHide() {
  state.open = false
  // #ifdef H5
  document.body.classList.remove('body-scroll-lock')
  // #endif
}

onMounted(() => {
  listHeadToolsApi?.registerItem({ doHide })
})
onUnmounted(() => {
  listHeadToolsApi?.unregisterItem({ doHide })
})

function doOpen() {
  if (!state.open) {
    listHeadToolsApi?.hideAll()
  }
  state.open = !state.open
  // #ifdef H5
  if (state.open) {
    document.body.classList.add('body-scroll-lock')
  } else {
    document.body.classList.remove('body-scroll-lock')
  }
  // #endif
}

function doReset() {
  emit('reset')
  doHide()
}

function doSubmit() {
  emit('submit')
  doHide()
}
</script>
