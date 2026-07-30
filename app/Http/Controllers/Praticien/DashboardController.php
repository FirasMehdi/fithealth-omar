<?php

namespace App\Http\Controllers\Praticien;

use App\Http\Controllers\Controller;
use App\Models\CheckIn;
use App\Models\Message;
use App\Models\User;
use App\Services\ObservanceCalculator;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    private const GROWTH_MONTHS = 12;

    private const OBSERVANCE_WEEKS = 12;

    private const WATCHLIST_SIZE = 5;

    public function index(Request $request, ObservanceCalculator $observanceCalculator): Response
    {
        /** @var User $practitioner */
        $practitioner = $request->user();

        $patients = $practitioner->patients()
            ->with(['activeProtocol.items', 'latestCheckIn'])
            ->get();

        $activeProtocols = $patients->pluck('activeProtocol')->filter()->values();
        $observanceByPatient = $observanceCalculator->forProtocols($activeProtocols);

        $weekStart = now()->startOfWeek();
        $weekEnd = now()->endOfWeek();

        $checkinsThisWeek = CheckIn::whereIn('patient_id', $patients->pluck('id'))
            ->whereBetween('submitted_at', [$weekStart, $weekEnd])
            ->count();

        $unreadMessages = Message::where('recipient_id', $practitioner->id)
            ->whereNull('read_at')
            ->count();

        return Inertia::render('Praticien/Dashboard', [
            'todayLabel' => ucfirst(Carbon::now()->locale('fr')->translatedFormat('l j F Y')),
            'stats' => [
                'activePatients' => $patients->count(),
                'newPatientsThisMonth' => $patients->filter(fn (User $p) => $p->created_at->isCurrentMonth())->count(),
                'checkinsThisWeek' => $checkinsThisWeek,
                'unreadMessages' => $unreadMessages,
            ],
            'growthTrend' => $this->growthTrend($patients),
            'observanceTrend' => $observanceCalculator->weeklyCabinetTrend($activeProtocols, self::OBSERVANCE_WEEKS),
            'observanceTiers' => $this->observanceTiers($observanceByPatient),
            'watchlist' => $this->watchlist($patients, $observanceByPatient),
        ]);
    }

    /**
     * Nouveaux patients par mois + total cumulé, sur les self::GROWTH_MONTHS
     * derniers mois. Le cumul part d'un total de départ (patients créés
     * avant la fenêtre) pour que la courbe ne reparte pas de zéro.
     *
     * @param  Collection<int, User>  $patients
     */
    private function growthTrend(Collection $patients): array
    {
        $windowStart = now()->startOfMonth()->subMonths(self::GROWTH_MONTHS - 1);

        $baseline = $patients->filter(fn (User $p) => $p->created_at->lt($windowStart))->count();

        $countsByMonth = $patients
            ->filter(fn (User $p) => $p->created_at->gte($windowStart))
            ->groupBy(fn (User $p) => $p->created_at->format('Y-m'))
            ->map->count();

        $trend = [];
        $running = $baseline;

        for ($i = 0; $i < self::GROWTH_MONTHS; $i++) {
            $month = $windowStart->copy()->addMonths($i);
            $newCount = (int) ($countsByMonth[$month->format('Y-m')] ?? 0);
            $running += $newCount;

            $trend[] = [
                'label' => ucfirst($month->locale('fr')->translatedFormat('M Y')),
                'new' => $newCount,
                'total' => $running,
            ];
        }

        return $trend;
    }

    /**
     * @param  array<int, int|null>  $observanceByPatient
     */
    private function observanceTiers(array $observanceByPatient): array
    {
        $tiers = ['under25' => 0, '25to50' => 0, '50to75' => 0, 'over75' => 0];

        foreach ($observanceByPatient as $rate) {
            if ($rate === null) {
                continue;
            }

            match (true) {
                $rate < 25 => $tiers['under25']++,
                $rate < 50 => $tiers['25to50']++,
                $rate < 75 => $tiers['50to75']++,
                default => $tiers['over75']++,
            };
        }

        return $tiers;
    }

    /**
     * Patients qui appellent une action cette semaine : check-in en retard,
     * ou observance faible. Pas la liste complète — juste les cas les plus
     * urgents, triés par observance croissante.
     *
     * @param  Collection<int, User>  $patients
     * @param  array<int, int|null>  $observanceByPatient
     */
    private function watchlist(Collection $patients, array $observanceByPatient): array
    {
        return $patients
            ->filter(fn (User $p) => $p->isCheckInLate || ($observanceByPatient[$p->id] ?? 100) < 50)
            ->sortBy(fn (User $p) => $observanceByPatient[$p->id] ?? 100)
            ->take(self::WATCHLIST_SIZE)
            ->map(fn (User $p) => [
                'id' => $p->id,
                'name' => $p->name,
                'initials' => $p->initials,
                'reason' => $p->isCheckInLate
                    ? 'Check-in en retard'
                    : 'Observance faible ('.($observanceByPatient[$p->id] ?? 0).'%)',
            ])
            ->values()
            ->all();
    }
}
