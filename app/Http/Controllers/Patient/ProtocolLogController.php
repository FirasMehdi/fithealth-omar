<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use App\Models\ProtocolItem;
use App\Models\ProtocolLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ProtocolLogController extends Controller
{
    public function toggle(Request $request, ProtocolItem $item): RedirectResponse
    {
        $this->authorize('view', $item->protocol);

        $loggedOn = $request->input('date', today()->toDateString());

        $existing = ProtocolLog::where('protocol_item_id', $item->id)
            ->where('logged_on', $loggedOn)
            ->first();

        ProtocolLog::record($item, $loggedOn, [
            'completed' => ! ($existing?->completed ?? false),
        ]);

        return back();
    }
}
