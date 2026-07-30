<?php

namespace App\Http\Controllers\Patient;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\WeekPlanBuilder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProtocolController extends Controller
{
    public function index(Request $request, WeekPlanBuilder $weekPlanBuilder): Response
    {
        /** @var User $patient */
        $patient = $request->user();

        $protocol = $patient->activeProtocol()->with('items')->first();

        return Inertia::render('Patient/Protocole/Index', [
            'weekPlan' => $protocol ? $weekPlanBuilder->build($protocol) : [],
        ]);
    }
}
