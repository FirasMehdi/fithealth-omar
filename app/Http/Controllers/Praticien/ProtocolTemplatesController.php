<?php

namespace App\Http\Controllers\Praticien;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProtocolTemplateRequest;
use App\Models\ProtocolTemplate;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProtocolTemplatesController extends Controller
{
    public function index(): Response
    {
        $templates = ProtocolTemplate::query()->orderBy('title')->get();

        return Inertia::render('Praticien/Protocoles/Index', [
            'templates' => $templates->map(fn (ProtocolTemplate $template) => [
                'id' => $template->id,
                'title' => $template->title,
                'description' => $template->description,
                'items' => $template->payload['items'],
            ])->values(),
        ]);
    }

    public function store(StoreProtocolTemplateRequest $request): RedirectResponse
    {
        ProtocolTemplate::create([
            'title' => $request->validated('title'),
            'description' => $request->validated('description'),
            'payload' => ['items' => $request->validated('items')],
        ]);

        return back();
    }

    public function update(StoreProtocolTemplateRequest $request, ProtocolTemplate $template): RedirectResponse
    {
        $template->update([
            'title' => $request->validated('title'),
            'description' => $request->validated('description'),
            'payload' => ['items' => $request->validated('items')],
        ]);

        return back();
    }

    public function destroy(ProtocolTemplate $template): RedirectResponse
    {
        $template->delete();

        return back();
    }
}
