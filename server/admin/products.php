<?php
/** 后台 · 商品管理（新增/编辑/删除/上下架） */
require __DIR__ . '/_auth.php';
$pdo = db();

$msg = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';
    try {
        if ($action === 'save') {
            $id       = intval($_POST['id'] ?? 0);
            $name     = trim($_POST['name'] ?? '');
            $price    = floatval($_POST['price'] ?? 0);
            $original = $_POST['original_price'] === '' ? null : floatval($_POST['original_price']);
            $category = trim($_POST['category'] ?? '默认');
            $image    = trim($_POST['image'] ?? '');
            $desc     = trim($_POST['description'] ?? '');
            $sort     = intval($_POST['sort'] ?? 0);
            $status   = isset($_POST['status']) ? 1 : 0;
            if ($name === '' || $price < 0) {
                throw new Exception('商品名称和价格必填');
            }
            if ($id > 0) {
                $pdo->prepare("UPDATE products SET name=?, price=?, original_price=?, category=?, image=?, description=?, sort=?, status=? WHERE id=?")
                    ->execute([$name, $price, $original, $category, $image, $desc, $sort, $status, $id]);
            } else {
                $pdo->prepare("INSERT INTO products (name, price, original_price, category, image, description, sort, status) VALUES (?,?,?,?,?,?,?,?)")
                    ->execute([$name, $price, $original, $category, $image, $desc, $sort, $status]);
            }
            $msg = '已保存';
        } elseif ($action === 'delete') {
            $id = intval($_POST['id'] ?? 0);
            $pdo->prepare("DELETE FROM cards WHERE product_id=?")->execute([$id]);
            $pdo->prepare("DELETE FROM products WHERE id=?")->execute([$id]);
            $msg = '已删除（该商品的卡密已一并删除）';
        } elseif ($action === 'toggle') {
            $id = intval($_POST['id'] ?? 0);
            $pdo->prepare("UPDATE products SET status = 1-status WHERE id=?")->execute([$id]);
            $msg = '已切换状态';
        }
    } catch (Exception $e) {
        $msg = '操作失败：' . $e->getMessage();
    }
}

// 编辑回显的数据
$edit = null;
if (isset($_GET['edit'])) {
    $stmt = $pdo->prepare("SELECT * FROM products WHERE id=?");
    $stmt->execute([intval($_GET['edit'])]);
    $edit = $stmt->fetch();
}

$products = $pdo->query("SELECT p.*, (SELECT COUNT(*) FROM cards c WHERE c.product_id=p.id AND c.status=0) stock,
                         (SELECT COUNT(*) FROM cards c WHERE c.product_id=p.id AND c.status=1) sold
                         FROM products p ORDER BY p.sort DESC, p.id DESC")->fetchAll();

admin_header('商品管理', 'products');
if ($msg) echo '<div class="msg">' . htmlspecialchars($msg) . '</div>';
?>
<div class="card">
  <h3 style="margin-top:0"><?= $edit ? '编辑商品 #' . $edit['id'] : '新增商品' ?></h3>
  <form method="post">
    <input type="hidden" name="action" value="save">
    <input type="hidden" name="id" value="<?= $edit['id'] ?? 0 ?>">
    <div class="grid2">
      <div><label>商品名称 *</label><input type="text" name="name" value="<?= htmlspecialchars($edit['name'] ?? '') ?>" required></div>
      <div><label>分类</label><input type="text" name="category" value="<?= htmlspecialchars($edit['category'] ?? '默认') ?>"></div>
      <div><label>售价（元）*</label><input type="number" step="0.01" min="0" name="price" value="<?= $edit['price'] ?? '' ?>" required></div>
      <div><label>划线原价（元，可空）</label><input type="number" step="0.01" min="0" name="original_price" value="<?= $edit['original_price'] ?? '' ?>"></div>
      <div><label>排序（越大越靠前）</label><input type="number" name="sort" value="<?= $edit['sort'] ?? 0 ?>"></div>
      <div><label>图片URL（可空）</label><input type="text" name="image" value="<?= htmlspecialchars($edit['image'] ?? '') ?>" placeholder="https://..."></div>
    </div>
    <label>商品说明（发货内容/使用方法）</label>
    <textarea name="description" rows="3"><?= htmlspecialchars($edit['description'] ?? '') ?></textarea>
    <label><input type="checkbox" name="status" <?= (!isset($edit) || $edit['status'] == 1) ? 'checked' : '' ?>> 上架</label>
    <br><br>
    <button class="btn" type="submit"><?= $edit ? '保存修改' : '新增商品' ?></button>
    <?php if ($edit): ?><a class="btn gray" href="products.php">取消编辑</a><?php endif; ?>
  </form>
</div>

<div class="card">
  <h3 style="margin-top:0">商品列表</h3>
  <table>
    <tr><th>ID</th><th>名称</th><th>分类</th><th>售价</th><th>库存/已售</th><th>状态</th><th>操作</th></tr>
    <?php foreach ($products as $p): ?>
    <tr>
      <td><?= $p['id'] ?></td>
      <td><?= htmlspecialchars($p['name']) ?></td>
      <td><?= htmlspecialchars($p['category']) ?></td>
      <td>￥<?= number_format($p['price'], 2) ?></td>
      <td><?= $p['stock'] ?> / <?= $p['sold'] ?></td>
      <td><?= $p['status'] ? '<span style="color:#16a34a">上架</span>' : '<span style="color:#999">下架</span>' ?></td>
      <td>
        <a class="btn" style="padding:5px 10px" href="products.php?edit=<?= $p['id'] ?>">编辑</a>
        <a class="btn" style="padding:5px 10px" href="cards.php?product_id=<?= $p['id'] ?>">卡密</a>
        <form method="post" style="display:inline">
          <input type="hidden" name="action" value="toggle"><input type="hidden" name="id" value="<?= $p['id'] ?>">
          <button class="btn gray" style="padding:5px 10px" type="submit"><?= $p['status'] ? '下架' : '上架' ?></button>
        </form>
        <form method="post" style="display:inline" onsubmit="return confirm('确定删除该商品及其全部卡密？')">
          <input type="hidden" name="action" value="delete"><input type="hidden" name="id" value="<?= $p['id'] ?>">
          <button class="btn danger" style="padding:5px 10px" type="submit">删除</button>
        </form>
      </td>
    </tr>
    <?php endforeach; ?>
  </table>
</div>
<?php admin_footer();
