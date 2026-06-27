<script setup lang="ts">
import { onLaunch, onPageNotFound, onError } from '@dcloudio/uni-app'
import { BrickUni } from './brick/BrickUni'
import { Bootstrap } from './config/bootstrap'

onLaunch(() => {
  BrickUni.flushPendingCrash('ruceriji')
  BrickUni.launch()
  Bootstrap.mounted()
})

onPageNotFound(() => {
  uni.redirectTo({ url: '/brick/module/system/page404' })
})

onError(BrickUni.sendCrash('ruceriji'))
</script>

<style lang="scss">
/* tailwindcss 指令 */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* uview-plus 全局样式 */
@import 'uview-plus/index.scss';
/* 全局自定义样式 */
@import './styles/global.scss';
</style>
