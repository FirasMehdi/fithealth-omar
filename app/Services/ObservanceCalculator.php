<?php

namespace App\Services;

use App\Models\Protocol;
use App\Models\ProtocolLog;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class ObservanceCalculator
{
    /**
     * Nombre d'occurrences attendues pour un protocole sur les $days
     * derniers jours pleins (aujourd'hui exclu, dernier jour = hier).
     */
    public function expectedOccurrences(Protocol $protocol, int $days = 7): int
    {
        [$windowStart, $windowEnd] = $this->window($days);

        return $this->expectedOccurrencesBetween($protocol, $windowStart, $windowEnd);
    }

    /**
     * Compte les items datés selon leur day_of_week, et les items
     * permanents (day_of_week null) une fois par jour, sur la fenêtre
     * [$windowStart, $windowEnd] — bornée par la date de démarrage du
     * protocole si celui-ci est plus récent que la fenêtre demandée.
     */
    public function expectedOccurrencesBetween(Protocol $protocol, Carbon $windowStart, Carbon $windowEnd): int
    {
        $effectiveStart = $protocol->starts_on->greaterThan($windowStart)
            ? $protocol->starts_on
            : $windowStart;

        if ($effectiveStart->greaterThan($windowEnd)) {
            return 0;
        }

        $expected = 0;

        for ($date = $effectiveStart->copy(); $date->lte($windowEnd); $date->addDay()) {
            $iso = $date->dayOfWeekIso;

            foreach ($protocol->items as $item) {
                if ($item->day_of_week === null || $item->day_of_week === $iso) {
                    $expected++;
                }
            }
        }

        return $expected;
    }

    /**
     * Taux d'observance (0-100) pour UN protocole. Null si aucune occurrence
     * n'était attendue sur la période (ex. protocole démarré aujourd'hui) —
     * ce n'est pas la même chose qu'un taux de 0%, ne pas les confondre.
     */
    public function forProtocol(Protocol $protocol, int $days = 7): ?int
    {
        [$windowStart, $windowEnd] = $this->window($days);

        return $this->forProtocolBetween($protocol, $windowStart, $windowEnd);
    }

    public function forProtocolBetween(Protocol $protocol, Carbon $windowStart, Carbon $windowEnd): ?int
    {
        $expected = $this->expectedOccurrencesBetween($protocol, $windowStart, $windowEnd);

        if ($expected === 0) {
            return null;
        }

        $completed = ProtocolLog::where('patient_id', $protocol->patient_id)
            ->where('completed', true)
            ->whereBetween('logged_on', [$windowStart->toDateString(), $windowEnd->toDateString()])
            ->count();

        return (int) round($completed / $expected * 100);
    }

    /**
     * Taux d'observance pour plusieurs protocoles à la fois, sans N+1 :
     * une seule requête agrégée pour les logs complétés du lot. Le nombre
     * d'occurrences attendues se calcule en mémoire à partir des items déjà
     * eager-loadés sur chaque protocole (aucune requête supplémentaire).
     *
     * @param  Collection<int, Protocol>  $protocols
     * @return array<int, int|null> observance indexée par patient_id
     */
    public function forProtocols(Collection $protocols, int $days = 7): array
    {
        if ($protocols->isEmpty()) {
            return [];
        }

        [$windowStart, $windowEnd] = $this->window($days);

        $completedByPatient = ProtocolLog::query()
            ->whereIn('patient_id', $protocols->pluck('patient_id'))
            ->where('completed', true)
            ->whereBetween('logged_on', [$windowStart->toDateString(), $windowEnd->toDateString()])
            ->selectRaw('patient_id, count(*) as completed_count')
            ->groupBy('patient_id')
            ->pluck('completed_count', 'patient_id');

        return $protocols->mapWithKeys(function (Protocol $protocol) use ($completedByPatient, $days) {
            $expected = $this->expectedOccurrences($protocol, $days);
            $completed = (int) ($completedByPatient[$protocol->patient_id] ?? 0);

            $observance = $expected === 0 ? null : (int) round($completed / $expected * 100);

            return [$protocol->patient_id => $observance];
        })->all();
    }

    /**
     * Moyenne d'observance du cabinet, une valeur par semaine (lundi-dimanche),
     * sur les $weeks dernières semaines glissantes — la semaine en cours est
     * incluse, bornée à hier pour ne pas fausser le taux avec des jours pas
     * encore écoulés. Une seule requête pour les logs, tout le reste calculé
     * en mémoire à partir des items déjà eager-loadés sur chaque protocole.
     *
     * @param  Collection<int, Protocol>  $protocols  protocoles actifs, avec items eager-loadés
     * @return array<int, array{weekStart: string, label: string, average: int|null}>
     */
    public function weeklyCabinetTrend(Collection $protocols, int $weeks = 12): array
    {
        $today = today();
        $currentWeekStart = $today->copy()->startOfWeek();
        $earliestWeekStart = $currentWeekStart->copy()->subWeeks($weeks - 1);

        $logsByPatientAndWeek = $protocols->isEmpty()
            ? collect()
            : ProtocolLog::query()
                ->whereIn('patient_id', $protocols->pluck('patient_id'))
                ->where('completed', true)
                ->where('logged_on', '>=', $earliestWeekStart->toDateString())
                ->get(['patient_id', 'logged_on'])
                ->groupBy(fn (ProtocolLog $log) => $log->patient_id.':'.Carbon::parse($log->logged_on)->startOfWeek()->toDateString());

        $trend = [];

        for ($i = $weeks - 1; $i >= 0; $i--) {
            $weekStart = $currentWeekStart->copy()->subWeeks($i);
            $weekEnd = $weekStart->copy()->endOfWeek();
            $cappedEnd = $weekEnd->greaterThan($today) ? $today->copy()->subDay() : $weekEnd;

            $rates = [];

            if (! $cappedEnd->lessThan($weekStart)) {
                foreach ($protocols as $protocol) {
                    $expected = $this->expectedOccurrencesBetween($protocol, $weekStart, $cappedEnd);

                    if ($expected === 0) {
                        continue;
                    }

                    $key = $protocol->patient_id.':'.$weekStart->toDateString();
                    $completed = $logsByPatientAndWeek->get($key)?->count() ?? 0;
                    $rates[] = $completed / $expected * 100;
                }
            }

            $trend[] = [
                'weekStart' => $weekStart->toDateString(),
                'label' => $weekStart->locale('fr')->translatedFormat('d M'),
                'average' => count($rates) > 0 ? (int) round(array_sum($rates) / count($rates)) : null,
            ];
        }

        return $trend;
    }

    /**
     * @return array{0: \Illuminate\Support\Carbon, 1: \Illuminate\Support\Carbon}
     */
    private function window(int $days): array
    {
        return [today()->subDays($days), today()->subDay()];
    }
}
