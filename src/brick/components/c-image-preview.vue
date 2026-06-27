<template>
  <c-modal ref="modal" :title="title" width="75%">
    <view :class="border ? 'image-border' : ''">
      <c-image :src="src" :ratio="imageRatio" preview @on-preview="onPreview" />
    </view>
    <view v-if="!!download" class="text-center mt-5">
      <view
        class="inline-flex items-center justify-center py-2.5 px-5 text-base rounded-full cursor-pointer"
        @click="doDownload"
      >
        <icon-lucide-download class="mr-1" />
        点击下载
      </view>
    </view>
  </c-modal>
</template>

<script setup lang="ts">
import { LogRemoteUtil } from '@/brick/lib/log-remote'
import { dialog } from '@/brick/lib/dialog'
import { reactive, ref, toRefs } from 'vue'
import { DateUtil } from '../lib/date-util'

defineOptions({ name: 'CImagePreview' })

const props = defineProps({
  download: {
    type: String,
    default: null,
  },
  imageRatio: {
    type: String,
    default: '1-1',
  },
  border: {
    type: Boolean,
    default: false,
  },
})

const state = reactive({
  src: '',
  title: '',
})
const { src, title } = toRefs(state)

const modal = ref<any>(null)

function show(src, title) {
  title = title || '图片预览'
  state.src = src
  state.title = title
  modal.value.show()
}

function hide() {
  modal.value.close()
}

function onPreview() {
  modal.value.close()
}

function doDownload() {
  let ext = 'png'
  if (props.download) {
    ext = props.download.split('.').pop()
  }
  const isBase64 = state.src.indexOf('data:image') === 0
  const downloadFail = (res) => {
    dialog.loadingOff()
    dialog.tipError('保存失败')
    LogRemoteUtil.post('CImagePreview.Error', res)
  }
  const downloadSuccess = () => {
    dialog.loadingOff()
    dialog.tipSuccess('保存成功')
  }
  // console.log('doDownload', state.src)
  // #ifdef H5
  const a = document.createElement('a')
  a.href = state.src
  a.target = '_blank'
  a.download = props.download
  a.click()
  // #endif
  // #ifdef MP-WEIXIN
  dialog.loadingOn('保存中...')
  if (isBase64) {
    const fileManager = uni.getFileSystemManager()
    const path = `${wx.env.USER_DATA_PATH}/${DateUtil.timestampInMs()}.${ext}`
    fileManager.writeFile({
      filePath: path,
      data: state.src.replace(/^data:image\/\w+;base64,/, ''),
      encoding: 'base64',
      success: (res) => {
        uni.saveImageToPhotosAlbum({
          filePath: path,
          success: () => {
            fileManager.unlink({
              filePath: path,
            })
            downloadSuccess()
          },
          fail: downloadFail,
        })
      },
      fail: downloadFail,
    })
  } else {
    uni.downloadFile({
      url: state.src,
      success: (res) => {
        if (res.statusCode === 200) {
          uni.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: downloadSuccess,
            fail: downloadFail,
          })
        } else {
          downloadFail(res)
        }
      },
      fail: downloadFail,
    })
  }
  // #endif
  // #ifdef APP-PLUS
  dialog.loadingOn('保存中...')
  if (isBase64) {
    const bitmap = new plus.nativeObj.Bitmap()
    const path = `_downloads/${DateUtil.timestampInMs()}.${ext}`
    bitmap.loadBase64Data(
      state.src,
      () => {
        bitmap.save(
          path,
          { overwrite: true },
          () => {
            bitmap.clear()
            plus.gallery.save(
              path,
              () => {
                downloadSuccess()
                plus.io.requestFileSystem(plus.io.PUBLIC_DOCUMENTS, (fs) => {
                  fs.root.getFile(path, { create: false }, (fileEntry) => {
                    fileEntry.remove()
                  })
                })
              },
              (e) => {
                bitmap.clear()
                downloadFail(e)
                plus.io.requestFileSystem(plus.io.PUBLIC_DOCUMENTS, (fs) => {
                  fs.root.getFile(path, { create: false }, (fileEntry) => {
                    fileEntry.remove()
                  })
                })
              }
            )
          },
          (e) => {
            bitmap.clear()
            downloadFail(e)
          }
        )
      },
      (e) => {
        bitmap.clear()
        downloadFail(e)
      }
    )
  } else {
    uni.downloadFile({
      url: state.src,
      success: (res) => {
        if (res.statusCode === 200) {
          plus.gallery.save(
            res.tempFilePath,
            () => {
              downloadSuccess()
            },
            (e) => {
              downloadFail(e)
            }
          )
        } else {
          downloadFail(res)
        }
      },
      fail: downloadFail,
    })
  }
  // #endif
}

defineExpose({ show, hide })
</script>

<style lang="less" scoped>
.image-border {
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  overflow: hidden;
}
</style>
