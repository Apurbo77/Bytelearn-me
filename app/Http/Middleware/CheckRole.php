<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        if (!$request->user()) {
            return redirect('/login');
        }

        if (in_array($request->user()->role, $roles)) {
            return $next($request);
        }

        return abort(403, 'Unauthorized access');
    }
}
