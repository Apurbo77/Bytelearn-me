<?php
require 'bootstrap/app.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Http\Kernel');
$response = $kernel->handle($request = $app->make('Illuminate\Http\Request'));

echo '=== Test 1: QuizAIService Instantiation ===' . PHP_EOL;
try {
    $service = app('App\Services\QuizAIService');
    echo '✓ QuizAIService instantiated successfully' . PHP_EOL;
    echo 'Service class: ' . get_class($service) . PHP_EOL;
} catch (\Exception $e) {
    echo '✗ Error: ' . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . '=== Test 2: Config Load ===' . PHP_EOL;
try {
    $config = config('services.gemini_quiz');
    if ($config) {
        echo '✓ Config loaded successfully' . PHP_EOL;
    } else {
        echo '⚠ Config is null or empty' . PHP_EOL;
    }
} catch (\Exception $e) {
    echo '✗ Error: ' . $e->getMessage() . PHP_EOL;
}
