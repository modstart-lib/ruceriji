<template>
  <view :style="{ height: height }" class="c-empty">
    <view :class="small ? 'text-center text-muted py-4' : 'text-center text-muted py-10'">
      <view v-if="image">
        <c-image class="w-1_3 mx-auto" :src="image"></c-image>
      </view>
      <view v-else class="text-center text-muted">
        <image class="image" mode="aspectFit" src="/static/image/no-record.svg" />
      </view>
      <view class="text-muted pt-4">{{ text }}</view>
      <view v-if="actions.length > 0" class="action mt-4">
        <view
          v-for="(action, actionIndex) in actions"
          :key="actionIndex"
          class="inline-flex items-center justify-center py-1 px-4 text-sm rounded-full cursor-pointer"
          @click="$emit('action', action)"
        >
          {{ action.title }}
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineOptions({ name: 'CEmpty' })

const props = defineProps({
  small: {
    type: Boolean,
    default: false,
  },
  text: {
    type: String,
    default: '暂无数据',
  },
  image: {
    type: String,
    default: '',
  },
  height: {
    type: String,
    default: 'auto',
  },
  actions: {
    type: Array,
    default: () => {
      return []
    },
  },
})
</script>

<style lang="less">
.c-empty {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
