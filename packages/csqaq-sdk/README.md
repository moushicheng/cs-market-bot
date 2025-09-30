# @qq/csqaq-sdk

Type-safe SDK for the CSQAQ Open API.

Docs: [CSQAQ 数据开放 API](https://docs.csqaq.com/)

## Install

```bash
pnpm add @qq/csqaq-sdk
```

## Usage

```ts
import {
  createCSQAQClient,
  type ApiEnvelope,
  type IndexBrief,
} from "@qq/csqaq-sdk";

const client = createCSQAQClient({
  token: process.env.CSQAQ_TOKEN!,
  // baseUrl: 'https://api.csqaq.com', // default
});

// 首页指数数据（带类型）
const home: ApiEnvelope<IndexBrief[]> = await client.getHomeIndexData();

// Index detail
const detail = await client.getIndexDetail({ id: 1 });

// Search items
const results = await client.searchItemIds("AK-47");

// Item detail (POST)
const item = await client.getItemById({ id: 123 });
```

## Notes

- 需在官网申请并获取 API Token。
- 某些端点可能需要 IP 白名单，必要时通过 `ipHeaderName` 与 `ipValue` 传递固定 IP。
- 部分端点返回包裹结构（如 `{ code, msg, data }`），SDK 使用 `ApiEnvelope<T>` 进行类型约束，字段以官方文档为准。
- 端点路径以官方文档为准，如有变更请按需调整。
