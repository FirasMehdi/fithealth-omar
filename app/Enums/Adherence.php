<?php

namespace App\Enums;

enum Adherence: string
{
    case Totalement = 'totalement';
    case Partiellement = 'partiellement';
    case Peu = 'peu';
}
