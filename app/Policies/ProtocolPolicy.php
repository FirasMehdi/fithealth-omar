<?php

namespace App\Policies;

use App\Enums\Role;
use App\Models\Protocol;
use App\Models\User;

class ProtocolPolicy
{
    public function view(User $user, Protocol $protocol): bool
    {
        if ($user->role === Role::Praticien) {
            return $protocol->practitioner_id === $user->id;
        }

        return $protocol->patient_id === $user->id;
    }

    public function update(User $user, Protocol $protocol): bool
    {
        return $user->role === Role::Praticien && $protocol->practitioner_id === $user->id;
    }

    public function delete(User $user, Protocol $protocol): bool
    {
        return $this->update($user, $protocol);
    }
}
