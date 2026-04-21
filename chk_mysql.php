<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3306;dbname=bytelearn', 'root', '');
    $stmt = $pdo->prepare('SELECT password FROM users WHERE email = ?');
    $stmt->execute(['apurbobhaket17@gmail.com']);
    $hash = $stmt->fetchColumn();
    echo "\n[PASSWORD_HASH:$hash]\n";
} catch (Exception $e) {
    echo "MySQL error: " . $e->getMessage();
}
