<?php

namespace App\Http\Requests;

use App\Enums\Sex;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StorePatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'phone' => ['nullable', 'string', 'max:255'],
            'birth_date' => ['nullable', 'date'],
            'sex' => ['nullable', new Enum(Sex::class)],
            'goal' => ['nullable', 'string', 'max:255'],
            'height_cm' => ['nullable', 'integer', 'min:1', 'max:300'],
            'initial_weight' => ['nullable', 'numeric', 'min:1', 'max:999'],
            'medical_background' => ['nullable', 'string', 'max:2000'],
            'current_treatments' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
