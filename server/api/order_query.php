<?php
/**
 * 前台 API · 订单/卡密查询
 * GET api/order_query.php?order_no=xxx&pwd=yyy
 * pwd 为下单时返回的查询密码。支付成功后返回卡密内容。
 */
require __DIR__ . '/../config.php';
cors_headers();

$order_no = trim($_GET['order_no'] ?? '');
$pwd      = trim($_GET['pwd'] ?? '');
if ($order_no === '' || $pwd === '') {
    json_out(['code' => 400, 'msg' => '缺少订单号或查询密码'], 400);
}

$stmt = db()->prepare("SELECT id, order_no, product_name, price, status, card_id, paid_at, query_pwd
                       FROM orders WHERE order_no = ?");
$stmt->execute([$order_no]);
$order = $stmt->fetch();
if (!$order) {
    json_out(['code' => 404, 'msg' => '订单不存在'], 404);
}
if (!hash_equals($order['query_pwd'], hash('sha256', $pwd))) {
    json_out(['code' => 403, 'msg' => '查询密码错误'], 403);
}

$data = [
    'order_no'     => $order['order_no'],
    'product_name' => $order['product_name'],
    'price'        => $order['price'],
    'status'       => intval($order['status']),
    'paid_at'      => $order['paid_at'],
];

// 已支付则取卡密内容
if (intval($order['status']) === 1 && $order['card_id']) {
    $stmt = db()->prepare("SELECT content FROM cards WHERE id = ?");
    $stmt->execute([$order['card_id']]);
    $card = $stmt->fetch();
    $data['card'] = $card ? $card['content'] : '卡密已售出但内容缺失，请联系客服补发';
} else {
    $data['card'] = '';
}

json_out(['code' => 0, 'msg' => 'ok', 'data' => $data]);
