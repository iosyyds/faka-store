<?php
/**
 * 支付宝 · 异步通知回调（自动发卡核心）
 * 支付宝支付成功后 POST 到本地址。必须返回纯文本 "success"。
 * 注意：本接口不输出 JSON，不回显页面。
 */
require __DIR__ . '/../config.php';
require __DIR__ . '/../lib/alipay/AlipaySign.php';

$params = $_POST;
if (empty($params)) {
    http_response_code(400);
    echo 'failure';
    exit;
}

$sign = $params['sign'] ?? '';
// 1. 验签
if (!AlipaySign::verify($params, $sign, ALI_PUBLIC_KEY)) {
    file_put_contents(__DIR__ . '/../logs/notify_error.log', date('Y-m-d H:i:s') . " 验签失败\n" . json_encode($params) . "\n", FILE_APPEND);
    echo 'failure';
    exit;
}

// 2. 校验基本信息
if (($params['app_id'] ?? '') !== ALI_APP_ID) {
    echo 'failure';
    exit;
}
$trade_status = $params['trade_status'] ?? '';
if (!in_array($trade_status, ['TRADE_SUCCESS', 'TRADE_FINISHED'], true)) {
    echo 'success'; // 其他状态（如 WAIT_BUYER_PAY）不处理，但确认接收
    exit;
}

$order_no = $params['out_trade_no'] ?? '';
$trade_no = $params['trade_no'] ?? '';
$amount   = $params['total_amount'] ?? '0';

$pdo = db();

// 3. 读取订单
$stmt = $pdo->prepare("SELECT * FROM orders WHERE order_no = ?");
$stmt->execute([$order_no]);
$order = $stmt->fetch();
if (!$order) {
    echo 'failure';
    exit;
}

// 4. 金额核对（防止改单）
if (abs((float)$amount - (float)$order['price']) > 0.01) {
    file_put_contents(__DIR__ . '/../logs/notify_error.log', date('Y-m-d H:i:s') . " 金额不符 {$order_no}\n", FILE_APPEND);
    echo 'failure';
    exit;
}

// 5. 已支付过则直接确认（幂等）
if (intval($order['status']) === 1) {
    echo 'success';
    exit;
}

// 6. 事务：更新订单 + 锁定并发放一张卡密（防止超卖）
try {
    $pdo->beginTransaction();

    // 锁一行未售卡密
    $stmt = $pdo->prepare("SELECT id, content FROM cards
                           WHERE product_id = ? AND status = 0
                           ORDER BY id ASC LIMIT 1 FOR UPDATE");
    $stmt->execute([$order['product_id']]);
    $card = $stmt->fetch();

    if (!$card) {
        // 没有卡密了：标记订单为待处理，人工补发
        $pdo->prepare("UPDATE orders SET status = 1, trade_no = ?, notify_time = NOW(), paid_at = NOW()
                       WHERE order_no = ?")
             ->execute([$trade_no, $order_no]);
        $pdo->commit();
        file_put_contents(__DIR__ . '/../logs/notify_error.log', date('Y-m-d H:i:s') . " 缺货 {$order_no}\n", FILE_APPEND);
        echo 'success';
        exit;
    }

    // 发放卡密
    $pdo->prepare("UPDATE cards SET status = 1, order_id = ?, sold_at = NOW() WHERE id = ?")
        ->execute([$order['id'], $card['id']]);

    // 更新订单
    $pdo->prepare("UPDATE orders SET status = 1, trade_no = ?, card_id = ?, notify_time = NOW(), paid_at = NOW()
                   WHERE order_no = ?")
        ->execute([$trade_no, $card['id'], $order_no]);

    // 更新商品销量和库存
    $pdo->prepare("UPDATE products SET sales = sales + 1, stock = stock - 1 WHERE id = ?")
        ->execute([$order['product_id']]);

    $pdo->commit();
    echo 'success';
} catch (Exception $e) {
    $pdo->rollBack();
    file_put_contents(__DIR__ . '/../logs/notify_error.log', date('Y-m-d H:i:s') . " 发卡异常 {$order_no} " . $e->getMessage() . "\n", FILE_APPEND);
    echo 'failure';
    exit;
}
