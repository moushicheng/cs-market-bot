import { Context } from "koishi"
import * as crypto from "crypto"

export interface GroupNotice {
  id?: number
  group_id: string
  notice_id: string
  message: string
  publish_time: number
  content_hash: string
  created_at?: Date
  updated_at?: Date
}

export class GroupNoticeRepository {
  private ctx: Context

  constructor(ctx: Context) {
    this.ctx = ctx
  }

  /**
   * 初始化群公告数据表
   */
  async initTable() {
    this.ctx.model.extend('group_notice', {
      id: 'unsigned',
      group_id: 'string',
      notice_id: 'string',
      message: 'text',
      publish_time: 'unsigned',
      content_hash: 'string',
      created_at: 'timestamp',
      updated_at: 'timestamp',
    }, {
      primary: 'id',
      autoInc: true,
      unique: ['notice_id']
    })
  }

  /**
   * 根据群ID查询群公告
   */
  async getNoticesByGroupId(groupId: number): Promise<GroupNotice[]> {
    return await this.ctx.database.get('group_notice', {
      group_id: String(groupId)
    })
  }

  /**
   * 根据 notice_id 查询群公告
   */
  async getNoticesByNoticeIds(noticeIds: string[]): Promise<GroupNotice[]> {
    return await this.ctx.database.get('group_notice', {
      notice_id: noticeIds
    })
  }

  /**
   * 查询所有群公告
   */
  async getAllNotices(groupId?: number): Promise<GroupNotice[]> {
    const query: any = {}
    if (groupId) {
      query.group_id = String(groupId)
    }
    return await this.ctx.database.get('group_notice', query)
  }

  /**
   * 创建群公告（批量）
   */
  async createNotices(notices: Omit<GroupNotice, 'id'>[]): Promise<void> {
    // Minato 的 create 方法不支持批量创建，需要逐个创建
    for (const notice of notices) {
      await this.ctx.database.create('group_notice', notice as any)
    }
  }

  /**
   * 更新群公告
   */
  async updateNotices(notices: GroupNotice[]): Promise<void> {
    await this.ctx.database.upsert('group_notice', notices as any, ['id'])
  }

  /**
   * 删除群公告（批量）
   */
  async deleteNotices(ids: number[]): Promise<void> {
    if (ids.length === 0) return
    await this.ctx.database.remove('group_notice', {
      id: { $in: ids }
    })
  }

  /**
   * 根据内容哈希查询群公告
   */
  async getNoticesByContentHash(contentHash: string): Promise<GroupNotice[]> {
    return await this.ctx.database.get('group_notice', {
      content_hash: contentHash
    })
  }

  /**
   * 生成内容哈希，用于检测重复内容
   */
  generateContentHash(message: any): string {
    const messageStr = JSON.stringify(message || {})
    return crypto.createHash('md5').update(messageStr).digest('hex')
  }

  /**
   * 预处理公告数据，生成 content_hash
   */
  preprocessNoticeData(notice: any, groupId: string): Omit<GroupNotice, 'id'> {
    const noticeId = String(notice.notice_id)
    const messageStr = JSON.stringify(notice.message || {})
    const contentHash = this.generateContentHash(notice.message)
    
    return {
      group_id: groupId,
      notice_id: noticeId,
      message: messageStr,
      publish_time: Number(notice.publish_time ?? 0),
      content_hash: contentHash,
      created_at: new Date(),
      updated_at: new Date()
    }
  }
}
