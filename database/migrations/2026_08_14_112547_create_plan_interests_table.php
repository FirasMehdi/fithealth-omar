<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Demandes de contact soumises via PlanInterestModal sur le site public
     * (formule choisie sur la page d'accueil). Pas de compte associé — les
     * visiteurs qui remplissent ce formulaire ne sont pas encore patients.
     */
    public function up(): void
    {
        Schema::create('plan_interests', function (Blueprint $table) {
            $table->id();
            $table->string('last_name');
            $table->string('first_name');
            $table->string('phone');
            $table->string('email');
            $table->string('goal')->nullable();
            $table->text('message')->nullable();
            $table->string('plan_title')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plan_interests');
    }
};
