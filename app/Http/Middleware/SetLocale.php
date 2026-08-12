<?php

namespace App\Http\Middleware;

use App\Enums\Locale;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $raw = $request->user()?->locale?->value
            ?? $request->session()->get('locale', Locale::Fr->value);

        $locale = Locale::tryFrom($raw) ?? Locale::Fr;

        App::setLocale($locale->value);

        return $next($request);
    }
}
