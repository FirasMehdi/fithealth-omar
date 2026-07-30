<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('protocols', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('practitioner_id')->constrained('users')->restrictOnDelete();
            $table->string('title');
            $table->date('starts_on');
            $table->string('status', 20);
            $table->timestamps();

            $table->index(['patient_id', 'status']);
        });

        // Un seul protocole "actif" par patient à la fois.
        DB::statement(
            "CREATE UNIQUE INDEX protocols_one_active_per_patient ON protocols (patient_id) WHERE status = 'actif'"
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('protocols');
    }
};
