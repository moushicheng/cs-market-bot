import 'reflect-metadata'
import { Context } from 'koishi'
import { SearchApp } from './app/search'
import { SessionManagerApp } from './app/session-manager'
import { AuditApp } from './app/audit/audit.app'
import { IpApp } from './app/ip/ip.app'
import { ContextKey, ContextRegistry } from './infra/context/context'

// 不知道为什么导入之后可以强行让bot.onebot不报错
import type {  } from 'koishi-plugin-adapter-onebot'

export function apply(ctx: Context) {
  
  ContextRegistry.getInstance().set(ContextKey.Ctx,ctx)
  // 注册应用层服务
  const sessionManagerApp = new SessionManagerApp()
  sessionManagerApp.registerMessageHandler(ctx)

  const auditApp = new AuditApp()
  auditApp.registerAudit(ctx)

  const searchApp = new SearchApp()
  searchApp.registerSearchCommand(ctx)

  // 注册IP绑定应用
  const ipApp = new IpApp()
  ipApp.registerIpBinding(ctx)

}
export const name = 'example'