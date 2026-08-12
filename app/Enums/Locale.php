<?php

namespace App\Enums;

enum Locale: string
{
    case Fr = 'fr';
    case Ar = 'ar';

    /**
     * Sens de lecture associé — pilote l'attribut `dir` du document et le
     * miroir de mise en page (sidebar, alignement, icônes directionnelles).
     */
    public function direction(): string
    {
        return match ($this) {
            self::Fr => 'ltr',
            self::Ar => 'rtl',
        };
    }
}
