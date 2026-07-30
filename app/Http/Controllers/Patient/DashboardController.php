<?php

namespace App\Http\Controllers\Patient;

use App\Enums\Pillar;
use App\Http\Controllers\Controller;
use App\Models\CheckIn;
use App\Models\ProtocolItem;
use App\Models\ProtocolLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var User $patient */
        $patient = $request->user();

        $protocol = $patient->activeProtocol()->with('items')->first();

        return Inertia::render('Patient/Dashboard', [
            'todayLabel' => ucfirst(Carbon::now()->locale('fr')->translatedFormat('l j F Y')),
            'nextCheckIn' => $this->nextCheckInLabel($patient->latestCheckIn),
            'todayItems' => $protocol ? $this->todayItems($protocol) : [],
            'vitalite' => $patient->vitaliteItems()->orderByDesc('id')->get(['id', 'text']),
        ]);
    }

    private function nextCheckInLabel(?CheckIn $lastCheckIn): string
    {
        if (! $lastCheckIn) {
            return 'Premier check-in à faire';
        }

        $remaining = 7 - $lastCheckIn->submitted_at->diffInDays(now());

        if ($remaining <= 0) {
            return 'Check-in disponible';
        }

        return $remaining === 1 ? 'Prochain check-in demain' : "Prochain check-in dans {$remaining} jours";
    }

    private function todayItems($protocol): array
    {
        $todayIso = today()->dayOfWeekIso;

        $todaysLogs = ProtocolLog::where('patient_id', $protocol->patient_id)
            ->where('logged_on', today()->toDateString())
            ->get()
            ->keyBy('protocol_item_id');

        return $protocol->items
            ->filter(fn (ProtocolItem $item) => in_array($item->pillar, [Pillar::Mouvement, Pillar::Nutrition], true)
                && ($item->day_of_week === null || $item->day_of_week === $todayIso))
            ->map(fn (ProtocolItem $item) => [
                'id' => $item->id,
                'title' => $item->title,
                'detail' => $this->itemDetail($item),
                'done' => (bool) ($todaysLogs->get($item->id)?->completed ?? false),
            ])
            ->values()
            ->all();
    }

    private function itemDetail(ProtocolItem $item): ?string
    {
        if ($item->notes) {
            return $item->notes;
        }

        if ($item->pillar === Pillar::Mouvement) {
            return $item->sets ? "{$item->sets} séries · {$item->reps}" : $item->reps;
        }

        return null;
    }
}
