/**
 * useLister - 列表数据加载/分页的 Composition API
 * 替代 ListerMixin / ComponentListerMixin
 */
import { ref, Ref } from 'vue'
import { Starter } from '@/brick/BrickUni'
import { api } from '@/brick/lib/api'

export interface ListState {
  page: number
  pageSize: number
  records: any[]
  total: number
}

export function useLister(options: { mode?: 'concat' | 'list'; pageSize?: number; autoInit?: boolean } = {}) {
  const mode = options.mode ?? 'concat'
  const autoInit = options.autoInit ?? true

  const listLoading = ref(false)
  const order = ref<{ field: string | null; type: string }>({ field: null, type: 'asc' })
  const list = ref<ListState>({ page: 1, pageSize: options.pageSize ?? 10, records: [], total: 0 })
  const selectIds = ref<any[]>([])
  const filter = ref<any[]>([])
  const search = ref<Record<string, any>>({})
  const listStatusRef = ref<any>(null)

  function doSearch() {
    listStatusRef.value?.init()
    doList(1)
  }

  function doList(page?: number) {
    console.error('useLister: should implement doList')
  }

  function doNextPage() {
    if (!listStatusRef.value?.shouldNext()) return
    doList(list.value.page + 1)
  }

  function onSortChange(data: any) {
    if (data?.item) {
      order.value.field = data.item.field
      order.value.type = data.item.type
    } else {
      order.value.field = null
      order.value.type = null
    }
    doSearch()
  }

  function doListProcess(
    url: string,
    page: number,
    param: Record<string, any> = {},
    cb?: (res: any) => void,
    resSuccessPreprocessCB?: (res: any) => any
  ) {
    page = page || list.value.page
    list.value.page = page
    if (mode === 'concat' && page === 1) {
      list.value.records = []
    } else if (mode === 'list') {
      list.value.records = []
    }
    listLoading.value = true
    api.post(
      url,
      Object.assign(
        {
          order: JSON.stringify(order.value),
          search: JSON.stringify(search.value),
          filter: JSON.stringify(filter.value),
          page: list.value.page,
          pageSize: list.value.pageSize,
        },
        param
      ),
      (res: any) => {
        listLoading.value = false
        uni.stopPullDownRefresh()
        if (list.value.page === 1) list.value.records = []
        if (resSuccessPreprocessCB) res = resSuccessPreprocessCB(res)
        list.value.page = res.data.page
        list.value.pageSize = res.data.pageSize
        if (mode === 'concat') {
          list.value.records = list.value.records.concat(res.data.records)
        } else {
          list.value.records = res.data.records
        }
        list.value.total = res.data.total
        if (res.data.records.length !== res.data.pageSize) {
          listStatusRef.value?.noMore()
        }
        cb && cb(res)
      },
      () => {
        listLoading.value = false
        uni.stopPullDownRefresh()
      }
    )
  }

  function onTableSelectChange(ids: any[]) {
    selectIds.value = ids.map((o) => o.id)
  }

  return {
    listLoading,
    order,
    list,
    selectIds,
    filter,
    search,
    listStatusRef,
    doSearch,
    doList,
    doNextPage,
    onSortChange,
    doListProcess,
    onTableSelectChange,
  }
}

export function useComponentLister() {
  const listLoading = ref(false)
  const order = ref<{ field: string | null; type: string }>({ field: null, type: 'asc' })
  const list = ref<ListState>({ page: 1, pageSize: 10, records: [], total: 0 })
  const selectIds = ref<any[]>([])
  const filter = ref<any[]>([])
  const search = ref<Record<string, any>>({})
  const listStatusRef = ref<any>(null)

  function doSearch() {
    listStatusRef.value?.init()
    doList(1)
  }

  function doList(page?: number) {
    console.error('useComponentLister: should implement doList')
  }

  function doNextPage() {
    if (!listStatusRef.value?.shouldNext()) return
    doList(list.value.page + 1)
  }

  function doListProcess(
    url: string,
    page: number,
    param: Record<string, any> = {},
    cb?: (res: any) => void,
    resSuccessPreprocessCB?: (res: any) => any
  ) {
    page = page || list.value.page
    list.value.page = page
    if (list.value.page === 1) list.value.records = []
    listLoading.value = true
    api.post(
      url,
      Object.assign(
        {
          order: JSON.stringify(order.value),
          search: JSON.stringify(search.value),
          filter: JSON.stringify(filter.value),
          page: list.value.page,
          pageSize: list.value.pageSize,
        },
        param
      ),
      (res: any) => {
        listLoading.value = false
        uni.stopPullDownRefresh()
        if (list.value.page === 1) list.value.records = []
        if (resSuccessPreprocessCB) res = resSuccessPreprocessCB(res)
        list.value.page = res.data.page
        list.value.pageSize = res.data.pageSize
        list.value.records = list.value.records.concat(res.data.records)
        list.value.total = res.data.total
        if (res.data.records.length !== res.data.pageSize) {
          listStatusRef.value?.noMore()
        }
        cb && cb(res)
      },
      () => {
        listLoading.value = false
        uni.stopPullDownRefresh()
      }
    )
  }

  return {
    listLoading,
    order,
    list,
    selectIds,
    filter,
    search,
    listStatusRef,
    doSearch,
    doList,
    doNextPage,
    doListProcess,
  }
}
