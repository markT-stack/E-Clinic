<?php
ini_set('session.cookie_secure',   '1');
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_samesite', 'Lax');

// Railway provides MYSQL_URL in the format:
// mysql://user:password@host:port/database
$url = getenv('MYSQL_URL') ?: getenv('MYSQL_PUBLIC_URL') ?: null;

if ($url) {
    $parts = parse_url($url);
    $host  = $parts['host'];
    $port  = $parts['port'] ?? 3306;
    $user  = $parts['user'];
    $pass  = $parts['pass'];
    $db    = ltrim($parts['path'], '/');
} else {
    // Local fallback
    $host = getenv('MYSQLHOST')     ?: 'localhost';
    $port = getenv('MYSQLPORT')     ?: '3306';
    $db   = getenv('MYSQLDATABASE') ?: 'eclinic';
    $user = getenv('MYSQLUSER')     ?: 'root';
    $pass = getenv('MYSQLPASSWORD') ?: '';
}

try {
    $pdo = new PDO(
        "mysql:host=$host;port=$port;dbname=$db;charset=utf8mb4",
        $user,
        $pass
    );
    $pdo->setAttribute(PDO::ATTR_ERRMODE,            PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    error_log("DB Connection failed: " . $e->getMessage());
    header('Content-Type: application/json');
    http_response_code(500);
    die(json_encode(['error' => 'Database connection failed', 'detail' => $e->getMessage()]));
}
?>