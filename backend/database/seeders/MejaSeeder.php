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
        
        // Generate 24 tables
        for ($i = 1; $i <= 24; $i++) {
            $mejas[] = [
                'nomor_meja' => 'Meja ' . $i,
                'status' => 'tersedia',
                'kapasitas' => 4,
                'catatan' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        // Set some tables as occupied for testing
        $occupiedTables = [3, 7, 12, 15, 18, 22]; // Table numbers that are occupied
        foreach ($occupiedTables as $tableNum) {
            if (isset($mejas[$tableNum - 1])) {
                $mejas[$tableNum - 1]['status'] = 'terisi';
            }
        }

        // Set some tables as being cleaned
        $cleaningTables = [5, 10]; // Table numbers being cleaned
        foreach ($cleaningTables as $tableNum) {
            if (isset($mejas[$tableNum - 1])) {
                $mejas[$tableNum - 1]['status'] = 'dipesan';
            }
        }

        DB::table('mejas')->insert($mejas);
    }
}
