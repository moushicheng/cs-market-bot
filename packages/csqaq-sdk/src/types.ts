// SDK 初始化配置
export type CSQAQSDKOptions = {
  /** CSQAQ 账户的 API Token */
  token: string;
  /** 可选：自定义接口地址，默认 https://api.csqaq.com */
  baseUrl?: string;
  /** 可选：自定义 axios 实例 */
  axiosInstance?: any;
};

// 通用接口返回包裹
export interface ApiEnvelope<T> {
  code: number;
  msg: string;
  data: T;
}

// 首页指数数据类型
export interface IndexData {
  id: number;
  name: string;
  name_key: string;
  img: string;
  market_index: number;
  chg_num: number;
  chg_rate: number;
  open: number;
  close: number;
  high: number;
  low: number;
  updated_at: string;
}

// 首页相关数据响应类型
export interface HomePageData {
  sub_index_data: IndexData[];
  // 根据实际 API 响应添加其他字段
}

// 饰品 ID 信息类型
export interface GoodIdInfo {
  id: number;
  name: string;
  market_hash_name: string;
}

// 获取饰品 ID 请求参数
export interface GetGoodIdRequest {
  page_index: number;
  page_size: number;
  search: string;
}

// 获取饰品 ID 响应数据
export interface GetGoodIdResponse {
  data: Record<string, GoodIdInfo>;
  page_index: number;
  page_size: number;
  total: number;
}

// 饰品详情信息类型
export interface GoodsInfo {
  id: number;
  turnover_number: number;
  turnover_avg_price: number;
  period_at: string;
  buff_id: number;
  yyyp_id: number;
  name: string;
  market_hash_name: string;
  buff_sell_price: number;
  buff_buy_price: number;
  buff_sell_num: number;
  buff_buy_num: number;
  yyyp_sell_price: number;
  yyyp_lease_num: number;
  yyyp_transfer_price: number;
  yyyp_lease_price: number;
  yyyp_long_lease_price: number;
  yyyp_lease_annual: number;
  yyyp_long_lease_annual: number;
  yyyp_sell_num: number;
  yyyp_steam_price: number;
  yyyp_buy_num: number;
  yyyp_buy_price: number;
  sell_price_rate_1: number;
  sell_price_rate_7: number;
  sell_price_rate_15: number;
  sell_price_rate_30: number;
  sell_price_rate_90: number;
  sell_price_rate_180: number;
  sell_price_rate_365: number;
  sell_price_1: number;
  sell_price_7: number;
  sell_price_15: number;
  sell_price_30: number;
  sell_price_90: number;
  sell_price_180: number;
  sell_price_365: number;
  yyyp_sell_price_1: number;
  yyyp_sell_price_7: number;
  yyyp_sell_price_15: number;
  yyyp_sell_price_30: number;
  yyyp_sell_price_90: number;
  yyyp_sell_price_180: number;
  yyyp_sell_price_365: number;
  yyyp_sell_price_rate_1: number;
  yyyp_sell_price_rate_7: number;
  yyyp_sell_price_rate_15: number;
  yyyp_sell_price_rate_30: number;
  yyyp_sell_price_rate_90: number;
  yyyp_sell_price_rate_180: number;
  yyyp_sell_price_rate_365: number;
  r8_sell_price: number;
  r8_sell_num: number;
  steam_sell_price: number;
  steam_sell_num: number;
  steam_buy_price: number;
  steam_buy_num: number;
  steam_buff_buy_conversion: number;
  steam_buff_sell_conversion: number;
  buff_steam_buy_conversion: number;
  buff_steam_sell_conversion: number;
  type_localized_name: string;
  statistic: number;
  img: string;
  updated_at: string;
  rank_num: number;
  rank_num_change: number;
  def_index: number;
  paint_index: number;
  c5_sell_price: number;
  c5_sell_num: number;
  c5_lease_price: number;
  c5_long_lease_price: number;
  min_float: number;
  max_float: number;
  rarity_localized_name: string;
  quality_localized_name: string;
  exterior_localized_name: string;
  group_hash_name: string;
}

// 按钮列表项类型
export interface ButtonListItem {
  id: number;
  name: string;
  current: boolean;
  switch: boolean;
}

// 多普勒变种类型
export interface DopplerVariant {
  key: number;
  label: string;
  value: string;
  def_index: number;
  paint_index: number;
  short_name_en: string;
  buff_sell_price: number;
  buff_buy_price: number;
}

// 统计信息类型
export interface StatisticItem {
  name: string;
  statistic_at: string;
  statistic: number;
}

// 武器箱信息类型
export interface ContainerInfo {
  id: number;
  url: string;
  name: string;
  price: number;
  comment: string;
  created_at: string;
  roi: number;
}

// 获取单件饰品详情响应数据
export interface GoodDetailResponse {
  goods_info: GoodsInfo;
  button_list: ButtonListItem[];
  dpl: DopplerVariant[];
  is_collection: any[];
  statistic_list: StatisticItem[];
  container: ContainerInfo[];
}

// 批量获取饰品出售价格请求参数
export interface BatchGoodSellPriceRequest {
  good_ids: number[];
}

// 饰品出售价格数据
export interface GoodSellPriceData {
  good_id: number;
  sell_price: number[];
}

// 批量获取饰品出售价格响应数据
export interface BatchGoodSellPriceResponse {
  data: Record<string, GoodSellPriceData>;
}

// 联想查询饰品ID信息响应数据
export interface SuggestItem {
  id: string;
  value: string;
}

// 绑定本机白名单IP响应数据
export interface BindLocalIpResponse {
  code: number;
  msg: string;
  data: string;
}
