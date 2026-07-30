<?php

namespace App\Enums;

enum Role: string
{
    case Praticien = 'praticien';
    case Patient = 'patient';

    /**
     * Route vers laquelle rediriger un utilisateur de ce rôle après connexion.
     * Point d'entrée unique pour cette décision — ne la duplique pas ailleurs.
     */
    public function homeRouteName(): string
    {
        return match ($this) {
            self::Praticien => 'praticien.dashboard',
            self::Patient => 'patient.dashboard',
        };
    }
}
