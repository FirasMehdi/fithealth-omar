<?php

namespace App\Http\Controllers;

use App\Enums\Locale;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LocaleController extends Controller
{
    public function update(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'locale' => ['required', Rule::enum(Locale::class)],
        ]);

        if ($user = $request->user()) {
            $user->update(['locale' => $data['locale']]);
        } else {
            $request->session()->put('locale', $data['locale']);
        }

        return back();
    }
}
