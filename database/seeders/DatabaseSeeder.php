<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::firstOrCreate(
            ['email' => 'kim@mail.com'],
            [
                'name' => 'Kim Doe',
                'password' => 'Kim_123',
                'email_verified_at' => now(),
            ]
        );
    }
}
