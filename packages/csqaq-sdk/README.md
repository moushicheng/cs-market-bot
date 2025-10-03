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
import { createCSQAQClient } from "@qq/csqaq-sdk";

const client = createCSQAQClient({
  // token: process.env.CSQAQ_TOKEN, // 可選，某些接口需要
  // baseUrl: 'https://api.csqaq.com', // 可選，默認值
});

// 獲取首頁指數數據
const indexData = await client.getIndexData();
console.log('指數數據:', indexData);
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
- getIndexData(type?: string) - 獲取首頁指數數據列表
- getSpecificIndex(nameKey: string) - 獲取特定指數數據
- getDecorIndex() - 獲取飾品指數
- getLeaseIndex() - 獲取租賃指數
- getMainWeaponIndex() - 獲取百元主戰指數
- getAgentIndex() - 獲取探員指數
- getNoPaintedIndex() - 獲取原皮指數
- getWkIndex() - 獲取武庫指數
- getStickerIndex() - 獲取貼紙指數
- getKnivesIndex() - 獲取匕首指數
- getGlovesIndex() - 獲取手套指數
- getCharmIndex() - 獲取掛件指數

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

## 示例

查看 xample.ts 文件獲取完整的使用示例。
