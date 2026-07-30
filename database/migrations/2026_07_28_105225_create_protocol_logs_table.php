<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('protocol_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('protocol_item_id')->constrained('protocol_items')->cascadeOnDelete();
            $table->foreignId('patient_id')->constrained('users')->cascadeOnDelete();
            $table->date('logged_on');
            $table->boolean('completed');
            $table->smallInteger('actual_reps')->nullable();
            $table->decimal('actual_weight', 5, 2)->nullable();
            $table->timestamps();

            $table->unique(['protocol_item_id', 'logged_on']);
            $table->index(['patient_id', 'logged_on']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('protocol_logs');
    }
};
