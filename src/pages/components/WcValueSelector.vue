<template>
  <view>
    <view class="flex items-center mb-3">
      <view class="font-bold text-lg mr-3">{{ title }}</view>
      <view v-if="tooltip" class="text-gray-400">{{ tooltip }}</view>
    </view>
    <view class="selector rounded-xl">
      <view class="selector-scroll-container flex overflow-x-auto">
        <view
          v-for="o in options"
          :key="o.value"
          class="selector-item"
          :class="{ active: modelValue === o.value, 'has-image': !!o.image, 'has-text': !o.image }"
          @click="doSelect(o.value)"
        >
          <view v-if="o.image" class="item-image">
            <c-image-static :src="o.image" />
          </view>
          <view v-else class="item-text">{{ o.label }}</view>
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
.selector {
  background-color: #f5f5f5;
  padding: 4rpx;

  .selector-scroll-container {
    &::-webkit-scrollbar {
      display: none;
    }
  }
}

.selector-item {
  flex-grow: 1;
  text-align: center;
  height: 100rpx;
  border-radius: 16rpx;
  flex-shrink: 0;
  min-width: 100rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  .item-image {
    width: 60rpx;
    height: 60rpx;
    margin: auto;
  }

  .item-text {
    line-height: 80rpx;
  }

  &.active {
    background-color: #f6d3b5;
  }
}
</style>
