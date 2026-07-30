<?php

namespace App\Http\Controllers\Patient;

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
    public function index(Request $request): Response
    {
        /** @var User $patient */
        $patient = $request->user();
        $practitioner = $patient->practitioner;

        $messages = Message::where(function ($q) use ($patient, $practitioner) {
            $q->where('sender_id', $patient->id)->where('recipient_id', $practitioner->id);
        })->orWhere(function ($q) use ($patient, $practitioner) {
            $q->where('sender_id', $practitioner->id)->where('recipient_id', $patient->id);
        })
            ->orderBy('created_at')
            ->get();

        Message::where('sender_id', $practitioner->id)
            ->where('recipient_id', $patient->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return Inertia::render('Patient/Messages/Index', [
            'practitioner' => [
                'name' => $practitioner->name,
                'initials' => $practitioner->initials,
            ],
            'messages' => $this->groupByDate($messages, $patient),
        ]);
    }

    public function store(StoreMessageRequest $request): RedirectResponse
    {
        /** @var User $patient */
        $patient = $request->user();

        Message::create([
            'sender_id' => $patient->id,
            'recipient_id' => $patient->practitioner_id,
            'body' => $request->validated('body'),
        ]);

        return back();
    }

    /**
     * Aplati les messages en une seule liste ordonnée, avec des séparateurs
     * de date insérés entre les jours — même logique que la maquette.
     */
    private function groupByDate(Collection $messages, User $patient): array
    {
        $items = [];
        $lastDate = null;

        foreach ($messages as $message) {
            $date = $message->created_at->toDateString();

            if ($date !== $lastDate) {
                $items[] = [
                    'isDateSeparator' => true,
                    'label' => $message->created_at->locale('fr')->translatedFormat('d F'),
                ];
                $lastDate = $date;
            }

            $items[] = [
                'isDateSeparator' => false,
                'id' => $message->id,
                'text' => $message->body,
                'fromPatient' => $message->sender_id === $patient->id,
            ];
        }

        return $items;
    }
}
