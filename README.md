# QQ Bot Mono-repo

这是一个使用 pnpm 管理的 mono-repo 项目，包含 QQ 机器人相关的应用和共享包。

## 项目结构

```
qq/
├── apps/                    # 应用程序目录
│   └── cs-market-bot/       # CS市场机器人
├── packages/                # 共享包目录
│   └── shared-utils/        # 共享工具包
├── pnpm-workspace.yaml      # pnpm工作区配置
├── .npmrc                   # pnpm配置
└── package.json             # 根package.json
```

## 环境要求

- Node.js >= 18
- pnpm >= 9.0.0

## 安装依赖

```bash
# 安装所有工作区的依赖
pnpm install

# 或者使用简写
pnpm i
```

## 开发命令

```bash
# 构建所有包
pnpm build

# 开发模式运行所有包
pnpm dev

# 清理所有构建产物
pnpm clean

# 运行所有测试
pnpm test

# 代码检查
pnpm lint
```

## 特定应用命令

```bash
# CS市场机器人相关命令
pnpm cs-market-bot:dev      # 开发模式
pnpm cs-market-bot:build    # 构建
pnpm cs-market-bot:start    # 启动
```

## 包管理

```bash
# 添加依赖到根目录
pnpm add <package>

# 添加依赖到特定工作区
pnpm --filter <workspace-name> add <package>

# 添加开发依赖到特定工作区
pnpm --filter <workspace-name> add -D <package>

# 移除依赖
pnpm --filter <workspace-name> remove <package>
```

## 工作区管理

```bash
# 列出所有工作区
pnpm list -r

# 在特定工作区运行命令
pnpm --filter <workspace-name> <command>

# 在所有工作区运行命令
pnpm -r <command>
```

## 共享包使用

在应用中使用共享包：

```typescript
// 在apps/cs-market-bot中
import { Logger, formatTimestamp } from "@qq/shared-utils";

const logger = new Logger("CS-Market-Bot");
logger.info("机器人启动");
```

## 配置说明

- `pnpm-workspace.yaml`: 定义工作区包的位置
- `.npmrc`: pnpm 的配置选项
- `package.json`: 根目录的脚本和依赖管理

## 注意事项

1. 所有共享包都应该发布到内部 npm registry 或使用本地链接
2. 使用`pnpm -r`命令可以在所有工作区执行相同命令
3. 使用`pnpm --filter`可以针对特定工作区执行命令
4. 确保所有包都使用相同的 Node.js 版本
