<?php
/**
 * 前台 API · 创建订单并发起支付宝当面付预下单
 * POST api/order_create.php
 * 参数：product_id, contact（买家联系方式，选填）
 * 返回：order_no（商户订单号）、qr_code（付款二维码内容）、price
 */
require __DIR__ . '/../config.php';
require __DIR__ . '/../lib/alipay/AlipaySign.php';
cors_headers();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_out(['code' => 400, 'msg' => '仅支持 POST'], 400);
}
$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    $input = $_POST;
}
$product_id = intval($input['product_id'] ?? 0);
$contact    = trim($input['contact'] ?? '');
if ($product_id <= 0) {
    json_out(['code' => 400, 'msg' => '缺少商品ID'], 400);
}
if (mb_strlen($contact) > 100) {
    json_out(['code' => 400, 'msg' => '联系方式过长'], 400);
}
$pdo = db();
// 读取商品并校验
$stmt = $pdo->prepare("SELECT * FROM products WHERE id = ? AND status = 1");
$stmt->execute([$product_id]);
$product = $stmt->fetch();
if (!$product) {
    json_out(['code' => 404, 'msg' => '商品不存在或已下架'], 404);
}
if (intval($product['stock']) <= 0) {
    json_out(['code' => 400, 'msg' => '商品库存不足'], 400);
}
// 生成订单号并写入订单（待支付）
$order_no  = gen_order_no();
$query_pwd = bin2hex(random_bytes(8)); // 查询密码，返回给买家用于查卡密
$stmt = $pdo->prepare(
    "INSERT INTO orders (order_no, product_id, product_name, price, contact, query_pwd, status)
     VALUES (?, ?, ?, ?, ?, ?, 0)"
);
$stmt->execute([$order_no, $product['id'], $product['name'], $product['price'], $contact, hash('sha256', $query_pwd)]);
$order_id = $pdo->lastInsertId();
// 支付宝预下单：subject 商品名，out_trade_no 订单号，total_amount 金额
try {
    $result = AlipaySign::precreate([
        'out_trade_no'  => $order_no,
        'total_amount'  => number_format((float)$product['price'], 2, '.', ''),
        'subject'       => $product['name'],
        'timeout_express' => '30m', // 30 分钟未支付自动关闭
    ]);
} catch (Exception $e) {
    // 预下单失败，回滚订单，避免占住库存逻辑混乱
    $pdo->prepare("DELETE FROM orders WHERE id = ?")->execute([$order_id]);
    json_out(['code' => 500, 'msg' => '发起支付失败：' . $e->getMessage()], 500);
}
$resp = $result['alipay_trade_precreate_response'] ?? [];
if (($resp['code'] ?? '') !== '10000') {
    $pdo->prepare("DELETE FROM orders WHERE id = ?")->execute([$order_id]);
    json_out(['code' => 500, 'msg' => '支付宝下单失败：' . ($resp['sub_msg'] ?? $resp['msg'] ?? '未知错误')], 500);
}
json_out([
    'code' => 0,
    'msg'  => 'ok',
    'data' => [
        'order_no'  => $order_no,
        'query_pwd' => $query_pwd, // 请前端提示用户保存，凭此查卡密
        'price'     => $product['price'],
        'product'   => $product['name'],
        'qr_code'   => $resp['qr_code'] ?? '',
    ],
]);
