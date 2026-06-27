import { Api } from './api'

export const LogRemoteUtil = {
  post(label: string, content?: Record<string, any>) {
    content = content || {}
    Api.post(
      'log_remote/post',
      {
        data: JSON.stringify({
          label,
          content,
        }),
      },
      () => {},
      () => {},
      {
        silent: true,
      }
    )
  },
}
