import axios, { AxiosInstance } from 'axios';
import {
  CSQAQSDKOptions,
  ApiEnvelope,
  HomePageData,
  GoodIdInfo,
  GetGoodIdRequest,
  GetGoodIdResponse,
  GoodDetailResponse,
  BatchGoodSellPriceResponse,
  SuggestItem,
  BindLocalIpResponse
} from './types';

export class CSQAQClient {
  private readonly axios: AxiosInstance;
  private readonly token?: string;

  constructor(options: CSQAQSDKOptions) {
    this.token = options.token;

    // 创建 axios 实例
    this.axios = options.axiosInstance || axios.create({
      baseURL: (options.baseUrl || 'https://api.csqaq.com').replace(/\/$/, ''),
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 添加请求拦截器
    this.axios.interceptors.request.use((config) => {
      // 添加 API Token
      if (this.token) {
        config.headers['ApiToken'] = this.token;
      }

      return config;
    });

    // 添加响应拦截器
    this.axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const { status, data } = error.response;
          const errorMessage = data?.msg || data?.message || `HTTP ${status}`;
          throw new Error(`CSQAQ API error: ${errorMessage}`);
        }
        throw error;
      }
    );
  }

  /**
   * 获取首页相关数据
   * @param type 数据类型，默认为 'init'
   * @returns 首页数据
   */
  async getHomePageData(type: string = 'init'): Promise<ApiEnvelope<HomePageData>> {
    const response = await this.axios.get<ApiEnvelope<HomePageData>>('/api/v1/current_data', {
      params: { type }
    });
    return response.data;
  }

  /**
   * 搜索饰品 ID 信息（简化版本）
   * @param search 搜索关键词
   * @param pageIndex 页码，默认为 1
   * @param pageSize 每页大小，默认为 20
   * @returns 饰品 ID 信息列表
   */
  async searchGoodId(search: string, pageIndex: number = 1, pageSize: number = 10): Promise<GoodIdInfo[]> {
    const response = await this.getGoodId({
      page_index: pageIndex,
      page_size: pageSize,
      search
    });

    // 将 Record 格式转换为数组格式
    return Object.values(response.data.data);
  }

  /**
   * 获取单件饰品详情
   * @param id 饰品 ID
   * @returns 饰品详情数据
   */
  async getGoodDetail(id: number): Promise<ApiEnvelope<GoodDetailResponse>> {
    const response = await this.axios.get<ApiEnvelope<GoodDetailResponse>>('/api/v1/info/good', {
      params: { id }
    });
    return response.data;
  }

  /**
   * 批量获取饰品出售价格数据
   * @param goodIds 饰品 ID 数组
   * @returns 批量饰品出售价格数据
   */
  async getBatchGoodSellPrice(goodIds: number[]): Promise<ApiEnvelope<BatchGoodSellPriceResponse>> {
    const response = await this.axios.post<ApiEnvelope<BatchGoodSellPriceResponse>>('/api/v1/info/good_sell_price', {
      good_ids: goodIds
    });
    return response.data;
  }

  /**
   * 联想查询饰品的ID信息
   * @param text 搜索关键词，支持饰品名称、特殊关键词联想
   * @returns 联想查询结果列表
   * 
   * 支持的特殊关键词联想：
   * - 皮肤类：二西莫夫(高达)、黑色魅影(大姐姐)、炽热之炎(火沙鹰)、巨龙传说(龙狙)等
   * - 武器类：SSG 08(鸟狙)、加利尔 AR(咖喱)、MAC-10(吹风机)、AWP(大狙)等
   * - 职业哥类：Twistzz(总监)、frozen(寒王)、electronic(电子哥/倒霉蛋)、ZywOo(载物/大番薯)等
   * - 战队类：Astralis(A队)、TYLOO(天禄)、Spirit(绿龙)、FURIA(黑豹)、Monte(三叉戟)等
   * - 常规类：久经沙场(酒精)、StatTrak™(暗金)、原皮/原版/无涂装等
   */
  async suggestGoodId(text: string): Promise<ApiEnvelope<SuggestItem[]>> {
    const response = await this.axios.get<ApiEnvelope<SuggestItem[]>>('/api/v1/search/suggest', {
      params: { text }
    });
    return response.data;
  }

  /**
   * 绑定本机白名单IP
   * 为当前请求的API_TOKEN绑定本机的IP地址，适用于非固定IP场景下使用
   * 频率限制：30秒/次
   * @returns 绑定结果信息
   */
  async bindLocalIp(): Promise<ApiEnvelope<BindLocalIpResponse>> {
    const response = await this.axios.post<ApiEnvelope<BindLocalIpResponse>>('/api/v1/sys/bind_local_ip');
    return response.data;
  }

  /**
 * 获取饰品的 ID 信息
 * @param request 请求参数
 * @returns 饰品 ID 信息列表
 */
  private async getGoodId(request: GetGoodIdRequest): Promise<ApiEnvelope<GetGoodIdResponse>> {
    const response = await this.axios.post<ApiEnvelope<GetGoodIdResponse>>('/api/v1/info/get_good_id', request);
    return response.data;
  }

}

export default CSQAQClient;
