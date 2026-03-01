<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Meja;

class MejaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $mejas = [];
        
        // Generate 24 tables - all available by default
        for ($i = 1; $i <= 24; $i++) {
            $mejas[] = [
                'nomor_meja' => 'Meja ' . $i,
                'status' => 'tersedia', // All tables available by default
                'kapasitas' => 4,
                'catatan' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('mejas')->insert($mejas);
    }
}
