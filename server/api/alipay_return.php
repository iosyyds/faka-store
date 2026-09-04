<?php
/**
 * 支付宝 · 同步跳转返回页
 * 用户付款成功后从支付宝跳回这里，再 302 跳到前台订单查询页。
 * （真正的发货以异步通知 alipay_notify.php 为准）
 */
require __DIR__ . '/../config.php';

$order_no = $_GET['out_trade_no'] ?? '';
// 跳回前台查询页（前台地址需自行填写）
header('Location: ' . rtrim(ALLOW_ORIGIN, '/') . '/query?order_no=' . urlencode($order_no));
exit;
