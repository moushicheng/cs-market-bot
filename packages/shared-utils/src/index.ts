/**
 * 格式化时间戳为可读字符串
 * @param timestamp 时间戳（毫秒）
 * @returns 格式化的时间字符串
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString('zh-CN');
}

/**
 * 生成随机字符串
 * @param length 字符串长度
 * @returns 随机字符串
 */
export function generateRandomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 延迟执行
 * @param ms 延迟时间（毫秒）
 * @returns Promise
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 验证QQ号格式
 * @param qq QQ号
 * @returns 是否为有效QQ号
 */
export function isValidQQ(qq: string | number): boolean {
  const qqStr = String(qq);
  return /^[1-9][0-9]{4,10}$/.test(qqStr);
}

/**
 * 日志工具类
 */
export class Logger {
  private prefix: string;

  constructor(prefix: string = 'QQ-Bot') {
    this.prefix = prefix;
  }

  info(message: string, ...args: any[]): void {
    console.log(`[${this.prefix}] [INFO] ${message}`, ...args);
  }

  warn(message: string, ...args: any[]): void {
    console.warn(`[${this.prefix}] [WARN] ${message}`, ...args);
  }

  error(message: string, ...args: any[]): void {
    console.error(`[${this.prefix}] [ERROR] ${message}`, ...args);
  }

  debug(message: string, ...args: any[]): void {
    console.debug(`[${this.prefix}] [DEBUG] ${message}`, ...args);
  }
}
