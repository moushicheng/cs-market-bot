/**
 * Session 类型使用示例
 */

import { SessionHookManager } from './session.domain'
import { 
  SessionType, 
  KoishiSession
} from '../../infra/types/session'
import type { ExtendedBaseSessionHook } from '../../infra/types/session'
import { MatchPattern } from '../../infra/types/matcher'

// 示例：创建一个等待用户选择皮肤ID的会话
export async function createSkinSelectionSession(koishiSession: KoishiSession) {
  const sessionManager = SessionHookManager.getInstance()
  
  // 定义匹配模式：当用户发送数字时匹配
  const matchPattern: MatchPattern = {
    conditions: [
      {
        type: 'field',
        field: 'session.message.content',
        operator: 'regex',
        value: '^\\d+$' // 匹配纯数字
      }
    ],
    logic: 'AND',
    priority: 1,
    enabled: true,
    name: 'skin_id_input',
    description: '匹配用户输入的皮肤ID'
  }
  
  // 创建会话参数
  const sessionParams: ExtendedBaseSessionHook = {
    userId: koishiSession.session.user.id,
    channelId: koishiSession.session.channel.id,
    sessionType: SessionType.WaitingChoiceSkinId,
    sessionData: {
      searchKeyword: 'AK-47',
      availableSkins: ['123', '456', '789']
    },
    sessionContext: {
      originalMessage: koishiSession.session.message.content,
      userInfo: koishiSession.session.user
    },
    eventType: 'message-created',
    matchPattern: matchPattern,
    timestamp: Date.now()
  }
  
  // 创建会话
  const session = await sessionManager.createSession(sessionParams)
  
  console.log(`创建会话成功，ID: ${session.id}`)
  return session
}

// 示例：创建一个等待搜索关键词的会话
export async function createSearchSession(koishiSession: KoishiSession) {
  const sessionManager = SessionHookManager.getInstance()
  
  // 定义匹配模式：当用户发送非空消息时匹配
  const matchPattern: MatchPattern = {
    conditions: [
      {
        type: 'field',
        field: 'session.message.content',
        operator: 'notEquals',
        value: ''
      },
      {
        type: 'field',
        field: 'session.message.content',
        operator: 'notEquals',
        value: '/search'
      }
    ],
    logic: 'AND',
    priority: 2,
    enabled: true,
    name: 'search_keyword_input',
    description: '匹配用户输入的搜索关键词'
  }
  
  const sessionParams: ExtendedBaseSessionHook = {
    userId: koishiSession.session.user.id,
    channelId: koishiSession.session.channel.id,
    sessionType: SessionType.WaitingSearchKeyword,
    sessionData: {
      searchType: 'weapon',
      filters: {}
    },
    sessionContext: {
      originalCommand: koishiSession.command?.name,
      userPreferences: {}
    },
    eventType: 'message-created',
    matchPattern: matchPattern,
    timestamp: Date.now()
  }
  
  const session = await sessionManager.createSession(sessionParams)
  console.log(`创建搜索会话成功，ID: ${session.id}`)
  return session
}

// 示例：检查并处理会话
export async function handleSession(koishiSession: KoishiSession) {
  const sessionManager = SessionHookManager.getInstance()
  
  // 检查是否有匹配的会话
  const matchingSessions = await sessionManager.findMatchingSessions(koishiSession)
  
  if (matchingSessions.length > 0) {
    const session = matchingSessions[0] // 获取优先级最高的会话
    
    console.log(`找到匹配的会话: ${session.id}, 类型: ${session.sessionType}`)
    
    // 根据会话类型处理
    switch (session.sessionType) {
      case SessionType.WaitingChoiceSkinId:
        const skinId = koishiSession.session.message.content
        console.log(`用户选择了皮肤ID: ${skinId}`)
        // 处理皮肤选择逻辑
        await sessionManager.removeSession(session.id)
        break
        
      case SessionType.WaitingSearchKeyword:
        const keyword = koishiSession.session.message.content
        console.log(`用户输入了搜索关键词: ${keyword}`)
        // 处理搜索逻辑
        await sessionManager.removeSession(session.id)
        break
        
      default:
        console.log(`未知的会话类型: ${session.sessionType}`)
    }
  } else {
    console.log('没有找到匹配的会话')
  }
}
