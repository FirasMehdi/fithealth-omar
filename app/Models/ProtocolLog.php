<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProtocolLog extends Model
{
    protected $fillable = [
        'protocol_item_id',
        'patient_id',
        'logged_on',
        'completed',
        'actual_reps',
        'actual_weight',
    ];

    protected function casts(): array
    {
        return [
            'logged_on' => 'date',
            'completed' => 'boolean',
            'actual_reps' => 'integer',
            'actual_weight' => 'decimal:2',
        ];
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(ProtocolItem::class, 'protocol_item_id');
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    /**
     * Point d'entrée unique pour consigner une réalisation.
     * Un item revient chaque semaine : toujours updateOrCreate, jamais create,
     * pour respecter la contrainte d'unicité (protocol_item_id, logged_on).
     */
    public static function record(ProtocolItem $item, string $loggedOn, array $attributes): self
    {
        return static::updateOrCreate(
            [
                'protocol_item_id' => $item->id,
                'logged_on' => $loggedOn,
            ],
            array_merge($attributes, [
                'patient_id' => $item->protocol->patient_id,
            ])
        );
    }
}
