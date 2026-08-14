<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlanInterest extends Model
{
    protected $fillable = [
        'last_name',
        'first_name',
        'phone',
        'email',
        'goal',
        'message',
        'plan_title',
    ];
}
