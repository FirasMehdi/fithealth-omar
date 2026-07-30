<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('protocol_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('protocol_id')->constrained('protocols')->cascadeOnDelete();
            $table->string('pillar', 20);
            $table->unsignedTinyInteger('day_of_week')->nullable();
            $table->string('title');
            $table->smallInteger('sets')->nullable();
            $table->string('reps')->nullable();
            $table->text('notes')->nullable();
            $table->smallInteger('position');
            $table->timestamps();

            $table->index(['protocol_id', 'day_of_week']);
        });

        DB::statement(
            'ALTER TABLE protocol_items ADD CONSTRAINT protocol_items_day_of_week_check CHECK (day_of_week IS NULL OR day_of_week BETWEEN 1 AND 7)'
        );
    }

    public function down(): void
    {
        Schema::dropIfExists('protocol_items');
    }
};
