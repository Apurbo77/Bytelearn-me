<?php
// Test script to verify QuizAIService and configuration

try {
    echo "1. Testing QuizAIService instantiation...\n";
    $service = app('App\Services\QuizAIService');
    echo "✓ QuizAIService instantiated successfully\n";
    echo "   Service class: " . get_class($service) . "\n";
} catch (\Exception $e) {
    echo "✗ Error instantiating QuizAIService: " . $e->getMessage() . "\n";
}

echo "\n2. Testing configuration load...\n";
try {
    $config = config('services.gemini_quiz');
    if ($config) {
        echo "✓ Config 'services.gemini_quiz' loaded successfully\n";
        echo "   Config keys: " . implode(', ', array_keys((array)$config)) . "\n";
    } else {
        echo "⚠ Config 'services.gemini_quiz' is null or empty\n";
    }
} catch (\Exception $e) {
    echo "✗ Error loading config: " . $e->getMessage() . "\n";
}
