<?php
require 'config.php';

$data = json_decode(file_get_contents('php://input'), true);
$username = $data['username'];
$studentId = $data['studentId'];
$password = password_hash($data['password'], PASSWORD_DEFAULT);

// Check if student exists
$stmt = $pdo->prepare("SELECT * FROM students WHERE student_id = ?");
$stmt->execute([$studentId]);
$student = $stmt->fetch();

if (!$student) {
    echo json_encode(['success' => false, 'message' => 'Invalid student ID']);
    exit;
}

// Check duplicate username
$stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
$stmt->execute([$username]);
if ($stmt->fetch()) {
    echo json_encode(['success' => false, 'message' => 'Username taken']);
    exit;
}

$stmt = $pdo->prepare("INSERT INTO users (username, password, role, student_id) VALUES (?, ?, 'student', ?)");
if ($stmt->execute([$username, $password, $studentId])) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Signup failed']);
}
?>