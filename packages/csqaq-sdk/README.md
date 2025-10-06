# @qq/csqaq-sdk

基於 axios 的 CSQAQ 數據開放 API TypeScript SDK。

文檔: [CSQAQ 數據開放 API](https://docs.csqaq.com/)

## 安裝

`ash
pnpm add @qq/csqaq-sdk
`

## 使用

### 基本用法

`	s
import { CSQAQClient } from "@qq/csqaq-sdk";

const client = new CSQAQClient({
  token: process.env.CSQAQ_TOKEN, // 可選，某些接口需要
  baseUrl: 'https://api.csqaq.com', // 可選，默認值
});

// 獲取首頁指數數據
const indexData = await client.getHomePageData();
console.log('指數數據:', indexData);

// 聯想查詢飾品ID
const suggestResult = await client.suggestGoodId('殺豬刀');
console.log('聯想查詢結果:', suggestResult);
`

### 獲取特定指數

`	s
// 獲取飾品指數
const decorIndex = await client.getDecorIndex();

// 獲取租賃指數
const leaseIndex = await client.getLeaseIndex();

// 獲取百元主戰指數
const mainWeaponIndex = await client.getMainWeaponIndex();

// 獲取探員指數
const agentIndex = await client.getAgentIndex();

// 獲取原皮指數
const noPaintedIndex = await client.getNoPaintedIndex();

// 獲取武庫指數
const wkIndex = await client.getWkIndex();

// 獲取貼紙指數
const stickerIndex = await client.getStickerIndex();

// 獲取匕首指數
const knivesIndex = await client.getKnivesIndex();

// 獲取手套指數
const glovesIndex = await client.getGlovesIndex();

// 獲取掛件指數
const charmIndex = await client.getCharmIndex();
`

### 高級用法

`	s
// 使用自定義 axios 實例
import axios from 'axios';

const customAxios = axios.create({
  timeout: 5000,
  // 其他配置...
});

const client = createCSQAQClient({
  axiosInstance: customAxios,
});

// 使用 IP 白名單（如果需要）
const client = createCSQAQClient({
  token: 'your_token',
  ipHeaderName: 'X-Forwarded-For',
  ipValue: 'your_ip_address',
});
`

## API 參考

### CSQAQClient

#### 構造函數選項

- 	oken?: string - CSQAQ API Token（可選）
- aseUrl?: string - API 基礎 URL（默認: https://api.csqaq.com）
- ipHeaderName?: string - IP 白名單請求頭名稱（可選）
- ipValue?: string - IP 白名單值（可選）
- xiosInstance?: AxiosInstance - 自定義 axios 實例（可選）

#### 方法

- getHomePageData(type?: string) - 獲取首頁相關數據
- searchGoodId(search: string, pageIndex?: number, pageSize?: number) - 搜索飾品ID信息
- getGoodDetail(id: number) - 獲取單件飾品詳情
- getBatchGoodSellPrice(goodIds: number[]) - 批量獲取飾品出售價格數據
- **suggestGoodId(text: string)** - 聯想查詢飾品的ID信息（新增功能）

## 類型定義

### IndexData

`	s
interface IndexData {
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
`

### SuggestItem (聯想查詢結果)

`	s
interface SuggestItem {
  id: string;
  value: string;
}
`

### ApiEnvelope

`	s
interface ApiEnvelope<T> {
  code: number;
  msg: string;
  data: T;
}
`

## 注意事項

- 首頁相關數據接口不需要 API Token 驗證
- 某些接口可能需要 IP 白名單，請根據需要配置
- 所有方法都是異步的，需要使用 wait 或 .then()
- 錯誤會拋出異常，請使用 try-catch 處理

## 聯想查詢功能

新增的 `suggestGoodId` 方法支持豐富的關鍵詞聯想，包括：

### 支持的特殊關鍵詞

- **皮膚類**：二西莫夫(高達)、黑色魅影(大姐姐)、熾熱之炎(火沙鷹)、巨龍傳說(龍狙)、短劍(牙簽)、廓爾喀刀(尼泊爾)、穿腸刀(殺豬刀)、外表生鏽(破傷風)、赤紅新星(qq會員) 等
- **武器類**：SSG 08(鳥狙)、加利爾 AR(咖喱)、MAC-10(吹風機)、AWP(大狙) 等
- **職業哥類**：Twistzz(總監)、frozen(寒王)、electronic(電子哥/倒霉蛋)、ZywOo(載物/大番薯) 等
- **戰隊類**：Astralis(A隊)、TYLOO(天祿)、Spirit(綠龍)、FURIA(黑豹)、Monte(三叉戟) 等
- **常規類**：久經沙場(酒精)、StatTrak™(暗金)、原皮/原版/無塗裝 等

### 使用示例

`	s
// 使用特殊關鍵詞聯想
const result1 = await client.suggestGoodId('殺豬刀');
const result2 = await client.suggestGoodId('龍狙');
const result3 = await client.suggestGoodId('總監');

// 使用常規武器名稱
const result4 = await client.suggestGoodId('AK-47');
const result5 = await client.suggestGoodId('AWP');
`

## 示例

查看 `example-suggest.ts` 文件獲取聯想查詢功能的完整使用示例。
