import { createId } from "../../infra/id-generator/id-generator"
import { getRedisClient, getRedisJson, setRedisJson } from "../../infra/redis/redis"
import { Matcher } from "./matcher"
import { MatchPattern, MatchContext, MatchResult } from "./matcher.types"

enum SessionType {
  WaitingChoiceSkinId = 'waiting_choice_skin_id',
}
// 基础会话信息
interface BaseSessionHook {
  /** 用户ID */
  userId: string
  /** 渠道ID */
  channelId: string
  /** 会话类型 */
  sessionType: SessionType
  /** 会话数据 */
  sessionContext: any
  /** 创建时间 */
  timestamp: number
  /** 事件类型 */
  eventType: string
}

type SessionHookCreateParams = {
  baseSession: BaseSessionHook
  sessionType: SessionType
  sessionData: any
  sessionContext: any
  eventType: string
  matchPattern: MatchPattern
}

// 会话存储结构
interface StoredSession {
  id: string
  sessionType: SessionType
  eventType: string
  matchPattern: MatchPattern
  createdAt: number
}

export class SessionHook {
  id: string
  /** 基础会话信息 */
  baseSession: BaseSessionHook
  /** 会话类型 */
  sessionType: SessionType
  /** 事件类型 */
  eventType: string
  /** 匹配模式 */
  matchPattern: MatchPattern
  /** 会话数据 */
  sessionData: any
  /** 会话上下文 */
  sessionContext: any

  async init(id: string) {
    const redisClient = await getRedisClient();
    const session = await redisClient.get(`session:${id}`) as BaseSessionHook;
    if (!session) {
      throw new Error("Session not found.");
    }
    this.baseSession = session
    this.sessionType = session.sessionType
    this.sessionData = session.sessionContext
    this.sessionContext = session.sessionContext
    this.eventType = session.eventType
    this.id = id
    return this;
  }

  async create(params: SessionHookCreateParams) {
    this.baseSession = params.baseSession  
    this.sessionType = params.sessionType
    this.sessionData = params.sessionData
    this.sessionContext = params.sessionContext
    this.eventType = params.eventType
    this.matchPattern = params.matchPattern
    this.id = createId()

    await setRedisJson(`session:${this.id}`, this.baseSession)
    
    return this;
  }

  /**
   * 检查是否匹配当前上下文
   */
  async checkMatch(context: MatchContext): Promise<MatchResult> {
    const matcher = new Matcher()
    matcher.addPattern(this.matchPattern)
    const results = matcher.match(context)
    return results[0] || { matched: false }
  }
}   


export class SessionHookManager {
  private static instance: SessionHookManager
  private matcher: Matcher

  private constructor() {
    this.matcher = new Matcher()
  }

  static getInstance(): SessionHookManager {
    if (!SessionHookManager.instance) {
      SessionHookManager.instance = new SessionHookManager()
    }
    return SessionHookManager.instance
  }

  async createSession(params: SessionHookCreateParams) {
    const session = new SessionHook()
    await session.create(params)

    // 将匹配模式添加到全局匹配器
    this.matcher.addPattern(params.matchPattern)

    // 保存会话到Redis
    const sessions = await getRedisJson(`sessions`) || {}
    sessions[session.id] = {
      id: session.id,
      sessionType: session.sessionType,
      eventType: session.eventType,
      matchPattern: session.matchPattern,
      createdAt: Date.now()
    }
    await setRedisJson(`sessions`, sessions)
    
    return session
  }

  /**
   * 根据上下文查找匹配的会话
   */
  async findMatchingSessions(context: MatchContext): Promise<SessionHook[]> {
    const sessions = await getRedisJson(`sessions`) || {}
    const matchingSessions: SessionHook[] = []

    for (const [sessionId, sessionData] of Object.entries(sessions)) {
      try {
        const storedSession = sessionData as StoredSession
        
        // 先检查匹配模式是否匹配，避免不必要的初始化
        if (storedSession.matchPattern) {
          const matcher = new Matcher()
          matcher.addPattern(storedSession.matchPattern)
          const results = matcher.match(context)
          
          if (results.length > 0 && results[0].matched) {
            // 只有匹配成功才初始化会话
            const session = new SessionHook()
            await session.init(sessionId)
            matchingSessions.push(session)
          }
        }
      } catch (error) {
        console.warn(`Failed to check session ${sessionId}:`, error)
      }
    }

    // 按优先级排序
    return matchingSessions.sort((a, b) => 
      (a.matchPattern.priority || 999) - (b.matchPattern.priority || 999)
    )
  }

  /**
   * 移除会话
   */
  async removeSession(sessionId: string): Promise<void> {
    const sessions = await getRedisJson(`sessions`) || {}
    if (sessions[sessionId]) {
      delete sessions[sessionId]
      await setRedisJson(`sessions`, sessions)
    }
    
    // 从Redis删除会话数据
    const redisClient = await getRedisClient()
    await redisClient.del(`session:${sessionId}`)
  }

  /**
   * 获取所有活跃会话
   */
  async getAllSessions(): Promise<Record<string, any>> {
    return await getRedisJson(`sessions`) || {}
  }
}