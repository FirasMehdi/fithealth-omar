<?php

namespace App\Policies;

use App\Enums\Role;
use App\Models\CheckIn;
use App\Models\User;

class CheckInPolicy
{
    public function view(User $user, CheckIn $checkIn): bool
    {
        if ($user->role === Role::Praticien) {
            return $checkIn->patient->practitioner_id === $user->id;
        }

        return $checkIn->patient_id === $user->id;
    }

    public function create(User $user, User $patient): bool
    {
        return $user->id === $patient->id;
    }
}
