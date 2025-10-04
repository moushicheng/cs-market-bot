# 通用匹配器系统

这是一个通用的匹配器系统，用于在会话管理中实现灵活的匹配逻辑。

## 核心特性

- **通用字段匹配**: 支持任意字段的匹配，使用点号语法访问嵌套字段
- **自定义匹配器**: 支持注册业务特定的匹配逻辑
- **灵活的操作符**: 支持多种比较操作符
- **优先级排序**: 支持匹配模式的优先级控制
- **逻辑组合**: 支持AND/OR逻辑组合多个条件

## 基本用法

### 1. 创建匹配器实例

```typescript
import { Matcher } from './matcher'

const matcher = new Matcher()
```

### 2. 注册自定义匹配器

```typescript
import { CSMarketMatcher, MessageMatcher } from './cs-market-matcher'

matcher.registerCustomMatcher(new CSMarketMatcher())
matcher.registerCustomMatcher(new MessageMatcher())
```

### 3. 定义匹配模式

```typescript
import { MatchPattern } from './matcher.types'

const pattern: MatchPattern = {
  name: 'user-message',
  description: '用户消息匹配',
  conditions: [
    {
      type: 'field',
      field: 'userId',
      value: '12345',
      operator: 'equals'
    },
    {
      type: 'custom',
      name: 'message',
      value: '价格',
      config: { operator: 'contains' }
    }
  ],
  logic: 'AND',
  priority: 100,
  enabled: true
}

matcher.addPattern(pattern)
```

### 4. 执行匹配

```typescript
const context: MatchContext = {
  userId: '12345',
  message: '这把刀的价格是多少？',
  timestamp: Date.now()
}

const results = matcher.match(context)
```

## 匹配条件类型

### 字段匹配 (FieldMatchCondition)

用于匹配上下文中的任意字段：

```typescript
{
  type: 'field',
  field: 'user.balance',        // 支持嵌套字段访问
  value: 1000,
  operator: 'gte'               // 大于等于
}
```

**支持的操作符:**
- `equals` / `notEquals`: 等于/不等于
- `contains` / `startsWith` / `endsWith`: 字符串包含/开始/结束
- `regex`: 正则表达式匹配
- `in` / `notIn`: 包含在数组中/不包含在数组中
- `gt` / `gte` / `lt` / `lte`: 数值比较
- `exists` / `notExists`: 字段存在/不存在

### 自定义匹配 (CustomMatchCondition)

用于业务特定的匹配逻辑：

```typescript
{
  type: 'custom',
  name: 'cs-market',            // 自定义匹配器名称
  value: 1000,
  config: {
    type: 'itemPrice',          // 业务类型
    operator: 'gte'             // 操作符
  }
}
```

### 时间范围匹配 (TimeRangeMatchCondition)

用于时间相关的匹配：

```typescript
{
  type: 'timeRange',
  value: {
    start: '09:00',             // 开始时间 (HH:mm)
    end: '18:00',               // 结束时间 (HH:mm)
    weekdays: [1, 2, 3, 4, 5]  // 星期几 (0-6, 0是周日)
  }
}
```

## 内置自定义匹配器

### CSMarketMatcher

处理CS市场相关的业务逻辑：

```typescript
// 物品价格匹配
{
  type: 'custom',
  name: 'cs-market',
  value: 1000,
  config: { 
    type: 'itemPrice',
    operator: 'gte'
  }
}

// 用户余额匹配
{
  type: 'custom',
  name: 'cs-market',
  value: 500,
  config: { 
    type: 'userBalance',
    operator: 'gte'
  }
}

// 物品分类匹配
{
  type: 'custom',
  name: 'cs-market',
  value: 'weapon',
  config: { 
    type: 'itemCategory',
    operator: 'equals'
  }
}
```

### MessageMatcher

处理消息内容匹配：

```typescript
{
  type: 'custom',
  name: 'message',
  value: '价格',
  config: { operator: 'contains' }
}
```

### UserPermissionMatcher

处理用户权限匹配：

```typescript
{
  type: 'custom',
  name: 'user-permission',
  value: 'vip',
  config: { operator: 'has' }
}
```

## 扩展自定义匹配器

要实现自定义匹配器，需要实现 `CustomMatcher` 接口：

```typescript
import { CustomMatcher, CustomMatchCondition, MatchContext } from './matcher.types'

export class MyCustomMatcher implements CustomMatcher {
  name = 'my-matcher'

  match(condition: CustomMatchCondition, context: MatchContext): { matched: boolean; variables?: Record<string, any> } {
    // 实现匹配逻辑
    const { value, config = {} } = condition
    
    // 根据config.type处理不同的匹配类型
    switch (config.type) {
      case 'myType':
        return this.matchMyType(value, context, config)
      default:
        return { matched: false }
    }
  }

  private matchMyType(value: any, context: MatchContext, config: any) {
    // 具体的匹配逻辑
    return { matched: true }
  }
}
```

## 会话集成

匹配器已经集成到 `SessionHook` 系统中：

```typescript
import { SessionHookManager } from './session.domain'

const sessionManager = SessionHookManager.getInstance()

// 创建带匹配模式的会话
const session = await sessionManager.createSession({
  baseSession: baseSessionData,
  sessionType: SessionType.WaitingChoiceSkinId,
  sessionData: sessionData,
  sessionContext: sessionContext,
  eventType: 'message',
  matchPattern: pattern  // 匹配模式
})

// 查找匹配的会话
const matchingSessions = await sessionManager.findMatchingSessions(context)
```

## 最佳实践

1. **优先级设计**: 使用较小的数字表示更高的优先级
2. **条件组合**: 合理使用AND/OR逻辑，避免过于复杂的条件
3. **性能考虑**: 对于频繁匹配的字段，考虑使用索引或缓存
4. **错误处理**: 自定义匹配器应该包含适当的错误处理
5. **测试覆盖**: 为匹配模式编写充分的测试用例

## 示例

查看 `examples.ts` 文件获取完整的使用示例。
