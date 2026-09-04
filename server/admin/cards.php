<?php
/** 后台 · 卡密管理（批量导入/查看/删除） */
require __DIR__ . '/_auth.php';
$pdo = db();
$msg = '';

// 当前选中的商品
$product_id = intval($_GET['product_id'] ?? ($_POST['product_id'] ?? 0));

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    $product_id = intval($_POST['product_id'] ?? 0);
    try {
        if ($product_id <= 0) throw new Exception('请先选择商品');
        if ($action === 'import') {
            $lines = preg_split('/\r\n|\r|\n/', trim($_POST['cards_text'] ?? ''));
            $lines = array_filter(array_map('trim', $lines));
            if (!$lines) throw new Exception('没有可导入的卡密内容');
            $stmt = $pdo->prepare("INSERT INTO cards (product_id, content) VALUES (?,?)");
            $pdo->beginTransaction();
            foreach ($lines as $line) $stmt->execute([$product_id, $line]);
            $pdo->commit();
            $msg = '成功导入 ' . count($lines) . ' 条卡密';
        } elseif ($action === 'delete_one') {
            $pdo->prepare("DELETE FROM cards WHERE id=? AND status=0")->execute([intval($_POST['id'] ?? 0)]);
            $msg = '已删除（仅可删除未售卡密）';
        } elseif ($action === 'clear_unsold') {
            $pdo->prepare("DELETE FROM cards WHERE product_id=? AND status=0")->execute([$product_id]);
            $msg = '已清空该商品全部未售卡密';
        }
    } catch (Exception $e) {
        $msg = '操作失败：' . $e->getMessage();
    }
}

$products = $pdo->query("SELECT id, name FROM products ORDER BY id DESC")->fetchAll();

// 当前商品的卡密列表（最多显示 200 条）
$cards = [];
if ($product_id > 0) {
    $stmt = $pdo->prepare("SELECT c.*, o.order_no, o.paid_at FROM cards c
                           LEFT JOIN orders o ON c.order_id = o.id
                           WHERE c.product_id=? ORDER BY c.id DESC LIMIT 200");
    $stmt->execute([$product_id]);
    $cards = $stmt->fetchAll();
    $counts = $pdo->prepare("SELECT status, COUNT(*) c FROM cards WHERE product_id=? GROUP BY status");
    $counts->execute([$product_id]);
    $countMap = ['未售' => 0, '已售' => 0];
    foreach ($counts->fetchAll() as $row) {
        $countMap[$row['status'] == 1 ? '已售' : '未售'] = $row['c'];
    }
}

admin_header('卡密管理', 'cards');
if ($msg) echo '<div class="msg">' . htmlspecialchars($msg) . '</div>';
?>
<div class="card">
  <h3 style="margin-top:0">选择商品</h3>
  <form method="get" action="cards.php">
    <select name="product_id" onchange="this.form.submit()">
      <option value="0">-- 请选择商品 --</option>
      <?php foreach ($products as $p): ?>
        <option value="<?= $p['id'] ?>" <?= $p['id'] === $product_id ? 'selected' : '' ?>><?= htmlspecialchars($p['name']) ?> (#<?= $p['id'] ?>)</option>
      <?php endforeach; ?>
    </select>
  </form>
</div>

<?php if ($product_id > 0): ?>
<div class="card">
  <h3 style="margin-top:0">批量导入卡密</h3>
  <p style="color:#888;font-size:13px">每行一条发货内容。例如：<br><code>激活码：ABC-123-456</code><br><code>卡号:123 密码:456</code></p>
  <form method="post">
    <input type="hidden" name="action" value="import">
    <input type="hidden" name="product_id" value="<?= $product_id ?>">
    <textarea name="cards_text" rows="8" placeholder="一行一条卡密内容" required></textarea>
    <button class="btn" type="submit">批量导入</button>
  </form>
</div>

<div class="card">
  <h3 style="margin-top:0">库存情况：未售 <?= $countMap['未售'] ?? 0 ?> 条 / 已售 <?= $countMap['已售'] ?? 0 ?> 条</h3>
  <form method="post" onsubmit="return confirm('确定清空全部未售卡密？')">
    <input type="hidden" name="action" value="clear_unsold">
    <input type="hidden" name="product_id" value="<?= $product_id ?>">
    <button class="btn danger" type="submit">清空未售卡密</button>
  </form>
  <table style="margin-top:12px">
    <tr><th>ID</th><th>内容</th><th>状态</th><th>售出时间/订单</th><th>操作</th></tr>
    <?php foreach ($cards as $c): ?>
    <tr>
      <td><?= $c['id'] ?></td>
      <td style="max-width:360px;word-break:break-all"><?= htmlspecialchars(mb_substr($c['content'], 0, 120)) ?></td>
      <td><?= $c['status'] ? '<span style="color:#16a34a">已售</span>' : '<span style="color:#999">未售</span>' ?></td>
      <td style="font-size:13px"><?= $c['paid_at'] ?? '' ?> <?= $c['order_no'] ?? '' ?></td>
      <td>
        <?php if (!$c['status']): ?>
        <form method="post" style="display:inline">
          <input type="hidden" name="action" value="delete_one">
          <input type="hidden" name="product_id" value="<?= $product_id ?>">
          <input type="hidden" name="id" value="<?= $c['id'] ?>">
          <button class="btn danger" style="padding:4px 8px" type="submit">删</button>
        </form>
        <?php endif; ?>
      </td>
    </tr>
    <?php endforeach; ?>
    <?php if (!$cards): ?><tr><td colspan="5" style="text-align:center;color:#999">暂无卡密，请先批量导入</td></tr><?php endif; ?>
  </table>
</div>
<?php endif;
admin_footer();
