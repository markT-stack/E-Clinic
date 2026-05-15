<?php
session_start();
require 'config.php';

$data = json_decode(file_get_contents('php://input'), true);
$username = $data['username'];
$password = $data['password'];

$stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
$stmt->execute([$username]);
$user = $stmt->fetch();

if ($user && password_verify($password, $user['password'])) {
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['role'] = $user['role'];
    $_SESSION['student_id'] = $user['student_id'];
    echo json_encode(['success' => true, 'role' => $user['role'], 'student_id' => $user['student_id']]);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
}
?>