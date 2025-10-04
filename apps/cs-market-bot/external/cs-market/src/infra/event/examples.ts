/**
 * 事件总线使用示例
 */

import { eventBus, BaseEvent } from './index'

// 定义一些具体的事件类型
export interface UserLoginEvent extends BaseEvent {
  type: 'user.login'
  data: {
    userId: string
    username: string
    loginTime: number
  }
}

export interface MarketSearchEvent extends BaseEvent {
  type: 'market.search'
  data: {
    keyword: string
    userId: string
    timestamp: number
  }
}

export interface PriceUpdateEvent extends BaseEvent {
  type: 'price.update'
  data: {
    itemId: string
    oldPrice: number
    newPrice: number
    changePercent: number
  }
}

/**
 * 事件处理器示例
 */
export class EventHandlers {
  /**
   * 用户登录事件处理器
   */
  static handleUserLogin(event: UserLoginEvent) {
    console.log(`用户 ${event.data.username} 登录了，用户ID: ${event.data.userId}`)
    // 这里可以添加登录日志、统计等功能
  }

  /**
   * 市场搜索事件处理器
   */
  static handleMarketSearch(event: MarketSearchEvent) {
    console.log(`用户 ${event.data.userId} 搜索了: ${event.data.keyword}`)
    // 这里可以添加搜索统计、推荐等功能
  }

  /**
   * 价格更新事件处理器
   */
  static handlePriceUpdate(event: PriceUpdateEvent) {
    const { itemId, oldPrice, newPrice, changePercent } = event.data
    console.log(`商品 ${itemId} 价格更新: ${oldPrice} -> ${newPrice} (${changePercent > 0 ? '+' : ''}${changePercent}%)`)
    // 这里可以添加价格监控、通知等功能
  }
}

/**
 * 初始化事件监听器
 */
export function initializeEventHandlers() {
  // 注册事件监听器
  eventBus.on('user.login', EventHandlers.handleUserLogin)
  eventBus.on('market.search', EventHandlers.handleMarketSearch)
  eventBus.on('price.update', EventHandlers.handlePriceUpdate)

  console.log('事件处理器已初始化')
}

/**
 * 发布事件示例
 */
export function publishExampleEvents() {
  // 发布用户登录事件
  eventBus.emit('user.login', {
    userId: '12345',
    username: 'testuser',
    loginTime: Date.now()
  })

  // 发布市场搜索事件
  eventBus.emit('market.search', {
    keyword: 'AK-47 红线',
    userId: '12345',
    timestamp: Date.now()
  })

  // 发布价格更新事件
  eventBus.emit('price.update', {
    itemId: 'ak47-redline',
    oldPrice: 100,
    newPrice: 105,
    changePercent: 5
  })
}
