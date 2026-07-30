<?php

namespace App\Http\Controllers\Praticien;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreVitaliteItemRequest;
use App\Models\User;
use App\Models\VitaliteItem;
use Illuminate\Http\RedirectResponse;

class VitaliteItemController extends Controller
{
    public function store(StoreVitaliteItemRequest $request, User $patient): RedirectResponse
    {
        $this->authorize('update', $patient);

        VitaliteItem::create([
            'patient_id' => $patient->id,
            'text' => $request->validated('text'),
        ]);

        return back();
    }
}
