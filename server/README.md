# 后端（PHP + MySQL）· 宝塔部署教程

本目录是发卡系统的**后端**，部署在你的宝塔服务器上，提供商品 API、支付回调、自动发卡和管理员后台。

## 一、目录结构

```
server/
├── config.example.php   # 配置模板（复制为 config.php 后填写）
├── config.php           # 真实配置（已被 gitignore，不会上传）
├── sql/install.sql      # 数据库安装脚本
├── lib/alipay/          # 支付宝当面付签名库
├── api/                 # 前台调用的接口
│   ├── products.php        商品列表
│   ├── order_create.php    下单 + 支付宝预下单
│   ├── order_query.php     订单/卡密查询
│   ├── alipay_notify.php   支付宝异步回调（自动发卡）
│   └── alipay_return.php   支付后跳回前台
├── admin/               # 管理员后台
└── tools/make_admin.php # 创建管理员（用完删除）
```

## 二、部署步骤（宝塔面板）

### 1. 上传代码
- 下载本 `server` 目录，上传到宝塔网站目录，例如 `/www/wwwroot/faka`（或你的后端站点根目录）。
- 确保目录下文件权限可读即可。

### 2. 创建数据库
- 宝塔 → 数据库 → 添加数据库（如 `faka`），记下用户名、密码。
- 在 phpMyAdmin 中打开该库，执行 `sql/install.sql`（或使用宝塔「导入」功能上传该文件执行）。

### 3. 创建 PHP 站点
- 宝塔 → 网站 → 添加站点，域名填你后端的域名（如 `api.yourdomain.com`），PHP 版本选 7.4 / 8.x 均可。
- 若直接用 IP 访问：站点域名填 IP 或本地 IP + 端口。

### 4. 配置 PHP
- 确保 PHP 已启用扩展：`openssl`（签名用）、`curl`、`pdo_mysql`。宝塔默认都有，可在 PHP 设置里检查。

### 5. 填写配置
```bash
cp config.example.php config.php
```
用编辑器打开 `config.php`，填入：
- 数据库 `DB_*` 四项
- 支付宝 `ALI_APP_ID` / 应用私钥 / 支付宝公钥
- `ALLOW_ORIGIN` 改为你的前台地址（GitHub Pages 域名）
- `ALI_NOTIFY_URL` 改为你后端的真实地址，例如 `https://api.yourdomain.com/api/alipay_notify.php`

### 6. 创建管理员
```bash
cd /www/wwwroot/faka
php tools/make_admin.php admin 你的密码
```
创建成功后**删除** `tools/make_admin.php`。

### 7. 设置 HTTPS（必须）
- 支付回调必须 HTTPS。宝塔 → 站点 → SSL → 申请 Let's Encrypt 免费证书（需域名已解析）。
- 如果只有 IP：当面付回调一般要求域名 + HTTPS，建议购买一个便宜域名解析到服务器。

## 三、支付宝当面付申请

1. 打开 [open.alipay.com](https://open.alipay.com)，用支付宝账号登录 → 创建「网页/移动应用」并完成审核。
2. 进入应用 → 产品绑定，添加「当面付」。
3. 使用「支付宝开放平台开发助手」生成 RSA2 密钥对：
   - **应用私钥** → 填进 `config.php` 的 `ALI_MERCHANT_PRIVATE_KEY`
   - 上传**应用公钥**到支付宝开放平台
   - 把平台的**支付宝公钥**填进 `ALI_PUBLIC_KEY`
4. 开通当面付一般需要企业/个体工商户资质；个人可咨询本地服务商，或用第三方聚合支付（如易支付）替换本项目中的 `lib/alipay/` 调用。

## 四、接口一览（给前台用）

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/api/products.php` | GET | 商品列表，`?category=分类` 可选 |
| `/api/order_create.php` | POST | 参数 `product_id`、`contact`，返回 `order_no`、`query_pwd`、`qr_code` |
| `/api/order_query.php` | GET | 参数 `order_no`、`pwd`，返回订单状态和卡密 |

后台地址：`https://你的后端域名/admin/`

## 五、安全提醒

- `config.php` 含密钥，**不要**手动提交到 GitHub（仓库已通过 `.gitignore` 保护）。
- 部署后建议：删除 `tools/make_admin.php`；修改数据库密码；给后台加 IP 白名单（宝塔可配）。
- 前台是公开仓库，任何敏感信息（密钥、密码）都只出现在后端 `config.php`。
