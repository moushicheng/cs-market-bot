# Session 类型定义

这个模块提供了完整的 Koishi Session 类型定义和会话管理系统。

## 文件结构

- `session.types.ts` - 核心类型定义
- `session.domain.ts` - 会话管理逻辑
- `session.example.ts` - 使用示例
- `README.md` - 说明文档

## 核心类型

### KoishiSession
完整的 Koishi 会话对象，包含：
- `session` - 会话数据（用户、消息、频道等）
- `command` - 命令信息
- `args` - 命令参数
- `options` - 命令选项

### SessionType
会话类型枚举：
- `WaitingChoiceSkinId` - 等待用户选择皮肤ID
- `WaitingSearchKeyword` - 等待搜索关键词
- `WaitingPriceInput` - 等待价格输入
- `WaitingConfirmTrade` - 等待交易确认
- `WaitingUserResponse` - 等待用户响应

### BaseSessionHook
基础会话钩子接口：
- `sessionType` - 会话类型
- `sessionData` - 会话数据
- `sessionContext` - 会话上下文
- `eventType` - 事件类型
- `matchPattern` - 匹配模式

### ExtendedBaseSessionHook
扩展的会话钩子接口，继承自 `BaseSessionHook` 并添加：
- `userId` - 用户ID
- `channelId` - 频道ID
- `timestamp` - 创建时间戳

## 使用方法

### 1. 创建会话

```typescript
import { SessionHookManager } from './session.domain'
import { SessionType, ExtendedBaseSessionHook } from './session.types'

const sessionManager = SessionHookManager.getInstance()

const sessionParams: ExtendedBaseSessionHook = {
  userId: '123456',
  channelId: 'private:123456',
  sessionType: SessionType.WaitingChoiceSkinId,
  sessionData: { searchKeyword: 'AK-47' },
  sessionContext: { originalMessage: '搜索' },
  eventType: 'message-created',
  matchPattern: {
    conditions: [{
      type: 'field',
      field: 'session.message.content',
      operator: 'regex',
      value: '^\\d+$'
    }],
    logic: 'AND',
    priority: 1
  },
  timestamp: Date.now()
}

const session = await sessionManager.createSession(sessionParams)
```

### 2. 检查会话

```typescript
// 检查是否有匹配的会话
const matchingSessions = await sessionManager.checkSessions(koishiSession)

if (matchingSessions.length > 0) {
  const session = matchingSessions[0]
  // 处理匹配的会话
}
```

### 3. 移除会话

```typescript
await sessionManager.removeSession(sessionId)
```

## 匹配模式

使用 `MatchPattern` 定义会话的匹配条件：

```typescript
const matchPattern: MatchPattern = {
  conditions: [
    {
      type: 'field',
      field: 'session.message.content',
      operator: 'equals',
      value: '确认'
    }
  ],
  logic: 'AND',
  priority: 1,
  enabled: true,
  name: 'confirm_trade',
  description: '匹配用户确认交易'
}
```

### 支持的匹配条件类型

- `field` - 字段匹配
- `custom` - 自定义匹配
- `timeRange` - 时间范围匹配

### 支持的运算符

- `equals` / `notEquals` - 等于/不等于
- `contains` / `startsWith` / `endsWith` - 包含/开始/结束
- `regex` - 正则表达式
- `in` / `notIn` - 在/不在列表中
- `gt` / `gte` / `lt` / `lte` - 大于/大于等于/小于/小于等于
- `exists` / `notExists` - 存在/不存在

## 示例

查看 `session.example.ts` 文件获取完整的使用示例。

## 注意事项

1. 会话会自动过期（默认60秒）
2. 匹配模式按优先级排序，数字越小优先级越高
3. 会话数据存储在 Redis 中
4. 支持多个会话同时存在，按优先级处理
