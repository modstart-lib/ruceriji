import { router } from '@/brick/lib/router'
import { computed, ref, watch } from 'vue'
import { useBrickBaseStore, useUi } from './useBaseStore'

export function usePageHeader(props: {
  cName?: string
  title?: string | null
  pageTitle?: string | null
  titleAlign?: string
  hasBack?: boolean
  hasAction?: boolean
  customBackCallback?: boolean
  height?: number | string
}) {
  const { SystemConfig } = useUi()
  const pages = getCurrentPages()
  const pageCanBack = ref(pages.length > 1)

  const headerStatusHeight = computed(() => (SystemConfig.StatusHeight ?? 0) + 'px')
  const headerStatusHeightRaw = computed(() => (SystemConfig.StatusHeightRaw ?? 0) + 'px')
  const headerContainerHeight = computed(() => {
    if (props.height) return props.height + 'px'
    return (SystemConfig.HeadHeight ?? 50) + 'px'
  })
  const headerHeight = computed(() => {
    const hh = props.height ? Number(props.height) : (SystemConfig.HeadHeight ?? 50)
    return hh + (SystemConfig.StatusHeight ?? 0) + 'px'
  })
  const headerBodyPaddingRight = computed(() => (SystemConfig.HeadMenuWidth ?? 0) + 'px')

  const _headerTitlePaddingRightRaw = computed(() => {
    let padding = 0
    if (props.hasBack && pageCanBack.value) padding += 50
    if (props.hasAction) padding -= 50
    padding -= SystemConfig.HeadMenuWidth ?? 0
    return padding
  })
  const headerTitlePaddingRight = computed(() => Math.max(_headerTitlePaddingRightRaw.value, 0) + 'px')
  const headerTitlePaddingLeft = computed(() => {
    let padding = 0
    if ((SystemConfig.HeadMenuWidth ?? 0) > 0) {
      if (props.hasAction) {
        if (props.hasBack && pageCanBack.value) return padding + 'px'
        return padding + 10 + 'px'
      }
    }
    const raw = _headerTitlePaddingRightRaw.value
    if (raw < 0) padding += -raw
    return padding + 'px'
  })
  const headerTitleTextAlign = computed(() => {
    if ((SystemConfig.HeadMenuWidth ?? 0) > 0 && props.hasAction) return 'left'
    return props.titleAlign ?? 'center'
  })

  // Watch title to update nav bar
  watch(
    () => props.title,
    (n) => {
      if (
        n &&
        props.cName &&
        ['c-page-header', 'c-page-header-holder', 'c-page-header-trans', 'c-page-header-search'].includes(props.cName)
      ) {
        uni.setNavigationBarTitle({ title: n })
        try {
          useBrickBaseStore().SET_PAGE_TITLE(n)
        } catch (e) {}
      }
    },
    { immediate: true }
  )

  watch(
    () => props.pageTitle,
    (n) => {
      if (n) uni.setNavigationBarTitle({ title: n })
    }
  )

  function doBack() {
    router.back()
  }

  return {
    pageCanBack,
    headerStatusHeight,
    headerStatusHeightRaw,
    headerContainerHeight,
    headerHeight,
    headerBodyPaddingRight,
    headerTitlePaddingRight,
    headerTitlePaddingLeft,
    headerTitleTextAlign,
    doBack,
  }
}
