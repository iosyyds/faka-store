<?php
/** 后台 · 订单管理（列表/详情/退款/查看卡密） */
require __DIR__ . '/_auth.php';
$pdo = db();
$msg = '';

// 状态筛选
$status_filter = isset($_GET['status']) && $_GET['status'] !== '' ? intval($_GET['status']) : null;
$keyword = trim($_GET['kw'] ?? '');

// 退款处理（简单标记为退款，不自动回滚卡密；如需回滚请手动在卡密管理操作）
if ($_SERVER['REQUEST_METHOD'] === 'POST' && ($_POST['action'] ?? '') === 'refund') {
    $oid = intval($_POST['id'] ?? 0);
    $pdo->prepare("UPDATE orders SET status=2 WHERE id=? AND status=1")->execute([$oid]);
    $msg = '订单已标记为退款（请在支付宝后台实际退款，并把卡密手动置回未售状态）';
}

$sql = "SELECT o.*, p.name AS product_name FROM orders o LEFT JOIN products p ON o.product_id=p.id WHERE 1=1";
$params = [];
if ($status_filter !== null) {
    $sql .= " AND o.status=?";
    $params[] = $status_filter;
}
if ($keyword !== '') {
    $sql .= " AND (o.order_no LIKE ? OR o.contact LIKE ? OR o.trade_no LIKE ?)";
    $k = '%' . $keyword . '%';
    $params = array_merge($params, [$k, $k, $k]);
}
$sql .= " ORDER BY o.id DESC LIMIT 100";
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$orders = $stmt->fetchAll();

admin_header('订单管理', 'orders');
if ($msg) echo '<div class="msg">' . htmlspecialchars($msg) . '</div>';
?>
<div class="card">
  <h3 style="margin-top:0">筛选</h3>
  <form method="get" action="orders.php">
    <div class="grid2">
      <div>
        <label>订单状态</label>
        <select name="status">
          <option value="">全部</option>
          <option value="0" <?= $status_filter === 0 ? 'selected' : '' ?>>待支付</option>
          <option value="1" <?= $status_filter === 1 ? 'selected' : '' ?>>已支付</option>
          <option value="2" <?= $status_filter === 2 ? 'selected' : '' ?>>已退款</option>
        </select>
      </div>
      <div><label>关键词（订单号/联系方式/交易号）</label>
        <input type="text" name="kw" value="<?= htmlspecialchars($keyword) ?>">
      </div>
    </div>
    <button class="btn" type="submit">查询</button>
  </form>
</div>

<div class="card">
  <h3 style="margin-top:0">订单列表（最近 100 条）</h3>
  <table>
    <tr><th>订单号</th><th>商品</th><th>金额</th><th>联系方式</th><th>状态</th><th>创建时间</th><th>操作</th></tr>
    <?php foreach ($orders as $o): $st = ['待支付', '已支付', '已退款'][$o['status']] ?? '未知'; ?>
    <tr>
      <td><?= htmlspecialchars($o['order_no']) ?></td>
      <td><?= htmlspecialchars($o['product_name']) ?></td>
      <td>￥<?= number_format($o['price'], 2) ?></td>
      <td><?= htmlspecialchars($o['contact']) ?></td>
      <td>
        <?php if ($o['status'] == 1): ?><span style="color:#16a34a">已支付</span>
        <?php elseif ($o['status'] == 2): ?><span style="color:#e5484d">已退款</span>
        <?php else: ?><span style="color:#999">待支付</span><?php endif; ?>
      </td>
      <td style="font-size:13px"><?= $o['created_at'] ?></td>
      <td>
        <details style="display:inline-block">
          <summary style="cursor:pointer;color:#1f5eff">详情</summary>
          <div style="background:#f7f8fc;padding:10px;border-radius:6px;margin-top:6px;min-width:280px">
            <div>支付宝交易号：<?= htmlspecialchars($o['trade_no'] ?: '-') ?></div>
            <div>支付时间：<?= $o['paid_at'] ?: '-' ?></div>
            <?php if ($o['card_id']): ?>
              <?php $cs = db()->query("SELECT content FROM cards WHERE id=" . intval($o['card_id']))->fetch(); ?>
              <div>卡密ID：<?= $o['card_id'] ?></div>
              <div style="word-break:break-all;background:#fff;border:1px solid #eef0f6;padding:8px;border-radius:4px;margin-top:6px"><?= htmlspecialchars($cs['content'] ?? '（卡密缺失）') ?></div>
            <?php else: ?>
              <div>卡密：未发放（可能缺货，请到卡密管理补发）</div>
            <?php endif; ?>
            <?php if ($o['status'] == 1): ?>
              <form method="post" style="margin-top:8px" onsubmit="return confirm('确认标记退款？请在支付宝后台同步退款。')">
                <input type="hidden" name="action" value="refund">
                <input type="hidden" name="id" value="<?= $o['id'] ?>">
                <button class="btn danger" style="padding:4px 8px" type="submit">标记退款</button>
              </form>
            <?php endif; ?>
          </div>
        </details>
      </td>
    </tr>
    <?php endforeach; ?>
    <?php if (!$orders): ?><tr><td colspan="7" style="text-align:center;color:#999">暂无订单</td></tr><?php endif; ?>
  </table>
</div>
<?php admin_footer();
