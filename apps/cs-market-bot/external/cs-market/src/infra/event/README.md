# 简单事件总线

基于 Node.js EventEmitter 的轻量级事件总线实现。

## 特性

- 🚀 基于 Node.js 原生 EventEmitter，性能优异
- 📦 轻量级，无额外依赖
- 🔧 TypeScript 支持
- 🎯 单例模式，全局可用
- 📊 内置统计功能

## 使用方法

### 1. 导入事件总线

```typescript
import { eventBus } from './domain/event'
```

### 2. 发布事件

```typescript
// 发布简单事件
eventBus.emit('user.login', {
  userId: '12345',
  username: 'testuser',
  loginTime: Date.now()
})

// 发布带数据的事件
eventBus.emit('market.search', {
  keyword: 'AK-47 红线',
  userId: '12345',
  timestamp: Date.now()
})
```

### 3. 订阅事件

```typescript
// 订阅事件
eventBus.on('user.login', (event) => {
  console.log(`用户 ${event.data.username} 登录了`)
})

// 一次性订阅
eventBus.once('price.update', (event) => {
  console.log('价格更新了:', event.data)
})

// 取消订阅
eventBus.off('user.login', handler)
```

### 4. 获取统计信息

```typescript
const stats = eventBus.getStats()
console.log('总监听器数量:', stats.totalListeners)
console.log('事件类型:', stats.eventTypes)
console.log('各类型监听器数量:', stats.listenersByType)
```

## 事件类型定义

```typescript
export interface BaseEvent {
  type: string
  data?: any
  timestamp?: number
  source?: string
}

// 自定义事件类型
export interface UserLoginEvent extends BaseEvent {
  type: 'user.login'
  data: {
    userId: string
    username: string
    loginTime: number
  }
}
```

## 在 Koishi 中使用

```typescript
import { eventBus } from './domain/event'

export function apply(ctx: Context) {
  // 订阅事件
  eventBus.on('market.search', (event) => {
    console.log('用户搜索了:', event.data.keyword)
  })

  // 在命令中发布事件
  ctx.command('search <keyword>')
    .action(async (session) => {
      eventBus.emit('market.search', {
        keyword: session.args[0],
        userId: 'unknown',
        timestamp: Date.now()
      })
      return '搜索完成'
    })
}
```

## 管理命令

添加了 `event` 命令来管理事件总线：

- `event stats` - 查看事件总线统计信息
- `event test` - 发布测试事件

## 注意事项

1. 事件总线是单例模式，全局共享
2. 事件处理器中的错误不会影响其他处理器
3. 建议为事件类型定义明确的接口
4. 避免在事件处理器中执行耗时操作
