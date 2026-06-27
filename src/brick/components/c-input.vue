<template>
  <input :placeholder="placeholder" :value="modelValue" @input="onInput" />
</template>

<script setup lang="ts">
defineOptions({ name: 'CInput' })

const props = defineProps({
  placeholder: {
    type: String,
    default: '',
  },
})
</script>
