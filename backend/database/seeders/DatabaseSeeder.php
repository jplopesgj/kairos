<?php

namespace Database\Seeders;

use App\Models\Client;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $client = Client::create(['name' => 'Meu primeiro cliente', 'email' => null]);
        $client->projects()->create([
            'name' => 'Projeto de exemplo',
            'description' => 'Remova este projeto quando começar a registrar suas horas.',
            'hourly_rate' => 120,
        ]);
    }
}
