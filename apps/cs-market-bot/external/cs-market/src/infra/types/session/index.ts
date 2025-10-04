/**
 * Koishi Session 类型定义
 * 基于提供的 session 对象结构
 */

// 导入并重新导出 matcher 类型
import type { MatchPattern, MatchContext, MatchResult } from "../matcher"
export type { MatchPattern, MatchContext, MatchResult }

// 用户信息
export interface User {
  id: string
  name: string
  userId: string
  avatar: string
  username: string
}

// 群成员信息
export interface Member {
  user: User
  nick: string
  roles: (string | null)[]
}

// 频道信息
export interface Channel {
  id: string
  type: number
}

// OneBot 原始数据
export interface OneBotRawData {
  self_id: number
  user_id: number
  time: number
  message_id: number
  message_seq: number
  real_id: number
  real_seq: string
  message_type: string
  sender: {
    user_id: number
    nickname: string
    card: string
  }
  raw_message: string
  font: number
  sub_type: string
  message: Array<{
    type: string
    data: {
      text: string
    }
  }>
  message_format: string
  post_type: string
  target_id: number
}

// 消息信息
export interface Message {
  messageId: string
  id: string
  content: string
}

// 登录信息
export interface Login {
  sn: number
  user: User
  platform: string
  selfId: string
  status: number
  hidden: boolean
  features: string[]
  adapter: string
}

// 命令信息
export interface Command {
  name: string
  description: Record<string, any>
  arguments: Array<{
    name: string
    type: string
    description: Record<string, string>
    required: boolean
  }>
  options: Array<{
    name: string
    type: string
    description: Record<string, any>
  }>
  children: any[]
}

// 会话信息
export interface SessionData {
  selfId: string
  platform: string
  timestamp: number
  type: string
  message: Message
  user: User
  member: Member
  channel: Channel
  subtype: string
  subsubtype: string
  _type: string
  _data: OneBotRawData
  sn: number
  login: Login
  id: number
}

// 完整的 Koishi Session 对象
export interface KoishiSession {
  rest: string
  source: string
  root: boolean
  session: SessionData
  command: Command
  args: any[]
  options: Record<string, any>
  error: string
}

// 会话类型枚举
export enum SessionType {
  WaitingChoiceSkinId = 'waiting_choice_skin_id',
  WaitingSearchKeyword = 'waiting_search_keyword',
  WaitingPriceInput = 'waiting_price_input',
  WaitingConfirmTrade = 'waiting_confirm_trade',
  WaitingUserResponse = 'waiting_user_response'
}

// 基础会话钩子接口
export interface BaseSessionHook {
  /** 会话类型 */
  sessionType: SessionType
  /** 会话数据 */
  sessionData: any
  /** 会话上下文 */
  sessionContext: any
  /** 事件类型 */
  eventType: string
  /** 匹配模式 */
  matchPattern: MatchPattern
}

// 扩展的匹配上下文，包含 Koishi 特定的字段
export interface KoishiMatchContext {
  session: KoishiSession
  user: User
  channel: Channel
  message: Message
  command?: Command
}

// 扩展的会话钩子接口（用于实际业务）
export interface ExtendedBaseSessionHook extends BaseSessionHook {
  /** 用户ID */
  userId: string
  /** 渠道ID */
  channelId: string
  /** 时间戳 */
  timestamp: number
}
