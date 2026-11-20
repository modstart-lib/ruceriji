<template>
  <view class="share-entry border-b border-gray-100/30" @tap="emit('tap')">
    <view class="share-entry__icon"><icon-lucide-share-2 :size="20" /></view>
    <view class="share-entry__label">分享好友</view>
    <view class="share-entry__arrow"><icon-lucide-chevron-right :size="16" /></view>
  </view>
</template>

<script setup lang="ts">
defineOptions({ name: 'ShareEntry' })

const emit = defineEmits(['tap'])
</script>

<style lang="scss" scoped>
.share-entry {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  transition: background-color 0.15s;
}

.share-entry:active {
  background-color: var(--token-panel);
}

.share-entry__icon {
  width: 24px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  color: var(--token-text);
  opacity: 0.7;
}

.share-entry__label {
  flex: 1;
  margin-left: 10px;
  font-size: 14px;
  font-weight: 500;
  color: var(--token-text);
}

.share-entry__arrow {
  flex-shrink: 0;
  display: flex;
  color: var(--token-text-disabled);
}
</style>
