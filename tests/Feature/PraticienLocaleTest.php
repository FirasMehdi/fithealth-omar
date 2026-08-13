<?php

namespace Tests\Feature;

use App\Enums\Locale;
use App\Enums\Pillar;
use App\Models\CheckIn;
use App\Models\Protocol;
use App\Models\ProtocolItem;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PraticienLocaleTest extends TestCase
{
    use RefreshDatabase;

    private function createProtocolWithMouvementItem(User $patient, ?int $dayOfWeek = null): Protocol
    {
        $protocol = Protocol::factory()->forPatient($patient)->create();

        ProtocolItem::create([
            'protocol_id' => $protocol->id,
            'pillar' => Pillar::Mouvement,
            'day_of_week' => $dayOfWeek,
            'title' => 'Marche',
            'position' => 1,
        ]);

        return $protocol;
    }

    public function test_la_fiche_patient_affiche_les_piliers_en_derja_si_le_praticien_est_en_arabe(): void
    {
        $practitioner = User::factory()->praticien()->create(['locale' => Locale::Ar]);
        $patient = User::factory()->patient($practitioner)->create();
        $this->createProtocolWithMouvementItem($patient);

        $response = $this->actingAs($practitioner)->get("/praticien/patients/{$patient->id}");

        $response->assertInertia(fn (Assert $page) => $page
            ->where('patient.pillars', 'الرياضة')
        );
    }

    public function test_la_fiche_patient_affiche_toujours_les_piliers_en_francais_par_defaut(): void
    {
        $practitioner = User::factory()->praticien()->create();
        $patient = User::factory()->patient($practitioner)->create();
        $this->createProtocolWithMouvementItem($patient);

        $response = $this->actingAs($practitioner)->get("/praticien/patients/{$patient->id}");

        $response->assertInertia(fn (Assert $page) => $page
            ->where('patient.pillars', 'Mouvement')
        );
    }

    public function test_la_fiche_patient_affiche_les_libelles_de_jour_en_derja_si_le_praticien_est_en_arabe(): void
    {
        $practitioner = User::factory()->praticien()->create(['locale' => Locale::Ar]);
        $patient = User::factory()->patient($practitioner)->create();
        $this->createProtocolWithMouvementItem($patient, dayOfWeek: 1);

        $response = $this->actingAs($practitioner)->get("/praticien/patients/{$patient->id}");

        $response->assertInertia(fn (Assert $page) => $page
            ->where('patient.pillars', 'الرياضة')
            ->where('protocol.mouvement.0.days', 'الإثنين')
        );
    }

    public function test_les_dates_de_checkin_sont_affichees_en_arabe_si_le_praticien_est_en_arabe(): void
    {
        $practitioner = User::factory()->praticien()->create(['locale' => Locale::Ar]);
        $patient = User::factory()->patient($practitioner)->create();

        $submittedAt = Carbon::create(2026, 1, 15, 10, 0, 0);
        CheckIn::factory()->for($patient, 'patient')->create(['submitted_at' => $submittedAt]);

        $expectedDate = $submittedAt->clone()->locale('ar')->translatedFormat('d M Y');

        $response = $this->actingAs($practitioner)->get("/praticien/patients/{$patient->id}");

        $response->assertInertia(fn (Assert $page) => $page
            ->where('checkins.0.date', $expectedDate)
        );
    }
}
