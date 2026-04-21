<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'openai' => [
        'key' => env('OPENAI_API_KEY'),
        'model' => env('OPENAI_MODEL', 'gpt-4o-mini'),
        'base_url' => env('OPENAI_BASE_URL', 'https://api.openai.com/v1'),
    ],

    // OpenAI-compatible API (https://openrouter.ai) - supports models like google/gemma-4-31b-it:free
    'openrouter' => [
        'key' => env('OPENROUTER_API_KEY'),
        'model' => env('OPENROUTER_MODEL', 'google/gemma-4-31b-it:free'),
        'base_url' => env('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1'),
        // Optional but recommended by OpenRouter.
        'http_referer' => env('OPENROUTER_HTTP_REFERER'),
        'x_title' => env('OPENROUTER_X_TITLE', env('APP_NAME', 'ByteLearn')),
    ],

    // Google AI Studio (Gemini) - Used for chatbot
    'gemini' => [
        'key' => env('GEMINI_API_KEY'),
        'model' => env('GEMINI_MODEL', 'gemma-3-4b-it'),
        'base_url' => env('GEMINI_BASE_URL', 'https://generativelanguage.googleapis.com/v1beta'),
    ],

    // Lena - Gemini API for Quiz Generation (independent from chatbot)
    'gemini_quiz' => [
        'api_key' => env('GEMINI_API_KEY_QUIZ'),
        'model' => env('GEMINI_MODEL_QUIZ', 'gemini-1.5-flash'),
        'base_url' => env('GEMINI_BASE_URL_QUIZ', 'https://generativelanguage.googleapis.com/v1beta'),
    ],

    'huggingface' => [
        'token' => env('HF_TOKEN'),
        // This matches your example model; you can change it to any hosted QA model.
        'qa_model' => env('HF_QA_MODEL', 'distilbert/distilbert-base-cased-distilled-squad'),
        'base_url' => env('HF_BASE_URL', 'https://api-inference.huggingface.co'),
    ],

];
