<?php

namespace App\Models;

use App\Enums\ProtocolStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class Protocol extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'practitioner_id',
        'title',
        'starts_on',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'starts_on' => 'date',
            'status' => ProtocolStatus::class,
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    public function practitioner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'practitioner_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(ProtocolItem::class)->orderBy('position');
    }

    /**
     * Active ce protocole et archive tout autre protocole actif du même patient.
     */
    public function activate(): void
    {
        DB::transaction(function () {
            static::where('patient_id', $this->patient_id)
                ->where('status', ProtocolStatus::Actif)
                ->where('id', '!=', $this->id)
                ->update(['status' => ProtocolStatus::Archive]);

            $this->update(['status' => ProtocolStatus::Actif]);
        });
    }
}
