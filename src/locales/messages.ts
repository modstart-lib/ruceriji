/**
 * I18n 国际化配置
 */

export const I18nList = [
  { id: 'zh', name: '中文' },
  { id: 'en', name: 'English' },
]

export const I18nMessages: Record<string, Record<string, string>> = {
  zh: {
    Tip: '提示',
    Confirm: '确认',
    Cancel: '取消',
    Save: '保存',
    Delete: '删除',
    Edit: '编辑',
    Submit: '提交',
    Loading: '加载中...',
    NoMore: '没有更多了',
    NoData: '暂无数据',
    NetworkError: '网络错误，请稍后重试',
    OperationSuccess: '操作成功',
    OperationFailed: '操作失败',
    LoginRequired: '需要登录后才能操作',
    Login: '登录',
    Logout: '退出登录',
  },
  en: {
    Tip: 'Tip',
    Confirm: 'Confirm',
    Cancel: 'Cancel',
    Save: 'Save',
    Delete: 'Delete',
    Edit: 'Edit',
    Submit: 'Submit',
    Loading: 'Loading...',
    NoMore: 'No more',
    NoData: 'No data',
    NetworkError: 'Network error, please try again',
    OperationSuccess: 'Success',
    OperationFailed: 'Failed',
    LoginRequired: 'Login required',
    Login: 'Login',
    Logout: 'Logout',
  },
}
