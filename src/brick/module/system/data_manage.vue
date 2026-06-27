<template>
  <view>
    <c-page-header :title="title">
      <template #action>
        <block>
          <icon-lucide-upload
            v-if="mode === 'manager' || mode === 'fileSelect'"
            class="item"
            :style="{ fontSize: '58rpx' }"
            @tap.stop="doUpload"
          />
        </block>
      </template>
    </c-page-header>
    <view class="pb-data-manage-toolbar">
      <view class="left">
        <icon-lucide-folder-plus class="item" @tap.stop="doEditCategory" />
        <icon-lucide-chevron-up v-if="currentCategoryId > 0" class="item" @tap.stop="doChangeCategoryUp" />
        <scroll-view scroll-x class="item scroll">
          <block v-for="(item, itemIndex) in categoryChain" :key="item.id">
            <view class="category" @tap.stop="doChangeCategory(item)">{{ item.name }}</view>
          </block>
        </scroll-view>
      </view>
      <view v-if="mode === 'manage'" class="right">
        <view class="empty"></view>
        <icon-lucide-check v-if="manageMode === 'view'" class="item" @tap.stop="doChangeManageMode('select')" />
        <icon-lucide-x v-if="manageMode === 'select'" class="item" @tap.stop="doChangeManageMode('view')" />
      </view>
    </view>
    <view class="pb-data-manage-toolbar-placeholder"></view>
    <view class="pb-data-manage-list">
      <view v-for="(item, itemIndex) in currentCategories" :key="item.id" class="item">
        <view
          class="box"
          :class="selectedCategoryIds.includes(item.id) ? 'selected' : ''"
          @click="doCategoryClick(item, false)"
          @longpress="doCategoryClick(item, true)"
        >
          <icon-lucide-folder class="thumb" />
          <view class="name">{{ item.name }}</view>
          <icon-lucide-square-check v-if="mode === 'manage' && manageMode === 'select'" class="checked" />
        </view>
      </view>
      <view v-for="(item, itemIndex) in list.records" :key="item.id" class="item">
        <view
          class="box"
          :class="selectedFileIds.includes(item.id) ? 'selected' : ''"
          @click="doFileClick(item, false)"
          @longpress="doFileClick(item, true)"
        >
          <view
            v-if="previewImage(item)"
            class="cover"
            :style="{ backgroundImage: 'url(' + item.preview + ')' }"
          ></view>
          <icon-lucide-file v-else class="thumb" />
          <view class="name">{{ item.filename }}</view>
          <icon-lucide-square-check
            v-if="(mode === 'manage' && manageMode === 'select') || mode === 'fileSelect'"
            class="checked"
          />
        </view>
      </view>
    </view>
    <c-list-status ref="listStatus" :loading="listLoading" :records="list.records" :total="list.total" :simple="true" />

    <view
      v-if="
        (mode === 'manage' && manageMode === 'select' && selectedFileIds.length + selectedCategoryIds.length > 0) ||
        mode === 'folderSelect' ||
        mode === 'fileSelect'
      "
      class="pb-data-manage-select-confirm-placeholder"
    ></view>
    <view
      v-if="
        (mode === 'manage' && manageMode === 'select' && selectedFileIds.length + selectedCategoryIds.length > 0) ||
        mode === 'folderSelect' ||
        mode === 'fileSelect'
      "
      class="pb-data-manage-select-confirm"
    >
      <view v-if="mode === 'manage'" class="item" :class="isEditEnable ? '' : 'disabled'" @tap.stop="doEdit">
        <icon-lucide-pen-line class="icon" />
        <view class="text">修改</view>
      </view>
      <view v-if="mode === 'manage'" class="item" :class="isDeleteEnable ? '' : 'disabled'" @tap.stop="doDelete">
        <icon-lucide-trash-2 class="icon" />
        <view class="text">删除</view>
      </view>
      <view v-if="mode === 'folderSelect'" class="item" @tap.stop="doFolderSelectConfirm">
        <icon-lucide-check class="icon" />
        <view class="text">确认</view>
      </view>
      <view v-if="mode === 'manage'" :class="isMoveEnable ? '' : 'disabled'" class="item" @tap.stop="doMove">
        <icon-lucide-arrow-right class="icon" />
        <view class="text">移动</view>
      </view>
      <view v-if="mode === 'fileSelect'" class="item" @click="doFileSelectConfirm">
        <icon-lucide-check class="icon text-primary" :style="{ fontSize: '50rpx' }" />
        <view class="text">确认({{ selectedFileIds.length }})</view>
      </view>

      <view v-if="false" class="item" @tap.stop="confirmMoreVisible = !confirmMoreVisible">
        <icon-lucide-ellipsis class="icon" />
        <view class="text">更多</view>
      </view>
      <div v-if="false && confirmMoreVisible" class="more-menu-mask" @tap.stop="confirmMoreVisible = false">
        <view class="more-menu">
          <view class="more-menu-item disabled">重命名</view>
          <view class="more-menu-item">重命名</view>
        </view>
      </div>
    </view>

    <c-modal ref="categoryEditDialogRef" title="输入分类名称" width="90%">
      <view>
        <view>
          <c-input v-model="categoryEdit.title" placeholder="点击填写"></c-input>
        </view>
        <view class="flex padding-top">
          <button class="flex-sub cu-btn bg-gray lg" @tap.stop="categoryEditDialogRef.close()">取消</button>
          <view :style="{ width: '20rpx' }"></view>
          <button class="flex-sub cu-btn primary lg" @tap.stop="doEditCategorySubmit">确定</button>
        </view>
      </view>
    </c-modal>
  </view>
</template>

<script setup lang="ts">
import { Starter } from '@/brick/BrickUni'
import { useUi } from '@/brick/composables/useBaseStore'
import { useRouterCallback } from '@/brick/composables/useRouterCallback'
import { useUser } from '@/brick/composables/useUser'
import { api } from '@/brick/lib/api'
import { dialog } from '@/brick/lib/dialog'
import { router } from '@/brick/lib/router'
import { onPullDownRefresh, onReachBottom, onReady } from '@dcloudio/uni-app'
import { computed, reactive, ref, toRefs, watch } from 'vue'
defineOptions({ name: 'DataManage' })

const { _e_, isInit, config, value, isCallbackPage, callbackCancel, callbackConfirm } = useRouterCallback()
const { user, userInit, requireUserLogin, requireUserLoginRouteTo } = useUser()
const { ui, getPageDefaultTitle, autoSetNavigationBarColor, SystemConfig } = useUi()

const state = reactive({
  url: 'member_data/select_dialog',
  category: 'image',
  // fileSelect   : 文件选择（一个或多个）
  // folderSelect : 文件夹选择（一个，用于移动文件时使用）
  // manage       : 文件管理
  mode: null,
  // view         : 查看模式
  // select       : 选择模式
  manageMode: 'view',
  confirmMoreVisible: false,

  // category
  isCategoryInit: false,
  currentCategoryId: 0,
  categories: [],
  selectedCategoryIds: [],
  categoryEdit: {
    id: 0,
    pid: 0,
    title: '',
  },

  listLoading: false,
  list: {
    page: 1,
    pageSize: 20,
    records: [],
    total: 0,
  },
  selectedFileIds: [],
})
const {
  url,
  category,
  mode,
  manageMode,
  confirmMoreVisible,
  isCategoryInit,
  currentCategoryId,
  categories,
  selectedCategoryIds,
  categoryEdit,
  listLoading,
  list,
  selectedFileIds,
} = toRefs(state)

const listStatusRef = ref<any>(null)
const categoryEditDialogRef = ref<any>(null)

const isEditEnable = computed(() => {
  return state.selectedCategoryIds.length === 1 && !state.selectedFileIds.length
})

const isDeleteEnable = computed(() => {
  return (
    (state.selectedCategoryIds.length === 1 && !state.selectedFileIds.length) ||
    (!state.selectedCategoryIds.length && state.selectedFileIds.length)
  )
})

const isMoveEnable = computed(() => {
  return (
    (state.selectedCategoryIds.length === 1 && !state.selectedFileIds.length) ||
    (!state.selectedCategoryIds.length && state.selectedFileIds.length)
  )
})

const title = computed(() => {
  if (config.value && config.value.title) {
    return config.value.title
  }
  switch (state.mode) {
    case 'fileSelect':
      switch (state.category) {
        case 'image':
          return '选择图片'
        default:
          return '选择文件'
      }
    case 'folderSelect':
      return '选择目录'
    default:
      switch (state.category) {
        case 'image':
          return '图片管理'
        default:
          return '文件管理'
      }
  }
})

const apiUrl = computed(() => {
  return state.url + '/' + state.category
})

const currentCategories = computed(() => {
  return state.categories.filter((o) => o.pid === state.currentCategoryId)
})

const categoryChain = computed(() => {
  let chain = []
  let current = state.currentCategoryId
  for (let i = 0; i < 1000; i++) {
    if (current === 0) {
      break
    }
    for (let j = 0; j < state.categories.length; j++) {
      if (state.categories[j].id === current) {
        chain.push(state.categories[j])
        current = state.categories[j].pid
        break
      }
    }
  }
  chain.push({ id: 0, name: '所有' })
  return chain.reverse()
})

watch(
  () => user,
  (n, o) => {
    n.id && init()
  }
)

watch(
  () => currentCategoryId,
  (n, o) => {
    doList(1)
  },
  { immediate: true }
)

function init() {
  listStatusRef.value && listStatusRef.value.init()
  !state.isCategoryInit && initCategory()
}

function doNextPage() {
  if (!listStatusRef.value.shouldNext()) {
    return
  }
  doList(state.list.page + 1)
}

function doList(page) {
  if (!state.mode) {
    setTimeout(() => {
      doList(page)
    }, 100)
    return
  }
  if (!['manage', 'fileSelect'].includes(state.mode)) {
    return
  }
  page = page || state.list.page
  state.list.page = page
  if (state.list.page === 1) {
    state.list.records = []
  }
  state.listLoading = true
  api
    .post(apiUrl.value, {
      action: 'list',
      categoryId: state.currentCategoryId === 0 ? -1 : state.currentCategoryId,
      page: state.list.page,
      pageSize: state.list.pageSize,
    })
    .then((res) => {
      state.listLoading = false
      uni.stopPullDownRefresh()
      state.list.page = res.data.page
      state.list.pageSize = res.data.pageSize
      if (state.list.page === 1) {
        state.list.records = []
      }
      state.list.records = state.list.records.concat(res.data.list)
      state.list.total = res.data.total
      if (res.data.list.length !== res.data.pageSize) {
        listStatusRef.value && listStatusRef.value.noMore()
      }
    })
    .catch(() => {
      state.listLoading = false
      uni.stopPullDownRefresh()
    })
}

function doFileClick(item, isLongPress) {
  // console.log('doCategoryClick', state.mode, state.manageMode, JSON.stringify(item))
  switch (state.mode) {
    case 'manage':
      switch (state.manageMode) {
        case 'view':
          if (isLongPress) {
            doChangeManageMode('select')
            state.selectedFileIds.push(item.id)
          } else {
            switch (item.type) {
              case 'png':
              case 'jpg':
              case 'jpeg':
                uni.previewImage({
                  current: 0,
                  urls: [item.preview],
                })
                break
              default:
                dialog.tipError('该文件在不支持预览')
            }
          }
          break
        case 'select': {
          const found = state.selectedFileIds.indexOf(item.id)
          if (found >= 0) {
            state.selectedFileIds.splice(found, 1)
            if (state.selectedCategoryIds.length + state.selectedFileIds.length === 0) {
              doChangeManageMode('view')
            }
          } else {
            state.selectedFileIds.push(item.id)
          }
          break
        }
      }
      break
    case 'fileSelect': {
      const found = state.selectedFileIds.indexOf(item.id)
      if (found >= 0) {
        state.selectedFileIds.splice(found, 1)
      } else {
        if (
          config.value &&
          config.value.max &&
          config.value.max > 0 &&
          state.selectedFileIds.length >= config.value.max
        ) {
          dialog.tipError(`最多选择${config.value.max}个文件`)
          return
        }
        state.selectedFileIds.push(item.id)
      }
      break
    }
  }
}

function doUpload() {
  switch (state.category) {
    case 'image':
      uni.chooseImage({
        success: (res) => {
          const tempFilePaths = res.tempFilePaths
          const total = tempFilePaths.length
          let current = 0
          const upload = () => {
            if (tempFilePaths.length === 0) {
              dialog.loadingOff()
              dialog.tipSuccess('上传完成', () => {
                doList(1)
              })
              return
            }
            current++
            dialog.loadingOn(`正在上传 ${current}/${total}`)
            api.postUpload(
              apiUrl.value,
              {
                filePath: tempFilePaths.shift(),
                formData: {
                  action: 'upload_file',
                  categoryId: state.currentCategoryId,
                },
              },
              (res) => {
                upload()
              },
              (res) => {
                upload()
              }
            )
          }
          upload()
        },
      })
      break
    default:
      dialog.tipError('暂不支持')
      break
  }
}

async function initCategory() {
  state.isCategoryInit = true
  dialog.loadingOn()
  const res = await api.post(apiUrl.value, { action: 'category' })
  dialog.loadingOff()
  state.categories = res.data.categories
}

function doCategoryClick(item, isLongPress) {
  // console.log('doCategoryClick', isLongPress, state.mode, state.manageMode, JSON.stringify(item))
  switch (state.mode) {
    case 'manage':
      switch (state.manageMode) {
        case 'view':
          if (isLongPress) {
            doChangeManageMode('select')
            state.selectedCategoryIds.push(item.id)
          } else {
            state.currentCategoryId = item.id
            state.selectedCategoryIds = []
          }
          break
        case 'select': {
          const found = state.selectedCategoryIds.indexOf(item.id)
          if (found >= 0) {
            state.selectedCategoryIds.splice(found, 1)
            if (state.selectedCategoryIds.length + state.selectedFileIds.length === 0) {
              doChangeManageMode('view')
            }
          } else {
            state.selectedCategoryIds.push(item.id)
          }
          break
        }
      }
      break
    case 'folderSelect':
      state.currentCategoryId = item.id
      break
    case 'fileSelect':
      state.currentCategoryId = item.id
      state.selectedFileIds = []
      break
  }
}

function doChangeManageMode(manageMode) {
  state.manageMode = manageMode
  state.selectedCategoryIds = []
  state.selectedFileIds = []
  switch (state.manageMode) {
    case 'view':
      break
    case 'select':
      break
  }
}

function doChangeCategory(item) {
  state.currentCategoryId = item.id
  state.selectedCategoryIds = []
}

function doChangeCategoryUp() {
  for (let i = 0; i < state.categories.length; i++) {
    if (state.categories[i].id === state.currentCategoryId) {
      state.currentCategoryId = state.categories[i].pid
      break
    }
  }
  state.selectedCategoryIds = []
}

function previewImage(item) {
  switch (item.type) {
    case 'png':
    case 'jpg':
    case 'jpeg':
      return item.preview
  }
  return null
}

function doDelete() {
  if (!isDeleteEnable.value) {
    return
  }
  if (state.selectedCategoryIds.length === 1) {
    doDeleteCategory()
  } else if (state.selectedFileIds.length > 0) {
    doDeleteFile()
  }
}

function doDeleteCategory() {
  dialog.confirm('确认删除（所有文件会被移动到根分类）？', async () => {
    await api.post(apiUrl.value, { action: 'categoryDelete', id: state.selectedCategoryIds[0] })
    dialog.loadingOff()
    doChangeManageMode('view')
    dialog.tipSuccess('删除成功', () => {
      initCategory()
      state.currentCategoryId === 0 && doList(1)
    })
  })
}

function doDeleteFile() {
  dialog.confirm('确认删除（所有引用到文件的地方都不可用）？', async () => {
    dialog.loadingOn()
    await api.post(apiUrl.value, {
      action: 'fileDelete',
      id: state.selectedFileIds.join(','),
    })
    dialog.loadingOff()
    dialog.tipSuccess('删除成功')
    doChangeManageMode('view')
    doList(1)
  })
}

function doEdit() {
  if (!isEditEnable.value) {
    return
  }
  if (state.selectedCategoryIds.length === 1) {
    doEditCategory()
  } else if (state.selectedFileIds.length === 1) {
    doEditFile()
  }
}

function doEditCategoryAssign() {
  if (state.selectedCategoryIds.length > 0) {
    const founds = state.categories.filter((o) => o.id === state.selectedCategoryIds[0])
    if (founds.length !== 1) {
      dialog.tipError('分类不存在')
      return
    }
    state.categoryEdit.id = founds[0].id
    state.categoryEdit.pid = founds[0].pid
    state.categoryEdit.title = founds[0].name
  } else {
    state.categoryEdit.id = 0
    state.categoryEdit.pid = state.currentCategoryId
    state.categoryEdit.title = ''
  }
}

function doEditCategory() {
  doEditCategoryAssign()
  categoryEditDialogRef.value.show()
}

async function doEditCategorySubmit() {
  dialog.loadingOn()
  await api.post(apiUrl.value, Object.assign(state.categoryEdit, { action: 'categoryEdit' }))
  dialog.loadingOff()
  categoryEditDialogRef.value.close()
  doChangeManageMode('view')
  dialog.tipSuccess('保存成功', () => {
    initCategory()
  })
}

function doEditFile() {
  //TODO
}

function doEditFileSubmit() {
  //TODO
}

function doMove() {
  if (!isMoveEnable.value) {
    return
  }
  if (state.selectedCategoryIds.length) {
    doMoveCategory()
  } else if (state.selectedFileIds.length) {
    doMoveFile()
  }
}

function doMoveCategory() {
  doEditCategoryAssign()
  if (!state.categoryEdit.id) {
    return
  }
  router.startForCallback(
    '/brick/module/system/data_manage',
    0,
    { title: '选择需要移动到的目录' },
    async (data) => {
      state.categoryEdit.pid = data
      dialog.loadingOn()
      await api.post(apiUrl.value, Object.assign(state.categoryEdit, { action: 'categoryEdit' }))
      dialog.loadingOff()
      doChangeManageMode('view')
      dialog.tipSuccess('移动成功', () => {
        initCategory()
      })
    },
    () => {
      dialog.tipError('操作已取消')
    },
    { mode: 'folderSelect' }
  )
}

function doMoveFile() {
  router.startForCallback(
    '/brick/module/system/data_manage',
    0,
    { title: '选择需要移动到的目录' },
    async (data) => {
      dialog.loadingOn()
      await api.post(apiUrl.value, {
        action: 'fileEdit',
        id: state.selectedFileIds.join(','),
        categoryId: data,
      })
      dialog.loadingOff()
      doChangeManageMode('view')
      dialog.tipSuccess('移动成功', () => {
        doList(1)
      })
    },
    () => {
      dialog.tipError('操作已取消')
    },
    { mode: 'folderSelect' }
  )
}

function doFolderSelectConfirm() {
  callbackConfirm(state.currentCategoryId)
}

function doFileSelectConfirm() {
  let records = state.list.records
    .filter((o) => state.selectedFileIds.includes(o.id))
    .map((o) => {
      return {
        category: o.category,
        filename: o.filename,
        path: o.path,
        preview: o.preview,
        type: o.type,
      }
    })
  if (config.value && config.value.min && config.value.min > 0 && state.selectedFileIds.length < config.value.min) {
    dialog.tipError(`最少选择${config.value.min}个文件`)
    return
  }
  callbackConfirm(records)
}

onReady(() => {
  Starter.boot(() => {
    state.mode = router.getQuery('mode')
    if (!['manage', 'fileSelect', 'folderSelect'].includes(state.mode)) {
      state.mode = 'manage'
    }
    user.value.id && init()
  })
})

onPullDownRefresh(() => {
  state.categories = []
  initCategory()
  doList(1)
})

onReachBottom(() => {
  doNextPage()
})
</script>

<style lang="less" scoped>
@import './styles/data_manage';
</style>
