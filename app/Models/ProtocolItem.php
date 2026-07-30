<?php

namespace App\Models;

use App\Enums\Pillar;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProtocolItem extends Model
{
    protected $fillable = [
        'protocol_id',
        'pillar',
        'day_of_week',
        'title',
        'sets',
        'reps',
        'notes',
        'position',
    ];

    protected function casts(): array
    {
        return [
            'pillar' => Pillar::class,
            'day_of_week' => 'integer',
            'sets' => 'integer',
            'position' => 'integer',
        ];
    }

    public function protocol(): BelongsTo
    {
        return $this->belongsTo(Protocol::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(ProtocolLog::class);
    }
}
