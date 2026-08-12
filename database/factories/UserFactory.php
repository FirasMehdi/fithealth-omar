<?php

namespace Database\Factories;

use App\Enums\Locale;
use App\Enums\Role;
use App\Enums\Sex;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
            'role' => Role::Praticien,
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    public function praticien(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => Role::Praticien,
            'locale' => Locale::Fr,
            'practitioner_id' => null,
            'birth_date' => null,
            'sex' => null,
            'goal' => null,
            'height_cm' => null,
            'initial_weight' => null,
        ]);
    }

    public function patient(?User $practitioner = null): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => Role::Patient,
            'locale' => Locale::Ar,
            'practitioner_id' => $practitioner?->id ?? User::factory()->praticien(),
            'birth_date' => fake()->dateTimeBetween('-65 years', '-18 years'),
            'sex' => fake()->randomElement(Sex::cases()),
            'goal' => fake()->randomElement([
                "Retrouver de l'énergie au quotidien",
                'Améliorer mon sommeil',
                'Reprendre une activité physique en confiance',
                'Rééquilibrer mon transit',
            ]),
            'height_cm' => fake()->numberBetween(155, 190),
            'initial_weight' => fake()->randomFloat(2, 55, 95),
        ]);
    }
}
