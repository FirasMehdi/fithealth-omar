<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role', 20)->after('password');
            $table->string('phone')->nullable()->after('role');
            $table->foreignId('practitioner_id')->nullable()->after('phone')->constrained('users')->restrictOnDelete();
            $table->date('birth_date')->nullable()->after('practitioner_id');
            $table->string('sex', 10)->nullable()->after('birth_date');
            $table->string('goal')->nullable()->after('sex');
            $table->unsignedSmallInteger('height_cm')->nullable()->after('goal');
            $table->decimal('initial_weight', 5, 2)->nullable()->after('height_cm');
            $table->text('medical_background')->nullable()->after('initial_weight');
            $table->text('current_treatments')->nullable()->after('medical_background');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('practitioner_id');
            $table->dropColumn([
                'role',
                'phone',
                'birth_date',
                'sex',
                'goal',
                'height_cm',
                'initial_weight',
                'medical_background',
                'current_treatments',
            ]);
        });
    }
};
