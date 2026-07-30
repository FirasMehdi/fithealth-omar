<?php

namespace App\Models;

use App\Enums\Adherence;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CheckIn extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'submitted_at',
        'energy',
        'sleep',
        'digestion',
        'mood',
        'adherence',
        'weight',
        'waist_cm',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'submitted_at' => 'datetime',
            'energy' => 'integer',
            'sleep' => 'integer',
            'digestion' => 'integer',
            'mood' => 'integer',
            'adherence' => Adherence::class,
            'weight' => 'decimal:2',
            'waist_cm' => 'integer',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'patient_id');
    }
}
