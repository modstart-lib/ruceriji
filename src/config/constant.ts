// This file is created by -> php tools.php DumpConstant

export const ResponseCodes: Record<string, number> = {
  API_TOKEN_EMPTY: 1000,
  LOGIN_REQUIRED: 1001,
  CAPTCHA_ERROR: 1002,
  PERMIT_DENIED: 1003,
  DEFAULT_ERROR: -1,
}

export interface ConstantItem {
  key: string
  value: number | string
  name: string
}

export const MemberMessageStatus: Record<string, ConstantItem> = {
  UNREAD: {
    key: 'UNREAD',
    value: 1,
    name: '未读',
  },
  READ: {
    key: 'READ',
    value: 2,
    name: '已读',
  },
}

export const RucerijiShowStatus: Record<string, ConstantItem> = {
  FINISHED: {
    key: 'FINISHED',
    value: 1,
    name: '已完结',
  },
  SERIAL: {
    key: 'SERIAL',
    value: 2,
    name: '连载中',
  },
}
