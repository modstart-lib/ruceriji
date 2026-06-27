<template>
  <view class="inline-block">
    {{ total ? '￥' + total : '-' }}
  </view>
</template>

<script setup lang="ts">
import { reactive, onMounted, toRefs } from 'vue'
import { api } from '@/brick/lib/api'

defineOptions({ name: 'BuiMemberMoneyTotal' })

const state = reactive({
  total: '',
})
const { total } = toRefs(state)

onMounted(async () => {
  const res = await api.post('member_money/get', {})
  state.total = res.data.total
})
</script>
