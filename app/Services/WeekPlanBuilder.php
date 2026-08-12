<?php

namespace App\Services;

use App\Enums\Pillar;
use App\Models\Protocol;
use App\Models\ProtocolItem;
use App\Models\ProtocolLog;

class WeekPlanBuilder
{
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

        $dayLabels = $this->dayLabels();
        $fullDayLabels = $this->fullDayLabels();

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
                'day' => $dayLabels[$iso],
                'fullDay' => $fullDayLabels[$iso],
                'date' => $date->toDateString(),
                'sport' => $dayItems->where('pillar', Pillar::Mouvement)->map($mapItem)->values()->all(),
                'nutrition' => $dayItems->where('pillar', Pillar::Nutrition)->map($mapItem)->values()->all(),
            ];
        }

        return $days;
    }

    /**
     * @return array<int, string>
     */
    private function dayLabels(): array
    {
        return [
            1 => __('Lun'), 2 => __('Mar'), 3 => __('Mer'), 4 => __('Jeu'),
            5 => __('Ven'), 6 => __('Sam'), 7 => __('Dim'),
        ];
    }

    /**
     * @return array<int, string>
     */
    private function fullDayLabels(): array
    {
        return [
            1 => __('Lundi'), 2 => __('Mardi'), 3 => __('Mercredi'), 4 => __('Jeudi'),
            5 => __('Vendredi'), 6 => __('Samedi'), 7 => __('Dimanche'),
        ];
    }
}
