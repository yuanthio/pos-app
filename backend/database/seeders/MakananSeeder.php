<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Makanan;

class MakananSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $makanans = [
            // Makanan
            [
                'nama' => 'Nasi Goreng',
                'deskripsi' => 'Nasi goreng spesial dengan telur mata sapi, ayam suwir, dan kerupuk',
                'harga' => 25000,
                'kategori' => 'makanan',
                'tersedia' => true,
                'stok' => 50,
            ],
            [
                'nama' => 'Mie Ayam',
                'deskripsi' => 'Mie ayam dengan pangsit rebus dan goreng, sayuran segar',
                'harga' => 20000,
                'kategori' => 'makanan',
                'tersedia' => true,
                'stok' => 30,
            ],
            [
                'nama' => 'Ayam Bakar',
                'deskripsi' => 'Ayam bakar dengan sambal terasi, lalapan, dan nasi',
                'harga' => 35000,
                'kategori' => 'makanan',
                'tersedia' => true,
                'stok' => 25,
            ],
            [
                'nama' => 'Soto Ayam',
                'deskripsi' => 'Soto ayam dengan telur rebus, suwiran ayam, dan kerupuk',
                'harga' => 22000,
                'kategori' => 'makanan',
                'tersedia' => true,
                'stok' => 40,
            ],
            [
                'nama' => 'Gado-Gado',
                'deskripsi' => 'Sayuran segar dengan bumbu kacang, telur, dan kerupuk',
                'harga' => 18000,
                'kategori' => 'makanan',
                'tersedia' => true,
                'stok' => 35,
            ],
            [
                'nama' => 'Rendang',
                'deskripsi' => 'Rendang daging sapi khas Padang dengan nasi putih',
                'harga' => 45000,
                'kategori' => 'makanan',
                'tersedia' => true,
                'stok' => 20,
            ],
            [
                'nama' => 'Cap Cay',
                'deskripsi' => 'Cap cay goreng dengan berbagai sayuran dan seafood',
                'harga' => 28000,
                'kategori' => 'makanan',
                'tersedia' => true,
                'stok' => 15,
            ],
            [
                'nama' => 'Bakso Urat',
                'deskripsi' => 'Bakso urat dengan mie, sayuran, dan kuah kaldu sapi',
                'harga' => 15000,
                'kategori' => 'makanan',
                'tersedia' => true,
                'stok' => 60,
            ],

            // Minuman
            [
                'nama' => 'Es Teh Manis',
                'deskripsi' => 'Teh manis dingin dengan es batu',
                'harga' => 5000,
                'kategori' => 'minuman',
                'tersedia' => true,
                'stok' => 100,
            ],
            [
                'nama' => 'Es Jeruk',
                'deskripsi' => 'Jeruk segar peras dengan es batu',
                'harga' => 8000,
                'kategori' => 'minuman',
                'tersedia' => true,
                'stok' => 80,
            ],
            [
                'nama' => 'Jus Alpukat',
                'deskripsi' => 'Jus alpukat segar dengan susu dan madu',
                'harga' => 15000,
                'kategori' => 'minuman',
                'tersedia' => true,
                'stok' => 40,
            ],
            [
                'nama' => 'Kopi Hitam',
                'deskripsi' => 'Kopi hitam tubruk atau kopi tubruk',
                'harga' => 6000,
                'kategori' => 'minuman',
                'tersedia' => true,
                'stok' => 90,
            ],
            [
                'nama' => 'Cappuccino',
                'deskripsi' => 'Cappuccino dengan foam susu dan bubuk cokelat',
                'harga' => 12000,
                'kategori' => 'minuman',
                'tersedia' => true,
                'stok' => 50,
            ],
            [
                'nama' => 'Es Campur',
                'deskripsi' => 'Es campur dengan buah-buahan segar, kelapa, dan susu kental',
                'harga' => 10000,
                'kategori' => 'minuman',
                'tersedia' => true,
                'stok' => 30,
            ],

            // Snack
            [
                'nama' => 'Kentang Goreng',
                'deskripsi' => 'Kentang goreng renyah dengan saus tomat dan mayonnaise',
                'harga' => 12000,
                'kategori' => 'snack',
                'tersedia' => true,
                'stok' => 45,
            ],
            [
                'nama' => 'Pisang Goreng',
                'deskripsi' => 'Pisang goreng madu dengan taburan keju parut',
                'harga' => 8000,
                'kategori' => 'snack',
                'tersedia' => true,
                'stok' => 35,
            ],
            [
                'nama' => 'Tahu Isi',
                'deskripsi' => 'Tahu isi dengan sayuran dan daging cincang',
                'harga' => 3000,
                'kategori' => 'snack',
                'tersedia' => true,
                'stok' => 50,
            ],
            [
                'nama' => 'Cireng',
                'deskripsi' => 'Cireng renyah dengan sambal bawang',
                'harga' => 2500,
                'kategori' => 'snack',
                'tersedia' => true,
                'stok' => 60,
            ],
            [
                'nama' => 'Roti Bakar',
                'deskripsi' => 'Roti bakar dengan selai, cokelat, dan keju',
                'harga' => 10000,
                'kategori' => 'snack',
                'tersedia' => true,
                'stok' => 25,
            ],
            [
                'nama' => 'Siomay',
                'deskripsi' => 'Siomay ikan dengan sayuran dan bumbu kacang',
                'harga' => 7000,
                'kategori' => 'snack',
                'tersedia' => true,
                'stok' => 40,
            ],
        ];

        foreach ($makanans as $makanan) {
            Makanan::create($makanan);
        }
    }
}
