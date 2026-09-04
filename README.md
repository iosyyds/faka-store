# 虚拟商品自动发卡系统（faka-store）

支付宝当面付 · 自动秒发 · 前端 GitHub Pages（Next.js）+ 后端宝塔（PHP + MySQL）

## 架构

```
┌─────────────────────────────┐         ┌──────────────────────────────┐
│  前台 · Next.js（静态导出）    │  HTTPS  │  后端 · PHP（宝塔）            │
│  GitHub Pages 免费托管        │ ──────▶ │  API：商品/下单/查卡            │
│  商品展示 · 扫码支付 · 查卡密   │   API   │  支付宝当面付 · 自动发卡        │
└─────────────────────────────┘         │  MySQL：商品/卡密/订单/管理员    │
                                        └──────────────────────────────┘
```

- `web/`    前台：Next.js 16（App Router + Tailwind v4），UI 采用 iOS 26「液态玻璃」设计语言
- `server/` 后端：PHP + MySQL，含支付宝当面付签名、自动发卡、管理员后台
- `.github/workflows/deploy.yml`  GitHub Actions 自动构建并部署前台到 GitHub Pages

## 快速开始

### 1. 前台（GitHub Pages）

1. 把本仓库设为公开（已默认公开）。
2. 仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
3. 在 **Settings → Variables → Actions** 添加变量 `NEXT_PUBLIC_API_BASE`，值是你的后端地址，如 `https://api.yourdomain.com`。
4. 推送代码到 `main` 分支，Actions 会自动构建并发布。
5. 访问 `https://你的用户名.github.io/faka-store/`。

> 说明：项目页（非 `用户名.github.io` 仓库）默认部署在 `/仓库名/` 子路径，已在构建配置中处理。

### 2. 后端（宝塔）

完整教程见 [server/README.md](server/README.md)，核心步骤：

1. 上传 `server/` 到宝塔站点目录。
2. 宝塔创建数据库，执行 `server/sql/install.sql`。
3. 复制 `config.example.php` 为 `config.php` 并填写数据库 / 支付宝配置。
4. 开启 PHP 扩展：`openssl`、`curl`、`pdo_mysql`。
5. 执行 `php tools/make_admin.php admin 你的密码` 创建管理员（用完删除该文件）。
6. 站点配置 HTTPS（支付回调必须 HTTPS）。
7. 支付宝开放平台申请「当面付」，生成 RSA2 密钥填入配置。

## 常用地址

| 用途 | 地址 |
| --- | --- |
| 前台首页 | `https://你的用户名.github.io/faka-store/` |
| 订单查询 | 前台首页 → 「查卡密」 |
| 后台管理 | `https://你的后端域名/admin/` |

## 安全提醒

- `server/config.php` 含密钥，已被 `.gitignore` 保护，**不要**强制提交。
- 部署后删除 `server/tools/make_admin.php`。
- 前台为公开仓库，敏感配置一律只放在后端。
