<?php
session_start();
require 'config.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Get all queries or queries for a specific student
        $student_id = $_GET['student_id'] ?? null;
        if ($student_id) {
            $stmt = $pdo->prepare("SELECT * FROM queries WHERE student_id = ? ORDER BY submitted_at DESC");
            $stmt->execute([$student_id]);
        } else {
            $stmt = $pdo->query("SELECT * FROM queries ORDER BY submitted_at DESC");
        }
        $queries = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($queries);
        break;

    case 'POST':
        // Submit a new query
        $data = json_decode(file_get_contents('php://input'), true);
        $student_id = $data['student_id'] ?? '';
        $student_name = $data['student_name'] ?? '';
        $type = $data['type'] ?? '';
        $message = $data['message'] ?? '';

        if (!$student_id || !$student_name || !$type || !$message) {
            echo json_encode(['success' => false, 'message' => 'Missing required fields']);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO queries (student_id, student_name, type, message) VALUES (?, ?, ?, ?)");
        if ($stmt->execute([$student_id, $student_name, $type, $message])) {
            echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to submit query']);
        }
        break;

    case 'PUT':
        // Update query (resolve or respond)
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $data['id'] ?? '';
        $status = $data['status'] ?? '';
        $response = $data['response'] ?? '';

        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'Query ID required']);
            exit;
        }

        if ($status === 'Resolved') {
            $stmt = $pdo->prepare("UPDATE queries SET status = ?, response = ?, resolved_at = NOW() WHERE id = ?");
            $stmt->execute([$status, $response, $id]);
        } else {
            $stmt = $pdo->prepare("UPDATE queries SET response = ? WHERE id = ?");
            $stmt->execute([$response, $id]);
        }

        echo json_encode(['success' => true]);
        break;

    case 'DELETE':
        // Delete query
        $id = $_GET['id'] ?? '';
        if (!$id) {
            echo json_encode(['success' => false, 'message' => 'Query ID required']);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM queries WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Invalid method']);
        break;
}
?>