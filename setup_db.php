<?php

declare(strict_types=1);

/**
 * Import the project's SQL dump into MariaDB/MySQL using PDO.
 * This exists because some Windows setups don't have the `mysql` CLI installed.
 */

$host = getenv('DB_HOST') ?: '127.0.0.1';
$port = getenv('DB_PORT') ?: '3306';
$dbName = getenv('DB_DATABASE') ?: 'bytelearn';
$username = getenv('DB_USERNAME') ?: 'root';
$password = getenv('DB_PASSWORD') ?: '';

$sqlPath = realpath(__DIR__ . '/../bytelearn.sql');
if ($sqlPath === false) {
    fwrite(STDERR, "✗ Could not find ../bytelearn.sql (expected next to repo root)\n");
    exit(1);
}

try {
    $pdo = new PDO("mysql:host={$host};port={$port}", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_EMULATE_PREPARES => true,
        PDO::MYSQL_ATTR_MULTI_STATEMENTS => false,
    ]);

    // Best-effort session settings (may be restricted by server config)
    try {
        $pdo->exec("SET SESSION wait_timeout=28800");
        $pdo->exec("SET SESSION interactive_timeout=28800");
    } catch (Throwable $e) {
        // ignore
    }

    $pdo->exec("DROP DATABASE IF EXISTS `{$dbName}`");
    $pdo->exec("CREATE DATABASE `{$dbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci");
    $pdo->exec("USE `{$dbName}`");

    echo "✓ Database '{$dbName}' recreated\n";

    $sql = file_get_contents($sqlPath);
    if ($sql === false) {
        throw new RuntimeException('Failed to read SQL dump');
    }

    // Strip common comment styles.
    $sql = preg_replace('/^\s*--.*$/m', '', $sql);
    $sql = preg_replace('#/\*![\s\S]*?\*/#', '', $sql);
    $sql = preg_replace('#/\*[\s\S]*?\*/#', '', $sql);

    // Split SQL by semicolons while keeping things simple (dump contains no stored procedures).
    $statements = preg_split('/;\s*\n/', $sql);
    if (!is_array($statements)) {
        throw new RuntimeException('Failed to split SQL dump');
    }
    $statements = array_filter(array_map('trim', $statements));

    $executed = 0;
    foreach ($statements as $statement) {
        $statement = trim($statement);
        if ($statement === '') {
            continue;
        }

        // Some dumps include trailing semicolons not followed by newline.
        $statement = rtrim($statement, ';');
        if ($statement === '') {
            continue;
        }

        try {
            $pdo->exec($statement);
        } catch (PDOException $e) {
            // If server closed connection mid-import, retry once.
            if (str_contains($e->getMessage(), 'server has gone away')) {
                $pdo = new PDO("mysql:host={$host};port={$port};dbname={$dbName}", $username, $password, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_EMULATE_PREPARES => true,
                ]);
                $pdo->exec($statement);
            } else {
                throw $e;
            }
        }
        $executed++;
    }

    echo "✓ Imported SQL dump ({$executed} statements)\n";
} catch (Throwable $e) {
    fwrite(STDERR, "✗ Import failed: {$e->getMessage()}\n");
    exit(1);
}

echo "✓ Done\n";

