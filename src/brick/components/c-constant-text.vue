<template>
  <text>
    <text v-if="values['v' + value]" :class="colorCls">{{ values['v' + value].name }}</text>
    <text v-if="!value" class="text-muted">-</text>
  </text>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'CConstantText' })

const props = defineProps({
  value: null,
  types: {
    type: Object,
    default: () => ({}),
  },
  colors: {
    type: Object,
    default: () => {},
  },
  mode: {
    type: String,
    default: 'guess',
  },
})

const values = computed(() => {
  let vs = {}
  Object.keys(props.types).forEach((k) => {
    vs['v' + props.types[k].value] = {
      name: props.types[k].name,
      value: props.types[k].value,
      key: k,
    }
  })
  return vs
})

const colorCls = computed(() => {
  switch (props.mode) {
    default: {
      const k = `v${props.value}`
      let cls = 'text'
      if (k in values.value) {
        const valueKey = values.value[k].key.toLowerCase()
        ConstantColorGuessMap.forEach((o) => {
          if (o[0].test(valueKey)) {
            cls = o[1]
          }
        })
      }
      let ret = {}
      ret[`ub-text-${cls}`] = true
      return ret
    }
  }
})
</script>
