import { Context } from 'koishi'
import { CSQAQClient } from '@qq/csqaq-sdk'
import { getRedisClient } from './infra/redis/redis'
import { SearchApp } from './app/search'
import { SessionManagerApp } from './app/session-manager'
export const name = 'example'
const token = process.env.CSQAQ_TOKEN
const client = new CSQAQClient({
  token,
})
export function apply(ctx: Context) {

  // 注册应用层服务
  const sessionManagerApp = new SessionManagerApp()
  sessionManagerApp.registerMessageHandler(ctx)

  const searchApp = new SearchApp()
  searchApp.registerSearchCommand(ctx)
}