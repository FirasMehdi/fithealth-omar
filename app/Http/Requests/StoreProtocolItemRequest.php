<?php

namespace App\Http\Requests;

use App\Enums\Pillar;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class StoreProtocolItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'pillar' => ['required', new Enum(Pillar::class)],
            'title' => ['required', 'string', 'max:255'],
            'sets' => ['nullable', 'integer', 'min:1'],
            'reps' => ['nullable', 'string', 'max:255'],
            'permanent' => ['required', 'boolean'],
            'days' => ['required_if:permanent,false', 'array', 'min:1'],
            'days.*' => ['integer', 'between:1,7'],
        ];
    }
}
