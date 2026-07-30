<?php

namespace Tests\Feature;

use App\Models\CheckIn;
use App\Models\Protocol;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class PatientIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_praticien_ne_peut_pas_voir_un_patient_dun_autre_praticien(): void
    {
        $practitionerA = User::factory()->praticien()->create();
        $practitionerB = User::factory()->praticien()->create();
        $patientOfB = User::factory()->patient($practitionerB)->create();

        $this->assertTrue(Gate::forUser($practitionerB)->allows('view', $patientOfB));
        $this->assertFalse(Gate::forUser($practitionerA)->allows('view', $patientOfB));
    }

    public function test_patient_ne_peut_pas_voir_un_autre_patient(): void
    {
        $practitioner = User::factory()->praticien()->create();
        $patientA = User::factory()->patient($practitioner)->create();
        $patientB = User::factory()->patient($practitioner)->create();

        $this->assertFalse(Gate::forUser($patientA)->allows('view', $patientB));
        $this->assertTrue(Gate::forUser($patientA)->allows('view', $patientA));
    }

    public function test_praticien_ne_peut_pas_voir_le_protocole_dun_patient_dun_autre_praticien(): void
    {
        $practitionerA = User::factory()->praticien()->create();
        $practitionerB = User::factory()->praticien()->create();
        $patientOfB = User::factory()->patient($practitionerB)->create();
        $protocol = Protocol::factory()->forPatient($patientOfB)->create();

        $this->assertTrue(Gate::forUser($practitionerB)->allows('view', $protocol));
        $this->assertFalse(Gate::forUser($practitionerA)->allows('view', $protocol));
    }

    public function test_praticien_ne_peut_pas_voir_le_check_in_dun_patient_dun_autre_praticien(): void
    {
        $practitionerA = User::factory()->praticien()->create();
        $practitionerB = User::factory()->praticien()->create();
        $patientOfB = User::factory()->patient($practitionerB)->create();
        $checkIn = CheckIn::factory()->for($patientOfB, 'patient')->create();

        $this->assertTrue(Gate::forUser($practitionerB)->allows('view', $checkIn));
        $this->assertFalse(Gate::forUser($practitionerA)->allows('view', $checkIn));
    }

    public function test_activer_un_protocole_archive_le_precedent(): void
    {
        $practitioner = User::factory()->praticien()->create();
        $patient = User::factory()->patient($practitioner)->create();

        $first = Protocol::factory()->forPatient($patient)->create();
        $second = Protocol::factory()->forPatient($patient)->create([
            'status' => \App\Enums\ProtocolStatus::Brouillon,
        ]);

        $second->activate();

        $this->assertEquals(\App\Enums\ProtocolStatus::Archive, $first->fresh()->status);
        $this->assertEquals(\App\Enums\ProtocolStatus::Actif, $second->fresh()->status);
    }
}
