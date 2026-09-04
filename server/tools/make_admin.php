<?php
/**
 * 创建管理员账号（部署时用一次，用完请删除本文件）
 *
 * 用法：
 *   php make_admin.php admin 你的密码
 * 或浏览器访问：
 *   make_admin.php?username=admin&password=你的密码
 */
require __DIR__ . '/../config.php';

$username = $argv[1] ?? ($_GET['username'] ?? '');
$password = $argv[2] ?? ($_GET['password'] ?? '');

if ($username === '' || strlen($password) < 6) {
    exit("用法：php make_admin.php <用户名> <密码(至少6位)>\n");
}

$hash = password_hash($password, PASSWORD_DEFAULT);
$stmt = db()->prepare("SELECT id FROM admins WHERE username = ?");
$stmt->execute([$username]);
if ($stmt->fetch()) {
    db()->prepare("UPDATE admins SET password_hash = ? WHERE username = ?")->execute([$hash, $username]);
    echo "已更新管理员 {$username} 的密码\n";
} else {
    db()->prepare("INSERT INTO admins (username, password_hash) VALUES (?, ?)")->execute([$username, $hash]);
    echo "已创建管理员 {$username}\n";
}
