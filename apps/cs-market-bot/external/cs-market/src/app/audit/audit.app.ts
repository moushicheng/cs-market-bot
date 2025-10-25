import { Context, Session } from "koishi"
import * as cron from 'node-cron'
import dayjs from 'dayjs'
import { GroupAuditDomain } from "../../domain/group-audit/group-audit.domain"

export class AuditApp {
  private cronJob: cron.ScheduledTask | null = null
  private groupAuditDomain: GroupAuditDomain | null = null

  constructor() {
 
  }

  public async registerAudit(ctx: Context) {
    this.groupAuditDomain = await GroupAuditDomain.getInstance().init(ctx)
    
    // 注册定时收集群公告任务
    this.registerGroupNoticeCollector(ctx)
  }

  /**
   * 注册群公告收集定时任务
   * 每天凌晨4点执行一次
   */
  private registerGroupNoticeCollector(ctx: Context) {
    // 每天凌晨4点执行 (cron: 0 4 * * *)
    this.cronJob = cron.schedule('0 4 * * *', async () => {
      await this.collectAllGroupNotices(ctx)
    }, {
      timezone: 'Asia/Shanghai'
    })

    // 启动定时任务
    this.cronJob.start()

    ctx.logger('audit-app').info('群公告收集定时任务已启动，每天凌晨4点执行一次')

    // 立即执行一次收集（用于测试）
    setTimeout(() => {
      this.collectAllGroupNotices(ctx).catch(error => {
        ctx.logger('audit-app').error('初始群公告收集失败:', error)
    })
    }, 10000);

  }

  /**
   * 收集所有群聊的最近一个月群公告
   */
  private async collectAllGroupNotices(ctx: Context): Promise<void> {
    try {
      if (!this.groupAuditDomain) {
        ctx.logger('audit-app').error('GroupAuditDomain未初始化')
        return
      }

      ctx.logger('audit-app').info('开始收集群公告...')

      // 获取所有群聊列表
      await this.groupAuditDomain.init(ctx)
      const groups = await this.groupAuditDomain.getAllGroups()
      ctx.logger('audit-app').info(`找到 ${groups.length} 个群聊`)

      const oneMonthAgo = dayjs().subtract(3, 'month')

      let totalNotices = 0
      let processedGroups = 0

      // 遍历每个群聊收集公告
      for (const group of groups) {
        try {
          const notices = await this.groupAuditDomain.collectGroupNotice(group.group_id)
          
          // 过滤最近一个月的公告
          const recentNotices = notices.filter(notice => {
            const noticeTime = dayjs.unix(notice.publish_time)
            return noticeTime.isAfter(oneMonthAgo)
          })

          if (recentNotices.length > 0) {
            // 持久化到数据库
            await this.groupAuditDomain.saveGroupNotices(group.group_id, recentNotices)
          }

          totalNotices += recentNotices.length
          processedGroups++

          // 避免请求过于频繁，添加短暂延迟
          await new Promise(resolve => setTimeout(resolve, 100))

        } catch (error) {
          ctx.logger('audit-app').error(`收集群 ${group.group_name}(${group.group_id}) 公告失败:`, error)
        }
      }

      ctx.logger('audit-app').info(`群公告收集完成: 处理了 ${processedGroups} 个群聊，共收集到 ${totalNotices} 条最近3个月的公告`)

    } catch (error) {
      ctx.logger('audit-app').error('收集群公告时发生异常:', error)
    }
  }

  /**
   * 停止群公告收集定时任务
   */
  public stopCollectGroupNotice() {
    if (this.cronJob) {
      this.cronJob.stop()
      this.cronJob = null
    }
    console.log('[群公告收集] 定时任务已停止')
  }
}