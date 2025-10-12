import { Context } from 'koishi'
import * as cron from 'node-cron'
import { SourceDomain } from '../../domain/source/source.domain'

/**
 * IP绑定应用
 * 负责定期调用CSQAQ SDK的bindLocalIp方法来绑定本机IP
 */
export class IpApp {
  private cronJob: cron.ScheduledTask | null = null

  constructor() {

  }

  /**
   * 注册IP绑定定时任务
   * 每1分钟执行一次IP绑定
   */
  registerIpBinding(ctx: Context) {
    // 每1分钟执行一次 (cron: * * * * *)
    this.cronJob = cron.schedule('* * * * *', async () => {
      await this.bindIp()
    }, {
      timezone: 'Asia/Shanghai'
    })

    // 启动定时任务
    this.cronJob.start()

    ctx.logger('ip-app').info('IP绑定定时任务已启动，每1分钟执行一次')

    // 立即执行一次绑定
    this.bindIp().catch(error => {
      ctx.logger('ip-app').error('初始IP绑定失败:', error)
    })
  }

  /**
   * 执行IP绑定
   */
  private async bindIp(): Promise<void> {
    try {
      const result = await SourceDomain.getInstance().bindLocalIp()
      
      if (result) {
        console.log(`[IP绑定] 成功 - ${new Date().toLocaleString()}: ${result}`)
      } else {
        console.error(`[IP绑定] 失败 - ${new Date().toLocaleString()}: ${result}`)
      }
    } catch (error) {
      console.error(`[IP绑定] 异常 - ${new Date().toLocaleString()}:`, error)
    }
  }

  /**
   * 停止IP绑定定时任务
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop()
      this.cronJob = null
    }
    console.log('[IP绑定] 定时任务已停止')
  }
}
