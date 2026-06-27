<template>
  <view class="inline-flex items-center">
    <view class="w-6 mr-1">
      <c-cover :src="member.avatar" round></c-cover>
    </view>
    <view>
      {{ member.nickname }}
    </view>
  </view>
</template>

<script setup lang="ts">
defineOptions({ name: 'BuiMemberUser' })

const props = defineProps({
  member: {
    type: Object,
    default: () => {
      return null
    },
  },
})
</script>

<style scoped></style>
