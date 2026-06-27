<template>
  <view class="pb-label-selector">
    <view
      v-for="item in options"
      :key="item.id"
      class="rounded-3xl bg-gray-100 px-3 leading-8 inline-block mr-1 mb-1"
      :class="{ 'bg-primary': modelValue === item.id, 'text-white': modelValue === item.id }"
      @click="onInput(item.id)"
    >
      {{ item.name }}
    </view>
  </view>
</template>

<script setup lang="ts">
defineOptions({ name: 'CSingleIdNameSelector' })

const props = defineProps({
  options: {
    type: Array,
    default: () => [],
  },
})
</script>
