<?php

namespace Tests\Feature;

use App\Enums\Locale;
use App\Enums\Pillar;
use App\Models\Protocol;
use App\Models\ProtocolItem;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PraticienLocaleTest extends TestCase
{
    use RefreshDatabase;

    private function createProtocolWithMouvementItem(User $patient): Protocol
    {
        $protocol = Protocol::factory()->forPatient($patient)->create();

        ProtocolItem::create([
            'protocol_id' => $protocol->id,
            'pillar' => Pillar::Mouvement,
            'day_of_week' => null,
            'title' => 'Marche',
            'position' => 1,
        ]);

        return $protocol;
    }

    public function test_la_fiche_patient_affiche_les_libelles_de_jour_en_derja_si_le_praticien_est_en_arabe(): void
    {
        $practitioner = User::factory()->praticien()->create(['locale' => Locale::Ar]);
        $patient = User::factory()->patient($practitioner)->create();
        $this->createProtocolWithMouvementItem($patient);

        $response = $this->actingAs($practitioner)->get("/praticien/patients/{$patient->id}");

        $response->assertInertia(fn (Assert $page) => $page
            ->where('patient.pillars', 'الرياضة')
        );
    }

    public function test_la_fiche_patient_affiche_toujours_les_libelles_en_francais_par_defaut(): void
    {
        $practitioner = User::factory()->praticien()->create();
        $patient = User::factory()->patient($practitioner)->create();
        $this->createProtocolWithMouvementItem($patient);

        $response = $this->actingAs($practitioner)->get("/praticien/patients/{$patient->id}");

        $response->assertInertia(fn (Assert $page) => $page
            ->where('patient.pillars', 'Mouvement')
        );
    }
}
