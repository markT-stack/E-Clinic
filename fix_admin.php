<?php
require 'api/config.php';

$password = 'admin1232026';
$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $pdo->prepare("UPDATE users SET password = ? WHERE username = 'admin'");
$stmt->execute([$hash]);

echo "Admin password updated successfully!";

// Delete this file after running
unlink(__FILE__);
?>