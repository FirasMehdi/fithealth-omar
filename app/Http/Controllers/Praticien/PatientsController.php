<?php

namespace App\Http\Controllers\Praticien;

use App\Enums\Locale;
use App\Enums\Pillar;
use App\Enums\Role;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePatientRequest;
use App\Models\ProtocolItem;
use App\Models\ProtocolTemplate;
use App\Models\User;
use App\Services\ObservanceCalculator;
use App\Services\WeekPlanBuilder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class PatientsController extends Controller
{
    private function dayLabels(): array
    {
        return [
            1 => __('Lun'), 2 => __('Mar'), 3 => __('Mer'), 4 => __('Jeu'),
            5 => __('Ven'), 6 => __('Sam'), 7 => __('Dim'),
        ];
    }

    public function index(Request $request, ObservanceCalculator $observanceCalculator): Response
    {
        /** @var User $practitioner */
        $practitioner = $request->user();

        $patients = $practitioner->patients()
            ->with(['activeProtocol.items', 'latestCheckIn'])
            ->get();

        $observanceByPatient = $observanceCalculator->forProtocols(
            $patients->pluck('activeProtocol')->filter()->values()
        );

        return Inertia::render('Praticien/Patients/Index', [
            'patients' => $patients->map(fn ($patient) => [
                'id' => $patient->id,
                'name' => $patient->name,
                'initials' => $patient->initials,
                'goal' => $patient->goal,
                'observance' => $observanceByPatient[$patient->id] ?? null,
                'lastCheckIn' => $patient->latestCheckIn?->submitted_at->locale(app()->getLocale())->translatedFormat('d M Y'),
                'status' => $patient->dashboardStatus,
            ])->values(),
            'initialObservanceTier' => $request->query('observance'),
        ]);
    }

    public function store(StorePatientRequest $request): RedirectResponse
    {
        /** @var User $practitioner */
        $practitioner = $request->user();

        User::create([
            ...$request->validated(),
            'password' => Hash::make($request->validated('password')),
            'role' => Role::Patient,
            'practitioner_id' => $practitioner->id,
            'locale' => $request->validated('locale') ?? Locale::Ar->value,
        ]);

        return back();
    }

    public function show(User $patient, WeekPlanBuilder $weekPlanBuilder): Response
    {
        $this->authorize('view', $patient);

        $protocol = $patient->activeProtocol()->with('items')->first();

        return Inertia::render('Praticien/Patients/Show', [
            'patient' => [
                'id' => $patient->id,
                'name' => $patient->name,
                'initials' => $patient->initials,
                'age' => $patient->age,
                'goal' => $patient->goal,
                'pillars' => $protocol ? $this->pillarsLabel($protocol->items) : null,
            ],
            'protocol' => $protocol ? [
                'id' => $protocol->id,
                'title' => $protocol->title,
                'mouvement' => $this->groupMouvementItems($protocol->items->where('pillar', Pillar::Mouvement)),
                'nutrition' => $this->groupNutritionItems($protocol->items->where('pillar', Pillar::Nutrition)),
            ] : null,
            'templates' => ProtocolTemplate::query()->orderBy('title')->get(['id', 'title', 'description']),
            'weekPlan' => $protocol ? $weekPlanBuilder->build($protocol) : [],
            'checkins' => $patient->checkIns()->orderByDesc('submitted_at')->get()->map(fn ($checkIn) => [
                'date' => $checkIn->submitted_at->locale(app()->getLocale())->translatedFormat('d M Y'),
                'energy' => $checkIn->energy,
                'sleep' => $checkIn->sleep,
                'digestion' => $checkIn->digestion,
                'mood' => $checkIn->mood,
                'note' => $checkIn->note,
            ])->values(),
            'vitalite' => $patient->vitaliteItems()->orderByDesc('id')->get(['id', 'text']),
        ]);
    }

    private function pillarsLabel(Collection $items): string
    {
        $pillars = $items->pluck('pillar')->unique();

        $labels = array_filter([
            $pillars->contains(Pillar::Mouvement) ? __('Mouvement') : null,
            $pillars->contains(Pillar::Nutrition) ? __('Nutrition') : null,
        ]);

        return implode(' + ', $labels);
    }

    /**
     * Un même exercice (titre/séries/reps identiques) revient sur plusieurs
     * jours sous forme de plusieurs protocol_items — on les regroupe ici pour
     * n'afficher qu'une ligne par exercice, avec la liste de ses jours.
     */
    private function groupMouvementItems(Collection $items): array
    {
        return $items
            ->groupBy(fn (ProtocolItem $item) => $item->title.'|'.$item->sets.'|'.$item->reps)
            ->map(function (Collection $group) {
                $first = $group->first();

                return [
                    'title' => $first->title,
                    'sets' => $first->sets,
                    'reps' => $first->reps,
                    'days' => $this->daysLabel($group),
                ];
            })
            ->values()
            ->all();
    }

    private function groupNutritionItems(Collection $items): array
    {
        return $items
            ->groupBy('title')
            ->map(function (Collection $group) {
                $hasPermanent = $group->contains(fn (ProtocolItem $item) => $item->day_of_week === null);

                return [
                    'title' => $group->first()->title,
                    'days' => $hasPermanent ? null : $this->daysLabel($group),
                ];
            })
            ->values()
            ->all();
    }

    private function daysLabel(Collection $items): string
    {
        if ($items->contains(fn (ProtocolItem $item) => $item->day_of_week === null)) {
            return __('Tous les jours');
        }

        $labels = $this->dayLabels();

        return $items->pluck('day_of_week')->unique()->sort()
            ->map(fn (int $day) => $labels[$day])
            ->implode(', ');
    }
}
