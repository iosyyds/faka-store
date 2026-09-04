<?php
/** 后台首页：统计概览 */
require __DIR__ . '/_auth.php';
admin_header('首页', 'index');

$pdo = db();
$stat = [
    'products' => $pdo->query("SELECT COUNT(*) c FROM products WHERE status=1")->fetch()['c'],
    'stock'    => $pdo->query("SELECT COUNT(*) c FROM cards WHERE status=0")->fetch()['c'],
    'orders'   => $pdo->query("SELECT COUNT(*) c FROM orders")->fetch()['c'],
    'paid'     => $pdo->query("SELECT COUNT(*) c FROM orders WHERE status=1")->fetch()['c'],
    'today_sales' => $pdo->query("SELECT COALESCE(SUM(price),0) s FROM orders WHERE status=1 AND DATE(paid_at)=CURDATE()")->fetch()['s'],
];
?>
<div class="card">
  <h3 style="margin-top:0">今日概览</h3>
  <div class="stat">在售商品<b><?= $stat['products'] ?></b></div>
  <div class="stat">剩余库存<b><?= $stat['stock'] ?></b></div>
  <div class="stat">累计订单<b><?= $stat['orders'] ?></b></div>
  <div class="stat">已支付订单<b><?= $stat['paid'] ?></b></div>
  <div class="stat">今日销售额<b>￥<?= number_format($stat['today_sales'], 2) ?></b></div>
</div>
<div class="card">
  <h3 style="margin-top:0">使用提示</h3>
  <ol style="line-height:2">
    <li>先在「商品管理」创建商品；</li>
    <li>再到「卡密管理」给商品批量导入卡密（每行一条发货内容）；</li>
    <li>前台用户下单 → 支付宝付款 → 系统自动发货。</li>
  </ol>
  <p style="color:#888;font-size:13px">默认首页仅展示统计，管理都在左侧导航对应页面完成。</p>
</div>
<?php admin_footer();
