<?php

namespace App\Services;

use App\Enums\Pillar;
use App\Models\Protocol;
use App\Models\ProtocolItem;
use App\Models\ProtocolLog;

class WeekPlanBuilder
{
    private const DAY_LABELS = [1 => 'Lun', 2 => 'Mar', 3 => 'Mer', 4 => 'Jeu', 5 => 'Ven', 6 => 'Sam', 7 => 'Dim'];

    private const FULL_DAY_LABELS = [
        1 => 'Lundi', 2 => 'Mardi', 3 => 'Mercredi', 4 => 'Jeudi', 5 => 'Vendredi', 6 => 'Samedi', 7 => 'Dimanche',
    ];

    /**
     * Planning des 7 jours de la semaine en cours (lundi à dimanche), avec
     * pour chaque jour les items prévus (datés sur ce jour, ou permanents)
     * et si un log complété existe pour ce jour précis. Partagé entre
     * l'onglet Suivi du praticien et la page Protocole du patient.
     */
    public function build(Protocol $protocol): array
    {
        $weekStart = now()->startOfWeek();
        $weekEnd = $weekStart->copy()->endOfWeek();

        $completedLogKeys = ProtocolLog::where('patient_id', $protocol->patient_id)
            ->where('completed', true)
            ->whereBetween('logged_on', [$weekStart->toDateString(), $weekEnd->toDateString()])
            ->get()
            ->map(fn (ProtocolLog $log) => $log->protocol_item_id.'|'.$log->logged_on->toDateString())
            ->flip();

        $days = [];

        for ($i = 0; $i < 7; $i++) {
            $date = $weekStart->copy()->addDays($i);
            $iso = $date->dayOfWeekIso;

            $dayItems = $protocol->items->filter(
                fn (ProtocolItem $item) => $item->day_of_week === null || $item->day_of_week === $iso
            );

            $mapItem = fn (ProtocolItem $item) => [
                'id' => $item->id,
                'text' => $item->title,
                'done' => $completedLogKeys->has($item->id.'|'.$date->toDateString()),
            ];

            $days[] = [
                'day' => self::DAY_LABELS[$iso],
                'fullDay' => self::FULL_DAY_LABELS[$iso],
                'date' => $date->toDateString(),
                'sport' => $dayItems->where('pillar', Pillar::Mouvement)->map($mapItem)->values()->all(),
                'nutrition' => $dayItems->where('pillar', Pillar::Nutrition)->map($mapItem)->values()->all(),
            ];
        }

        return $days;
    }
}
