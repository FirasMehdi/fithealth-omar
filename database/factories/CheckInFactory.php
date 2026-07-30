<?php

namespace Database\Factories;

use App\Enums\Adherence;
use App\Models\CheckIn;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CheckIn>
 */
class CheckInFactory extends Factory
{
    public function definition(): array
    {
        return [
            'submitted_at' => now(),
            'energy' => fake()->numberBetween(1, 10),
            'sleep' => fake()->numberBetween(1, 10),
            'digestion' => fake()->numberBetween(1, 10),
            'mood' => fake()->numberBetween(1, 10),
            'adherence' => fake()->randomElement(Adherence::cases()),
            'weight' => null,
            'waist_cm' => null,
            'note' => null,
        ];
    }
}
