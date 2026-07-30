<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('check_ins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('users')->cascadeOnDelete();
            $table->dateTime('submitted_at');
            $table->tinyInteger('energy');
            $table->tinyInteger('sleep');
            $table->tinyInteger('digestion');
            $table->tinyInteger('mood');
            $table->string('adherence', 20);
            $table->decimal('weight', 5, 2)->nullable();
            $table->smallInteger('waist_cm')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index(['patient_id', 'submitted_at']);
        });

        DB::statement(
            'ALTER TABLE check_ins ADD CONSTRAINT check_ins_scores_check CHECK (
                energy BETWEEN 1 AND 10
                AND sleep BETWEEN 1 AND 10
                AND digestion BETWEEN 1 AND 10
                AND mood BETWEEN 1 AND 10
            )'
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('check_ins');
    }
};
