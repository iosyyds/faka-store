<?php
/** 后台登录页 */
session_start();
if (!empty($_SESSION['admin_id'])) {
    header('Location: index.php');
    exit;
}
require_once __DIR__ . '/../config.php';

$err = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    $stmt = db()->prepare("SELECT * FROM admins WHERE username = ?");
    $stmt->execute([$username]);
    $admin = $stmt->fetch();
    if ($admin && password_verify($password, $admin['password_hash'])) {
        session_regenerate_id(true);
        $_SESSION['admin_id'] = $admin['id'];
        $_SESSION['admin_name'] = $admin['username'];
        header('Location: index.php');
        exit;
    }
    $err = '用户名或密码错误';
}
?>
<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>后台登录 - 发卡系统</title>
<style>
  body{font-family:system-ui,sans-serif;background:#f5f6fa;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}
  .box{background:#fff;border-radius:12px;padding:36px 40px;width:340px;box-shadow:0 2px 10px rgba(0,0,0,.08)}
  h1{font-size:20px;text-align:center;margin:0 0 24px}
  input{width:100%;box-sizing:border-box;padding:11px 12px;border:1px solid #d7dbe6;border-radius:8px;font-size:15px;margin-bottom:16px}
  button{width:100%;background:#1f5eff;color:#fff;border:0;border-radius:8px;padding:12px;font-size:15px;cursor:pointer}
  .err{background:#fff0f0;border:1px solid #ffc9c9;color:#b0252b;border-radius:6px;padding:10px;margin-bottom:16px;text-align:center}
</style></head><body>
<div class="box">
  <h1>发卡系统 · 管理员登录</h1>
  <?php if ($err): ?><div class="err"><?= htmlspecialchars($err) ?></div><?php endif; ?>
  <form method="post">
    <input type="text" name="username" placeholder="用户名" required autofocus>
    <input type="password" name="password" placeholder="密码" required>
    <button type="submit">登 录</button>
  </form>
</div>
</body></html>
