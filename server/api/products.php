<?php
/**
 * 前台 API · 商品列表
 * GET  api/products.php?category=xxx  可选按分类筛选
 */
require __DIR__ . '/../config.php';
cors_headers();

$cat = trim($_GET['category'] ?? '');
$sql = "SELECT id, name, description, price, original_price, category, image, stock, sales
        FROM products WHERE status = 1";
$params = [];
if ($cat !== '') {
    $sql .= " AND category = ?";
    $params[] = $cat;
}
$sql .= " ORDER BY sort DESC, id DESC";

$stmt = db()->prepare($sql);
$stmt->execute($params);
$products = $stmt->fetchAll();

json_out(['code' => 0, 'msg' => 'ok', 'data' => $products]);
