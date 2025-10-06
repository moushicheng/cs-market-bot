import 'reflect-metadata'
import { Context } from 'koishi'
import { SearchApp } from './app/search'
import { SessionManagerApp } from './app/session-manager'
export const name = 'example'
// 不知道为什么导入之后可以强行让bot.onebot不报错
import type {  } from 'koishi-plugin-adapter-onebot'

export function apply(ctx: Context) {

  // 注册应用层服务
  const sessionManagerApp = new SessionManagerApp()
  sessionManagerApp.registerMessageHandler(ctx)

  const searchApp = new SearchApp()
  searchApp.registerSearchCommand(ctx)
  

}