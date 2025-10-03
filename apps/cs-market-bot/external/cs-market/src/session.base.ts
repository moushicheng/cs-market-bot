import { getRedisClient } from "./infra/redis/redis"

enum SessionType {
  WaitingChoiceSkinId = 'waiting_choice_skin_id',
}
// 基础会话信息
interface BaseSession {
  /** 用户ID */
  userId: string
  /** 频道ID */
  channelId: string
  /** 会话类型 */
  sessionType: SessionType
  /** 会话数据 */
  sessionContext:any
  /** 创建时间 */
  timestamp: number
}

export class Session {
  id: string
  /** 基础会话信息 */
  baseSession: BaseSession
  /** 会话类型 */
  sessionType: SessionType
  /** 会话数据 */
  sessionData: any
  /** 会话上下文 */
  sessionContext: any

  async init(id:string) {
    const redisClient =await getRedisClient();
    const session = await redisClient.get(`session:${id}`) as BaseSession;
    if(!session){
      throw new Error("Session not found.");
    }
      this.baseSession = session
      this.sessionType = session.sessionType
      this.sessionData = session.sessionContext
      this.sessionContext = session.sessionContext
      this.id = id
    return this;
   
  }

  createSession(baseSession: BaseSession,sessionType: SessionType,sessionData: any,sessionContext: any) {
    this.baseSession = baseSession
    this.sessionType = sessionType
    this.sessionData = sessionData
    this.sessionContext = sessionContext
    
    return this;
  }
}   