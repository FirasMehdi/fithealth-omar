<?php

namespace App\Http\Controllers;

use App\Mail\NewPlanInterest;
use App\Http\Requests\StorePlanInterestRequest;
use App\Models\PlanInterest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Mail;

class PlanInterestController extends Controller
{
    public function store(StorePlanInterestRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $planInterest = PlanInterest::create([
            'last_name' => $data['lastName'],
            'first_name' => $data['firstName'],
            'phone' => $data['phone'],
            'email' => $data['email'],
            'goal' => $data['goal'] ?? null,
            'message' => $data['message'] ?? null,
            'plan_title' => $data['planTitle'] ?? null,
        ]);

        foreach (User::query()->rolePraticien()->get() as $practitioner) {
            Mail::to($practitioner->email)->send(new NewPlanInterest($planInterest));
        }

        return back();
    }
}
