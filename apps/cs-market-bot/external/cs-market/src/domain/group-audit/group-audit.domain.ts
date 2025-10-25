import { Context, Session } from "koishi"
import OneBotBot from "koishi-plugin-adapter-onebot"
import * as crypto from 'crypto'
import { GroupNoticeRepository, GroupNotice } from "./group-notice.repository"

export interface DuplicateNotice {
  content_hash: string
  count: number
  notices: {
    id: number
    group_id: string
    notice_id: string
    publish_time: number
    created_at: Date
  }[]
}

export interface DuplicateResult {
  totalNotices: number
  uniqueContent: number
  duplicateGroups: number
  duplicates: DuplicateNotice[]
}

export interface SaveResult {
  new: number
  updated: number
  duplicateById: number
  duplicateByContent: number
}

export class GroupAuditDomain {
  private static instance: GroupAuditDomain
  ctx:Context
  bot:OneBotBot<Context>
  private groupNoticeRepository: GroupNoticeRepository
  
  private constructor() {
  }
  public static getInstance(): GroupAuditDomain {
    if (!GroupAuditDomain.instance) {
      GroupAuditDomain.instance = new GroupAuditDomain()
    }
    return GroupAuditDomain.instance
  }
  public async init(ctx:Context){
    this.ctx=ctx
    this.bot=ctx.bots.find(item=>item.platform==='onebot') as OneBotBot<Context>
    this.groupNoticeRepository = new GroupNoticeRepository(ctx)

    // 初始化群公告数据表
    await this.groupNoticeRepository.initTable()
    return this
  }
  

 async getGroupNoticeBySession(session: Session){
    const onebotInstance=session.onebot
   if(onebotInstance && onebotInstance.group_id){
     const notices= await onebotInstance.getGroupNotice(onebotInstance.group_id)
   }
  }

  async collectGroupNotice(groupId:number){ 
    const notices= await this.bot.internal.getGroupNotice(groupId)
    return notices
  }

  async getAllGroups(){
    const groups= await this.bot.internal.getGroupList()
    return groups
  }


  /**
   * 查询重复的群公告
   * @param groupId 群ID，可选
   * @returns 重复公告统计信息
   */
  async getDuplicateNotices(groupId?: number): Promise<DuplicateResult> {
    const notices = await this.groupNoticeRepository.getAllNotices(groupId)
    
    // 按内容哈希分组，找出重复内容
    const contentHashGroups = new Map<string, GroupNotice[]>()
    notices.forEach(notice => {
      if (notice.content_hash) {
        if (!contentHashGroups.has(notice.content_hash)) {
          contentHashGroups.set(notice.content_hash, [])
        }
        contentHashGroups.get(notice.content_hash)!.push(notice)
      }
    })

    // 找出有重复的组
    const duplicates = Array.from(contentHashGroups.values())
      .filter(group => group.length > 1)
      .map(group => ({
        content_hash: group[0].content_hash,
        count: group.length,
        notices: group.map(n => ({
          id: n.id!,
          group_id: n.group_id,
          notice_id: n.notice_id,
          publish_time: n.publish_time,
          created_at: n.created_at!
        }))
      }))

    return {
      totalNotices: notices.length,
      uniqueContent: contentHashGroups.size,
      duplicateGroups: duplicates.length,
      duplicates: duplicates
    }
  }

  /**
   * 清理重复的群公告（保留最新的）
   * @param groupId 群ID，可选
   * @returns 清理结果
   */
  async cleanDuplicateNotices(groupId?: number): Promise<{ cleanedCount: number; remainingDuplicates: number }> {
    const duplicateInfo = await this.getDuplicateNotices(groupId)
    
    let cleanedCount = 0
    const idsToDelete: number[] = []

    for (const duplicate of duplicateInfo.duplicates) {
      // 按发布时间排序，保留最新的
      const sortedNotices = duplicate.notices.sort((a, b) => b.publish_time - a.publish_time)
      
      // 删除除了最新之外的所有记录
      const toDelete = sortedNotices.slice(1)
      idsToDelete.push(...toDelete.map(n => n.id))
      cleanedCount += toDelete.length
    }

    if (idsToDelete.length > 0) {
      await this.groupNoticeRepository.deleteNotices(idsToDelete)
    }

    return {
      cleanedCount,
      remainingDuplicates: duplicateInfo.duplicateGroups - cleanedCount
    }
  }

  /**
   * 智能去重保存群公告
   * 1. 基于 notice_id 全局去重
   * 2. 基于内容哈希检测重复内容
   * 3. 批量处理，减少数据库查询
   */
  async saveGroupNotices(groupId: number, notices: any[]): Promise<SaveResult> {
    if (!Array.isArray(notices) || notices.length === 0) {
      return { new: 0, updated: 0, duplicateById: 0, duplicateByContent: 0 }
    }

    const groupIdStr = String(groupId)
    const now = new Date()

    // 1. 查询数据库中已存在的公告（基于 notice_id 全局查询）
    const noticeIds = notices.map(notice => String(notice.notice_id))
    const existingNotices = await this.groupNoticeRepository.getNoticesByNoticeIds(noticeIds)

    // 创建已存在公告的映射
    const existingNoticeMap = new Map<string, GroupNotice>()
    const existingContentHashSet = new Set<string>()
    
    existingNotices.forEach(notice => {
      existingNoticeMap.set(notice.notice_id, notice)
      if (notice.content_hash) {
        existingContentHashSet.add(notice.content_hash)
      }
    })

    // 2. 处理新公告，进行去重
    const newNotices: Omit<GroupNotice, 'id'>[] = []
    const updatedNotices: GroupNotice[] = []
    let duplicateCount = 0
    let contentDuplicateCount = 0

    for (const notice of notices) {
      // 使用仓库层方法预处理公告数据
      const processedNotice = this.groupNoticeRepository.preprocessNoticeData(notice, groupIdStr)
      const noticeId = processedNotice.notice_id
      const contentHash = processedNotice.content_hash
      
      // 检查是否已存在相同的 notice_id
      if (existingNoticeMap.has(noticeId)) {
        const existingNotice = existingNoticeMap.get(noticeId)!
        
        // 检查内容是否有变化
        if (existingNotice.content_hash !== contentHash) {
          updatedNotices.push({
            ...processedNotice,
            id: existingNotice.id,
            updated_at: now
          })
        } else {
          duplicateCount++
        }
      } 
      // 检查是否有相同内容的公告（不同 notice_id）
      else if (existingContentHashSet.has(contentHash)) {
        contentDuplicateCount++
        this.ctx.logger('group-audit').warn(`发现重复内容公告: group_id=${groupIdStr}, notice_id=${noticeId}`)
      } 
      // 全新的公告
      else {
        newNotices.push({
          ...processedNotice,
          created_at: now,
          updated_at: now
        })
      }
    }

    // 3. 批量保存新公告
    if (newNotices.length > 0) {
      await this.groupNoticeRepository.createNotices(newNotices)
    }

    // 4. 批量更新有变化的公告
    if (updatedNotices.length > 0) {
      await this.groupNoticeRepository.updateNotices(updatedNotices)
    }

    // 5. 记录统计信息
    this.ctx.logger('group-audit').info(
      `群公告保存完成: 群ID=${groupIdStr}, 新增=${newNotices.length}, 更新=${updatedNotices.length}, ` +
      `ID重复=${duplicateCount}, 内容重复=${contentDuplicateCount}`
    )

    return {
      new: newNotices.length,
      updated: updatedNotices.length,
      duplicateById: duplicateCount,
      duplicateByContent: contentDuplicateCount
    }
  }
} 