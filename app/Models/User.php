<?php

namespace App\Models;

use App\Enums\ProtocolStatus;
use App\Enums\Role;
use App\Enums\Sex;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'practitioner_id',
        'birth_date',
        'sex',
        'goal',
        'height_cm',
        'initial_weight',
        'medical_background',
        'current_treatments',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => Role::class,
            'sex' => Sex::class,
            'birth_date' => 'date',
            'height_cm' => 'integer',
            'initial_weight' => 'decimal:2',
        ];
    }

    // Relations

    public function practitioner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'practitioner_id');
    }

    public function patients(): HasMany
    {
        return $this->hasMany(User::class, 'practitioner_id');
    }

    public function protocols(): HasMany
    {
        return $this->hasMany(Protocol::class, 'patient_id');
    }

    public function checkIns(): HasMany
    {
        return $this->hasMany(CheckIn::class, 'patient_id');
    }

    public function vitaliteItems(): HasMany
    {
        return $this->hasMany(VitaliteItem::class, 'patient_id');
    }

    public function sentMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function receivedMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'recipient_id');
    }

    /**
     * Le protocole actif du patient — au plus un, garanti par l'index
     * unique partiel en base (voir docs/MODELE-DONNEES.md).
     */
    public function activeProtocol(): HasOne
    {
        return $this->hasOne(Protocol::class, 'patient_id')->where('status', ProtocolStatus::Actif);
    }

    /**
     * Dernier check-in du patient. Utilise latestOfMany pour rester
     * eager-loadable en une seule requête sur toute une liste de patients.
     */
    public function latestCheckIn(): HasOne
    {
        return $this->hasOne(CheckIn::class, 'patient_id')->latestOfMany('submitted_at');
    }

    // Scopes

    public function scopeRolePatient(Builder $query): Builder
    {
        return $query->where('role', Role::Patient);
    }

    public function scopeRolePraticien(Builder $query): Builder
    {
        return $query->where('role', Role::Praticien);
    }

    // Attributs calculés — jamais stockés, toujours recalculés.

    /**
     * Poids courant : dernier check-in pesé, sinon le poids initial.
     */
    public function getCurrentWeightAttribute(): ?float
    {
        $lastWeighedCheckIn = $this->checkIns()
            ->whereNotNull('weight')
            ->orderByDesc('submitted_at')
            ->first();

        if ($lastWeighedCheckIn) {
            return (float) $lastWeighedCheckIn->weight;
        }

        return $this->initial_weight !== null ? (float) $this->initial_weight : null;
    }

    /**
     * Variation depuis le poids initial.
     */
    public function getWeightChangeAttribute(): ?float
    {
        if ($this->initial_weight === null || $this->currentWeight === null) {
            return null;
        }

        return round($this->currentWeight - (float) $this->initial_weight, 2);
    }

    /**
     * IMC, depuis height_cm et le poids courant.
     */
    public function getBmiAttribute(): ?float
    {
        if (! $this->height_cm || $this->currentWeight === null) {
            return null;
        }

        $heightMeters = $this->height_cm / 100;

        return round($this->currentWeight / ($heightMeters ** 2), 1);
    }

    /**
     * Âge, depuis birth_date.
     */
    public function getAgeAttribute(): ?int
    {
        return $this->birth_date?->age;
    }

    /**
     * Initiales depuis le nom (2 lettres max) — utilisées pour les avatars
     * dans toute l'interface praticien.
     */
    public function getInitialsAttribute(): string
    {
        $words = array_slice(preg_split('/\s+/', trim($this->name)), 0, 2);

        return implode('', array_map(fn ($word) => mb_strtoupper(mb_substr($word, 0, 1)), $words));
    }

    /**
     * En retard : dernier check-in > 10 jours, ou aucun check-in alors que
     * le protocole actif a démarré il y a plus de 10 jours.
     *
     * Passe par les relations activeProtocol()/latestCheckIn() (pas par une
     * requête directe) pour rester sans N+1 quand elles sont eager-loadées
     * sur une liste de patients.
     */
    public function getIsCheckInLateAttribute(): bool
    {
        $lastCheckIn = $this->latestCheckIn;

        if ($lastCheckIn) {
            return $lastCheckIn->submitted_at->lt(now()->subDays(10));
        }

        $activeProtocol = $this->activeProtocol;

        return $activeProtocol !== null && $activeProtocol->starts_on->lt(today()->subDays(10));
    }

    /**
     * Statut affiché sur le dashboard praticien : a_jour / en_retard / nouveau.
     * "nouveau" couvre aussi bien un protocole actif récent qu'aucun
     * protocole du tout — dans les deux cas le patient n'a simplement pas
     * encore de check-in à évaluer.
     */
    public function getDashboardStatusAttribute(): string
    {
        if ($this->isCheckInLate) {
            return 'en_retard';
        }

        return $this->latestCheckIn !== null ? 'a_jour' : 'nouveau';
    }
}
