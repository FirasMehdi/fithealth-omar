<?php

namespace App\Http\Controllers\Praticien;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProtocolItemRequest;
use App\Models\Protocol;
use App\Models\ProtocolItem;
use Illuminate\Http\RedirectResponse;

class ProtocolItemController extends Controller
{
    public function store(StoreProtocolItemRequest $request, Protocol $protocol): RedirectResponse
    {
        $this->authorize('update', $protocol);

        $data = $request->validated();

        $position = $protocol->items()->where('pillar', $data['pillar'])->max('position') + 1;

        $days = $data['permanent'] ? [null] : $data['days'];

        foreach ($days as $day) {
            ProtocolItem::create([
                'protocol_id' => $protocol->id,
                'pillar' => $data['pillar'],
                'day_of_week' => $day,
                'title' => $data['title'],
                'sets' => $data['sets'] ?? null,
                'reps' => $data['reps'] ?? null,
                'position' => $position,
            ]);
        }

        return back();
    }
}
