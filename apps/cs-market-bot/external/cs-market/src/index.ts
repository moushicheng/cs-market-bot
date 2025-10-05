import 'reflect-metadata'
import { Context } from 'koishi'
import { SearchApp } from './app/search'
import { SessionManagerApp } from './app/session-manager'
export const name = 'example'
export function apply(ctx: Context) {

  // 注册应用层服务
  const sessionManagerApp = new SessionManagerApp()
  sessionManagerApp.registerMessageHandler(ctx)

  const searchApp = new SearchApp()
  searchApp.registerSearchCommand(ctx)
}