// SDK 初始化配置
export type CSQAQSDKOptions = {
  /** CSQAQ 账户的 API Token */
  token: string;
  /** 可选：自定义接口地址，默认 https://api.csqaq.com */
  baseUrl?: string;
  /** 可选：部分场景需要透传绑定 IP 的请求头名 */
  ipHeaderName?: string;
  /** 可选：与 ipHeaderName 配合使用的静态 IP 值 */
  ipValue?: string;
  /** 可选：自定义 fetch 实现（Node 环境或单测中注入） */
  fetchImpl?: typeof fetch;
};

export type HttpMethod = "GET" | "POST";

// 通用接口返回包裹（仅作为示例，具体字段请以官方文档为准）
export interface ApiEnvelope<T> {
  code: number;
  msg?: string;
  data: T;
}

// 指数相关类型（根据文档可再细化）
export interface IndexBrief {
  id: number;
  name: string;
  symbol?: string;
  lastPrice?: number;
  change24h?: number;
}

export interface IndexDetail extends IndexBrief {
  description?: string;
  constituents?: Array<{ id: number; weight?: number }>;
}

export interface KlinePoint {
  time: number; // 时间戳（秒或毫秒，按实际文档调整）
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

// 物品与价格相关类型
export interface ItemBrief {
  id: number;
  name: string;
  game?: string;
}

export interface ItemDetail extends ItemBrief {
  rarity?: string;
  iconUrl?: string;
  description?: string;
}

export interface PricePoint {
  time: number;
  price: number;
}

export interface RankingEntry {
  id: number;
  name: string;
  value: number; // 排名指标值，如成交额/涨幅等
}

// Http 方法类型（避免重复定义）

export class CSQAQClient {
  private readonly baseUrl: string;
  private readonly token: string;
  private readonly fetchImpl: typeof fetch;
  private readonly ipHeaderName?: string;
  private readonly ipValue?: string;

  constructor(options: CSQAQSDKOptions) {
    this.baseUrl = (options.baseUrl ?? "https://api.csqaq.com").replace(/\/$/, "");
    this.token = options.token;
    this.fetchImpl = options.fetchImpl ?? globalThis.fetch.bind(globalThis);
    this.ipHeaderName = options.ipHeaderName;
    this.ipValue = options.ipValue;
  }

  private buildHeaders(extra?: Record<string, string>): Headers {
    const headers = new Headers({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.token}`,
      ...extra,
    });
    if (this.ipHeaderName && this.ipValue) {
      headers.set(this.ipHeaderName, this.ipValue);
    }
    return headers;
  }

  // 内部请求封装
  private async request<T>(method: HttpMethod, path: string, body?: unknown, init?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
    const response = await this.fetchImpl(url, {
      method,
      headers: this.buildHeaders(init?.headers as Record<string, string> | undefined),
      body: body == null ? undefined : JSON.stringify(body),
      ...init,
    });
    if (!response.ok) {
      const text = await safeReadText(response);
      throw new Error(`CSQAQ API error ${response.status}: ${text}`);
    }
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      return (await response.json()) as T;
    }
    // Fallback to text for some endpoints
    return (await response.text()) as unknown as T;
  }

  get<T>(path: string, init?: RequestInit): Promise<T> {
    return this.request<T>("GET", path, undefined, init);
  }

  post<TReq extends object, TRes>(path: string, payload: TReq, init?: RequestInit): Promise<TRes> {
    return this.request<TRes>("POST", path, payload, init);
  }

  // 高层封装：可继续扩展更多 Open API

  // Index endpoints
  /** 首页指数概览 */
  getHomeIndexData() {
    return this.get<ApiEnvelope<IndexBrief[]>>("/open/index/home");
  }

  /** 指数详情 */
  getIndexDetail(params: { id: number | string }) {
    const search = new URLSearchParams({ id: String(params.id) });
    return this.get<ApiEnvelope<IndexDetail>>(`/open/index/detail?${search.toString()}`);
  }

  /** 指数 K 线 */
  getIndexKline(params: { id: number | string; period?: string }) {
    const search = new URLSearchParams({ id: String(params.id) });
    if (params.period) search.set("period", params.period);
    return this.get<ApiEnvelope<KlinePoint[]>>(`/open/index/kline?${search.toString()}`);
  }

  // 物品相关（路径以文档为准，如与实际不符请根据文档调整）
  /** 搜索物品 */
  searchItemIds(query: string) {
    const search = new URLSearchParams({ q: query });
    return this.get<ApiEnvelope<ItemBrief[]>>(`/open/item/search?${search.toString()}`);
  }

  /** 物品详情（POST） */
  getItemById(body: { id: number | string }) {
    return this.post<typeof body, ApiEnvelope<ItemDetail>>("/open/item/get", body);
  }

  /** 物品价格批量（POST） */
  getItemsPriceBatch(body: { ids: Array<number | string> }) {
    return this.post<typeof body, ApiEnvelope<Record<string, PricePoint[]>>>("/open/item/price/batch", body);
  }

  /** 物品走势图（POST） */
  getItemChart(body: { id: number | string; period?: string }) {
    return this.post<typeof body, ApiEnvelope<PricePoint[]>>("/open/item/chart", body);
  }

  // 排行相关
  /** 排行列表（POST） */
  getRankings(body: { type: string; page?: number; pageSize?: number }) {
    return this.post<typeof body, ApiEnvelope<RankingEntry[]>>("/open/rank/list", body);
  }
}

async function safeReadText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

export function createCSQAQClient(options: CSQAQSDKOptions) {
  return new CSQAQClient(options);
}

export default CSQAQClient;
