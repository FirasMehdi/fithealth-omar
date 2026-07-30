<?php

namespace Database\Factories;

use App\Enums\ProtocolStatus;
use App\Models\Protocol;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Protocol>
 */
class ProtocolFactory extends Factory
{
    public function definition(): array
    {
        return [
            'title' => 'Reprise en douceur — phase 1',
            'starts_on' => now()->subWeeks(2)->toDateString(),
            'status' => ProtocolStatus::Actif,
        ];
    }

    public function forPatient(User $patient): static
    {
        return $this->state(fn (array $attributes) => [
            'patient_id' => $patient->id,
            'practitioner_id' => $patient->practitioner_id,
        ]);
    }
}
