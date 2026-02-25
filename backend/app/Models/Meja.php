<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Meja extends Model
{
    use HasFactory;

    protected $fillable = [
        'nomor_meja',
        'status',
        'kapasitas',
        'catatan'
    ];

    protected $casts = [
        'status' => 'string',
        'kapasitas' => 'integer'
    ];

    /**
     * Get status dalam bahasa Indonesia
     */
    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            'tersedia' => 'Tersedia',
            'terisi' => 'Terisi',
            'dipesan' => 'Sedang Dipesan',
            'tidak_aktif' => 'Tidak Aktif'
        };
    }

    /**
     * Check if meja is available for new order
     */
    public function isAvailable(): bool
    {
        return in_array($this->status, ['tersedia']);
    }

    /**
     * Get active orders for this table
     */
    public function pesanans()
    {
        return $this->hasMany(Pesanan::class);
    }
}
