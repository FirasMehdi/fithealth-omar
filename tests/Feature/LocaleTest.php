<?php

namespace Tests\Feature;

use App\Enums\Locale;
use App\Enums\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class LocaleTest extends TestCase
{
    use RefreshDatabase;

    public function test_un_nouveau_patient_a_la_derja_par_defaut_via_la_factory(): void
    {
        $patient = User::factory()->patient()->create();

        $this->assertSame(Locale::Ar, $patient->locale);
    }

    public function test_un_nouveau_praticien_a_le_francais_par_defaut_via_la_factory(): void
    {
        $practitioner = User::factory()->praticien()->create();

        $this->assertSame(Locale::Fr, $practitioner->locale);
    }

    public function test_la_colonne_locale_vaut_fr_par_defaut_en_base(): void
    {
        $userId = DB::table('users')->insertGetId([
            'name' => 'Sans locale explicite',
            'email' => 'sans-locale@example.com',
            'password' => bcrypt('password'),
            'role' => Role::Praticien->value,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->assertSame('fr', DB::table('users')->find($userId)->locale);
    }

    public function test_un_nouveau_patient_cree_par_le_praticien_est_en_derja_par_defaut(): void
    {
        $practitioner = User::factory()->praticien()->create();

        $this->actingAs($practitioner)->post('/praticien/patients', [
            'name' => 'Nouveau Patient',
            'email' => 'nouveau.patient@example.com',
            'password' => 'password123',
        ])->assertRedirect();

        $this->assertSame(Locale::Ar, User::where('email', 'nouveau.patient@example.com')->first()->locale);
    }

    public function test_le_praticien_peut_choisir_explicitement_le_francais_a_la_creation(): void
    {
        $practitioner = User::factory()->praticien()->create();

        $this->actingAs($practitioner)->post('/praticien/patients', [
            'name' => 'Patient Francophone',
            'email' => 'patient.fr@example.com',
            'password' => 'password123',
            'locale' => 'fr',
        ])->assertRedirect();

        $this->assertSame(Locale::Fr, User::where('email', 'patient.fr@example.com')->first()->locale);
    }

    public function test_locale_par_defaut_est_fr_pour_un_invite(): void
    {
        $this->get('/');

        $this->assertSame('fr', app()->getLocale());
    }

    public function test_locale_invite_suit_la_session(): void
    {
        $this->withSession(['locale' => 'ar'])->get('/');

        $this->assertSame('ar', app()->getLocale());
    }

    public function test_locale_suit_le_compte_du_patient_connecte(): void
    {
        $patient = User::factory()->patient()->create(['locale' => Locale::Ar]);

        $this->actingAs($patient)->get('/patient/dashboard');

        $this->assertSame('ar', app()->getLocale());
    }
}
