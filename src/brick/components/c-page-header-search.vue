<template>
  <view class="ub-header-mobile" :class="shadow ? '' : 'no-shadow'">
    <view class="header-status" :style="{ backgroundColor: backgroundColor, height: headerStatusHeight }"></view>
    <view
      class="header-container"
      :style="{ backgroundColor: backgroundColor, height: headerContainerHeight, top: headerStatusHeight }"
    >
      <view class="body" :style="{ paddingRight: headerBodyPaddingRight }">
        <icon-lucide-chevron-left
          v-if="hasBack && pageCanBack"
          class="back"
          :style="{ color: color }"
          @click="doBack"
        />
        <view
          class="title"
          :style="{
            color: color,
            paddingLeft: headerSearchTitlePaddingLeft,
            paddingRight: headerSearchTitlePaddingRight,
            textAlign: headerTitleTextAlign,
          }"
        >
          <view class="pb-page-header-search-input" @click="doSearch">
            <view class="search-input" :class="{ placeholder: !searchKeywords }">
              {{ searchKeywords ? searchKeywords : searchPlaceholder }}
            </view>
            <view class="search-btn">
              <icon-lucide-search />
            </view>
          </view>
        </view>
        <view v-if="hasAction" class="action" :style="{ color: color }">
          <slot name="action"></slot>
        </view>
      </view>
    </view>
    <view class="header-container-placeholder" :style="{ height: headerHeight }"></view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { router } from '@/brick/lib/router'
import { usePageHeader } from '@/brick/composables/usePageHeader'

defineOptions({ name: 'CPageHeaderSearch' })

const props = defineProps({
  title: { type: [String, null], default: '' },
  pageTitle: { type: [String, null], default: '' },
  backgroundColor: { type: String, default: 'var(--color-content-bg)' },
  color: { type: String, default: 'var(--color-text)' },
  hasTitle: { type: Boolean, default: true },
  hasBack: { type: Boolean, default: true },
  shadow: { type: Boolean, default: true },
  hasAction: { type: Boolean, default: false },
  customBackCallback: { type: Boolean, default: false },
  titleAlign: { type: String, default: 'center' },
  height: { type: [Number, String], default: 0 },
  searchKeywords: { type: String, default: '' },
  searchPlaceholder: { type: String, default: '输入关键词搜索' },
})

const emit = defineEmits(['back', 'search'])

const {
  pageCanBack,
  headerStatusHeight,
  headerContainerHeight,
  headerHeight,
  headerBodyPaddingRight,
  headerTitlePaddingLeft,
  headerTitlePaddingRight,
  headerTitleTextAlign,
  doBack,
} = usePageHeader({ ...props, cName: 'c-page-header-search' })

const headerSearchTitlePaddingLeft = computed(() => `calc( ${headerTitlePaddingLeft.value} + 10px )`)
const headerSearchTitlePaddingRight = computed(() => `calc( ${headerTitlePaddingRight.value} + 10px )`)

function doSearch() {
  router.startForCallback(
    '/brick/module/system/search',
    props.searchKeywords,
    {
      placeholder: props.searchPlaceholder,
    },
    (data: any) => {
      emit('search', data)
    }
  )
}
</script>

<style lang="less">
.ub-header-mobile {
  .header-container {
    .body {
      .pb-page-header-search-input {
        background: var(--color-body-bg);
        line-height: 30px;
        height: 30px;
        margin-top: 10px;
        border-radius: 15px;
        display: flex;
        color: var(--color-muted);

        .search-input {
          flex-grow: 1;
          line-height: 30px;
          height: 30px;
          color: var(--color-tertiary);
          margin-left: 30px;
          overflow-x: scroll;
          overflow-y: hidden;
          font-size: 0.6rem;

          &.placeholder {
            color: var(--color-muted);
          }
        }

        .search-btn {
          width: 30px;
          flex-shrink: 0;
          line-height: 30px;
          text-align: center;

          .iconfont {
            width: 30px;
            height: 30px;
            display: block;
            line-height: 30px;
          }
        }
      }
    }
  }
}
</style>
