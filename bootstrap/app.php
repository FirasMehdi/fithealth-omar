<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Render (like Heroku/Railway) terminates TLS at its edge proxy and
        // forwards to the container over plain HTTP. Without this, Laravel
        // doesn't know the original request was HTTPS and generates http://
        // asset/URL links even on a https:// page — trusting the proxy lets
        // it read X-Forwarded-Proto and get the scheme right. Safe to trust
        // any upstream here since the container is never reachable directly,
        // only through Render's proxy.
        $middleware->trustProxies(at: '*');

        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
        ]);

        $middleware->alias([
            'role' => \App\Http\Middleware\EnsureUserHasRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
