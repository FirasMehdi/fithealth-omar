<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class SeedIfEmpty extends Command
{
    protected $signature = 'app:seed-if-empty';

    protected $description = 'Seed demo data, but only if the database is still empty. Safe to run on every boot.';

    public function handle(): int
    {
        if (User::count() > 0) {
            $this->info('Database already has data — skipping seed.');

            return self::SUCCESS;
        }

        $this->call('db:seed', ['--force' => true]);
        $this->info('Seeded demo data.');

        return self::SUCCESS;
    }
}
