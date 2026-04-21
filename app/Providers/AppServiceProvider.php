<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Hashing\BcryptHasher;
use Illuminate\Cookie\CookieJar;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Register hash service
        $this->app->singleton('hash', function ($app) {
            return new BcryptHasher();
        });

        // Register cookie service
        $this->app->singleton('cookie', function ($app) {
            return new CookieJar();
        });
    }

    public function boot(): void
    {
        //
    }
}
