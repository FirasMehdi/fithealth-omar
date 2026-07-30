<?php

namespace App\Policies;

use App\Enums\Role;
use App\Models\User;

class UserPolicy
{
    /**
     * Un praticien ne peut voir que ses propres patients (ou lui-même).
     * Un patient ne peut voir que sa propre fiche.
     */
    public function view(User $user, User $target): bool
    {
        if ($user->id === $target->id) {
            return true;
        }

        if ($user->role === Role::Praticien) {
            return $target->practitioner_id === $user->id;
        }

        return false;
    }

    public function update(User $user, User $target): bool
    {
        return $this->view($user, $target);
    }
}
