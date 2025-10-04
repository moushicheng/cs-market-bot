/**
 * 枚举使用示例
 */
import { MatchType, Operator, FieldMatchCondition, CustomMatchCondition, TimeRangeMatchCondition } from './index'

// 使用枚举创建字段匹配条件
const fieldCondition: FieldMatchCondition = {
  type: MatchType.FIELD,
  field: 'user.id',
  value: '12345',
  operator: Operator.EQUALS
}

// 使用枚举创建自定义匹配条件
const customCondition: CustomMatchCondition = {
  type: MatchType.CUSTOM,
  name: 'customMatcher',
  value: 'someValue'
}

// 使用枚举创建时间范围匹配条件
const timeRangeCondition: TimeRangeMatchCondition = {
  type: MatchType.TIME_RANGE,
  value: {
    start: '09:00',
    end: '18:00',
    weekdays: [1, 2, 3, 4, 5] // 工作日
  }
}

// 其他操作符示例
const containsCondition: FieldMatchCondition = {
  type: MatchType.FIELD,
  field: 'message.content',
  value: 'hello',
  operator: Operator.CONTAINS
}

const regexCondition: FieldMatchCondition = {
  type: MatchType.FIELD,
  field: 'message.content',
  value: /^\d+$/,
  operator: Operator.REGEX
}

const existsCondition: FieldMatchCondition = {
  type: MatchType.FIELD,
  field: 'user.email',
  value: null, // 对于 EXISTS 操作符，value 通常为 null
  operator: Operator.EXISTS
}

export {
  fieldCondition,
  customCondition,
  timeRangeCondition,
  containsCondition,
  regexCondition,
  existsCondition
}
