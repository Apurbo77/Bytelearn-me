<?php

/**
 * Laravel Development Server Router
 * 
 * This file is used by the PHP development server to handle routing
 * for files that don't physically exist on the filesystem.
 */

$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// If this is a request for a file or directory that exists, let the web server handle it
if ($uri !== '/' && file_exists(__DIR__ . $uri)) {
    return false;
}

// Otherwise, route through Laravel's index.php
require __DIR__ . '/index.php';
