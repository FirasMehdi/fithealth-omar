<?php

namespace App\Enums;

enum ProtocolStatus: string
{
    case Brouillon = 'brouillon';
    case Actif = 'actif';
    case Archive = 'archive';
}
