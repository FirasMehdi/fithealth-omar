<?php

namespace App\Http\Controllers\Patient;

use App\Enums\Adherence;
use App\Http\Controllers\Controller;
use App\Models\CheckIn;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class CheckInController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Patient/CheckIn/Index', [
            'todayLabel' => ucfirst(now()->locale('fr')->translatedFormat('l j F Y')),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        /** @var User $patient */
        $patient = $request->user();

        $this->authorize('create', [CheckIn::class, $patient]);

        $data = $request->validate([
            'energy' => ['required', 'integer', 'between:1,10'],
            'sleep' => ['required', 'integer', 'between:1,10'],
            'digestion' => ['required', 'integer', 'between:1,10'],
            'mood' => ['required', 'integer', 'between:1,10'],
            'adherence' => ['required', Rule::enum(Adherence::class)],
            'note' => ['nullable', 'string'],
        ]);

        $patient->checkIns()->create([
            ...$data,
            'submitted_at' => now(),
        ]);

        return to_route('patient.dashboard');
    }
}
