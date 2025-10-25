import 'koishi'

declare module 'koishi' {
  interface Tables {
    group_notice: {
      id?: number
      group_id: string
      notice_id: string
      message: string
      publish_time: number
      content_hash: string
      created_at?: Date
      updated_at?: Date
    }
  }
}


