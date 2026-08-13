<?php

namespace App\Http\Controllers\Praticien;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMessageRequest;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class MessageController extends Controller
{
    public function index(Request $request, ?User $patient = null): Response
    {
        /** @var User $practitioner */
        $practitioner = $request->user();

        if ($patient) {
            $this->authorize('view', $patient);
        }

        $patients = $practitioner->patients()->get();
        $patientIds = $patients->pluck('id');

        $lastMessageByPatient = $this->lastMessagePerPatient($practitioner, $patientIds);

        $unreadCountByPatient = Message::where('recipient_id', $practitioner->id)
            ->whereIn('sender_id', $patientIds)
            ->whereNull('read_at')
            ->selectRaw('sender_id, count(*) as aggregate')
            ->groupBy('sender_id')
            ->pluck('aggregate', 'sender_id');

        $conversations = $patients
            ->map(fn (User $p) => [
                'patient' => $p,
                'lastMessage' => $lastMessageByPatient->get($p->id),
                'unreadCount' => (int) ($unreadCountByPatient->get($p->id) ?? 0),
            ])
            ->sortByDesc(fn ($c) => $c['lastMessage']?->created_at?->timestamp ?? 0)
            ->map(fn ($c) => [
                'id' => $c['patient']->id,
                'name' => $c['patient']->name,
                'initials' => $c['patient']->initials,
                'lastMessage' => $c['lastMessage']?->body,
                'lastMessageAt' => $c['lastMessage']?->created_at?->diffForHumans(),
                'unreadCount' => $c['unreadCount'],
            ])
            ->values();

        $messages = [];

        if ($patient) {
            $messages = Message::where(function ($q) use ($practitioner, $patient) {
                $q->where('sender_id', $practitioner->id)->where('recipient_id', $patient->id);
            })->orWhere(function ($q) use ($practitioner, $patient) {
                $q->where('sender_id', $patient->id)->where('recipient_id', $practitioner->id);
            })
                ->orderBy('created_at')
                ->get()
                ->map(fn (Message $m) => [
                    'id' => $m->id,
                    'body' => $m->body,
                    'fromPractitioner' => $m->sender_id === $practitioner->id,
                    'createdAt' => $m->created_at->locale(app()->getLocale())->translatedFormat('d M à H:i'),
                ]);

            Message::where('sender_id', $patient->id)
                ->where('recipient_id', $practitioner->id)
                ->whereNull('read_at')
                ->update(['read_at' => now()]);
        }

        return Inertia::render('Praticien/Messages/Index', [
            'conversations' => $conversations,
            'activePatient' => $patient ? [
                'id' => $patient->id,
                'name' => $patient->name,
                'initials' => $patient->initials,
            ] : null,
            'messages' => $messages,
        ]);
    }

    public function store(StoreMessageRequest $request, User $patient): RedirectResponse
    {
        $this->authorize('view', $patient);

        /** @var User $practitioner */
        $practitioner = $request->user();

        Message::create([
            'sender_id' => $practitioner->id,
            'recipient_id' => $patient->id,
            'body' => $request->validated('body'),
        ]);

        return back();
    }

    /**
     * Dernier message (envoyé ou reçu) par patient, en une seule requête —
     * pas une par patient.
     */
    private function lastMessagePerPatient(User $practitioner, Collection $patientIds): Collection
    {
        return Message::where(function ($q) use ($practitioner, $patientIds) {
            $q->where('sender_id', $practitioner->id)->whereIn('recipient_id', $patientIds);
        })->orWhere(function ($q) use ($practitioner, $patientIds) {
            $q->where('recipient_id', $practitioner->id)->whereIn('sender_id', $patientIds);
        })
            ->get()
            ->groupBy(fn (Message $m) => $m->sender_id === $practitioner->id ? $m->recipient_id : $m->sender_id)
            ->map(fn (Collection $group) => $group->sortByDesc('created_at')->first());
    }
}
