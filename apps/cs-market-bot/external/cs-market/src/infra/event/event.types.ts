/**
 * 基础事件接口
 */
export interface BaseEvent<T = any> {
  type: string
  data?: T
  timestamp?: number
  source?: string
}

/**
 * 事件处理器函数类型
 */
export type EventHandler<T = any> = (event: T) => void | Promise<void>

/**
 * 事件总线接口
 */
export interface EventBus {
  emit<T = any>(eventType: string, data?: T): boolean
  on<T = any>(eventType: string, handler: EventHandler<T>): void
  off<T = any>(eventType: string, handler: EventHandler<T>): void
  once<T = any>(eventType: string, handler: EventHandler<T>): void
  removeAllListeners(eventType?: string): void
  listenerCount(eventType: string): number
  listeners(eventType: string): EventHandler[]
}
