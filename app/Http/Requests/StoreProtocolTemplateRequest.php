<?php

namespace App\Http\Requests;

use App\Enums\Pillar;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreProtocolTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.pillar' => ['required', new Enum(Pillar::class)],
            'items.*.title' => ['required', 'string', 'max:255'],
            'items.*.sets' => ['nullable', 'integer', 'min:1'],
            'items.*.reps' => ['nullable', 'string', 'max:255'],
            'items.*.day_of_week' => ['nullable', 'integer', 'between:1,7'],
            'items.*.position' => ['required', 'integer', 'min:1'],
        ];
    }
}
