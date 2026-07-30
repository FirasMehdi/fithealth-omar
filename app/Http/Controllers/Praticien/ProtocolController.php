<?php

namespace App\Http\Controllers\Praticien;

use App\Enums\Pillar;
use App\Enums\ProtocolStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProtocolRequest;
use App\Models\Protocol;
use App\Models\ProtocolItem;
use App\Models\ProtocolTemplate;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class ProtocolController extends Controller
{
    public function store(StoreProtocolRequest $request, User $patient): RedirectResponse
    {
        $this->authorize('update', $patient);

        DB::transaction(function () use ($request, $patient) {
            $protocol = Protocol::create([
                'patient_id' => $patient->id,
                'practitioner_id' => $patient->practitioner_id,
                'title' => $request->validated('title'),
                'starts_on' => today(),
                'status' => ProtocolStatus::Brouillon,
            ]);

            if ($templateId = $request->validated('template_id')) {
                $this->applyTemplate($protocol, ProtocolTemplate::findOrFail($templateId));
            }

            $protocol->activate();
        });

        return back();
    }

    private function applyTemplate(Protocol $protocol, ProtocolTemplate $template): void
    {
        foreach ($template->payload['items'] as $item) {
            ProtocolItem::create([
                'protocol_id' => $protocol->id,
                'pillar' => Pillar::from($item['pillar']),
                'day_of_week' => $item['day_of_week'],
                'title' => $item['title'],
                'sets' => $item['sets'] ?? null,
                'reps' => $item['reps'] ?? null,
                'notes' => $item['notes'] ?? null,
                'position' => $item['position'],
            ]);
        }
    }
}
