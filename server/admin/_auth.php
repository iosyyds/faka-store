<?php
/** 后台鉴权公共文件：未登录跳转登录页 */
session_start();
if (empty($_SESSION['admin_id'])) {
    header('Location: login.php');
    exit;
}
require_once __DIR__ . '/../config.php';

/** 后台页面统一样式头 */
function admin_header($title, $active = '')
{
    $nav = [
        'index'    => ['index.php', '首页'],
        'products' => ['products.php', '商品管理'],
        'cards'    => ['cards.php', '卡密管理'],
        'orders'   => ['orders.php', '订单管理'],
    ];
    echo '<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>' . htmlspecialchars($title) . ' - 发卡后台</title>
    <style>
      body{font-family:system-ui,sans-serif;margin:0;background:#f5f6fa;color:#222}
      .top{background:#1f2430;color:#fff;padding:12px 24px;display:flex;justify-content:space-between;align-items:center}
      .top h1{font-size:18px;margin:0}
      .top a{color:#9fb3ff;text-decoration:none;margin-left:16px}
      .nav{background:#fff;border-bottom:1px solid #e3e6ef;padding:0 24px;display:flex;gap:4px}
      .nav a{padding:12px 16px;text-decoration:none;color:#555;border-bottom:3px solid transparent}
      .nav a.active{color:#1f5eff;border-bottom-color:#1f5eff;font-weight:600}
      .wrap{max-width:1100px;margin:24px auto;padding:0 24px}
      .card{background:#fff;border-radius:10px;padding:20px 24px;margin-bottom:20px;box-shadow:0 1px 4px rgba(0,0,0,.06)}
      table{width:100%;border-collapse:collapse;font-size:14px}
      th,td{padding:10px 8px;border-bottom:1px solid #eef0f6;text-align:left}
      th{color:#777;font-weight:600}
      .btn{display:inline-block;background:#1f5eff;color:#fff;border:0;border-radius:6px;padding:8px 14px;cursor:pointer;font-size:14px;text-decoration:none}
      .btn.danger{background:#e5484d}
      .btn.gray{background:#7a8299}
      input[type=text],input[type=number],input[type=password],select,textarea{width:100%;box-sizing:border-box;padding:9px 10px;border:1px solid #d7dbe6;border-radius:6px;font-size:14px;margin:4px 0 12px}
      .grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
      .stat{display:inline-block;background:#fff;border-radius:10px;padding:18px 28px;margin:0 12px 12px 0;box-shadow:0 1px 4px rgba(0,0,0,.06)}
      .stat b{font-size:26px;display:block}
      .msg{background:#eef6ff;border:1px solid #bcd7ff;color:#1a56a0;border-radius:6px;padding:10px 14px;margin:12px 0}
      .err{background:#fff0f0;border:1px solid #ffc9c9;color:#b0252b;border-radius:6px;padding:10px 14px;margin:12px 0}
    </style></head><body>
    <div class="top"><h1>发卡系统后台</h1><div>
      <a href="' . rtrim(ALLOW_ORIGIN, '/') . '" target="_blank">查看前台</a>
      <a href="logout.php">退出登录</a>
    </div></div>
    <div class="nav">';
    foreach ($nav as $k => $v) {
        echo '<a href="' . $v[0] . '"' . ($active === $k ? ' class="active"' : '') . '>' . $v[1] . '</a>';
    }
    echo '</div><div class="wrap">';
}

function admin_footer()
{
    echo '</div></body></html>';
}
