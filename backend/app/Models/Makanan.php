<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Makanan extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama',
        'deskripsi',
        'harga',
        'kategori',
        'gambar',
        'tersedia',
        'stok',
    ];

    protected $casts = [
        'harga' => 'decimal:2',
        'tersedia' => 'boolean',
        'stok' => 'integer',
    ];

    /**
     * Format harga ke Rupiah
     */
    public function getHargaFormattedAttribute(): string
    {
        return 'Rp ' . number_format((float) $this->harga, 0, ',', '.');
    }

    /**
     * Scope untuk makanan yang tersedia
     */
    public function scopeTersedia($query)
    {
        return $query->where('tersedia', true);
    }

    /**
     * Scope berdasarkan kategori
     */
    public function scopeKategori($query, $kategori)
    {
        return $query->where('kategori', $kategori);
    }

    /**
     * Scope untuk pencarian
     */
    public function scopeSearch($query, $search)
    {
        return $query->where('nama', 'like', "%{$search}%")
                    ->orWhere('deskripsi', 'like', "%{$search}%");
    }
}
