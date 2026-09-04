<?php
/**
 * 虚拟商品自动发卡系统 · 全局配置文件（示例模板）
 *
 * 部署步骤：
 *   1. 复制本文件为 config.php：  cp config.example.php config.php
 *   2. 在 config.php 中填入真实的数据库和支付宝配置。
 *   3. config.php 已被 .gitignore 忽略，不会提交到 GitHub，请放心填写。
 */

// ==================== 基础配置 ====================
error_reporting(E_ALL);
ini_set('display_errors', '0');   // 生产环境关闭错误显示，看日志
date_default_timezone_set('Asia/Shanghai');

// 允许跨域的前台地址（你的 GitHub Pages 前台域名，改成本站地址）
define('ALLOW_ORIGIN', 'https://你的用户名.github.io');
// 前台查询订单时用的公网地址（可选）

// ==================== 数据库配置（宝塔） ====================
define('DB_HOST', '127.0.0.1');
define('DB_PORT', '3306');
define('DB_NAME', 'faka');
define('DB_USER', 'root');
define('DB_PASS', '你的数据库密码');

// ==================== 支付宝 · 当面付配置 ====================
// 在 open.alipay.com 创建应用，开通「当面付」能力，
// 并用「支付宝开放平台开发助手」生成 RSA2 密钥对。
define('ALI_APP_ID', '你的应用APPID');
define('ALI_MERCHANT_PRIVATE_KEY', <<<EOD
-----BEGIN RSA PRIVATE KEY-----
把你的应用私钥粘贴到这里（不要外泄）
-----END RSA PRIVATE KEY-----
EOD);
define('ALI_PUBLIC_KEY', <<<EOD
-----BEGIN PUBLIC KEY-----
把支付宝公钥粘贴到这里
-----END PUBLIC KEY-----
EOD);

// 回调地址（必须使用 HTTPS，且能被支付宝公网访问到）
// 例如：https://api.yourdomain.com/api/alipay_notify.php
define('ALI_NOTIFY_URL', 'https://你的后端域名/api/alipay_notify.php');
define('ALI_RETURN_URL', 'https://你的后端域名/api/alipay_return.php');
// 当面付网关
define('ALI_GATEWAY', 'https://openapi.alipay.com/gateway.do');

// ==================== 工具函数 ====================
/** 统一 JSON 输出 */
function json_out($data, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/** 输出 JSON 前允许指定来源跨域（配合 CORS 头） */
function cors_headers() {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin === ALLOW_ORIGIN) {
        header('Access-Control-Allow-Origin: ' . ALLOW_ORIGIN);
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
    }
    // 预检请求直接结束
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

/** 获取 PDO 连接 */
function db() {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=utf8mb4';
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
        } catch (PDOException $e) {
            json_out(['code' => 500, 'msg' => '数据库连接失败：' . $e->getMessage()], 500);
        }
    }
    return $pdo;
}

/** 生成商户订单号：时间 + 随机数 */
function gen_order_no() {
    return date('YmdHis') . mt_rand(1000, 9999);
}
