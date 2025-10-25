class GroupAuditEntity {
  id: number
  group_id: number
  notice_id: number
  notice_content: string
  notice_time: Date
  notice_type: string
  notice_status: string
  notice_sender: string
  notice_receiver: string
  notice_content_hash: string
}