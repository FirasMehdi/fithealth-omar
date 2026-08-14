<?php

namespace Tests\Feature;

use App\Enums\Role;
use App\Mail\NewPlanInterest;
use App\Models\PlanInterest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class PlanInterestTest extends TestCase
{
    use RefreshDatabase;

    private function validPayload(array $overrides = []): array
    {
        return array_merge([
            'lastName' => 'Trabelsi',
            'firstName' => 'Amina',
            'phone' => '20123456',
            'email' => 'amina.prospect@example.com',
            'goal' => "Retrouver de l'énergie",
            'message' => 'Je suis intéressée par ce suivi.',
            'planTitle' => 'Suivi 1 mois',
        ], $overrides);
    }

    public function test_une_demande_valide_est_enregistree(): void
    {
        $this->post('/interet', $this->validPayload())->assertRedirect();

        $this->assertDatabaseHas('plan_interests', [
            'last_name' => 'Trabelsi',
            'first_name' => 'Amina',
            'phone' => '20123456',
            'email' => 'amina.prospect@example.com',
            'goal' => "Retrouver de l'énergie",
            'message' => 'Je suis intéressée par ce suivi.',
            'plan_title' => 'Suivi 1 mois',
        ]);
    }

    public function test_une_demande_valide_envoie_un_mail_a_chaque_praticien(): void
    {
        Mail::fake();

        $practitioner = User::factory()->praticien()->create(['email' => 'praticien@fithealth.tn']);

        $this->post('/interet', $this->validPayload())->assertRedirect();

        Mail::assertSent(NewPlanInterest::class, function (NewPlanInterest $mail) use ($practitioner) {
            return $mail->hasTo($practitioner->email);
        });
    }

    public function test_une_demande_est_envoyee_a_tous_les_praticiens_pas_seulement_le_premier(): void
    {
        Mail::fake();

        User::factory()->praticien()->create(['email' => 'praticien1@fithealth.tn']);
        User::factory()->praticien()->create(['email' => 'praticien2@fithealth.tn']);

        $this->post('/interet', $this->validPayload())->assertRedirect();

        Mail::assertSent(NewPlanInterest::class, 2);
    }

    public function test_goal_et_message_sont_facultatifs(): void
    {
        $this->post('/interet', $this->validPayload(['goal' => '', 'message' => '']))
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertDatabaseCount('plan_interests', 1);
    }

    public function test_les_champs_obligatoires_sont_valides(): void
    {
        $this->post('/interet', $this->validPayload(['lastName' => '']))
            ->assertSessionHasErrors('lastName');

        $this->post('/interet', $this->validPayload(['firstName' => '']))
            ->assertSessionHasErrors('firstName');

        $this->post('/interet', $this->validPayload(['phone' => '']))
            ->assertSessionHasErrors('phone');

        $this->post('/interet', $this->validPayload(['email' => '']))
            ->assertSessionHasErrors('email');

        $this->assertDatabaseCount('plan_interests', 0);
    }

    public function test_lemail_doit_etre_une_adresse_valide(): void
    {
        $this->post('/interet', $this->validPayload(['email' => 'pas-un-email']))
            ->assertSessionHasErrors('email');
    }

    public function test_accessible_sans_etre_connecte(): void
    {
        // Pas de $this->actingAs() — le visiteur du site public n'a pas de compte.
        $this->post('/interet', $this->validPayload())->assertRedirect();
        $this->assertDatabaseCount('plan_interests', 1);
    }
}
